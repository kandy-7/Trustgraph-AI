"""
TrustGraph AI - Risk Aggregator & Decision Engine
Combines multi-vector risks (Telemetry, Identity, Behaviour, Threat Correlation) 
into a final SOC-ready Customer Risk Score.
"""

from __future__ import annotations
import logging
from datetime import datetime
from typing import Any, List, Optional

from backend.config import RISK_LOW_MAX, RISK_MEDIUM_MAX
from backend.models.schemas import TelemetryData

logger = logging.getLogger(__name__)


def _aggregate_risk(
    telemetry_score: int,
    identity_risk: int,
    behaviour_risk: int,
    threat_bonus: int,
    threat_confidence: Optional[float],
    ml_fraud_prob: int,
    network_risk: int,
    threat_intel_bonus: int
) -> int:
    """Combines all risk vectors into a final 0-100 score using weighted intelligence."""
    
    # 30% Rule Score (Telemetry)
    # 20% Behaviour (Max of Identity and Behaviour drift)
    # 30% ML Score
    # 15% Correlation (Threat Bonus)
    # 5% Graph Intelligence
    
    rule_score_weighted = (telemetry_score / 100.0) * 30
    
    max_beh = max(identity_risk, behaviour_risk)
    beh_score_weighted = (max_beh / 100.0) * 20
    
    ml_score_weighted = (ml_fraud_prob / 100.0) * 30
    
    # Cap threat bonus contribution to 15 points
    correlation_weighted = min((threat_bonus / 100.0) * 15, 15)
    
    graph_weighted = (network_risk / 100.0) * 5
    
    base_score = int(rule_score_weighted + beh_score_weighted + ml_score_weighted + correlation_weighted + graph_weighted)
    
    # Critical overrides for Hackathon Demo impact
    if threat_confidence and threat_confidence > 80:
        base_score += threat_bonus
    if threat_intel_bonus > 0:
        base_score += threat_intel_bonus
    if network_risk > 0:
        base_score += network_risk + 40 # Heavily penalize graph findings
    if ml_fraud_prob > 60:
        base_score += ml_fraud_prob
    if telemetry_score > 50:
        base_score += telemetry_score
        
    return min(99, max(0, base_score))


def classify_risk_and_action(score: int, threat_name: Optional[str], attack_stage: Optional[str]) -> dict[str, Any]:
    """Map numeric score → severity, SOC response action, and alert status."""
    
    if threat_name and attack_stage == "Money Extraction":
        # Hard block if we are highly confident they are extracting funds
        return {
            "risk_level":         "CRITICAL",
            "recommended_action": "Freeze Account",
            "suggested_step":     "Escalate to SOC, Notify Customer immediately",
            "alert":              True,
            "severity":           "CRITICAL"
        }

    if score <= RISK_LOW_MAX:
        return {
            "risk_level":         "LOW",
            "recommended_action": "ALLOW",
            "alert":              False,
            "severity":           "LOW"
        }
    elif score <= RISK_MEDIUM_MAX:
        return {
            "risk_level":         "MEDIUM",
            "recommended_action": "VERIFY",
            "suggested_step":     "Step-up MFA / OTP required",
            "alert":              True,
            "severity":           "MEDIUM"
        }
    else:
        return {
            "risk_level":         "HIGH",
            "recommended_action": "BLOCK",
            "suggested_step":     "Soft hold, escalate to investigation team",
            "alert":              True,
            "severity":           "HIGH"
        }


