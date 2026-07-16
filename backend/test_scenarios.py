import os
import sys

# Add project root to path if running directly
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from backend.database.db import SessionLocal, Base, engine
from backend.models.schemas import CyberEventRequest, RawClientTelemetry
from backend.services.event_collector import process_cyber_event
import json

def setup_db():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    return SessionLocal()

def print_result(scenario_name, result):
    print(f"\n{'='*50}")
    print(f"Scenario: {scenario_name}")
    print(f"Risk Score: {result['risk_score']} ({result['risk_level']})")
    print(f"Alert: {result['alert']}")
    print(f"Action: {result['recommended_action']}")
    print("Reasons:")
    for r in result['reasons']:
        print(f"  - {r}")
    print(f"{'='*50}")

def run_scenarios():
    db = setup_db()

    # 1. Normal Customer
    req_normal = CyberEventRequest(
        user_id="USR-NORMAL",
        event_id="EVT-001",
        event_type="LOGIN",
        ip_address="192.168.1.100",
        location="Mumbai, India",
        device_id="DEV-PHONE",
        raw_telemetry=RawClientTelemetry(
            is_vpn=False,
            browser_fingerprint="chrome_win_normal"
        )
    )
    res_normal = process_cyber_event(req_normal, db)
    print_result("1. Normal Customer", res_normal)

    # 2. SIM Swap -> Transfer
    req_simswap = CyberEventRequest(
        user_id="USR-VICTIM1",
        event_id="EVT-002",
        event_type="SIM_SWAP",
        ip_address="45.22.11.99",
        location="Unknown",
        device_id="DEV-UNKNOWN",
        raw_telemetry=RawClientTelemetry()
    )
    process_cyber_event(req_simswap, db)
    
    req_transfer = CyberEventRequest(
        user_id="USR-VICTIM1",
        event_id="EVT-003",
        event_type="TRANSFER",
        ip_address="45.22.11.99",
        location="Unknown",
        device_id="DEV-UNKNOWN",
        metadata_payload={"amount": 490000},
        raw_telemetry=RawClientTelemetry()
    )
    res_sim_transfer = process_cyber_event(req_transfer, db)
    print_result("2. SIM Swap -> Transfer", res_sim_transfer)

    # 3. Mule Network
    # Simulating 4 different users sending money to the SAME beneficiary (MULE-001)
    for i in range(4):
        req_mule_in = CyberEventRequest(
            user_id=f"USR-VICTIM-{i}",
            event_id=f"EVT-MULE-{i}",
            event_type="TRANSFER",
            beneficiary_id="MULE-001",
            metadata_payload={"amount": 10000},
            raw_telemetry=RawClientTelemetry()
        )
        process_cyber_event(req_mule_in, db)

    # Now the mule logs in
    req_mule = CyberEventRequest(
        user_id="MULE-001",
        event_id="EVT-004",
        event_type="TRANSFER",
        beneficiary_id="UNKNOWN-EXTERNAL",
        metadata_payload={"amount": 35000},
        raw_telemetry=RawClientTelemetry()
    )
    res_mule = process_cyber_event(req_mule, db)
    print_result("3. Mule Network (High In-Degree)", res_mule)

    # 4. Shared Device
    # Same device_id used by 4 different accounts
    for i in range(3):
        req_dev = CyberEventRequest(
            user_id=f"USR-BOT-{i}",
            event_id=f"EVT-DEV-{i}",
            event_type="LOGIN",
            device_id="DEV-FRAUD-RING",
            raw_telemetry=RawClientTelemetry()
        )
        process_cyber_event(req_dev, db)

    req_dev_flag = CyberEventRequest(
        user_id="USR-BOT-99",
        event_id="EVT-005",
        event_type="TRANSFER",
        device_id="DEV-FRAUD-RING",
        raw_telemetry=RawClientTelemetry()
    )
    res_shared_dev = process_cyber_event(req_dev_flag, db)
    print_result("4. Shared Device (Device Graph)", res_shared_dev)

    # 5. Credential Stuffing
    for i in range(5):
        req_stuff = CyberEventRequest(
            user_id="USR-STUFF",
            event_id=f"EVT-FAIL-{i}",
            event_type="FAILED_LOGIN",
            ip_address="185.15.42.100", # Botnet IP
            raw_telemetry=RawClientTelemetry() 
        )
        process_cyber_event(req_stuff, db)

    req_stuff_success = CyberEventRequest(
        user_id="USR-STUFF",
        event_id="EVT-006",
        event_type="LOGIN",
        ip_address="185.15.42.100",
        raw_telemetry=RawClientTelemetry()
    )
    res_stuffing = process_cyber_event(req_stuff_success, db)
    print_result("5. Credential Stuffing (Threat Correlation)", res_stuffing)

if __name__ == "__main__":
    run_scenarios()
