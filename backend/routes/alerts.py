"""
TrustGraph AI - Fraud Alert Routes
GET    /api/alerts          – List all fraud alerts (filterable)
GET    /api/alerts/{id}     – Single alert detail
PATCH  /api/alerts/{id}     – Officer updates status / notes
DELETE /api/alerts/{id}     – Close an alert
"""

from __future__ import annotations
import logging
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from backend.database import get_db
from backend.models.db_models import FraudAlert
from backend.models.schemas import AlertResponse, AlertUpdateRequest

router = APIRouter(prefix="/api/alerts", tags=["Fraud Alerts"])
logger = logging.getLogger(__name__)


# ──────────────────────────────────────────────
# GET /api/alerts
# ──────────────────────────────────────────────

@router.get(
    "",
    summary="List fraud alerts",
    description=(
        "Returns paginated fraud alerts. Filter by risk_level (HIGH/MEDIUM), "
        "status (OPEN/REVIEWED/CLOSED), or user_id."
    )
)
def list_alerts(
    risk_level: Optional[str] = Query(None, examples=["HIGH"]),
    status:     Optional[str] = Query(None, examples=["OPEN"]),
    user_id:    Optional[str] = Query(None, examples=["USR-10042"]),
    limit:      int           = Query(50, ge=1, le=500),
    offset:     int           = Query(0,  ge=0),
    db: Session = Depends(get_db)
):
    q = db.query(FraudAlert)
    if risk_level:
        q = q.filter(FraudAlert.risk_level == risk_level.upper())
    if status:
        q = q.filter(FraudAlert.status == status.upper())
    if user_id:
        q = q.filter(FraudAlert.user_id == user_id)

    total   = q.count()
    records = q.order_by(FraudAlert.created_at.desc()).offset(offset).limit(limit).all()

    return {
        "total":  total,
        "offset": offset,
        "limit":  limit,
        "data": [
            {
                "alert_id":          a.alert_id,
                "transaction_id":    a.transaction_id,
                "user_id":           a.user_id,
                "risk_score":        a.risk_score,
                "risk_level":        a.risk_level,
                "reasons":           a.reasons,
                "recommended_action":a.recommended_action,
                "suggested_step":    a.suggested_step,
                "status":            a.status,
                "officer_notes":     a.officer_notes,
                "created_at":        a.created_at,
            }
            for a in records
        ]
    }


# ──────────────────────────────────────────────
# GET /api/alerts/{alert_id}
# ──────────────────────────────────────────────

@router.get(
    "/{alert_id}",
    response_model=AlertResponse,
    summary="Get a single alert by ID"
)
def get_alert(alert_id: str, db: Session = Depends(get_db)):
    alert = db.query(FraudAlert).filter(FraudAlert.alert_id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail=f"Alert '{alert_id}' not found")
    return AlertResponse(
        alert_id          = alert.alert_id,
        transaction_id    = alert.transaction_id,
        user_id           = alert.user_id,
        risk_score        = alert.risk_score,
        risk_level        = alert.risk_level,
        reasons           = alert.reasons or [],
        recommended_action= alert.recommended_action,
        suggested_step    = alert.suggested_step,
        status            = alert.status,
        officer_notes     = alert.officer_notes,
        created_at        = alert.created_at,
    )


# ──────────────────────────────────────────────
# PATCH /api/alerts/{alert_id}
# ──────────────────────────────────────────────

@router.patch(
    "/{alert_id}",
    summary="Update alert status or add officer notes",
    description=(
        "Fraud officer can change status to REVIEWED or CLOSED "
        "and append investigation notes."
    )
)
def update_alert(
    alert_id: str,
    body:     AlertUpdateRequest,
    db: Session = Depends(get_db)
):
    alert = db.query(FraudAlert).filter(FraudAlert.alert_id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail=f"Alert '{alert_id}' not found")

    valid_statuses = {"OPEN", "REVIEWED", "CLOSED"}
    if body.status:
        if body.status.upper() not in valid_statuses:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid status. Choose from: {valid_statuses}"
            )
        alert.status = body.status.upper()

    if body.officer_notes is not None:
        alert.officer_notes = body.officer_notes

    db.commit()
    db.refresh(alert)
    logger.info("Alert %s updated → status: %s", alert_id, alert.status)

    return {
        "success":       True,
        "alert_id":      alert.alert_id,
        "status":        alert.status,
        "officer_notes": alert.officer_notes
    }


# ──────────────────────────────────────────────
# DELETE /api/alerts/{alert_id}
# ──────────────────────────────────────────────

@router.delete(
    "/{alert_id}",
    summary="Close (soft-delete) an alert"
)
def close_alert(alert_id: str, db: Session = Depends(get_db)):
    alert = db.query(FraudAlert).filter(FraudAlert.alert_id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail=f"Alert '{alert_id}' not found")

    alert.status = "CLOSED"
    db.commit()
    return {"success": True, "alert_id": alert_id, "status": "CLOSED"}
