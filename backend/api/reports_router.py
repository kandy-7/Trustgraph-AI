from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import PlainTextResponse
from sqlalchemy.orm import Session
from datetime import datetime
import json
import csv
import io

from backend.database.db import get_db
from backend.models.db_models import CyberEvent, FraudAlert, UserProfile

router = APIRouter(prefix="/api/reports", tags=["Incident Reporting Engine"])

@router.get("/summary")
def get_reports_summary(db: Session = Depends(get_db)):
    """Returns global incident reporting metrics."""
    today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    
    today_incidents = db.query(FraudAlert).filter(FraudAlert.timestamp >= today_start).count()
    critical = db.query(FraudAlert).filter(FraudAlert.risk_level == "Critical").count()
    blocked = db.query(FraudAlert).filter(FraudAlert.recommended_action == "BLOCK").count()
    
    # Calculate Prevented Loss
    blocked_alerts = db.query(FraudAlert).filter(FraudAlert.recommended_action == "BLOCK").all()
    prevented_loss = 0
    for alert in blocked_alerts:
        event = db.query(CyberEvent).filter(CyberEvent.event_id == alert.event_id).first()
        if event and event.metadata_payload:
            prevented_loss += float(event.metadata_payload.get("amount", 0))

    return {
        "today_incidents": today_incidents,
        "critical": critical,
        "blocked": blocked,
        "prevented_loss": prevented_loss
    }


@router.get("/incident/{event_id}")
def export_incident_report(
    event_id: str, 
    format: str = Query("json", description="Export format: json or csv"), 
    db: Session = Depends(get_db)
):
    """
    Phase 12: Incident Reporting Engine
    Exports a structured JSON/CSV report for compliance and SOC investigations.
    """
    event = db.query(CyberEvent).filter(CyberEvent.event_id == event_id).first()
    alert = db.query(FraudAlert).filter(FraudAlert.event_id == event_id).first()
    
    if not event:
        raise HTTPException(status_code=404, detail="Incident not found")
        
    user_profile = db.query(UserProfile).filter(UserProfile.user_id == event.user_id).first()
    analysis = event.metadata_payload.get("analysis", {})
    
    report_dict = {
        "report_metadata": {
            "report_id": f"REP-{event_id}",
            "generated_time": datetime.utcnow().isoformat(),
            "generated_by": "TrustGraph AI Platform",
            "version": "1.0"
        },
        "incident": {
            "event_id": event_id,
            "timestamp": event.timestamp.isoformat(),
            "type": event.event_type,
            "status": event.status
        },
        "customer": {
            "user_id": event.user_id,
            "known_devices": user_profile.known_devices if user_profile else [],
            "usual_location": user_profile.usual_location if user_profile else "Unknown"
        },
        "threat_summary": {
            "threat_name": analysis.get("threat_name", "Unknown Anomaly"),
            "attack_stage": analysis.get("attack_stage", "Execution"),
            "risk_score": analysis.get("risk_score", 0),
            "risk_level": analysis.get("risk_level", "Unknown")
        },
        "timeline": analysis.get("threat_story", []),
        "evidence": analysis.get("reasons", []),
        "risk_analysis": {
            "engine_contributions": analysis.get("engine_contributions", {}),
            "feature_contributions": analysis.get("feature_contributions", [])
        },
        "playbook": analysis.get("playbook", {}),
        "investigator_notes": "",
        "compliance_summary": "Auto-generated report for RBI guidelines."
    }

    if format.lower() == "csv":
        # Flatten the JSON for CSV export
        output = io.StringIO()
        writer = csv.writer(output)
        writer.writerow(["Category", "Key", "Value"])
        
        for category, data in report_dict.items():
            if isinstance(data, dict):
                for k, v in data.items():
                    writer.writerow([category, k, str(v)])
            elif isinstance(data, list):
                writer.writerow([category, "List", " | ".join(map(str, data))])
            else:
                writer.writerow([category, category, str(data)])
                
        return PlainTextResponse(output.getvalue(), media_type="text/csv", headers={
            "Content-Disposition": f"attachment; filename=incident_report_{event_id}.csv"
        })
        
    return report_dict
