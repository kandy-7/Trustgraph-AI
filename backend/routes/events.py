"""
TrustGraph AI - Cyber Events Routes
Unified Event Collection API endpoints.
"""

from __future__ import annotations
import logging
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, Path
from sqlalchemy.orm import Session

from backend.database import get_db
from backend.models.schemas import (
    CyberEventRequest, CyberEventResponse, SuccessResponse, ErrorResponse
)
from backend.models.db_models import CyberEvent
from backend.services.event_collector import process_cyber_event

router = APIRouter(prefix="/api", tags=["Events"])
logger = logging.getLogger(__name__)


# ──────────────────────────────────────────────
# POST /api/events
# ──────────────────────────────────────────────

@router.post(
    "/events",
    response_model=CyberEventResponse,
    summary="Ingest a new cyber event",
    description="Submit a cyber event (Login, Transfer, Device Change). Event is validated, analyzed for risk, and persisted."
)
def ingest_event(payload: CyberEventRequest, db: Session = Depends(get_db)):
    try:
        response_data = process_cyber_event(payload, db)
        if "error" in response_data:
            raise HTTPException(status_code=422, detail=response_data)
        return response_data
    except Exception as e:
        logger.error(f"Error processing event: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal Server Error")


# ──────────────────────────────────────────────
# GET /api/events/{event_id}
# ──────────────────────────────────────────────

@router.get(
    "/events/{event_id}",
    summary="Get a single event by ID"
)
def get_event(event_id: str = Path(..., example="EVT-DEMO001"), db: Session = Depends(get_db)):
    event = db.query(CyberEvent).filter(CyberEvent.event_id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail=f"Event '{event_id}' not found")
        
    return {
        "event_id":           event.event_id,
        "user_id":            event.user_id,
        "event_type":         event.event_type,
        "timestamp":          event.timestamp,
        "device_id":          event.device_id,
        "ip_address":         event.ip_address,
        "location":           event.location,
        "session_id":         event.session_id,
        "correlation_id":     event.correlation_id,
        "source":             event.source,
        "metadata_payload":   event.metadata_payload,
        "severity":           event.severity,
        "status":             event.status,
        "risk_score":         event.risk_score,
        "risk_level":         event.risk_level,
    }


# ──────────────────────────────────────────────
# GET /api/users/{id}/timeline
# ──────────────────────────────────────────────

@router.get(
    "/users/{user_id}/timeline",
    summary="Get chronological event timeline for a user"
)
def get_user_timeline(
    user_id: str = Path(..., example="USR-10042"),
    limit:   int = Query(50, ge=1, le=500),
    offset:  int = Query(0, ge=0),
    db: Session = Depends(get_db)
):
    """Fetch the chronological sequence of events for a specific user to reconstruct attack stories."""
    q = db.query(CyberEvent).filter(CyberEvent.user_id == user_id)
    total = q.count()
    
    # Order by timestamp ASC to build the timeline correctly
    records = q.order_by(CyberEvent.timestamp.asc()).offset(offset).limit(limit).all()
    
    return {
        "user_id": user_id,
        "total": total,
        "offset": offset,
        "limit": limit,
        "timeline": [
            {
                "event_id":           t.event_id,
                "event_type":         t.event_type,
                "timestamp":          t.timestamp,
                "device_id":          t.device_id,
                "ip_address":         t.ip_address,
                "location":           t.location,
                "session_id":         t.session_id,
                "correlation_id":     t.correlation_id,
                "source":             t.source,
                "metadata_payload":   t.metadata_payload,
                "severity":           t.severity,
                "status":             t.status,
                "risk_score":         t.risk_score,
                "risk_level":         t.risk_level,
            }
            for t in records
        ]
    }
