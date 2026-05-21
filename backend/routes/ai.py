"""
TrustGraph AI – AI Routes (Gemini-powered)

POST /api/ai/explain     – Plain-English fraud decision explanation
POST /api/ai/narrate     – Customer-facing risk notification
POST /api/ai/compliance  – Compliance summary for a flagged batch
POST /api/ai/chat        – Free-form fraud officer chat
"""

from __future__ import annotations
import logging
from typing import Optional, Any

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from backend.database import get_db
from backend.models.db_models import Transaction, FraudAlert
from backend.services.ai_engine import (
    explain_fraud_decision,
    narrate_risk_score,
    compliance_summary,
    chat_with_fraud_agent,
)

router = APIRouter(prefix="/api/ai", tags=["AI (Gemini)"])
logger = logging.getLogger(__name__)


# ──────────────────────────────────────────────
# Schemas
# ──────────────────────────────────────────────

class ExplainRequest(BaseModel):
    transaction_id: str = Field(..., example="TXN-DEMO001")

    class Config:
        json_schema_extra = {"example": {"transaction_id": "TXN-DEMO001"}}


class NarrateRequest(BaseModel):
    transaction_id: str = Field(..., example="TXN-DEMO001")


class ComplianceRequest(BaseModel):
    limit: int = Field(default=50, ge=1, le=500,
                       description="Number of recent HIGH/MEDIUM transactions to summarise")


class ChatRequest(BaseModel):
    message: str = Field(..., example="Why was transaction TXN-DEMO001 blocked?")
    transaction_id: Optional[str] = Field(
        default=None,
        example="TXN-DEMO001",
        description="Optional transaction ID to attach as context"
    )

    class Config:
        json_schema_extra = {
            "example": {
                "message": "Explain the risk factors for account takeover attacks in UPI.",
                "transaction_id": None
            }
        }


class AIResponse(BaseModel):
    model:    str = "gemini-1.5-flash"
    response: str


# ──────────────────────────────────────────────
# POST /api/ai/explain
# ──────────────────────────────────────────────

@router.post(
    "/explain",
    response_model=AIResponse,
    summary="Explain a fraud decision in plain English",
    description=(
        "Fetches the stored transaction analysis and asks Gemini to write "
        "a 3–4 sentence explanation for a fraud officer covering: why it was flagged, "
        "what the risk indicators mean, and what action to take."
    )
)
def explain_transaction(body: ExplainRequest, db: Session = Depends(get_db)):
    txn = db.query(Transaction).filter(
        Transaction.transaction_id == body.transaction_id
    ).first()
    if not txn:
        raise HTTPException(status_code=404,
                            detail=f"Transaction '{body.transaction_id}' not found")

    analysis = {
        "transaction_id":    txn.transaction_id,
        "user_id":           txn.user_id,
        "amount":            txn.amount,
        "risk_score":        txn.risk_score,
        "risk_level":        txn.risk_level,
        "recommended_action":txn.recommended_action,
        "reasons":           txn.risk_reasons or [],
    }
    text = explain_fraud_decision(analysis)
    logger.info("Gemini explain called for %s", body.transaction_id)
    return AIResponse(response=text)


# ──────────────────────────────────────────────
# POST /api/ai/narrate
# ──────────────────────────────────────────────

@router.post(
    "/narrate",
    response_model=AIResponse,
    summary="Customer-friendly risk notification",
    description=(
        "Generates a 2-sentence customer-facing message explaining why a transaction "
        "was held or flagged — in non-technical language. "
        "Useful for in-app notifications or SMS alerts."
    )
)
def narrate_transaction(body: NarrateRequest, db: Session = Depends(get_db)):
    txn = db.query(Transaction).filter(
        Transaction.transaction_id == body.transaction_id
    ).first()
    if not txn:
        raise HTTPException(status_code=404,
                            detail=f"Transaction '{body.transaction_id}' not found")

    analysis = {
        "transaction_id":    txn.transaction_id,
        "risk_score":        txn.risk_score,
        "risk_level":        txn.risk_level,
        "recommended_action":txn.recommended_action,
        "reasons":           txn.risk_reasons or [],
    }
    text = narrate_risk_score(analysis)
    return AIResponse(response=text)


# ──────────────────────────────────────────────
# POST /api/ai/compliance
# ──────────────────────────────────────────────

@router.post(
    "/compliance",
    response_model=AIResponse,
    summary="Compliance summary for flagged batch",
    description=(
        "Fetches the most recent HIGH/MEDIUM risk transactions and asks Gemini "
        "to generate a professional compliance report suitable for RBI/NPCI reporting. "
        "Includes anomaly overview, system actions, and manual review recommendations."
    )
)
def generate_compliance_report(body: ComplianceRequest, db: Session = Depends(get_db)):
    records = (
        db.query(Transaction)
        .filter(Transaction.risk_level.in_(["HIGH", "MEDIUM"]))
        .order_by(Transaction.created_at.desc())
        .limit(body.limit)
        .all()
    )
    if not records:
        raise HTTPException(status_code=404,
                            detail="No HIGH/MEDIUM transactions found for compliance summary.")

    batch = [
        {
            "transaction_id": t.transaction_id,
            "user_id":        t.user_id,
            "amount":         t.amount,
            "risk_level":     t.risk_level,
            "reasons":        t.risk_reasons or [],
        }
        for t in records
    ]
    text = compliance_summary(batch)
    logger.info("Compliance report generated for %d transactions.", len(batch))
    return AIResponse(response=text)


# ──────────────────────────────────────────────
# POST /api/ai/chat
# ──────────────────────────────────────────────

@router.post(
    "/chat",
    response_model=AIResponse,
    summary="Chat with the fraud intelligence agent",
    description=(
        "Free-form question answering powered by Gemini. "
        "Pass an optional `transaction_id` to attach live transaction data as context. "
        "Ask anything: fraud patterns, UPI risks, RBI guidelines, investigation steps."
    )
)
def fraud_chat(body: ChatRequest, db: Session = Depends(get_db)):
    context: dict[str, Any] | None = None

    if body.transaction_id:
        txn = db.query(Transaction).filter(
            Transaction.transaction_id == body.transaction_id
        ).first()
        if txn:
            context = {
                "transaction_id":    txn.transaction_id,
                "user_id":           txn.user_id,
                "amount":            txn.amount,
                "risk_score":        txn.risk_score,
                "risk_level":        txn.risk_level,
                "recommended_action":txn.recommended_action,
                "reasons":           txn.risk_reasons or [],
                "location":          txn.location,
                "payment_type":      txn.payment_type,
                "trusted_device":    txn.trusted_device,
                "login_time":        txn.login_time,
            }

    text = chat_with_fraud_agent(body.message, context)
    return AIResponse(response=text)
