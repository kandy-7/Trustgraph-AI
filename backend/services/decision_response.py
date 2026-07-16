from typing import Dict, Any

def generate_playbook(
    risk_score: int, 
    threat_name: str, 
    network_risk: int, 
    threat_intel_match: bool,
    amount: float
) -> Dict[str, Any]:
    """
    Phase 9: Decision & Response Engine
    Translates risk scores and threat vectors into actionable banking playbooks.
    """
    
    # 1. Determine Priority
    if risk_score >= 85:
        priority = "Critical"
        decision = "BLOCK"
    elif risk_score >= 70:
        priority = "High"
        decision = "BLOCK"
    elif risk_score >= 40:
        priority = "Medium"
        decision = "VERIFY"
    else:
        priority = "Low"
        decision = "ALLOW"

    # 2. Select Playbook & Action Categories
    playbook_name = "DEFAULT_MONITORING"
    actions = {
        "Identity": [],
        "Transaction": [],
        "Customer": [],
        "Operations": [],
        "Compliance": []
    }

    if decision == "ALLOW":
        return {
            "decision": decision,
            "playbook": playbook_name,
            "priority": priority,
            "estimated_loss_prevented": 0,
            "actions": actions
        }

    # Match specific vectors for dynamic playbooks
    if threat_name == "Account Takeover" or threat_intel_match:
        playbook_name = "ACCOUNT_TAKEOVER"
        actions["Identity"] = ["Force Password Reset", "Revoke Sessions"]
        actions["Transaction"] = ["Block Transfer", "Hold Funds"]
        actions["Customer"] = ["Push Notification", "SMS Alert"]
        actions["Operations"] = ["Escalate to Fraud Team"]
        actions["Compliance"] = ["Generate RBI Summary"]
        
    elif network_risk > 0:
        playbook_name = "MULE_NETWORK_DETECTED"
        actions["Transaction"] = ["Block Beneficiary", "Hold Funds"]
        actions["Customer"] = ["Email Warning"]
        actions["Operations"] = ["Assign Case to Mule Taskforce"]
        actions["Compliance"] = ["Notify FIU"]
        
    elif decision == "VERIFY":
        playbook_name = "STEP_UP_VERIFICATION"
        actions["Identity"] = ["Video KYC", "OTP Verification"]
        actions["Transaction"] = ["Limit Transaction"]
        actions["Customer"] = ["Push Notification"]
        
    else:
        playbook_name = "HIGH_RISK_ANOMALY"
        actions["Identity"] = ["Revoke Sessions"]
        actions["Transaction"] = ["Block Transfer"]
        actions["Operations"] = ["Assign Case"]

    return {
        "decision": decision,
        "playbook": playbook_name,
        "priority": priority,
        "estimated_loss_prevented": amount if decision == "BLOCK" else 0,
        "actions": actions
    }
