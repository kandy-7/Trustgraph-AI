"""
TrustGraph AI - Transaction Simulator Service
Generates realistic fraud and normal transaction payloads for testing.
"""

from __future__ import annotations
import uuid
import random
from datetime import datetime
from typing import Any


# ──────────────────────────────────────────────
# Scenario Templates
# ──────────────────────────────────────────────

SCENARIOS: dict[str, dict[str, Any]] = {

    "account_takeover": {
        "description": "Attacker takes over account and drains funds via new beneficiary at midnight",
        "TransactionAmt_range": (60000, 200000),
        "login_time_range":     (0, 4),
        "trusted_device":       False,
        "beneficiary_type":     "new",
        "location":             "Unknown",
        "isFraud":              1,
        "payment_type":         "UPI",
    },

    "sim_swap": {
        "description": "SIM swap fraud – new device, high amount, new beneficiary",
        "TransactionAmt_range": (50000, 150000),
        "login_time_range":     (1, 5),
        "trusted_device":       False,
        "beneficiary_type":     "new",
        "location":             "Delhi",
        "isFraud":              1,
        "payment_type":         "UPI",
    },

    "upi_phishing": {
        "description": "UPI phishing – medium amount, known device, but new beneficiary",
        "TransactionAmt_range": (5000, 30000),
        "login_time_range":     (9, 22),
        "trusted_device":       True,
        "beneficiary_type":     "new",
        "location":             "Chennai",
        "isFraud":              1,
        "payment_type":         "UPI",
    },

    "mule_account": {
        "description": "Money mule – receives and forwards funds rapidly through chain",
        "TransactionAmt_range": (10000, 80000),
        "login_time_range":     (8, 20),
        "trusted_device":       True,
        "beneficiary_type":     "new",
        "location":             "Hyderabad",
        "isFraud":              1,
        "payment_type":         "NEFT",
    },

    "normal_user": {
        "description": "Legitimate user performing a routine transaction",
        "TransactionAmt_range": (200, 5000),
        "login_time_range":     (8, 21),
        "trusted_device":       True,
        "beneficiary_type":     "known",
        "location":             "Tamil Nadu",
        "isFraud":              0,
        "payment_type":         "UPI",
    },
}

LOCATIONS = [
    "Tamil Nadu", "Mumbai", "Delhi", "Bangalore", "Hyderabad",
    "Chennai", "Kolkata", "Pune", "Ahmedabad", "Jaipur"
]

PAYMENT_TYPES = ["UPI", "NEFT", "RTGS", "IMPS", "Wallet"]


# ──────────────────────────────────────────────
# Generator
# ──────────────────────────────────────────────

def _make_transaction(scenario_key: str, user_id: str | None = None) -> dict:
    """Build a single transaction dict from a named scenario template."""
    template = SCENARIOS.get(scenario_key)
    if not template:
        # Fallback: fully random mix
        template = random.choice(list(SCENARIOS.values()))

    lo, hi = template["TransactionAmt_range"]
    hour_lo, hour_hi = template["login_time_range"]
    hour = random.randint(hour_lo, hour_hi)
    minute = random.randint(0, 59)

    return {
        "TransactionID":   f"SIM-{uuid.uuid4().hex[:10].upper()}",
        "user_id":         user_id or f"USR-{random.randint(10000, 99999)}",
        "TransactionAmt":  round(random.uniform(lo, hi), 2),
        "payment_type":    template.get("payment_type", random.choice(PAYMENT_TYPES)),
        "location":        template.get("location", random.choice(LOCATIONS)),
        "beneficiary_id":  f"BEN-{random.randint(10000, 99999)}",
        "beneficiary_type":template["beneficiary_type"],
        "device_id":       f"DEV-{uuid.uuid4().hex[:8]}",
        "trusted_device":  template["trusted_device"],
        "login_time":      f"{hour:02d}:{minute:02d}",
        "isFraud":         template["isFraud"],
        "_scenario":       scenario_key,
    }


def _make_random_transaction(user_id: str | None = None) -> dict:
    """Generate a fully random transaction (50/50 fraud vs normal)."""
    fraud = random.random() > 0.5
    key   = random.choice(
        [k for k, v in SCENARIOS.items() if v["isFraud"] == (1 if fraud else 0)]
    )
    return _make_transaction(key, user_id)


# ──────────────────────────────────────────────
# Public API
# ──────────────────────────────────────────────

def generate_transactions(
    scenario: str = "random",
    count: int = 1,
    user_id: str | None = None
) -> list[dict]:
    """
    Generate `count` transactions for a given scenario.

    Args:
        scenario: Scenario key or "random".
        count:    Number of transactions (1–50).
        user_id:  Optional fixed user ID (else random per transaction).

    Returns:
        List of raw transaction dicts ready for fraud_engine.analyze_transaction().
    """
    count = max(1, min(count, 50))
    results = []

    for _ in range(count):
        if scenario == "random":
            txn = _make_random_transaction(user_id)
        else:
            txn = _make_transaction(scenario, user_id)
        results.append(txn)

    return results


def list_scenarios() -> list[dict]:
    """Return available scenario names and descriptions."""
    return [
        {"key": k, "description": v["description"], "is_fraud": bool(v["isFraud"])}
        for k, v in SCENARIOS.items()
    ] + [{"key": "random", "description": "50/50 mix of fraud and normal", "is_fraud": None}]
