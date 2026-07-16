"""
TrustGraph AI - Pydantic Schemas
Request / Response models for all API endpoints.
"""

from __future__ import annotations
from typing import List, Optional, Any, Dict
from pydantic import BaseModel, Field
from datetime import datetime
from enum import Enum
import uuid


# ══════════════════════════════════════════════════════════
# Enums
# ══════════════════════════════════════════════════════════

class EventType(str, Enum):
    LOGIN = "LOGIN"
    LOGOUT = "LOGOUT"
    FAILED_LOGIN = "FAILED_LOGIN"
    TRANSFER = "TRANSFER"
    IMPS = "IMPS"
    NEFT = "NEFT"
    UPI = "UPI"
    CARD_PAYMENT = "CARD_PAYMENT"
    ATM_WITHDRAWAL = "ATM_WITHDRAWAL"
    PASSWORD_CHANGE = "PASSWORD_CHANGE"
    DEVICE_CHANGE = "DEVICE_CHANGE"
    SIM_SWAP = "SIM_SWAP"
    OTP_FAILURE = "OTP_FAILURE"
    BENEFICIARY_ADDED = "BENEFICIARY_ADDED"
    KYC_UPDATED = "KYC_UPDATED"
    PROFILE_UPDATED = "PROFILE_UPDATED"


class EventSource(str, Enum):
    MOBILE_APP = "MOBILE_APP"
    WEB = "WEB"
    ATM = "ATM"
    BRANCH = "BRANCH"
    UPI = "UPI"
    API = "API"
    CARD = "CARD"


