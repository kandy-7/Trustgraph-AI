from backend.database import SessionLocal, init_db
from backend.services.simulator import generate_attack_stories
from backend.services.event_collector import process_cyber_event
from backend.models.schemas import CyberEventRequest
import json
import logging

logging.basicConfig(level=logging.INFO)

def test_pipeline():
    init_db()
    db = SessionLocal()
    
    # Generate an attack story (Account Takeover)
    stories = generate_attack_stories(scenario="account_takeover", count=1)
    story = stories[0]
    
    print(f"Testing Attack Story with {len(story)} events...")
    
    for event_data in story:
        req = CyberEventRequest(**event_data)
        result = process_cyber_event(req, db)
        
        print(f"\n--- Event: {req.event_type.value} ---")
        print(f"Risk Level: {result['risk_level']} (Score: {result['risk_score']})")
        print("Reasons:")
        for r in result.get("reasons", []):
            print(f"  - {r}")
            
    db.close()

if __name__ == "__main__":
    test_pipeline()
