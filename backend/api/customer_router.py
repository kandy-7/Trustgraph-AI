from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from backend.database.db import get_db
from backend.models.db_models import UserProfile, CyberEvent, FraudAlert

router = APIRouter(prefix="/api/customers", tags=["Customers"])

@router.get("/{user_id}")
def get_customer_profile(user_id: str, db: Session = Depends(get_db)):
    profile = db.query(UserProfile).filter(UserProfile.user_id == user_id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Customer not found")
    
    return {
        "user_id": profile.user_id,
        "total_txns": profile.total_txns,
        "fraud_txns": profile.fraud_txns,
        "avg_amount": profile.avg_amount,
        "max_amount": profile.max_amount,
        "usual_location": profile.usual_location,
        "known_devices": profile.known_devices
    }

@router.get("/{user_id}/timeline")
def get_customer_timeline(user_id: str, db: Session = Depends(get_db)):
    events = db.query(CyberEvent).filter(CyberEvent.user_id == user_id).order_by(CyberEvent.timestamp.desc()).limit(100).all()
    return [
        {
            "event_id": e.event_id,
            "type": e.event_type,
            "timestamp": e.timestamp,
            "ip_address": e.ip_address,
            "location": e.location,
            "device_id": e.device_id,
            "status": e.status,
            "risk_score": e.risk_score
        } for e in events
    ]

@router.get("/{user_id}/alerts")
def get_customer_alerts(user_id: str, db: Session = Depends(get_db)):
    alerts = db.query(FraudAlert).filter(FraudAlert.user_id == user_id).order_by(FraudAlert.id.desc()).all()
    return [
        {
            "alert_id": a.alert_id,
            "event_id": a.event_id,
            "risk_score": a.risk_score,
            "risk_level": a.risk_level,
            "reasons": a.reasons,
            "action": a.recommended_action,
            "status": a.status
        } for a in alerts
    ]

@router.get("/{user_id}/devices")
def get_customer_devices(user_id: str, db: Session = Depends(get_db)):
    profile = db.query(UserProfile).filter(UserProfile.user_id == user_id).first()
    if not profile:
        return []
    return profile.known_devices or []
