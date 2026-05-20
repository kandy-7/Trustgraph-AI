"""
TrustGraph AI - Behavioral Fraud Detection Engine
Modular, rule-based + behavioral fraud detection for real-time risk intelligence.
"""

from __future__ import annotations
import logging
from datetime import datetime
from typing import Any

from backend.config import (
    RISK_LOW_MAX, RISK_MEDIUM_MAX,
    HIGH_AMOUNT_THRESHOLD,
    MIDNIGHT_HOUR_START, MIDNIGHT_HOUR_END
)

logger = logging.getLogger(__name__)


# ══════════════════════════════════════════════════════════
# Rule Definitions
# ══════════════════════════════════════════════════════════

RULES: list[dict[str, Any]] = [
    {
        "id":     "high_amount",
        "label":  "High Transaction Amount",
        "weight": 30,
        "description": f"Amount exceeds ₹{HIGH_AMOUNT_THRESHOLD:,}"
    },
    {
        "id":     "unknown_device",
        "label":  "Untrusted / Unknown Device",
        "weight": 25,
        "description": "Transaction from unrecognised device"
    },
    {
        "id":     "new_beneficiary",
        "label":  "New Beneficiary",
        "weight": 20,
        "description": "First-time transfer to this recipient"
    },
    {
        "id":     "midnight_login",
        "label":  "Suspicious Login Time",
        "weight": 20,
        "description": f"Login between {MIDNIGHT_HOUR_START:02d}:00 – {MIDNIGHT_HOUR_END:02d}:59"
    },
    {
        "id":     "historical_fraud",
        "label":  "Historical Fraud Signal",
        "weight": 30,
        "description": "Transaction bears a ground-truth fraud label"
    },
    {
        "id":     "location_anomaly",
        "label":  "Location Anomaly",
        "weight": 15,
        "description": "Transaction location differs from user's usual region"
    },
    {
        "id":     "velocity_spike",
        "label":  "Velocity Spike",
        "weight": 20,
        "description": "Amount is ≥10× the user's historical average"
    },
]


# ══════════════════════════════════════════════════════════
# Core Scoring
# ══════════════════════════════════════════════════════════

def _apply_rules(transaction: dict, user_profile: dict | None = None) -> tuple[int, list[str]]:
    """
    Evaluate each rule against the transaction and optional behavioral profile.
    Returns total score (capped at 100) and list of triggered rule IDs.
    """
    score = 0
    triggered: list[str] = []

    # Rule 1 – High Amount
    amount = float(transaction.get("TransactionAmt", 0))
    if amount > HIGH_AMOUNT_THRESHOLD:
        score += 30
        triggered.append("high_amount")

    # Rule 2 – Unknown Device
    if not transaction.get("trusted_device", True):
        score += 25
        triggered.append("unknown_device")

    # Rule 3 – New Beneficiary
    if transaction.get("beneficiary_type") == "new":
        score += 20
        triggered.append("new_beneficiary")

    # Rule 4 – Midnight Login
    login_raw = transaction.get("login_time", "12:00")
    try:
        hour = int(str(login_raw).split(":")[0])
        if MIDNIGHT_HOUR_START <= hour <= MIDNIGHT_HOUR_END:
            score += 20
            triggered.append("midnight_login")
    except (ValueError, AttributeError):
        logger.warning("Could not parse login_time: %s", login_raw)

    # Rule 5 – Historical Fraud Label
    if int(transaction.get("isFraud", 0)) == 1:
        score += 30
        triggered.append("historical_fraud")

    # Rule 6 – Location Anomaly (needs profile)
    if user_profile:
        usual_loc = (user_profile.get("usual_location") or "").lower()
        curr_loc  = (transaction.get("location") or "").lower()
        if usual_loc and curr_loc and usual_loc not in curr_loc and curr_loc != "unknown":
            score += 15
            triggered.append("location_anomaly")

        # Rule 7 – Velocity Spike (needs profile)
        avg = float(user_profile.get("avg_amount", 0) or 0)
        if avg > 0 and amount >= avg * 10:
            score += 20
            triggered.append("velocity_spike")

    return min(score, 100), triggered


# ══════════════════════════════════════════════════════════
# Risk Classification
# ══════════════════════════════════════════════════════════

def classify_risk(score: int) -> dict[str, Any]:
    """Map numeric score → risk band + recommended action."""
    if score <= RISK_LOW_MAX:
        return {
            "risk_level":         "LOW",
            "recommended_action": "ALLOW",
            "alert":              False
        }
    elif score <= RISK_MEDIUM_MAX:
        return {
            "risk_level":         "MEDIUM",
            "recommended_action": "VERIFY",
            "suggested_step":     "OTP re-verification required",
            "alert":              True
        }
    else:
        return {
            "risk_level":         "HIGH",
            "recommended_action": "BLOCK",
            "suggested_step":     "Escalate to fraud investigation team",
            "alert":              True
        }


# ══════════════════════════════════════════════════════════
# Public API
# ══════════════════════════════════════════════════════════

def analyze_transaction(transaction: dict, user_profile: dict | None = None) -> dict:
    """
    Main entry point.
    Validates → scores → classifies → returns full analysis report.

    Args:
        transaction:  Raw transaction payload dict (matches TransactionRequest).
        user_profile: Optional behavioral baseline for the user.

    Returns:
        Analysis report dict (matches TransactionResponse).
    """
    txn_id  = transaction.get("TransactionID", "UNKNOWN")
    user_id = transaction.get("user_id", "UNKNOWN")

    # ── Validation ──────────────────────────────────────
    required = ["TransactionID", "user_id", "TransactionAmt"]
    missing  = [f for f in required if f not in transaction]
    if missing:
        logger.error("Transaction %s rejected – missing fields: %s", txn_id, missing)
        return {
            "error":          "Missing required fields",
            "missing_fields": missing,
            "status":         "FAILED"
        }

    # ── Score ────────────────────────────────────────────
    score, reasons = _apply_rules(transaction, user_profile)

    # ── Classify ─────────────────────────────────────────
    classification = classify_risk(score)

    # ── Build Report ─────────────────────────────────────
    report: dict[str, Any] = {
        "transaction_id":     txn_id,
        "user_id":            user_id,
        "amount":             float(transaction.get("TransactionAmt", 0)),
        "risk_score":         score,
        "risk_level":         classification["risk_level"],
        "alert":              classification["alert"],
        "recommended_action": classification["recommended_action"],
        "reasons":            reasons,
        "timestamp":          datetime.utcnow().isoformat()
    }
    if "suggested_step" in classification:
        report["suggested_step"] = classification["suggested_step"]

    # ── Log ───────────────────────────────────────────────
    log = logger.warning if report["risk_level"] == "HIGH" else logger.info
    log(
        "Transaction %s | User %s | Risk %s (%d/100) | Triggers: %s",
        txn_id, user_id, report["risk_level"], score, reasons
    )

    return report


def get_rule_catalogue() -> list[dict]:
    """Return the full list of fraud detection rules (for the /rules endpoint)."""
    return RULES
