"""
TrustGraph AI - Adaptive Customer Intelligence Engine
Calculates Behaviour Drift and Identity Risk by continuously comparing events 
against the customer's historical digital identity baseline.
"""

from __future__ import annotations
import logging
from typing import Optional

from backend.models.schemas import CyberEventRequest, TelemetryData
from backend.models.db_models import UserProfile

logger = logging.getLogger(__name__)

def evaluate_customer_intelligence(
    event: CyberEventRequest, 
    telemetry: TelemetryData, 
    profile: Optional[UserProfile]
) -> tuple[int, int, list[str]]:
    """
    Returns (identity_risk, behaviour_risk, list_of_reasons)
    Calculates drifts in amount, location, time, and device usage.
    """
    identity_risk = 0
    behaviour_risk = 0
    reasons = []

    if not profile:
        # First time seeing this user
        identity_risk += 30
        reasons.append("New customer profile (no baseline)")
        return identity_risk, behaviour_risk, reasons

    # 1. Amount Drift (Behaviour)
    if event.event_type.value == "TRANSFER":
        amount = float(event.metadata_payload.get("amount", 0))
        median = profile.median_amount or profile.avg_amount or 0
        if median > 0:
            if amount > median * 10:
                behaviour_risk += 40
                reasons.append(f"Amount Drift: Transfer is {int(amount/median)}x historical median")
            elif amount > median * 5:
                behaviour_risk += 20
                reasons.append(f"Amount Drift: Transfer is {int(amount/median)}x historical median")

    # 2. Location Drift (Identity)
    if event.location and event.location != "Unknown":
        usual = (profile.usual_location or "").lower()
        trusted_locs = [loc.lower() for loc in (profile.trusted_locations or [])]
        
        if usual and event.location.lower() != usual and event.location.lower() not in trusted_locs:
            identity_risk += 25
            reasons.append(f"Location Drift: Unexpected transaction from {event.location}")

    # 3. Device Drift (Identity)
    if telemetry.device_trust_score < 50:
        identity_risk += 30
        reasons.append(f"Device Drift: Low device trust score ({telemetry.device_trust_score}/100)")
    elif telemetry.browser_fingerprint:
        known = profile.known_devices or []
        if telemetry.browser_fingerprint not in known:
            identity_risk += 15
            reasons.append("Device Drift: First time seeing this browser/device fingerprint")

    # 4. Time Drift (Behaviour)
    # Simple check for midnight hour
    login_time = event.metadata_payload.get("time", "12:00")
    if isinstance(login_time, str) and ":" in login_time:
        try:
            hour = int(login_time.split(":")[0])
            usual_hour = profile.usual_login_hour or 10
            
            # If they normally login at 10 AM, and this is 3 AM
            if hour <= 4 and usual_hour >= 8:
                behaviour_risk += 20
                reasons.append(f"Time Drift: Suspicious night activity ({login_time})")
        except ValueError:
            pass

    return min(100, identity_risk), min(100, behaviour_risk), reasons
