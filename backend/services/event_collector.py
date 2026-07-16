"""
TrustGraph AI - Cyber Event Collector Pipeline
Ingests events, fetches baseline profiles, evaluates telemetry, assesses fraud risk, and persists data.
"""

from __future__ import annotations
import logging
from datetime import datetime, timedelta
from typing import List
from sqlalchemy.orm import Session

from backend.models.schemas import CyberEventRequest
from backend.models.db_models import CyberEvent, UserProfile, FraudAlert
from backend.services.fraud_engine import analyze_event
from backend.services.telemetry_engine import evaluate_telemetry
from backend.services.adaptive_intelligence import evaluate_customer_intelligence
from backend.services.threat_correlation import correlate_threats

logger = logging.getLogger(__name__)


def _get_or_create_user_profile(user_id: str, db: Session) -> UserProfile:
    profile = db.query(UserProfile).filter(UserProfile.user_id == user_id).first()
    if not profile:
        profile = UserProfile(user_id=user_id)
        db.add(profile)
        db.commit()
        db.refresh(profile)
    return profile


def _get_recent_session_events(user_id: str, session_id: str | None, db: Session, minutes: int = 30) -> List[CyberEvent]:
    """Fetch recent events for the user to correlate threats."""
    since = datetime.utcnow() - timedelta(minutes=minutes)
    query = db.query(CyberEvent).filter(
        CyberEvent.user_id == user_id,
        CyberEvent.timestamp >= since
    )
    if session_id:
        # If we have a session ID, we might just look at session events, but attackers might change sessions.
        # For a hackathon, looking at user's recent events is more robust for demoing correlation.
        pass
        
    return query.order_by(CyberEvent.timestamp.asc()).all()


def _update_user_profile(profile: UserProfile, event: CyberEventRequest, telemetry, is_fraud: bool, db: Session):
    """Update behavioral baselines after an event."""
    profile.total_txns += 1
    if is_fraud:
        profile.fraud_txns += 1

    # Update location
    if event.location and event.location != "Unknown":
        profile.usual_location = event.location

    # Update devices
    if telemetry and telemetry.browser_fingerprint:
        known = set(profile.known_devices or [])
        known.add(telemetry.browser_fingerprint)
        profile.known_devices = list(known)

    # Update amount stats for transfers
    if event.event_type.value == "TRANSFER":
        amt = float(event.metadata_payload.get("amount", 0))
        if amt > 0:
            current_avg = profile.avg_amount or 0.0
            n = max(1, profile.total_txns)
            profile.avg_amount = ((current_avg * (n - 1)) + amt) / n
            profile.max_amount = max(profile.max_amount or 0.0, amt)
            
            # Simplified median update for demo
            profile.median_amount = profile.avg_amount

    db.add(profile)


def process_cyber_event(payload: CyberEventRequest, db: Session) -> dict:
    """
    Main SOC Pipeline for CyberEvents:
    1. Fetch baseline (UserProfile, Last Event)
    2. Telemetry Engine (Raw -> Continuous Risk)
    3. Adaptive Intelligence (Identity/Behaviour Drift)
    4. Threat Correlation (Timeline Signatures)
    5. Risk Aggregator (Final Score & Explanations)
    6. Persistence
    """
    # 1. Fetch baselines
    user_profile = _get_or_create_user_profile(payload.user_id, db)
    recent_events = _get_recent_session_events(payload.user_id, payload.session_id, db)
    last_event = recent_events[-1] if recent_events else None
    
    # 2. Telemetry Engine
    telemetry_profile = evaluate_telemetry(
        raw=payload.raw_telemetry,
        ip_address=payload.ip_address,
        session_id=payload.session_id,
        user_profile=user_profile,
        last_event=last_event
    )

    # 3. Adaptive Intelligence (Drift)
    id_risk, beh_risk, drift_reasons = evaluate_customer_intelligence(
        payload, telemetry_profile, user_profile
    )
    
    # 4. Threat Correlation
    threat_name, threat_conf, attack_stage, threat_story, threat_bonus = correlate_threats(
        payload, recent_events
    )

    # 5. Risk Aggregation
    event_dict = payload.model_dump()
    analysis = analyze_event(
        event=event_dict, 
        telemetry=telemetry_profile,
        identity_risk=id_risk,
        behaviour_risk=beh_risk,
        adaptive_reasons=drift_reasons,
        threat_name=threat_name,
        threat_confidence=threat_conf,
        attack_stage=attack_stage,
        threat_story=threat_story,
        threat_risk_bonus=threat_bonus
    )
    
    # 6. Persistence
    new_event = CyberEvent(
        event_id=payload.event_id,
        user_id=payload.user_id,
        event_type=payload.event_type.value,
        device_id=payload.device_id or telemetry_profile.device_id,
        ip_address=telemetry_profile.ip,
        location=payload.location,
        session_id=telemetry_profile.session_id,
        correlation_id=payload.correlation_id,
        source=payload.source.value,
        severity=analysis["severity"],
        status="FLAGGED" if analysis["alert"] else "PROCESSED",
        metadata_payload=payload.metadata_payload,
        raw_telemetry=payload.raw_telemetry.model_dump() if payload.raw_telemetry else {},
        telemetry_profile=telemetry_profile.model_dump(),
        risk_score=analysis["risk_score"],
        risk_level=analysis["risk_level"]
    )
    db.add(new_event)
    
    # Update profile
    _update_user_profile(user_profile, payload, telemetry_profile, analysis["alert"], db)
    
    # Create alert if needed
    if analysis["alert"]:
        alert = FraudAlert(
            alert_id=f"ALT-{new_event.event_id}",
            event_id=new_event.event_id,
            user_id=new_event.user_id,
            risk_score=analysis["risk_score"],
            risk_level=analysis["risk_level"],
            reasons=analysis["reasons"],
            recommended_action=analysis["recommended_action"],
            suggested_step=analysis.get("suggested_step")
        )
        db.add(alert)
        
    db.commit()
    
    # Enrich the analysis dict for the API response
    analysis["telemetry_profile"] = telemetry_profile.model_dump()
    
    return analysis
