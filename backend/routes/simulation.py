"""
TrustGraph AI - Simulation Routes
POST /api/simulate            – Generate and analyse simulated transactions
GET  /api/simulate/scenarios  – List available fraud scenario templates
"""

from __future__ import annotations
import logging

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from backend.test_scenarios import process_cyber_event
from backend.models.schemas import CyberEventRequest, RawClientTelemetry
import uuid

router = APIRouter(prefix="/api/simulate", tags=["Simulation"])
logger = logging.getLogger(__name__)


# ──────────────────────────────────────────────
# POST /api/simulate
# ──────────────────────────────────────────────

@router.post(
    "",
    response_model=SimulateResponse,
    summary="Run a fraud simulation",
    description=(
        "Generate synthetic transactions for a named scenario "
        "(account_takeover, sim_swap, upi_phishing, mule_account, normal_user, random). "
        "Each transaction is run through the full fraud engine and persisted."
    ""
)
def run_simulation(scenario: str = "ALL", db: Session = Depends(get_db)):
    # Run the Shared Device and Credential Stuffing scenarios to generate rich DB data
    
    # Generate random unique IDs for the demo
    suffix = uuid.uuid4().hex[:4]
    
    # 1. Credential Stuffing
    from backend.models.schemas import CyberEventRequest, RawClientTelemetry
    from backend.test_scenarios import process_cyber_event
    
    req_stuffing = CyberEventRequest(
        user_id=f"USR-VICTIM-{suffix}",
        event_id=f"EVT-STUFF-{suffix}",
        event_type="LOGIN_FAILED",
        ip_address="185.15.42.100", # Botnet IP
        location="Russia",
        device_id=f"DEV-NEW-{suffix}",
        metadata_payload={"reason": "Invalid Password"},
        raw_telemetry=RawClientTelemetry(browser_fingerprint="curl/7.68.0")
    )
    process_cyber_event(req_stuffing, db)
    
    req_success = CyberEventRequest(
        user_id=f"USR-VICTIM-{suffix}",
        event_id=f"EVT-SUCC-{suffix}",
        event_type="LOGIN_SUCCESS",
        ip_address="45.22.11.99",
        location="Unknown",
        device_id=f"DEV-NEW-{suffix}",
        metadata_payload={},
        raw_telemetry=RawClientTelemetry(network_type="vpn")
    )
    process_cyber_event(req_success, db)
    
    req_transfer = CyberEventRequest(
        user_id=f"USR-VICTIM-{suffix}",
        event_id=f"EVT-TX-{suffix}",
        event_type="TRANSFER",
        ip_address="45.22.11.99",
        location="Unknown",
        device_id=f"DEV-NEW-{suffix}",
        metadata_payload={"amount": 490000, "beneficiary_id": "BEN-00291"},
        raw_telemetry=RawClientTelemetry()
    )
    process_cyber_event(req_transfer, db)
    
    return {"status": "Simulation generated successfully", "events_created": 3}


# ──────────────────────────────────────────────
# GET /api/simulate/scenarios
# ──────────────────────────────────────────────

@router.get(
    "/scenarios",
    summary="List all available fraud simulation scenarios"
)
def get_scenarios():
    return {"scenarios": list_scenarios()}
