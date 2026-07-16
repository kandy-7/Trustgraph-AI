from datetime import datetime
from backend.models.schemas import CyberEventRequest, TelemetryData
from backend.models.db_models import UserProfile

def extract_features(event: CyberEventRequest, telemetry_profile: TelemetryData, user_profile: UserProfile, db) -> dict:
    """
    Extracts numerical features from the raw CyberEvent and UserProfile
    ready to be fed into the Machine Learning Engine.
    """
    
    # 1. amount
    amount = float(event.metadata_payload.get("amount", 0.0)) if event.metadata_payload else 0.0
    
    # 2. hour_of_day
    try:
        dt = datetime.fromisoformat(event.timestamp.replace('Z', '+00:00'))
        hour_of_day = dt.hour
    except:
        hour_of_day = 12
        
    # 3. is_vpn
    is_vpn = 1 if telemetry_profile and telemetry_profile.vpn_probability > 0.8 else 0
    
    # 4. device_trust_score
    device_trust = telemetry_profile.device_trust_score if telemetry_profile else 50
    
    # 5. has_sim_swap
    has_sim_swap = 1 if event.event_type == 'SIM_SWAP' else 0
    
    # 6. failed_login_ratio
    failed_login_ratio = user_profile.failed_login_ratio
    
    # 7. velocity_count (txns in last 24h)
    velocity_count = user_profile.daily_txn_count

    return {
        "amount": amount,
        "hour_of_day": hour_of_day,
        "is_vpn": is_vpn,
        "device_trust_score": device_trust,
        "has_sim_swap": has_sim_swap,
        "failed_login_ratio": failed_login_ratio,
        "velocity_count": velocity_count
    }
