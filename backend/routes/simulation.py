"""
TrustGraph AI - Simulation Routes
POST /api/simulate            – Generate and analyse simulated transactions
GET  /api/simulate/scenarios  – List available fraud scenario templates
"""

from __future__ import annotations
import logging

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from backend.database import get_db
from backend.models.schemas import SimulateRequest, SimulateResponse, TransactionResponse
from backend.services.simulator import generate_transactions, list_scenarios
from backend.services.fraud_engine import analyze_transaction
from backend.models.db_models import Transaction, FraudAlert
import uuid

router = APIRouter(prefix="/api/simulate", tags=["Simulation"])
logger = logging.getLogger(__name__)


# ──────────────────────────────────────────────
# POST /api/simulate
# ──────────────────────────────────────────────

@router.post(
    "",
    response_model=SimulateResponse,
    summary="Run a fraud simulation",
    description=(
        "Generate synthetic transactions for a named scenario "
        "(account_takeover, sim_swap, upi_phishing, mule_account, normal_user, random). "
        "Each transaction is run through the full fraud engine and persisted."
    )
)
def run_simulation(payload: SimulateRequest, db: Session = Depends(get_db)):
    valid_keys = {s["key"] for s in list_scenarios()}
    if payload.scenario not in valid_keys:
        raise HTTPException(
            status_code=400,
            detail=f"Unknown scenario '{payload.scenario}'. "
                   f"Valid: {sorted(valid_keys)}"
        )

    raw_txns = generate_transactions(
        scenario = payload.scenario,
        count    = payload.count,
        user_id  = payload.user_id
    )

    results: list[TransactionResponse] = []

    for raw in raw_txns:
        analysis = analyze_transaction(raw)
        if "error" in analysis:
            logger.warning("Skipping bad simulated txn: %s", analysis)
            continue

        # Persist
        db_txn = Transaction(
            transaction_id    = analysis["transaction_id"],
            user_id           = analysis["user_id"],
            amount            = analysis["amount"],
            payment_type      = raw.get("payment_type", "UPI"),
            location          = raw.get("location", "Unknown"),
            beneficiary_id    = raw.get("beneficiary_id"),
            beneficiary_type  = raw.get("beneficiary_type", "known"),
            device_id         = raw.get("device_id"),
            trusted_device    = raw.get("trusted_device", True),
            login_time        = raw.get("login_time", "12:00"),
            is_fraud          = raw.get("isFraud", 0),
            risk_score        = analysis["risk_score"],
            risk_level        = analysis["risk_level"],
            risk_reasons      = analysis["reasons"],
            recommended_action= analysis["recommended_action"],
            suggested_step    = analysis.get("suggested_step"),
        )
        db.add(db_txn)

        if analysis["alert"]:
            db.add(FraudAlert(
                alert_id          = f"ALT-{uuid.uuid4().hex[:10].upper()}",
                transaction_id    = analysis["transaction_id"],
                user_id           = analysis["user_id"],
                risk_score        = analysis["risk_score"],
                risk_level        = analysis["risk_level"],
                reasons           = analysis["reasons"],
                recommended_action= analysis["recommended_action"],
                suggested_step    = analysis.get("suggested_step"),
                status            = "OPEN"
            ))

        results.append(TransactionResponse(**analysis))

    db.commit()
    logger.info("Simulation '%s' generated %d transactions.", payload.scenario, len(results))

    return SimulateResponse(
        scenario  = payload.scenario,
        generated = len(results),
        results   = results
    )


# ──────────────────────────────────────────────
# GET /api/simulate/scenarios
# ──────────────────────────────────────────────

@router.get(
    "/scenarios",
    summary="List all available fraud simulation scenarios"
)
def get_scenarios():
    return {"scenarios": list_scenarios()}
