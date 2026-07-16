"""
TrustGraph AI - Cyber Risk Engine
Evaluates raw telemetry to compute continuous probabilities, device trust, and session risk.
"""

from __future__ import annotations
import logging
import math
from datetime import datetime, timedelta
from typing import Optional, Dict, Any

from backend.models.schemas import RawClientTelemetry, TelemetryData
from backend.models.db_models import CyberEvent, UserProfile

logger = logging.getLogger(__name__)


def _haversine(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculate the great circle distance in kilometers between two points."""
    R = 6371.0
    lat1, lon1, lat2, lon2 = map(math.radians, [lat1, lon1, lat2, lon2])
    
    dlon = lon2 - lon1
    dlat = lat2 - lat1
    
    a = math.sin(dlat / 2)**2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlon / 2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    
    return R * c


def _check_impossible_travel(
    current_geo: Optional[Dict[str, float]], 
    current_time: datetime,
    last_event: Optional[CyberEvent]
) -> tuple[bool, float, float]:
    """
    Returns (is_impossible, distance_km, minutes_diff)
    Required speed threshold is generally 900 km/h (commercial flight).
    """
    if not current_geo or not last_event or not last_event.raw_telemetry:
        return False, 0.0, 0.0
        
    last_geo = last_event.raw_telemetry.get("gps_location")
    if not last_geo:
        return False, 0.0, 0.0
        
    # Get last event time
    last_time = last_event.timestamp
    if not last_time:
        return False, 0.0, 0.0
        
    # If the datetime is naive, make it UTC-aware for accurate subtraction
    if last_time.tzinfo is None:
        last_time = last_time.replace(tzinfo=current_time.tzinfo)
        
    minutes_diff = (current_time - last_time).total_seconds() / 60.0
    if minutes_diff <= 0:
        minutes_diff = 0.1 # Prevent division by zero
        
    distance_km = _haversine(
        current_geo.get("lat", 0), current_geo.get("lon", 0),
        last_geo.get("lat", 0), last_geo.get("lon", 0)
    )
    
    # km/h
    speed = (distance_km / minutes_diff) * 60
    
    # 900 km/h is typical threshold for impossible travel
    is_impossible = speed > 900 and distance_km > 100
    return is_impossible, distance_km, minutes_diff


def _evaluate_device_trust(
    raw: RawClientTelemetry,
    user_profile: Optional[UserProfile],
    vpn_prob: float,
    malware_score: float,
    rooted_score: float
) -> tuple[int, float]:
    """
    Calculates a 0-100 Device Trust Score and a known_device_confidence score.
    """
    base_trust = 100.0
    known_confidence = 0.0
    
    # 1. Fingerprint matching
    if user_profile and raw.browser_fingerprint:
        known_devices = user_profile.known_devices or []
        if raw.browser_fingerprint in known_devices:
            known_confidence = 1.0
        else:
            base_trust -= 20 # Unrecognized device
            
    # 2. Risk deductions
    if vpn_prob > 0.7:
        base_trust -= (vpn_prob * 30)
    if malware_score > 0:
        base_trust -= (malware_score * 80)
    if rooted_score > 0:
        base_trust -= (rooted_score * 50)
        
    # 3. Anomaly deductions
    if raw.proxy_headers:
        base_trust -= 10
        
    final_trust = max(0, min(int(base_trust), 100))
    return final_trust, known_confidence


def _infer_probabilities(raw: RawClientTelemetry, ip_address: Optional[str]) -> tuple[float, float, float, float]:
    """
    Returns (vpn_prob, emulator_prob, malware_score, rooted_score)
    In a real system, this would call specialized SDKs or ML models.
    """
    vpn_prob = 0.0
    emulator_prob = 0.0
    malware_score = 0.0
    rooted_score = 0.0
    
    # Simple heuristics for simulation
    if ip_address and (ip_address.startswith("185.") or ip_address.startswith("103.")):
        vpn_prob = 0.95
        
    if raw.proxy_headers:
        vpn_prob = max(vpn_prob, 0.85)
        
    if raw.jailbreak_indicators:
        rooted_score = 1.0
        if "su_binary_found" in raw.jailbreak_indicators:
            malware_score = 0.5
            
    if raw.os_version and "emulator" in raw.os_version.lower():
        emulator_prob = 0.98
        
    return vpn_prob, emulator_prob, malware_score, rooted_score


def evaluate_telemetry(
    raw: Optional[RawClientTelemetry],
    ip_address: Optional[str],
    session_id: Optional[str],
    user_profile: Optional[UserProfile],
    last_event: Optional[CyberEvent]
) -> TelemetryData:
    """
    Main entry point for Telemetry Engine.
    Translates raw client data into a continuous Cyber Trust Profile.
    """
    if not raw:
        # If no raw telemetry provided, generate a safe baseline
        return TelemetryData(
            device_id="UNKNOWN",
            browser_fingerprint=None,
            ip=ip_address or "UNKNOWN",
            geo_location=None,
            app_version=None,
            os_version=None,
            network_type=None,
            proxy_detected=False,
            vpn_probability=0.0,
            emulator_probability=0.0,
            malware_score=0.0,
            rooted_score=0.0,
            device_trust_score=50,
            known_device_confidence=0.0,
            session_id=session_id,
            session_risk_score=0,
            impossible_travel_flag=False
        )

    # 1. Base Probabilities
    vpn_prob, emulator_prob, malware_score, rooted_score = _infer_probabilities(raw, ip_address)
    
    # 2. Device Trust
    trust_score, known_conf = _evaluate_device_trust(
        raw, user_profile, vpn_prob, malware_score, rooted_score
    )
    
    # 3. Impossible Travel
    is_impossible, dist, mins = _check_impossible_travel(
        raw.gps_location, datetime.utcnow(), last_event
    )
    if is_impossible:
        logger.warning(f"Impossible travel detected: {dist:.1f} km in {mins:.1f} minutes")

    # 4. Aggregate Session Risk (simplified)
    # In a real system, you would sum the risk of previous events in the session.
    session_risk = 0
    if is_impossible: session_risk += 40
    if vpn_prob > 0.8: session_risk += 20
    if trust_score < 40: session_risk += 30

    return TelemetryData(
        device_id="DEV-EXTRACTED", # Usually extracted from SDK payload
        browser_fingerprint=raw.browser_fingerprint,
        ip=ip_address or "UNKNOWN",
        geo_location=raw.gps_location,
        app_version=raw.app_version,
        os_version=raw.os_version,
        network_type=raw.network_type,
        proxy_detected=bool(raw.proxy_headers),
        vpn_probability=vpn_prob,
        emulator_probability=emulator_prob,
        malware_score=malware_score,
        rooted_score=rooted_score,
        device_trust_score=trust_score,
        known_device_confidence=known_conf,
        session_id=session_id,
        session_risk_score=min(100, session_risk),
        impossible_travel_flag=is_impossible
    )
