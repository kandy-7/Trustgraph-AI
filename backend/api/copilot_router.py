from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional, Any, Dict
from sqlalchemy.orm import Session
from backend.database.db import get_db
from backend.models.db_models import FraudAlert, CyberEvent
from backend.services.soc_copilot import (
    generate_incident_explanation,
    generate_compliance_report,
    generate_executive_summary,
    generate_recommendations,
    handle_chat,
    generate_threat_story_narrative
)

router = APIRouter(prefix="/api/copilot", tags=["SOC Copilot"])

# ══════════════════════════════════════════════════════════
# Schemas
# ══════════════════════════════════════════════════════════

class CopilotRequest(BaseModel):
    event_id: Optional[str] = None
    query: Optional[str] = None


def _fetch_event_context(event_id: str, db: Session) -> Dict[str, Any]:
    # We fetch the Alert because it contains reasons and risk score
    alert = db.query(FraudAlert).filter(FraudAlert.event_id == event_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Incident not found in database.")
    
    # We also fetch the CyberEvent to get the threat story
    event = db.query(CyberEvent).filter(CyberEvent.event_id == event_id).first()
    
    # In a real app we'd construct a rich dict.
    return {
        "event_id": event_id,
        "user_id": alert.user_id,
        "risk_score": alert.risk_score,
        "risk_level": alert.risk_level,
        "reasons": alert.reasons,
        "recommended_action": alert.recommended_action,
        "threat_story": event.metadata_payload.get("threat_story", []) if event else []
    }


# ══════════════════════════════════════════════════════════
# Routes
# ══════════════════════════════════════════════════════════

@router.post("/explain")
def copilot_explain(req: CopilotRequest, db: Session = Depends(get_db)):
    if not req.event_id:
        raise HTTPException(status_code=400, detail="event_id required")
    ctx = _fetch_event_context(req.event_id, db)
    return {"result": generate_incident_explanation(ctx)}


@router.post("/report")
def copilot_report(req: CopilotRequest, db: Session = Depends(get_db)):
    if not req.event_id:
        raise HTTPException(status_code=400, detail="event_id required")
    ctx = _fetch_event_context(req.event_id, db)
    return {"result": generate_compliance_report(ctx)}


@router.post("/recommend")
def copilot_recommend(req: CopilotRequest, db: Session = Depends(get_db)):
    if not req.event_id:
        raise HTTPException(status_code=400, detail="event_id required")
    ctx = _fetch_event_context(req.event_id, db)
    return {"result": generate_recommendations(ctx)}


@router.post("/summary")
def copilot_summary():
    # Executive summary doesn't need a specific event_id
    return {"result": generate_executive_summary()}


@router.post("/chat")
def copilot_chat(req: CopilotRequest, db: Session = Depends(get_db)):
    ctx = _fetch_event_context(req.event_id, db) if req.event_id else None
    return {"result": handle_chat(req.query or "Hello", ctx)}


@router.post("/story")
def copilot_threat_story(req: CopilotRequest, db: Session = Depends(get_db)):
    if not req.event_id:
        raise HTTPException(status_code=400, detail="event_id required")
    ctx = _fetch_event_context(req.event_id, db)
    return {"result": generate_threat_story_narrative(ctx)}
