"""
TrustGraph AI - Transaction Routes
POST /api/transaction – Analyse a single transaction.
GET  /api/transactions – List all stored transactions.
GET  /api/transactions/{txn_id} – Get one transaction.
GET  /api/stats – Dashboard aggregate stats.
GET  /api/rules – List active fraud detection rules.
"""

from __future__ import annotations
import uuid
import logging
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from backend.database import get_db
from backend.models.schemas import (
    TransactionRequest, TransactionResponse,
    DashboardStats, SuccessResponse
)
from backend.models.db_models import Transaction, FraudAlert, UserProfile
from backend.services.fraud_engine import analyze_transaction, get_rule_catalogue

router = APIRouter(prefix="/api", tags=["Transactions"])
logger = logging.getLogger(__name__)


# ──────────────────────────────────────────────
# POST /api/transaction
# ──────────────────────────────────────────────

@router.post(
    "/transaction",
    response_model=TransactionResponse,
    summary="Analyse a transaction for fraud",
    description=(
        "Submit a transaction payload. The fraud engine evaluates 7 behavioural rules, "
        "computes a risk score (0–100), classifies the risk (LOW/MEDIUM/HIGH), "
        "recommends an action (ALLOW/VERIFY/BLOCK), and persists everything to the DB."
    )
)
def analyse_transaction(payload: TransactionRequest, db: Session = Depends(get_db)):
    txn_dict = payload.model_dump()

    # Lookup user profile for behavioural comparison
    profile = db.query(UserProfile).filter(
        UserProfile.user_id == payload.user_id
    ).first()
    profile_dict = None
    if profile:
        profile_dict = {
            "usual_location": profile.usual_location,
            "avg_amount":     profile.avg_amount,
            "known_devices":  profile.known_devices or [],
        }

    # Run fraud engine
    result = analyze_transaction(txn_dict, profile_dict)

    if "error" in result:
        raise HTTPException(status_code=422, detail=result)

    # Persist transaction to DB
    db_txn = Transaction(
        transaction_id    = result["transaction_id"],
        user_id           = result["user_id"],
        amount            = result["amount"],
        payment_type      = payload.payment_type,
        location          = payload.location,
        beneficiary_id    = payload.beneficiary_id,
        beneficiary_type  = payload.beneficiary_type,
        device_id         = payload.device_id,
        trusted_device    = payload.trusted_device,
        login_time        = payload.login_time,
        is_fraud          = payload.isFraud,
        risk_score        = result["risk_score"],
        risk_level        = result["risk_level"],
        risk_reasons      = result["reasons"],
        recommended_action= result["recommended_action"],
        suggested_step    = result.get("suggested_step"),
    )
    db.add(db_txn)

    # Create alert for MEDIUM / HIGH risk
    if result["alert"]:
        alert = FraudAlert(
            alert_id          = f"ALT-{uuid.uuid4().hex[:10].upper()}",
            transaction_id    = result["transaction_id"],
            user_id           = result["user_id"],
            risk_score        = result["risk_score"],
            risk_level        = result["risk_level"],
            reasons           = result["reasons"],
            recommended_action= result["recommended_action"],
            suggested_step    = result.get("suggested_step"),
            status            = "OPEN"
        )
        db.add(alert)

    # Update user profile running stats
    if profile:
        profile.total_txns += 1
        if payload.isFraud:
            profile.fraud_txns += 1
        # Incremental avg
        profile.avg_amount = (
            (profile.avg_amount * (profile.total_txns - 1) + payload.TransactionAmt)
            / profile.total_txns
        )
    else:
        new_profile = UserProfile(
            user_id        = payload.user_id,
            usual_location = payload.location,
            avg_amount     = payload.TransactionAmt,
            max_amount     = payload.TransactionAmt,
            usual_login_hour = int(payload.login_time.split(":")[0]),
            known_devices  = [payload.device_id] if payload.device_id else [],
            known_beneficiaries = [payload.beneficiary_id] if payload.beneficiary_id else [],
            total_txns     = 1,
            fraud_txns     = payload.isFraud
        )
        db.add(new_profile)

    db.commit()
    logger.info("Transaction %s stored. Risk: %s", result["transaction_id"], result["risk_level"])
    return result


