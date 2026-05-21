"""
TrustGraph AI – database/validators.py
Row-level validation for each CSV dataset.

Each validator:
  - Checks required columns are present
  - Validates data types / value ranges
  - Returns (is_valid: bool, reason: str)
"""

from __future__ import annotations
from typing import Any


# ──────────────────────────────────────────────
# Required column definitions
# ──────────────────────────────────────────────
REQUIRED_COLUMNS = {
    "transactions": [
        "transaction_id", "user_id", "amount", "location",
        "device", "login_time", "beneficiary_type", "payment_type",
    ],
    "user_profiles": [
        "user_id", "avg_transaction", "usual_location", "trusted_devices",
    ],
    "blacklisted_accounts": ["account_id", "reason"],
    "fraud_patterns":       ["pattern_id", "description", "risk_score"],
}

VALID_PAYMENT_TYPES     = {"UPI", "IMPS", "NEFT", "CARD", "RTGS", "CHEQUE"}
VALID_BENEFICIARY_TYPES = {"known", "new"}
VALID_RISK_LEVELS       = {"LOW", "MEDIUM", "HIGH", "CRITICAL"}


# ──────────────────────────────────────────────
# Column-presence check (called once per CSV)
# ──────────────────────────────────────────────
def check_required_columns(df_columns: list[str], table: str) -> list[str]:
    """
    Return a list of missing column names for the given table.
    An empty list means all required columns are present.
    """
    required = REQUIRED_COLUMNS.get(table, [])
    return [col for col in required if col not in df_columns]


# ──────────────────────────────────────────────
# Row validators
# ──────────────────────────────────────────────

def validate_transaction_row(row: dict[str, Any]) -> tuple[bool, str]:
    """
    Validate a single transaction row.

    Returns:
        (True, "OK")  – row is valid
        (False, reason) – row should be skipped
    """
    # ── Required non-null fields ──────────────
    for field in ("transaction_id", "user_id", "amount"):
        val = row.get(field)
        if val is None or str(val).strip() == "" or str(val).lower() == "nan":
            return False, f"Missing required field: '{field}'"

    # ── Amount: must be positive float ────────
    try:
        amount = float(row["amount"])
        if amount <= 0:
            return False, f"Amount must be positive, got {amount}"
    except (TypeError, ValueError):
        return False, f"Amount is not a valid number: {row['amount']!r}"

    # ── login_time: HH:MM format ───────────────
    login_time = str(row.get("login_time", "")).strip()
    if login_time and login_time.lower() != "nan":
        parts = login_time.split(":")
        try:
            hour, minute = int(parts[0]), int(parts[1])
            if not (0 <= hour <= 23 and 0 <= minute <= 59):
                return False, f"login_time out of range: {login_time}"
        except (IndexError, ValueError):
            return False, f"login_time format invalid (expected HH:MM): {login_time}"

    # ── beneficiary_type ──────────────────────
    btype = str(row.get("beneficiary_type", "")).strip().lower()
    if btype and btype != "nan" and btype not in VALID_BENEFICIARY_TYPES:
        return False, f"beneficiary_type must be one of {VALID_BENEFICIARY_TYPES}, got {btype!r}"

    # ── payment_type ──────────────────────────
    ptype = str(row.get("payment_type", "")).strip().upper()
    if ptype and ptype != "NAN" and ptype not in VALID_PAYMENT_TYPES:
        return False, f"payment_type must be one of {VALID_PAYMENT_TYPES}, got {ptype!r}"

    return True, "OK"


def validate_user_profile_row(row: dict[str, Any]) -> tuple[bool, str]:
    """Validate a single user_profiles row."""
    for field in ("user_id",):
        val = row.get(field)
        if val is None or str(val).strip() == "" or str(val).lower() == "nan":
            return False, f"Missing required field: '{field}'"

    avg = row.get("avg_transaction")
    if avg is not None and str(avg).lower() != "nan":
        try:
            avg_val = float(avg)
            if avg_val < 0:
                return False, f"avg_transaction cannot be negative, got {avg_val}"
        except (TypeError, ValueError):
            return False, f"avg_transaction is not a valid number: {avg!r}"

    return True, "OK"


def validate_blacklisted_row(row: dict[str, Any]) -> tuple[bool, str]:
    """Validate a single blacklisted_accounts row."""
    for field in ("account_id", "reason"):
        val = row.get(field)
        if val is None or str(val).strip() == "" or str(val).lower() == "nan":
            return False, f"Missing required field: '{field}'"
    return True, "OK"


def validate_fraud_pattern_row(row: dict[str, Any]) -> tuple[bool, str]:
    """Validate a single fraud_patterns row."""
    for field in ("pattern_id", "description"):
        val = row.get(field)
        if val is None or str(val).strip() == "" or str(val).lower() == "nan":
            return False, f"Missing required field: '{field}'"

    risk = row.get("risk_score")
    if risk is None or str(risk).lower() == "nan":
        return False, "Missing required field: 'risk_score'"
    try:
        score = int(float(risk))
        if not (0 <= score <= 100):
            return False, f"risk_score must be 0–100, got {score}"
    except (TypeError, ValueError):
        return False, f"risk_score is not a valid integer: {risk!r}"

    return True, "OK"


# ──────────────────────────────────────────────
# Dispatch helper
# ──────────────────────────────────────────────
_VALIDATORS = {
    "transactions":         validate_transaction_row,
    "user_profiles":        validate_user_profile_row,
    "blacklisted_accounts": validate_blacklisted_row,
    "fraud_patterns":       validate_fraud_pattern_row,
}


def validate_row(table: str, row: dict[str, Any]) -> tuple[bool, str]:
    """Dispatch row validation to the appropriate validator by table name."""
    validator = _VALIDATORS.get(table)
    if validator is None:
        return True, "OK"   # no validator registered → pass through
    return validator(row)
