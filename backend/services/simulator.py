"""
TrustGraph AI - Simulator Service
Generates realistic fraud attack stories and normal event sequences.
Preserves legacy generate_transactions for backward compatibility.
Now augmented to generate raw client telemetry.
"""

from __future__ import annotations
import uuid
import random
from datetime import datetime, timedelta
from typing import Any

from backend.models.schemas import EventType, EventSource


# ══════════════════════════════════════════════════════════
# Legacy Scenario Templates (For Transactions)
# ══════════════════════════════════════════════════════════

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


# ══════════════════════════════════════════════════════════
# Legacy Generator
# ══════════════════════════════════════════════════════════

def _make_transaction(scenario_key: str, user_id: str | None = None) -> dict:
    template = SCENARIOS.get(scenario_key)
    if not template:
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
    fraud = random.random() > 0.5
    key   = random.choice(
        [k for k, v in SCENARIOS.items() if v["isFraud"] == (1 if fraud else 0)]
    )
    return _make_transaction(key, user_id)

def generate_transactions(scenario: str = "random", count: int = 1, user_id: str | None = None) -> list[dict]:
    count = max(1, min(count, 50))
    results = []
    for _ in range(count):
        if scenario == "random":
            txn = _make_random_transaction(user_id)
        else:
            txn = _make_transaction(scenario, user_id)
        results.append(txn)
    return results


# ══════════════════════════════════════════════════════════
# New Attack Story Generator (CyberEvents with Raw Telemetry)
# ══════════════════════════════════════════════════════════

def _create_base_event(
    user_id: str, 
    correlation_id: str, 
    session_id: str,
    ip: str,
    device_id: str,
    fingerprint: str,
    os_ver: str,
    gps: dict,
    proxy: dict = None
) -> dict:
    return {
        "event_id": f"EVT-{uuid.uuid4().hex[:8].upper()}",
        "user_id": user_id,
        "session_id": session_id,
        "correlation_id": correlation_id,
        "source": EventSource.MOBILE_APP.value,
        "device_id": device_id,
        "ip_address": ip,
        "location": "Simulated",
        "metadata_payload": {},
        "isFraud": 0,
        "raw_telemetry": {
            "gps_location": gps,
            "browser_fingerprint": fingerprint,
            "os_version": os_ver,
            "app_version": "2.4.1",
            "proxy_headers": proxy or {}
        }
    }

def _generate_normal_story(user_id: str) -> list[dict]:
    corr_id = f"CORR-{uuid.uuid4().hex[:6].upper()}"
    sess_id = f"SESS-{uuid.uuid4().hex[:6].upper()}"
    events = []
    
    # Normal user context
    ip = "122.15.42.1"
    dev_id = f"DEV-NORM-{uuid.uuid4().hex[:4]}"
    fingerprint = "e5b3829f07a4b2a8d30e5f"
    os_ver = "Android 14"
    gps = {"lat": 19.0760, "lon": 72.8777} # Mumbai
    
    # 1. Normal Login
    evt1 = _create_base_event(user_id, corr_id, sess_id, ip, dev_id, fingerprint, os_ver, gps)
    evt1["event_type"] = EventType.LOGIN.value
    events.append(evt1)
    
    # 2. Transfer
    evt2 = _create_base_event(user_id, corr_id, sess_id, ip, dev_id, fingerprint, os_ver, gps)
    evt2["event_type"] = EventType.TRANSFER.value
    evt2["metadata_payload"] = {
        "amount": round(random.uniform(500, 5000), 2),
        "beneficiary_id": f"BEN-KNOWN-{random.randint(100, 999)}",
        "beneficiary_type": "known",
        "payment_type": "UPI"
    }
    events.append(evt2)
    
    # 3. Logout
    evt3 = _create_base_event(user_id, corr_id, sess_id, ip, dev_id, fingerprint, os_ver, gps)
    evt3["event_type"] = EventType.LOGOUT.value
    events.append(evt3)
    
    return events


