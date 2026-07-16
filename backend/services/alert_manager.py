import asyncio
import logging
import uuid
from datetime import datetime
from sqlalchemy.orm import Session
from backend.models.db_models import FraudAlert, CyberEvent
from backend.routes.websocket import broadcast_alert, broadcast_transaction
from backend.services.decision_response import generate_playbook

logger = logging.getLogger(__name__)

def process_and_store_alert(
    event_payload: dict,
    analysis_result: dict,
    db: Session
) -> dict:
    """
    Phase 9 & 10: Alert Manager
    Takes the Risk Aggregation result, queries the Decision Engine for a response playbook,
    persists everything to SQLite, and broadcasts via WebSockets to the Dashboard.
    """
    
    # 1. Generate the Response Playbook
    playbook_data = generate_playbook(
        risk_score=analysis_result["risk_score"],
        threat_name=analysis_result.get("threat_name") or "",
        network_risk=analysis_result.get("network_risk", 0),
        threat_intel_match=any("Threat Intelligence" in r for r in analysis_result.get("reasons", [])),
        amount=event_payload.get("metadata_payload", {}).get("amount", 0)
    )
    
    # Enhance the analysis result with the playbook decision
    analysis_result["decision"] = playbook_data["decision"]
    analysis_result["action"] = playbook_data["decision"]
    analysis_result["playbook"] = playbook_data
    
    event_id = event_payload.get("event_id") or f"EVT-{uuid.uuid4().hex[:8]}"
    user_id = event_payload.get("user_id")
    
    # 2. Persist CyberEvent to DB
    cyber_event = CyberEvent(
        event_id=event_id,
        user_id=user_id,
        event_type=event_payload.get("event_type"),
        timestamp=datetime.utcnow(),
        ip_address=event_payload.get("ip_address"),
        location=event_payload.get("location"),
        device_id=event_payload.get("device_id"),
        metadata_payload={
            **event_payload.get("metadata_payload", {}),
            "telemetry": event_payload.get("raw_telemetry", {}),
            "threat_story": analysis_result.get("threat_story", []),
            "analysis": analysis_result
        }
    )
    
    try:
        db.add(cyber_event)
        
        # 3. Create FraudAlert if action is not ALLOW
        alert_record = None
        if playbook_data["decision"] in ["BLOCK", "VERIFY"]:
            alert_id = f"ALT-{uuid.uuid4().hex[:8]}"
            alert_record = FraudAlert(
                alert_id=alert_id,
                event_id=event_id,
                user_id=user_id,
                risk_score=analysis_result["risk_score"],
                risk_level=playbook_data["priority"], # Critical, High, Medium
                reasons=analysis_result.get("reasons", []),
                recommended_action=playbook_data["decision"],
                status="OPEN"
            )
            db.add(alert_record)
            
        db.commit()
        
        # 4. WebSocket Broadcast
        # Since we might be inside a sync FastAPI thread, we check if there's a running loop
        try:
            loop = asyncio.get_running_loop()
            loop.create_task(broadcast_transaction(analysis_result))
            if alert_record:
                loop.create_task(broadcast_alert({
                    "alert_id": alert_record.alert_id,
                    "event_id": event_id,
                    "user_id": user_id,
                    "risk_score": alert_record.risk_score,
                    "risk_level": alert_record.risk_level,
                    "reasons": alert_record.reasons,
                    "playbook": playbook_data
                }))
        except RuntimeError:
            # We are outside an event loop (e.g., in test_scenarios.py)
            asyncio.run(broadcast_transaction(analysis_result))
            if alert_record:
                asyncio.run(broadcast_alert({
                    "alert_id": alert_record.alert_id,
                    "event_id": event_id,
                    "user_id": user_id,
                    "risk_score": alert_record.risk_score,
                    "risk_level": alert_record.risk_level,
                    "reasons": alert_record.reasons,
                    "playbook": playbook_data
                }))
                
    except Exception as e:
        db.rollback()
        logger.error(f"Failed to process alert in Alert Manager: {e}")
        
    return analysis_result
