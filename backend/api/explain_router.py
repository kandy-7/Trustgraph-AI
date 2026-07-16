from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.database.db import get_db
from backend.models.db_models import CyberEvent

router = APIRouter(prefix="/api/explain", tags=["Decision Intelligence"])

@router.get("/{event_id}")
def get_decision_intelligence(event_id: str, db: Session = Depends(get_db)):
    """
    Phase 11: Decision Intelligence Engine
    Returns structured engine and feature contributions for an event.
    """
    event = db.query(CyberEvent).filter(CyberEvent.event_id == event_id).first()
    if not event or not event.metadata_payload:
        raise HTTPException(status_code=404, detail="Event analysis not found")
        
    analysis = event.metadata_payload.get("analysis", {})
    
    return {
        "event_id": event_id,
        "risk_score": analysis.get("risk_score", 0),
        "engine_contributions": analysis.get("engine_contributions", {}),
        "feature_contributions": analysis.get("feature_contributions", [])
    }
