"""
TrustGraph AI – database/queries.py
Reusable database query functions and fraud logging API.

Public API
──────────
Transaction retrieval:
    get_all_transactions(db, skip, limit)
    get_transaction_by_id(db, transaction_id)
    get_user_transactions(db, user_id)

Reference data:
    get_blacklisted_accounts(db)
    get_user_profile(db, user_id)
    get_fraud_patterns(db)

Fraud logging:
    log_fraud_alert(db, transaction_id, risk_score, risk_level, reasons)

Utility:
    is_blacklisted(db, account_id)
    get_fraud_logs(db, skip, limit)
    get_fraud_logs_by_transaction(db, transaction_id)
"""

from __future__ import annotations

from datetime import datetime, timezone
from typing import Any

from sqlalchemy.orm import Session

from backend.models.db_models import (
    Transaction, FraudAlert, UserProfile, BlacklistedAccount, FraudPattern, FraudLog
)


# ══════════════════════════════════════════════
# Transaction Retrieval
# ══════════════════════════════════════════════

def get_all_transactions(
    db: Session,
    skip: int = 0,
    limit: int = 100,
) -> list[dict]:
    """
    Return all transactions (paginated).

    Args:
        db:    SQLAlchemy session
        skip:  offset (default 0)
        limit: max rows returned (default 100)

    Returns:
        List of transaction dicts ordered by newest first.
    """
    rows = (
        db.query(Transaction)
        .order_by(Transaction.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )
    return [r.to_dict() for r in rows]


def get_transaction_by_id(
    db: Session,
    transaction_id: str,
) -> dict | None:
    """
    Fetch a single transaction by its business ID (e.g. 'TXN001').

    Returns:
        Transaction dict, or None if not found.
    """
    row = (
        db.query(Transaction)
        .filter(Transaction.transaction_id == transaction_id)
        .first()
    )
    return row.to_dict() if row else None


def get_user_transactions(
    db: Session,
    user_id: str,
    skip: int = 0,
    limit: int = 100,
) -> list[dict]:
    """
    Return all transactions for a given user_id.

    Returns:
        List of transaction dicts ordered by newest first.
    """
    rows = (
        db.query(Transaction)
        .filter(Transaction.user_id == user_id)
        .order_by(Transaction.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )
    return [r.to_dict() for r in rows]


# ══════════════════════════════════════════════
# Reference Data
# ══════════════════════════════════════════════

def get_blacklisted_accounts(db: Session) -> list[dict]:
    """Return all blacklisted accounts."""
    rows = db.query(BlacklistedAccount).order_by(BlacklistedAccount.account_id).all()
    return [r.to_dict() for r in rows]


def get_user_profile(db: Session, user_id: str) -> dict | None:
    """
    Fetch the behavioural profile for a user.

    Returns:
        UserProfile dict, or None if not found.
    """
    row = db.query(UserProfile).filter(UserProfile.user_id == user_id).first()
    return row.to_dict() if row else None


def get_fraud_patterns(db: Session) -> list[dict]:
    """Return all registered fraud patterns, ordered by risk_score descending."""
    rows = (
        db.query(FraudPattern)
        .order_by(FraudPattern.risk_score.desc())
        .all()
    )
    return [r.to_dict() for r in rows]


# ══════════════════════════════════════════════
# Utility / Lookup
# ══════════════════════════════════════════════

def is_blacklisted(db: Session, account_id: str) -> bool:
    """Return True if the account_id appears in blacklisted_accounts."""
    return (
        db.query(BlacklistedAccount)
        .filter(BlacklistedAccount.account_id == account_id)
        .first()
    ) is not None


# ══════════════════════════════════════════════
# Fraud Logging
# ══════════════════════════════════════════════

def log_fraud_alert(
    db: Session,
    transaction_id: str,
    risk_score: int,
    risk_level: str,
    reasons: list[str] | None = None,
) -> dict:
    """
    Insert a fraud alert into fraud_logs and return the saved record.

    Args:
        db:             SQLAlchemy session
        transaction_id: business transaction ID (e.g. 'TXN001')
        risk_score:     integer 0–100
        risk_level:     one of LOW | MEDIUM | HIGH | CRITICAL
        reasons:        list of human-readable reason strings

    Returns:
        The newly created FraudLog as a dict (includes auto-assigned id and timestamp).

    Example:
        log_fraud_alert(
            db,
            transaction_id = "TXN002",
            risk_score     = 88,
            risk_level     = "HIGH",
            reasons        = ["Midnight transfer", "Untrusted device", "New beneficiary"],
        )
    """
    if reasons is None:
        reasons = []

    log = FraudLog(
        transaction_id = transaction_id,
        risk_score     = int(risk_score),
        risk_level     = str(risk_level).upper(),
        reasons        = reasons,
        timestamp      = datetime.now(tz=timezone.utc),
    )
    db.add(log)
    db.commit()
    db.refresh(log)
    return log.to_dict()


# ══════════════════════════════════════════════
# Fraud Log Retrieval
# ══════════════════════════════════════════════

def get_fraud_logs(
    db: Session,
    skip: int = 0,
    limit: int = 100,
) -> list[dict]:
    """Return all fraud logs, newest first (paginated)."""
    rows = (
        db.query(FraudLog)
        .order_by(FraudLog.timestamp.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )
    return [r.to_dict() for r in rows]


def get_fraud_logs_by_transaction(
    db: Session,
    transaction_id: str,
) -> list[dict]:
    """Return all fraud logs associated with a specific transaction_id."""
    rows = (
        db.query(FraudLog)
        .filter(FraudLog.transaction_id == transaction_id)
        .order_by(FraudLog.timestamp.desc())
        .all()
    )
    return [r.to_dict() for r in rows]


# ══════════════════════════════════════════════
# Backend integration helpers
# ══════════════════════════════════════════════

def get_user_history_summary(db: Session, user_id: str) -> dict[str, Any]:
    """
    Aggregate summary for a user, combining profile + transaction history.
    Useful for risk-scoring context in the fraud engine.

    Returns dict with:
        profile:       UserProfile dict (or None)
        transactions:  last 20 transactions
        total_count:   total transaction count for user
        is_blacklisted: bool
    """
    profile = get_user_profile(db, user_id)
    transactions = get_user_transactions(db, user_id, limit=20)
    total_count = (
        db.query(Transaction)
        .filter(Transaction.user_id == user_id)
        .count()
    )
    blacklisted = is_blacklisted(db, user_id)

    return {
        "profile":        profile,
        "transactions":   transactions,
        "total_count":    total_count,
        "is_blacklisted": blacklisted,
    }
