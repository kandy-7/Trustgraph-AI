"""
TrustGraph AI - Pydantic Schemas
Request / Response models for all API endpoints.
"""

from __future__ import annotations
from typing import List, Optional, Any
from pydantic import BaseModel, Field
from datetime import datetime
import uuid


# ══════════════════════════════════════════════════════════
# Transaction
# ══════════════════════════════════════════════════════════

class TransactionRequest(BaseModel):
    """
    POST /api/transaction
    Payload sent by the client to analyse a single transaction.
    """
    TransactionID:    str   = Field(default_factory=lambda: f"TXN-{uuid.uuid4().hex[:8].upper()}")
    user_id:          str   = Field(..., example="USR-10042")
    TransactionAmt:   float = Field(..., gt=0, example=95000.0)
    payment_type:     str   = Field(default="UPI",   example="UPI")
    location:         str   = Field(default="Unknown", example="Mumbai")
    beneficiary_id:   Optional[str] = Field(default=None, example="BEN-00291")
    beneficiary_type: str   = Field(default="known", example="new")
    device_id:        Optional[str] = Field(default=None, example="DEV-android-9921")
    trusted_device:   bool  = Field(default=True, example=False)
    login_time:       str   = Field(default="12:00", example="02:14",
                                    description="HH:MM 24-hour format")
    isFraud:          int   = Field(default=0, ge=0, le=1, example=0,
                                    description="Ground-truth label (0=legitimate, 1=fraud)")

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
    """Full fraud-analysis result returned to the client."""
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
    transaction_id:     str
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
    """
    POST /api/simulate
    Trigger a named fraud scenario or run N random transactions.
    """
    scenario:    str = Field(default="random",
                             example="account_takeover",
                             description=(
                                 "Scenario name: account_takeover | sim_swap | "
                                 "upi_phishing | mule_account | normal_user | random"
                             ))
    count:       int = Field(default=1, ge=1, le=50, example=5,
                             description="Number of transactions to simulate")
    user_id:     Optional[str] = Field(default=None, example="USR-99999")

    class Config:
        json_schema_extra = {
            "example": {
                "scenario": "account_takeover",
                "count": 3,
                "user_id": "USR-99999"
            }
        }


class SimulateResponse(BaseModel):
    """Response from POST /api/simulate."""
    scenario:   str
    generated:  int
    results:    List[TransactionResponse]


# ══════════════════════════════════════════════════════════
# Graph Analysis
# ══════════════════════════════════════════════════════════

class GraphNode(BaseModel):
    id:    str
    label: str
    type:  str   # user | beneficiary
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


# ══════════════════════════════════════════════════════════
# Generic Response
# ══════════════════════════════════════════════════════════

class SuccessResponse(BaseModel):
    success: bool = True
    message: str
    data:    Optional[Any] = None


class ErrorResponse(BaseModel):
    success: bool = False
    error:   str
    detail:  Optional[Any] = None
