import pandas as pd
import numpy as np
import pickle
import os
from sklearn.ensemble import RandomForestClassifier, IsolationForest

# Ensure directory exists
os.makedirs('backend/models_pkl', exist_ok=True)

print("Generating synthetic banking dataset (10,000 records)...")
np.random.seed(42)

n_samples = 10000

# Features:
# 0: amount
# 1: hour_of_day (0-23)
# 2: is_vpn (0 or 1)
# 3: device_trust_score (0-100)
# 4: has_sim_swap (0 or 1)
# 5: failed_login_ratio (0.0-1.0)
# 6: velocity_count (txns in last 24h)

# Normal transactions (approx 9500)
normal_samples = int(n_samples * 0.95)
normal_data = pd.DataFrame({
    'amount': np.random.lognormal(mean=4.0, sigma=1.0, size=normal_samples) * 100, # mostly 1000-5000 INR
    'hour_of_day': np.random.normal(loc=14, scale=4, size=normal_samples).clip(0, 23).astype(int),
    'is_vpn': np.random.binomial(1, 0.05, normal_samples),
    'device_trust_score': np.random.normal(loc=85, scale=10, size=normal_samples).clip(0, 100),
    'has_sim_swap': np.zeros(normal_samples),
    'failed_login_ratio': np.random.uniform(0, 0.1, normal_samples),
    'velocity_count': np.random.poisson(lam=2, size=normal_samples),
    'is_fraud': 0
})

# Fraud transactions (approx 500)
fraud_samples = n_samples - normal_samples
fraud_data = pd.DataFrame({
    'amount': np.random.lognormal(mean=6.0, sigma=1.0, size=fraud_samples) * 100, # mostly 50k-200k INR
    'hour_of_day': np.random.choice([0, 1, 2, 3, 4, 22, 23], fraud_samples), # night time
    'is_vpn': np.random.binomial(1, 0.8, fraud_samples),
    'device_trust_score': np.random.normal(loc=20, scale=15, size=fraud_samples).clip(0, 100),
    'has_sim_swap': np.random.binomial(1, 0.4, fraud_samples),
    'failed_login_ratio': np.random.uniform(0.5, 1.0, fraud_samples),
    'velocity_count': np.random.poisson(lam=12, size=fraud_samples),
    'is_fraud': 1
})

df = pd.concat([normal_data, fraud_data]).sample(frac=1).reset_index(drop=True)

X = df.drop('is_fraud', axis=1)
y = df['is_fraud']

print("Training Random Forest Classifier...")
rf = RandomForestClassifier(n_estimators=50, max_depth=10, random_state=42)
rf.fit(X, y)

print("Training Isolation Forest (Anomaly Detection)...")
# Train only on normal data so it learns the "normal" manifold
iso = IsolationForest(n_estimators=50, contamination=0.05, random_state=42)
iso.fit(X[y == 0])

# Save models
rf_path = 'backend/models_pkl/fraud_rf.pkl'
iso_path = 'backend/models_pkl/isolation.pkl'

with open(rf_path, 'wb') as f:
    pickle.dump(rf, f)

with open(iso_path, 'wb') as f:
    pickle.dump(iso, f)

print(f"Models saved successfully to {rf_path} and {iso_path}.")
print("Feature importances:", dict(zip(X.columns, rf.feature_importances_)))
