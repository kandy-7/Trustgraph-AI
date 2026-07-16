from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import Dict, Any

from backend.database.db import get_db
from backend.models.db_models import FraudAlert, CyberEvent, UserProfile

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard"])

@router.get("/overview")
def get_dashboard_overview(db: Session = Depends(get_db)):
    """Returns banking metrics: Prevented Loss, Fraud Attempts, Active Cases"""
    total_events = db.query(CyberEvent).count()
    total_alerts = db.query(FraudAlert).count()
    
    # Calculate Prevented Loss
    blocked_alerts = db.query(FraudAlert).filter(FraudAlert.recommended_action == "BLOCK").all()
    prevented_loss = 0
    for alert in blocked_alerts:
        event = db.query(CyberEvent).filter(CyberEvent.event_id == alert.event_id).first()
        if event and event.metadata_payload:
            prevented_loss += float(event.metadata_payload.get("amount", 0))
            
    open_cases = db.query(FraudAlert).filter(FraudAlert.status == "OPEN").count()
    
    return {
        "prevented_loss": prevented_loss,
        "fraud_attempts": total_alerts,
        "high_risk_customers": db.query(UserProfile).filter(UserProfile.fraud_txns > 0).count(),
        "open_cases": open_cases,
        "total_events_today": total_events
    }

@router.get("/live-events")
def get_live_events(db: Session = Depends(get_db)):
    """Returns the latest 50 events for the live ticker"""
    events = db.query(CyberEvent).order_by(CyberEvent.timestamp.desc()).limit(50).all()
    return [
        {
            "event_id": e.event_id,
            "user_id": e.user_id,
            "type": e.event_type,
            "timestamp": e.timestamp,
            "risk_score": e.metadata_payload.get("analysis", {}).get("risk_score", 0) if e.metadata_payload else 0
        } for e in events
    ]

@router.get("/threats")
def get_threats_overview(db: Session = Depends(get_db)):
    """Breakdown of threats (e.g. Account Takeover, Mule Network)"""
    alerts = db.query(FraudAlert).all()
    threat_breakdown = {}
    for a in alerts:
        # Simplistic breakdown based on the first reason
        if a.reasons:
            cat = a.reasons[0].split(":")[0]
            threat_breakdown[cat] = threat_breakdown.get(cat, 0) + 1
            
    return {"threats": threat_breakdown}
