"""
TrustGraph AI - Application Configuration
Environment variables and system-wide settings
"""

import os
from dotenv import load_dotenv

load_dotenv()

# ──────────────────────────────────────────────
# App Metadata
# ──────────────────────────────────────────────
APP_NAME = "TrustGraph AI"
APP_VERSION = "1.0.0"
APP_DESCRIPTION = "Behavioral Fraud Detection Engine for Real-Time Risk Intelligence"

# ──────────────────────────────────────────────
# Server
# ──────────────────────────────────────────────
HOST = os.getenv("HOST", "0.0.0.0")
PORT = int(os.getenv("PORT", 8000))
DEBUG = os.getenv("DEBUG", "true").lower() == "true"

# ──────────────────────────────────────────────
# Database
# ──────────────────────────────────────────────
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./trustgraph.db")

# ──────────────────────────────────────────────
# AI / LLM – Google Gemini
# ──────────────────────────────────────────────
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
GEMINI_MODEL   = os.getenv("GEMINI_MODEL", "gemini-1.5-flash")

# ──────────────────────────────────────────────
# Risk Thresholds
# ──────────────────────────────────────────────
RISK_LOW_MAX = 30
RISK_MEDIUM_MAX = 60
HIGH_AMOUNT_THRESHOLD = 50000      # INR
MIDNIGHT_HOUR_START = 0
MIDNIGHT_HOUR_END = 5

# ──────────────────────────────────────────────
# CORS
# ──────────────────────────────────────────────
CORS_ORIGINS = os.getenv("CORS_ORIGINS", "*").split(",")