# ──────────────────────────────────────────────
# GET /api/transactions
# ──────────────────────────────────────────────

@router.get(
    "/transactions",
    summary="List all analysed transactions",
    description="Returns paginated list of all transactions. Filter by risk_level or user_id."
)
def list_transactions(
    risk_level: Optional[str] = Query(None, examples=["HIGH"]),
    user_id:    Optional[str] = Query(None, examples=["USR-10042"]),
    limit:      int           = Query(50,  ge=1, le=500),
    offset:     int           = Query(0,   ge=0),
    db: Session = Depends(get_db)
):
    q = db.query(Transaction)
    if risk_level:
        q = q.filter(Transaction.risk_level == risk_level.upper())
    if user_id:
        q = q.filter(Transaction.user_id == user_id)

    total   = q.count()
    records = q.order_by(Transaction.created_at.desc()).offset(offset).limit(limit).all()

    return {
        "total":  total,
        "offset": offset,
        "limit":  limit,
        "data": [
            {
                "transaction_id":    t.transaction_id,
                "user_id":           t.user_id,
                "amount":            t.amount,
                "payment_type":      t.payment_type,
                "location":          t.location,
                "risk_score":        t.risk_score,
                "risk_level":        t.risk_level,
                "recommended_action":t.recommended_action,
                "reasons":           t.risk_reasons,
                "created_at":        t.created_at,
            }
            for t in records
        ]
    }


# ──────────────────────────────────────────────
# GET /api/transactions/{txn_id}
# ──────────────────────────────────────────────

@router.get(
    "/transactions/{txn_id}",
    summary="Get a single transaction by ID"
)
def get_transaction(txn_id: str, db: Session = Depends(get_db)):
    txn = db.query(Transaction).filter(Transaction.transaction_id == txn_id).first()
    if not txn:
        raise HTTPException(status_code=404, detail=f"Transaction '{txn_id}' not found")
    return {
        "transaction_id":    txn.transaction_id,
        "user_id":           txn.user_id,
        "amount":            txn.amount,
        "payment_type":      txn.payment_type,
        "location":          txn.location,
        "beneficiary_id":    txn.beneficiary_id,
        "beneficiary_type":  txn.beneficiary_type,
        "trusted_device":    txn.trusted_device,
        "login_time":        txn.login_time,
        "risk_score":        txn.risk_score,
        "risk_level":        txn.risk_level,
        "recommended_action":txn.recommended_action,
        "suggested_step":    txn.suggested_step,
        "reasons":           txn.risk_reasons,
        "is_fraud":          txn.is_fraud,
        "created_at":        txn.created_at,
    }


# ──────────────────────────────────────────────
# GET /api/stats
# ──────────────────────────────────────────────

@router.get(
    "/stats",
    response_model=DashboardStats,
    summary="Dashboard aggregate statistics"
)
def dashboard_stats(db: Session = Depends(get_db)):
    total  = db.query(Transaction).count()
    high   = db.query(Transaction).filter(Transaction.risk_level == "HIGH").count()
    medium = db.query(Transaction).filter(Transaction.risk_level == "MEDIUM").count()
    low    = db.query(Transaction).filter(Transaction.risk_level == "LOW").count()
    blocked= db.query(Transaction).filter(Transaction.recommended_action == "BLOCK").count()
    alerts_open = db.query(FraudAlert).filter(FraudAlert.status == "OPEN").count()

    fraud_rate = round((high / total * 100), 2) if total else 0.0

    return DashboardStats(
        total_transactions = total,
        high_risk_count    = high,
        medium_risk_count  = medium,
        low_risk_count     = low,
        fraud_rate_pct     = fraud_rate,
        blocked_count      = blocked,
        alerts_open        = alerts_open
    )


# ──────────────────────────────────────────────
# GET /api/rules
# ──────────────────────────────────────────────

@router.get(
    "/rules",
    summary="List all active fraud detection rules"
)
def fraud_rules():
    return {"rules": get_rule_catalogue()}
