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
    threat_confidence: Optional[float]
) -> int:
    """Combines all risk vectors into a final 0-100 score."""
    base_score = max(telemetry_score, identity_risk, behaviour_risk)
    
    # Add threat bonus if we have high confidence
    if threat_confidence and threat_confidence > 80:
        base_score += threat_bonus
    elif threat_bonus > 0:
        base_score += int(threat_bonus * 0.5)
        
    return min(100, base_score)


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
    threat_risk_bonus: int
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

    # 2. Aggregation
    final_score = _aggregate_risk(
        telemetry_risk, identity_risk, behaviour_risk, threat_risk_bonus, threat_confidence
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
        "timestamp":          datetime.utcnow().isoformat()
    }
    if "suggested_step" in classification:
        report["suggested_step"] = classification["suggested_step"]

    return report
