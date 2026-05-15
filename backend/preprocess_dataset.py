import pandas as pd
import numpy as np
import os
import random
from datetime import datetime, timedelta

# --- Configuration ---
RAW_DATA_PATH = r"C:\Users\pmano\OneDrive\Desktop\suraksha hack\backend\raw_data"
OUTPUT_DATA_PATH = r"C:\Users\pmano\OneDrive\Desktop\suraksha hack\backend\data"

# Ensure output directory exists
os.makedirs(OUTPUT_DATA_PATH, exist_ok=True)

def log_progress(message):
    print(f"[TrustGraph AI] {datetime.now().strftime('%H:%M:%S')} - {message}")

def preprocess():
    log_progress("Starting data pipeline...")

    # 1. Load Datasets
    try:
        log_progress("Loading raw Kaggle datasets...")
        train_trans = pd.read_csv(os.path.join(RAW_DATA_PATH, 'train_transaction.csv'))
        train_id = pd.read_csv(os.path.join(RAW_DATA_PATH, 'train_identity.csv'))
    except FileNotFoundError as e:
        log_progress(f"Error: Raw data files not found. {e}")
        return

    # 2. Merge Datasets
    log_progress("Merging transaction and identity data...")
    df = pd.merge(train_trans, train_id, on='TransactionID', how='left')

    # 3. Select Required Columns
    required_cols = [
        'TransactionID', 'TransactionAmt', 'DeviceType', 'DeviceInfo', 
        'TransactionDT', 'addr1', 'card1', 'isFraud'
    ]
    df = df[required_cols]
    
    # Fill missing values for processing
    df['DeviceInfo'] = df['DeviceInfo'].fillna('unknown')
    df['DeviceType'] = df['DeviceType'].fillna('unknown')
    df['addr1'] = df['addr1'].fillna(0)
    
    # Limit dataset size for hackathon efficiency (e.g., top 50k rows)
    # This ensures the final CSV is lightweight for GitHub
    df = df.head(50000).copy()

    log_progress(f"Processing {len(df)} records...")

    # 4. Generate Behavioral Features
    
    # user_id: Map card1 (proxy for card/account) to a unique synthetic ID
    unique_cards = df['card1'].unique()
    user_map = {card: f"U{1000 + i}" for i, card in enumerate(unique_cards)}
    df['user_id'] = df['card1'].map(user_map)

    # location: Map addr1 to realistic Indian locations
    indian_cities = [
        "Tamil Nadu", "Chennai", "Mumbai", "Delhi", 
        "Bangalore", "Hyderabad", "Pune", "Coimbatore"
    ]
    # Use modulo mapping for consistency based on addr1
    df['location'] = df['addr1'].apply(lambda x: indian_cities[int(x) % len(indian_cities)] if x > 0 else "Unknown")

    # login_time: Convert TransactionDT (seconds) to HH:MM
    def get_time(seconds):
        # TransactionDT is an offset in seconds
        seconds_in_day = int(seconds) % 86400
        hours = seconds_in_day // 3600
        minutes = (seconds_in_day % 3600) // 60
        return f"{hours:02d}:{minutes:02d}"

    df['login_time'] = df['TransactionDT'].apply(get_time)

    # beneficiary_type: Known/New with fraud logic
    def assign_beneficiary(is_fraud):
        # Fraud has 70% chance of being 'new'
        if is_fraud == 1:
            return 'new' if random.random() < 0.7 else 'known'
        else:
            # Normal has 90% chance of being 'known'
            return 'known' if random.random() < 0.9 else 'new'

    df['beneficiary_type'] = df['isFraud'].apply(assign_beneficiary)

    # payment_type: Realistic Indian banking modes
    payment_modes = ['UPI', 'IMPS', 'NEFT', 'CARD']
    df['payment_type'] = [random.choice(payment_modes) for _ in range(len(df))]

    # trusted_device: Based on DeviceInfo
    df['trusted_device'] = df['DeviceInfo'].apply(lambda x: 'true' if x != 'unknown' and x != 'mobile' else 'false')

    # risk_score: Heuristic logic (0-100)
    def calculate_risk(row):
        score = 10
        if row['isFraud'] == 1: score += 40
        if row['TransactionAmt'] > 500: score += 20
        if row['trusted_device'] == 'false': score += 15
        if row['beneficiary_type'] == 'new': score += 15
        
        # Suspicious timing (Late night/Early morning)
        hour = int(row['login_time'].split(':')[0])
        if 0 <= hour <= 5: score += 10
        
        return min(score, 100)

    df['risk_score'] = df.apply(calculate_risk, axis=1)

    # --- Output Optimized Files ---

    # A. transactions.csv
    transactions_df = df[[
        'TransactionID', 'user_id', 'TransactionAmt', 'location', 
        'login_time', 'beneficiary_type', 'payment_type', 
        'trusted_device', 'risk_score', 'isFraud'
    ]]
    transactions_df.to_csv(os.path.join(OUTPUT_DATA_PATH, 'transactions.csv'), index=False)
    log_progress("Generated: transactions.csv")

    # B. user_profiles.csv
    user_profiles = df.groupby('user_id').agg({
        'TransactionAmt': 'mean',
        'trusted_device': lambda x: x.mode()[0] if not x.mode().empty else 'false',
        'login_time': lambda x: x.mode()[0] if not x.mode().empty else '12:00',
        'location': lambda x: x.mode()[0] if not x.mode().empty else 'Unknown'
    }).reset_index()
    user_profiles.columns = ['user_id', 'avg_spending', 'preferred_device', 'normal_login_time', 'usual_location']
    user_profiles.to_csv(os.path.join(OUTPUT_DATA_PATH, 'user_profiles.csv'), index=False)
    log_progress("Generated: user_profiles.csv")

    # C. blacklisted_accounts.csv
    # High risk users (> 75 risk score)
    blacklisted = df[df['risk_score'] > 75][['user_id', 'risk_score', 'isFraud']].drop_duplicates(subset=['user_id'])
    blacklisted['blacklist_reason'] = blacklisted.apply(
        lambda x: "Confirmed Fraud Activity" if x['isFraud'] == 1 else "High Suspicious Behavior", axis=1
    )
    blacklisted['risk_category'] = 'Critical'
    blacklisted[['user_id', 'risk_score', 'blacklist_reason', 'risk_category']].to_csv(
        os.path.join(OUTPUT_DATA_PATH, 'blacklisted_accounts.csv'), index=False
    )
    log_progress("Generated: blacklisted_accounts.csv")

    # D. fraud_patterns.csv
    patterns = pd.DataFrame([
        {"fraud_type": "UPI Phishing", "risk_level": "High", "indicators": "New beneficiary, Late night, UPI", "recommended_response": "Block UPI ID & Notify User"},
        {"fraud_type": "SIM Swap", "risk_level": "Critical", "indicators": "New device, High amount, IMPS", "recommended_response": "Freeze Account & Multi-factor Call"},
        {"fraud_type": "Account Takeover", "risk_level": "Critical", "indicators": "Unknown device, Location change, NEFT", "recommended_response": "Reset Credentials"},
        {"fraud_type": "Mule Account", "risk_level": "Medium", "indicators": "Frequent low amounts, Multiple locations", "recommended_response": "Audit Transactions"},
        {"fraud_type": "Money Laundering", "risk_level": "High", "indicators": "High volume, Rapid transfers, Known accounts", "recommended_response": "Legal Review Required"}
    ])
    patterns.to_csv(os.path.join(OUTPUT_DATA_PATH, 'fraud_patterns.csv'), index=False)
    log_progress("Generated: fraud_patterns.csv")

    log_progress("Data pipeline completed successfully. Optimized datasets are ready in backend/data/")

if __name__ == "__main__":
    preprocess()