def _generate_account_takeover_story(user_id: str) -> list[dict]:
    corr_id = f"CORR-{uuid.uuid4().hex[:6].upper()}"
    sess_id = f"SESS-{uuid.uuid4().hex[:6].upper()}"
    events = []
    
    # Attacker Context (Impossible Travel from Mumbai to London)
    attacker_ip = "185.15.42.100" # Suspicious VPN-like IP
    attacker_device = f"DEV-ATTK-{uuid.uuid4().hex[:4]}"
    attacker_fp = "f8a9223f07a4b2a8d30abc"
    os_ver = "Android 11 (Emulator)"
    attacker_gps = {"lat": 51.5074, "lon": -0.1278} # London
    proxy_headers = {"x-forwarded-for": "103.45.2.1"}
    
    # We first simulate a normal event from the user in Mumbai so the system records their location
    # (Note: In a real simulation test, we might want to ensure the DB already has this baseline,
    # but firing it as part of the sequence helps trigger impossible travel immediately.)
    norm_ip = "122.15.42.1"
    norm_gps = {"lat": 19.0760, "lon": 72.8777} # Mumbai
    evt_base = _create_base_event(user_id, corr_id, "SESS-OLD", norm_ip, "DEV-NORM", "e5b3829", "Android 14", norm_gps)
    evt_base["event_type"] = EventType.LOGIN.value
    events.append(evt_base)
    
    # 1. Failed Login x 2 by attacker (just minutes after the real login in Mumbai)
    for _ in range(2):
        evt = _create_base_event(user_id, corr_id, sess_id, attacker_ip, attacker_device, attacker_fp, os_ver, attacker_gps, proxy_headers)
        evt["event_type"] = EventType.FAILED_LOGIN.value
        evt["metadata_payload"] = {"failed_attempts": 1}
        evt["isFraud"] = 1
        events.append(evt)
        
    # 2. Successful Login (VPN/Attacker)
    evt2 = _create_base_event(user_id, corr_id, sess_id, attacker_ip, attacker_device, attacker_fp, os_ver, attacker_gps, proxy_headers)
    evt2["event_type"] = EventType.LOGIN.value
    evt2["isFraud"] = 1
    events.append(evt2)
    
    # 3. Device Change Registered
    evt4 = _create_base_event(user_id, corr_id, sess_id, attacker_ip, attacker_device, attacker_fp, os_ver, attacker_gps, proxy_headers)
    evt4["event_type"] = EventType.DEVICE_CHANGE.value
    evt4["isFraud"] = 1
    events.append(evt4)
    
    # 4. SIM Swap
    evt5 = _create_base_event(user_id, corr_id, sess_id, attacker_ip, attacker_device, attacker_fp, os_ver, attacker_gps, proxy_headers)
    evt5["event_type"] = EventType.SIM_SWAP.value
    evt5["isFraud"] = 1
    events.append(evt5)
    
    # 5. Large Transfer
    evt6 = _create_base_event(user_id, corr_id, sess_id, attacker_ip, attacker_device, attacker_fp, os_ver, attacker_gps, proxy_headers)
    evt6["event_type"] = EventType.TRANSFER.value
    evt6["isFraud"] = 1
    evt6["metadata_payload"] = {
        "amount": round(random.uniform(90000, 150000), 2),
        "beneficiary_id": f"BEN-MULE-{random.randint(100, 999)}",
        "beneficiary_type": "new",
        "payment_type": "IMPS"
    }
    events.append(evt6)

    return events


def generate_attack_stories(scenario: str = "random", count: int = 1, user_id: str | None = None) -> list[list[dict]]:
    """
    Generate sequences of cyber events representing user sessions/attacks.
    Returns a list of stories. Each story is a list of event dictionaries.
    """
    count = max(1, min(count, 50))
    stories = []
    
    for _ in range(count):
        uid = user_id or f"USR-{random.randint(10000, 99999)}"
        
        if scenario == "random":
            is_fraud = random.random() > 0.5
            if is_fraud:
                story = _generate_account_takeover_story(uid)
            else:
                story = _generate_normal_story(uid)
        elif scenario in ["account_takeover", "sim_swap"]:
            story = _generate_account_takeover_story(uid)
        else:
            story = _generate_normal_story(uid)
            
        stories.append(story)
        
    return stories

def list_scenarios() -> list[dict]:
    return [
        {"key": "normal_user", "description": "Legitimate user performing routine actions", "is_fraud": False},
        {"key": "account_takeover", "description": "Attacker logs in, changes device, and drains account", "is_fraud": True},
        {"key": "random", "description": "Mix of normal and attack stories", "is_fraud": None},
    ]
