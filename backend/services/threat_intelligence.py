from typing import List, Dict, Any, Optional

# Static Threat Feed for Hackathon Demo
THREAT_FEED = [
    {
        "indicator": "185.15.42.100",
        "type": "IP",
        "severity": "Critical",
        "category": "Credential Stuffing",
        "confidence": 98,
        "description": "Known botnet node involved in automated brute force attacks.",
        "risk_bonus": 40
    },
    {
        "indicator": "MULE-001",
        "type": "BENEFICIARY",
        "severity": "Critical",
        "category": "Mule Network",
        "confidence": 99,
        "description": "Account flagged for receiving funds from multiple compromised victims.",
        "risk_bonus": 50
    },
    {
        "indicator": "DEV-FRAUD-RING",
        "type": "DEVICE",
        "severity": "High",
        "category": "Shared Device Fraud",
        "confidence": 92,
        "description": "Mobile device fingerprint associated with 10+ banking profiles.",
        "risk_bonus": 35
    },
    {
        "indicator": "45.22.11.99",
        "type": "IP",
        "severity": "High",
        "category": "Suspicious VPN",
        "confidence": 85,
        "description": "Commercial VPN node commonly used for location masking.",
        "risk_bonus": 20
    }
]

def check_threat_intelligence(event_payload: dict, telemetry_profile) -> Dict[str, Any]:
    """
    Phase 7: Threat Intelligence Engine
    Checks incoming Cyber Events against known indicators of compromise (IoC).
    Returns a rich finding object if matched, or an empty result.
    """
    
    # Extract indicators from the current event
    indicators = []
    
    if telemetry_profile and telemetry_profile.ip:
        indicators.append({"value": telemetry_profile.ip, "type": "IP"})
        
    device_id = event_payload.get("device_id") or (telemetry_profile.device_id if telemetry_profile else None)
    if device_id:
        indicators.append({"value": device_id, "type": "DEVICE"})
        
    metadata = event_payload.get("metadata_payload", {})
    if metadata and "beneficiary_id" in metadata:
        indicators.append({"value": metadata["beneficiary_id"], "type": "BENEFICIARY"})

    # Check against the threat feed
    for ind in indicators:
        for threat in THREAT_FEED:
            if threat["type"] == ind["type"] and threat["indicator"] == ind["value"]:
                return {
                    "matched": True,
                    "indicator": threat["indicator"],
                    "type": threat["type"],
                    "category": threat["category"],
                    "severity": threat["severity"],
                    "confidence": threat["confidence"],
                    "description": threat["description"],
                    "risk_bonus": threat["risk_bonus"]
                }
                
    # No match found
    return {
        "matched": False
    }