def analyze_event(
    event: dict, 
    telemetry: TelemetryData, 
    identity_risk: int,
    behaviour_risk: int,
    adaptive_reasons: List[str],
    threat_name: Optional[str],
    threat_confidence: Optional[float],
    attack_stage: Optional[str],
    threat_story: List[str],
    threat_risk_bonus: int,
    ml_analysis: dict,
    graph_analysis: dict,
    threat_intel_result: dict
) -> dict:
    """
    Risk Aggregator Pipeline
    Combines everything into the final SOC-ready payload.
    """
    event_id = event.get("event_id", "UNKNOWN")
    user_id = event.get("user_id", "UNKNOWN")

    # 1. Base telemetry risk (derived from device trust, vpn, etc.)
    telemetry_risk = 0
    if telemetry.vpn_probability > 0.8: telemetry_risk += 20
    if telemetry.malware_score > 0.5: telemetry_risk += 80
    if telemetry.rooted_score > 0.7: telemetry_risk += 50
    if telemetry.impossible_travel_flag: telemetry_risk += 40
    if telemetry.device_trust_score < 40: telemetry_risk += 30

    # 2. Aggregation (Weighted Intelligence)
    final_score = _aggregate_risk(
        telemetry_score=telemetry_risk, 
        identity_risk=identity_risk, 
        behaviour_risk=behaviour_risk, 
        threat_bonus=threat_risk_bonus, 
        threat_confidence=threat_confidence,
        ml_fraud_prob=ml_analysis.get("ml_fraud_prob", 0),
        network_risk=graph_analysis.get("network_risk", 0),
        threat_intel_bonus=threat_intel_result.get("risk_bonus", 0)
    )
    
    # 3. Decision
    classification = classify_risk_and_action(final_score, threat_name, attack_stage)

    # 4. Compile reasons for explainability
    reasons = []
    if threat_name:
        reasons.append(f"Threat detected: {threat_name} ({int(threat_confidence or 0)}% confidence)")
        reasons.append(f"Attack Stage: {attack_stage}")
    
    if telemetry.impossible_travel_flag:
        reasons.append("Impossible travel detected")
    if telemetry.vpn_probability > 0.8:
        reasons.append(f"VPN usage detected ({int(telemetry.vpn_probability*100)}% confidence)")
        
    reasons.extend(adaptive_reasons)
    
    if ml_analysis.get("is_anomaly"):
        reasons.append("Highly anomalous behaviour detected compared to historical customer profile.")
        
    for feature in ml_analysis.get("top_features", []):
        reasons.append(f"ML Intelligence: High risk indicator - {feature}")
        
    if threat_intel_result and threat_intel_result.get("matched"):
        reasons.append(f"Threat Intelligence: Match on {threat_intel_result.get('type')} "
                       f"({threat_intel_result.get('indicator')}) - {threat_intel_result.get('category')}")
        
    for finding in graph_analysis.get("graph_findings", []):
        reasons.append(f"Graph Intelligence: {finding}")

    # Phase 11: Decision Intelligence Engine
    engine_contributions = {
        "Rules": int((telemetry_risk / 100.0) * 30),
        "Behaviour": int((max(identity_risk, behaviour_risk) / 100.0) * 20),
        "ML": int((ml_analysis.get("ml_fraud_prob", 0) / 100.0) * 30),
        "Correlation": min(int((threat_risk_bonus / 100.0) * 15), 15),
        "Graph": int((graph_analysis.get("network_risk", 0) / 100.0) * 5)
    }
    
    feature_contributions = []
    
    # Map high level features to their engine
    if threat_intel_result and threat_intel_result.get("matched"):
        feature_contributions.append({
            "feature": threat_intel_result.get('category', 'Unknown Threat'),
            "engine": "Threat Intelligence",
            "score": threat_intel_result.get('risk_bonus', 0)
        })
        
    for feature in ml_analysis.get("top_features", []):
        feature_contributions.append({
            "feature": feature,
            "engine": "ML Intelligence",
            "score": 15  # Fixed simulated score for demo purposes
        })
        
    for finding in graph_analysis.get("graph_findings", []):
        feature_contributions.append({
            "feature": finding,
            "engine": "Graph Intelligence",
            "score": 40
        })
        
    if threat_name:
        feature_contributions.append({
            "feature": threat_name,
            "engine": "Correlation",
            "score": 15
        })

    report: dict[str, Any] = {
        "event_id":           event_id,
        "user_id":            user_id,
        "event_type":         event.get("event_type"),
        
        # Breakdown
        "identity_risk":      identity_risk,
        "behaviour_risk":     behaviour_risk,
        "threat_name":        threat_name,
        "threat_confidence":  threat_confidence,
        "attack_stage":       attack_stage,
        "threat_story":       threat_story,
        
        # Final Outcome
        "risk_score":         final_score,
        "risk_level":         classification["risk_level"],
        "severity":           classification["severity"],
        "alert":              classification["alert"],
        "recommended_action": classification["recommended_action"],
        "reasons":            reasons,
        "engine_contributions": engine_contributions,
        "feature_contributions": feature_contributions,
        "timestamp":          datetime.utcnow().isoformat()
    }
    if "suggested_step" in classification:
        report["suggested_step"] = classification["suggested_step"]

    return report
