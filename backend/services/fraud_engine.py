"""
TrustGraph AI - Behavioral Fraud Detection Engine
Modular, rule-based fraud detection system for real-time risk intelligence.
"""

import logging
from datetime import datetime

# Setup basic logging configuration
logging.basicConfig(level=logging.INFO, format='[%(levelname)s] %(message)s')
logger = logging.getLogger(__name__)

def calculate_risk_score(transaction: dict):
    """
    Calculates the fraud risk score based on behavioral rules.
    Returns:
        score (int): Total risk score (capped at 100)
        reasons (list): List of detected risk flags
    """
    risk_score = 0
    reasons = []

    try:
        # Rule 1: High Amount
        # TransactionAmt > 50000 -> +30 risk
        amount = float(transaction.get("TransactionAmt", 0))
        if amount > 50000:
            risk_score += 30
            reasons.append("high_amount")

        # Rule 2: Unknown / Untrusted Device
        # trusted_device == False -> +25 risk
        if not transaction.get("trusted_device", True):
            risk_score += 25
            reasons.append("unknown_device")

        # Rule 3: New Beneficiary
        # beneficiary_type == "new" -> +20 risk
        if transaction.get("beneficiary_type") == "new":
            risk_score += 20
            reasons.append("new_beneficiary")

        # Rule 4: Suspicious Login Timing
        # 00:00 to 05:00 -> +20 risk
        login_time_str = transaction.get("login_time", "12:00")
        try:
            # Check if login_time is within 00:00 to 05:00
            # Simple string comparison works for HH:MM format
            if "00:00" <= login_time_str <= "05:00":
                risk_score += 20
                reasons.append("suspicious_login_time")
        except Exception as e:
            logger.error(f"Error parsing login_time '{login_time_str}': {e}")

        # Rule 5: Historical Fraud Signal
        # isFraud == 1 -> +30 risk
        if transaction.get("isFraud") == 1:
            risk_score += 30
            reasons.append("historical_fraud_signal")

    except Exception as e:
        logger.error(f"Error during risk calculation: {e}")
    
    # Cap the score at 100
    risk_score = min(risk_score, 100)
    
    return risk_score, reasons

def classify_risk(score: int):
    """
    Classifies the risk level and recommends an action based on the score.
    """
    if score <= 30:
        return {
            "risk_level": "LOW",
            "recommended_action": "ALLOW",
            "alert": False
        }
    elif score <= 60:
        return {
            "risk_level": "MEDIUM",
            "recommended_action": "VERIFY",
            "suggested_step": "OTP verification",
            "alert": True
        }
    else:
        return {
            "risk_level": "HIGH",
            "recommended_action": "BLOCK",
            "suggested_step": "Fraud Investigation",
            "alert": True
        }

def analyze_transaction(transaction: dict):
    """
    Main entry point for analyzing a transaction.
    Validates input, calculates score, classifies risk, and returns a full report.
    """
    txn_id = transaction.get("TransactionID", "UNKNOWN")
    user_id = transaction.get("user_id", "UNKNOWN")

    # Basic Validation
    required_fields = ["TransactionID", "user_id", "TransactionAmt"]
    missing_fields = [field for field in required_fields if field not in transaction]
    
    if missing_fields:
        logger.error(f"Transaction {txn_id} rejected due to missing fields: {missing_fields}")
        return {
            "error": "Missing required fields",
            "missing_fields": missing_fields,
            "status": "FAILED"
        }

    # Calculate Score
    score, reasons = calculate_risk_score(transaction)
    
    # Classify Risk
    classification = classify_risk(score)
    
    # Generate Report
    report = {
        "transaction_id": txn_id,
        "user_id": user_id,
        "risk_score": score,
        "risk_level": classification["risk_level"],
        "alert": classification["alert"],
        "recommended_action": classification["recommended_action"],
        "reasons": reasons
    }

    # Add suggested step if it's MEDIUM or HIGH
    if "suggested_step" in classification:
        report["suggested_step"] = classification["suggested_step"]

    # Logging based on risk level
    if report["risk_level"] == "HIGH":
        logger.warning(f"High risk transaction detected: {txn_id} (Score: {score})")
    else:
        logger.info(f"Transaction {txn_id} analyzed. Risk: {report['risk_level']} (Score: {score})")

    return report

if __name__ == "__main__":
    # Example usage for testing
    test_transaction = {
        "TransactionID": "TXN001",
        "user_id": "U1002",
        "TransactionAmt": 95000,
        "location": "Mumbai",
        "login_time": "02:14",
        "beneficiary_type": "new",
        "payment_type": "UPI",
        "trusted_device": False,
        "isFraud": 1
    }
    
    result = analyze_transaction(test_transaction)
    print("\n--- Analysis Result ---")
    import json
    print(json.dumps(result, indent=4))