class EventSeverity(str, Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"


# ══════════════════════════════════════════════════════════
# Telemetry Models
# ══════════════════════════════════════════════════════════

class RawClientTelemetry(BaseModel):
    """Raw telemetry collected by the client SDK."""
    gps_location:        Optional[Dict[str, float]] = Field(None, example={"lat": 19.0760, "lon": 72.8777})
    browser_fingerprint: Optional[str] = Field(None, example="e5b3829f07a4b2a8d30e5f")
    os_version:          Optional[str] = Field(None, example="Android 14")
    app_version:         Optional[str] = Field(None, example="2.1.0")
    sdk_version:         Optional[str] = Field(None, example="1.0.4")
    jailbreak_indicators:Optional[List[str]] = Field(default_factory=list, example=["su_binary_found"])
    proxy_headers:       Optional[Dict[str, str]] = Field(default_factory=dict, example={"x-forwarded-for": "103.45.2.1"})
    sensor_data:         Optional[Dict[str, Any]] = Field(default_factory=dict, example={"typing_speed": 45, "gyroscope_active": True})
    network_type:        Optional[str] = Field(None, example="WIFI")


class TelemetryData(BaseModel):
    """Processed telemetry forming the continuous cyber trust profile."""
    device_id:                str
    browser_fingerprint:      Optional[str]
    ip:                       str
    geo_location:             Optional[Dict[str, float]]
    app_version:              Optional[str]
    os_version:               Optional[str]
    network_type:             Optional[str]
    proxy_detected:           bool
    vpn_probability:          float
    emulator_probability:     float
    malware_score:            float
    rooted_score:             float
    device_trust_score:       int     # 0 - 100
    known_device_confidence:  float
    session_id:               Optional[str]
    session_risk_score:       int     # Aggregated risk for the session
    impossible_travel_flag:   bool


# ══════════════════════════════════════════════════════════
# Cyber Event
# ══════════════════════════════════════════════════════════

class CyberEventRequest(BaseModel):
    """
    POST /api/events
    Payload sent by the client to ingest a new cyber event.
    """
    event_id:         str   = Field(default_factory=lambda: f"EVT-{uuid.uuid4().hex[:8].upper()}")
    user_id:          str   = Field(..., example="USR-10042")
    event_type:       EventType = Field(..., example=EventType.TRANSFER)
    
    device_id:        Optional[str] = Field(default=None, example="DEV-android-9921")
    ip_address:       Optional[str] = Field(default=None, example="192.168.1.5")
    location:         str   = Field(default="Unknown", example="Mumbai")
    
    session_id:       Optional[str] = Field(default=None, example="SESS-ABCD123")
    correlation_id:   Optional[str] = Field(default=None, example="CORR-9999XYZ")
    source:           EventSource   = Field(default=EventSource.MOBILE_APP, example=EventSource.MOBILE_APP)

    # Specific business data (amount, beneficiary, etc.)
    metadata_payload: Dict[str, Any] = Field(default_factory=dict, description="Event specific data like amount, beneficiary_id, etc.")
    
    # Raw Telemetry sent by the client SDK
    raw_telemetry:    Optional[RawClientTelemetry] = Field(default=None)

    class Config:
        json_schema_extra = {
            "example": {
                "event_id": "EVT-DEMO001",
                "user_id": "USR-10042",
                "event_type": "TRANSFER",
                "device_id": "DEV-android-9921",
                "ip_address": "122.15.42.1",
                "location": "Mumbai",
                "session_id": "SESS-ABCD123",
                "correlation_id": "CORR-9999XYZ",
                "source": "MOBILE_APP",
                "metadata_payload": {
                    "amount": 95000,
                    "beneficiary_id": "BEN-00291"
                },
                "raw_telemetry": {
                    "gps_location": {"lat": 19.0760, "lon": 72.8777},
                    "browser_fingerprint": "e5b3829f07a4b2a8d30e5f",
                    "os_version": "Android 14",
                    "app_version": "2.1.0"
                }
            }
        }


class CyberEventResponse(BaseModel):
    """Full fraud-analysis result returned to the client for an event."""
    event_id:           str
    user_id:            str
    event_type:         str
    timestamp:          datetime = Field(default_factory=datetime.utcnow)
    
    device_id:          Optional[str] = None
    ip_address:         Optional[str] = None
    location:           str
    
    session_id:         Optional[str] = None
    correlation_id:     Optional[str] = None
    source:             str
    
    metadata_payload:   Dict[str, Any]
    telemetry_profile:  Optional[TelemetryData] = None
    
    # SOC Intelligence
    identity_risk:      int = 0
    behaviour_risk:     int = 0
    threat_name:        Optional[str] = None
    threat_confidence:  Optional[float] = None
    attack_stage:       Optional[str] = None
    threat_story:       List[str] = Field(default_factory=list)
    
    severity:           str
    status:             str
    risk_score:         int
    risk_level:         str
    reasons:            List[str] = Field(default_factory=list, description="Human readable explanations for the risk score")
    
    alert:              bool = False
    recommended_action: str = "ALLOW"
    suggested_step:     Optional[str] = None

    class Config:
        from_attributes = True


# ══════════════════════════════════════════════════════════
# Legacy Transaction (Preserved for Demo)
# ══════════════════════════════════════════════════════════

class TransactionRequest(BaseModel):
    """Legacy transaction payload"""
    TransactionID:    str   = Field(default_factory=lambda: f"TXN-{uuid.uuid4().hex[:8].upper()}")
    user_id:          str   = Field(..., example="USR-10042")
    TransactionAmt:   float = Field(..., gt=0, example=95000.0)
    payment_type:     str   = Field(default="UPI",   example="UPI")
    location:         str   = Field(default="Unknown", example="Mumbai")
    beneficiary_id:   Optional[str] = Field(default=None, example="BEN-00291")
    beneficiary_type: str   = Field(default="known", example="new")
    device_id:        Optional[str] = Field(default=None, example="DEV-android-9921")
    trusted_device:   bool  = Field(default=True, example=False)
    login_time:       str   = Field(default="12:00", example="02:14")
    isFraud:          int   = Field(default=0, ge=0, le=1, example=0)

    class Config:
        json_schema_extra = {
            "example": {
                "TransactionID": "TXN-DEMO001",
                "user_id": "USR-10042",
                "TransactionAmt": 95000,
                "payment_type": "UPI",
                "location": "Mumbai",
                "beneficiary_id": "BEN-00291",
                "beneficiary_type": "new",
                "device_id": "DEV-android-9921",
                "trusted_device": False,
                "login_time": "02:14",
                "isFraud": 0
            }
        }


class TransactionResponse(BaseModel):
    transaction_id:     str
    user_id:            str
    amount:             float
    risk_score:         int
    risk_level:         str                 # LOW | MEDIUM | HIGH
    alert:              bool
    recommended_action: str                 # ALLOW | VERIFY | BLOCK
    suggested_step:     Optional[str] = None
    reasons:            List[str]
    timestamp:          datetime = Field(default_factory=datetime.utcnow)

    class Config:
        from_attributes = True


# ══════════════════════════════════════════════════════════
# Fraud Alert
# ══════════════════════════════════════════════════════════

class AlertResponse(BaseModel):
    """Single fraud alert returned from GET /api/alerts."""
    alert_id:           str
    transaction_id:     Optional[str] = None
    event_id:           Optional[str] = None
    user_id:            str
    risk_score:         int
    risk_level:         str
    reasons:            List[str]
    recommended_action: str
    suggested_step:     Optional[str] = None
    status:             str             # OPEN | REVIEWED | CLOSED
    officer_notes:      Optional[str] = None
    created_at:         Optional[datetime] = None

    class Config:
        from_attributes = True


class AlertUpdateRequest(BaseModel):
    """PATCH /api/alerts/{alert_id} – officer adds notes or changes status."""
    status:        Optional[str] = Field(default=None, example="REVIEWED")
    officer_notes: Optional[str] = Field(default=None,
                                          example="Verified with customer. False positive.")


# ══════════════════════════════════════════════════════════
# Simulation
# ══════════════════════════════════════════════════════════

class SimulateRequest(BaseModel):
    scenario:    str = Field(default="random",
                             example="account_takeover",
                             description="Scenario name: account_takeover | sim_swap | upi_phishing | mule_account | normal_user | random")
    count:       int = Field(default=1, ge=1, le=50, example=1)
    user_id:     Optional[str] = Field(default=None, example="USR-99999")
    mode:        str = Field(default="events", description="'events' for new event sequences, 'transactions' for legacy.")

class SimulateResponse(BaseModel):
    scenario:   str
    generated:  int
    results:    List[Any] # Can be TransactionResponse or CyberEventResponse


# ══════════════════════════════════════════════════════════
# Graph Analysis
# ══════════════════════════════════════════════════════════

class GraphNode(BaseModel):
    id:    str
    label: str
    type:  str
    flagged: bool = False

class GraphEdge(BaseModel):
    source: str
    target: str
    weight: float = 1.0
    flagged: bool = False

class GraphResponse(BaseModel):
    nodes:        List[GraphNode]
    edges:        List[GraphEdge]
    flagged_nodes: List[str]
    risk_clusters: List[List[str]]


# ══════════════════════════════════════════════════════════
# Dashboard Stats
# ══════════════════════════════════════════════════════════

class DashboardStats(BaseModel):
    total_transactions: int
    high_risk_count:    int
    medium_risk_count:  int
    low_risk_count:     int
    fraud_rate_pct:     float
    blocked_count:      int
    alerts_open:        int


class SuccessResponse(BaseModel):
    success: bool = True
    message: str
    data:    Optional[Any] = None

class ErrorResponse(BaseModel):
    success: bool = False
    error:   str
    detail:  Optional[Any] = None
