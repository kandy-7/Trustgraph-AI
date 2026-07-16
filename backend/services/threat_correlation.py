"""
TrustGraph AI - Threat Detection & Correlation Engine
Matches sequences of cyber events against MITRE-aligned attack signatures 
to detect multi-stage threats and generate rich Threat Stories.
"""

from __future__ import annotations
import logging
import yaml
import os
from typing import Optional, List, Dict, Any

from backend.models.schemas import CyberEventRequest
from backend.models.db_models import CyberEvent

logger = logging.getLogger(__name__)

# Load Attack Signatures
SIG_PATH = os.path.join(os.path.dirname(__file__), "..", "attack_signatures.yaml")
try:
    with open(SIG_PATH, 'r') as f:
        ATTACK_SIGNATURES = yaml.safe_load(f).get("signatures", [])
except Exception as e:
    logger.error(f"Failed to load attack signatures: {e}")
    ATTACK_SIGNATURES = []


def _build_threat_story(events: List[CyberEvent], current_event: CyberEventRequest) -> List[str]:
    """Generates a human-readable sequence of the attack timeline."""
    story = []
    
    # Process historical events
    for ev in events:
        time_str = ev.timestamp.strftime("%H:%M") if ev.timestamp else "Unknown"
        event_type = ev.event_type
        
        # Friendly phrasing
        if event_type == "FAILED_LOGIN":
            msg = "Failed login attempt detected"
        elif event_type == "LOGIN":
            msg = "Login succeeded"
        elif event_type == "SIM_SWAP":
            msg = "SIM replacement detected"
        elif event_type == "DEVICE_CHANGE":
            msg = "Device change registered"
        elif event_type == "PASSWORD_CHANGE":
            msg = "Password reset completed"
        elif event_type == "BENEFICIARY_ADDED":
            msg = "New beneficiary added"
        elif event_type == "TRANSFER":
            amt = ev.metadata_payload.get("amount", 0) if ev.metadata_payload else 0
            msg = f"₹{amt} IMPS initiated"
        else:
            msg = f"Event: {event_type}"
            
        story.append(f"{time_str}: {msg}")
        
    # Process current event
    time_str = "Now"
    event_type = current_event.event_type.value
    if event_type == "FAILED_LOGIN":
        msg = "Failed login attempt detected"
    elif event_type == "LOGIN":
        msg = "Login succeeded"
    elif event_type == "SIM_SWAP":
        msg = "SIM replacement detected"
    elif event_type == "DEVICE_CHANGE":
        msg = "Device change registered"
    elif event_type == "PASSWORD_CHANGE":
        msg = "Password reset completed"
    elif event_type == "BENEFICIARY_ADDED":
        msg = "New beneficiary added"
    elif event_type == "TRANSFER":
        amt = current_event.metadata_payload.get("amount", 0)
        msg = f"₹{amt} IMPS initiated"
    else:
        msg = f"Event: {event_type}"
        
    story.append(f"{time_str}: {msg}")
    
    return story


def correlate_threats(
    current_event: CyberEventRequest,
    recent_events: List[CyberEvent]
) -> tuple[Optional[str], Optional[float], Optional[str], List[str], int]:
    """
    Evaluates the event timeline against known attack signatures.
    Returns: (threat_name, threat_confidence, attack_stage, threat_story, risk_bonus)
    """
    if not ATTACK_SIGNATURES:
        return None, None, None, [], 0
        
    # Build a simple ordered list of event types for matching
    timeline_types = [ev.event_type for ev in recent_events]
    timeline_types.append(current_event.event_type.value)
    
    best_match = None
    highest_match_count = 0
    
    for sig in ATTACK_SIGNATURES:
        sig_seq = [step["event_type"] for step in sig.get("sequence", []) if not step.get("optional", False)]
        all_seq = [step["event_type"] for step in sig.get("sequence", [])]
        
        # Check if the mandatory sequence is present in the timeline
        # (This is a simplified subsequence matcher for the hackathon)
        match_count = 0
        idx = 0
        for t_type in timeline_types:
            if t_type in all_seq:
                match_count += 1
                
        if match_count >= sig.get("minimum_events", 3):
            # Check if this is the best match so far
            if match_count > highest_match_count:
                highest_match_count = match_count
                best_match = sig

    if best_match:
        threat_name = best_match["name"]
        threat_confidence = min(99.0, best_match.get("base_confidence", 80) + (highest_match_count * 2))
        risk_bonus = best_match.get("risk_bonus", 30)
        
        # Determine stage based on current event
        stages = best_match.get("stages", [])
        attack_stage = stages[-1] if stages else "Execution"
        
        # Adjust stage for Account Takeover
        if threat_name == "Account Takeover":
            curr_type = current_event.event_type.value
            if curr_type in ["FAILED_LOGIN"]:
                attack_stage = "Credential Abuse"
            elif curr_type in ["LOGIN", "DEVICE_CHANGE", "SIM_SWAP"]:
                attack_stage = "Identity Compromise"
            elif curr_type in ["PASSWORD_CHANGE", "BENEFICIARY_ADDED"]:
                attack_stage = "Persistence"
            elif curr_type in ["TRANSFER"]:
                attack_stage = "Money Extraction"
                
        threat_story = _build_threat_story(recent_events, current_event)
        return threat_name, threat_confidence, attack_stage, threat_story, risk_bonus
        
    return None, None, None, [], 0
