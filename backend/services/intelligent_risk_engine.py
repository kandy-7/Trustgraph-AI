import pickle
import pandas as pd
import os

# Load models at module level so they are only loaded once on startup
RF_PATH = os.path.join(os.path.dirname(__file__), '../models_pkl/fraud_rf.pkl')
ISO_PATH = os.path.join(os.path.dirname(__file__), '../models_pkl/isolation.pkl')

rf_model = None
iso_model = None

try:
    with open(RF_PATH, 'rb') as f:
        rf_model = pickle.load(f)
    with open(ISO_PATH, 'rb') as f:
        iso_model = pickle.load(f)
except Exception as e:
    print(f"Warning: ML models not found or failed to load. Run train_models.py first. Error: {e}")

# Feature names in the exact order the model was trained on
FEATURE_NAMES = [
    'amount',
    'hour_of_day',
    'is_vpn',
    'device_trust_score',
    'has_sim_swap',
    'failed_login_ratio',
    'velocity_count'
]

def analyze_ml_risk(features: dict) -> dict:
    """
    Predicts fraud probability and anomaly status using pre-trained models.
    Returns structured explainability.
    """
    if rf_model is None or iso_model is None:
        return {
            "ml_fraud_prob": 0,
            "is_anomaly": False,
            "top_features": []
        }

    # Convert features dict to DataFrame in correct order
    df = pd.DataFrame([features], columns=FEATURE_NAMES)
    
    # Random Forest Prediction
    # predict_proba returns [[prob_0, prob_1]]
    fraud_prob = int(rf_model.predict_proba(df)[0][1] * 100)
    
    # Isolation Forest Anomaly Detection
    # predict returns 1 for inliers, -1 for anomalies
    anomaly_prediction = iso_model.predict(df)[0]
    is_anomaly = anomaly_prediction == -1
    
    # Explainability: Find the top contributing features for this prediction
    # A simple proxy without SHAP is to look at feature importances for features 
    # that are deviating strongly from normal (e.g. is_vpn=1, has_sim_swap=1, low trust).
    top_features = []
    
    if features.get('is_vpn') == 1:
        top_features.append("VPN Detected")
    if features.get('has_sim_swap') == 1:
        top_features.append("Recent SIM Swap")
    if features.get('device_trust_score', 100) < 50:
        top_features.append("Low Device Trust")
    if features.get('hour_of_day') < 5 or features.get('hour_of_day') > 22:
        top_features.append("Unusual Login Hour")
    if features.get('velocity_count', 0) > 5:
        top_features.append("High Transaction Velocity")
        
    return {
        "ml_fraud_prob": fraud_prob,
        "is_anomaly": is_anomaly,
        "top_features": top_features
    }
