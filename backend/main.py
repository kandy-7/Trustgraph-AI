"""
TrustGraph AI – FastAPI Application Entry Point
Behavioural Fraud Detection Engine

Endpoints:
  REST
    POST   /api/transaction             – Analyse a single transaction
    GET    /api/transactions            – List all transactions  (paginated, filterable)
    GET    /api/transactions/{id}       – Get one transaction
    GET    /api/stats                   – Dashboard aggregate stats
    GET    /api/rules                   – Active fraud detection rules
    GET    /api/alerts                  – List fraud alerts      (paginated, filterable)
    GET    /api/alerts/{id}             – Get one alert
    PATCH  /api/alerts/{id}             – Officer: update status / notes
    DELETE /api/alerts/{id}             – Close an alert
    POST   /api/simulate                – Run a fraud simulation scenario
    GET    /api/simulate/scenarios      – List scenario templates
    GET    /api/graph                   – Full beneficiary transaction graph
    GET    /api/graph/user/{user_id}    – Per-user connection map
    POST   /api/ai/explain              – Gemini fraud decision explanation
    POST   /api/ai/narrate              – Gemini customer risk notification
    POST   /api/ai/compliance           – Gemini compliance batch summary
    POST   /api/ai/chat                 – Gemini fraud officer chat

  WebSocket
    WS  /ws/transactions                – Live transaction stream
    WS  /ws/alerts                      – Live fraud alert stream

  Docs
    GET  /docs                          – Swagger UI
    GET  /redoc                         – ReDoc UI
"""

import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.config import APP_NAME, APP_VERSION, APP_DESCRIPTION, DEBUG, CORS_ORIGINS
from backend.database import init_db
from backend.routes import (
    transaction_router,
    alerts_router,
    simulation_router,
    graph_router,
    websocket_router,
    ai_router,
)

# ──────────────────────────────────────────────
# Logging
# ──────────────────────────────────────────────
logging.basicConfig(
    level   = logging.DEBUG if DEBUG else logging.INFO,
    format  = "[%(levelname)s] %(name)s – %(message)s"
)
logger = logging.getLogger("trustgraph")


# ──────────────────────────────────────────────
# Lifespan (startup / shutdown)
# ──────────────────────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("🚀 TrustGraph AI starting up …")
    init_db()                               # Create DB tables if not exist
    logger.info("✅ Database initialised.")
    yield
    logger.info("🛑 TrustGraph AI shut down.")


# ──────────────────────────────────────────────
# FastAPI App
# ──────────────────────────────────────────────
app = FastAPI(
    title          = APP_NAME,
    version        = APP_VERSION,
    description    = APP_DESCRIPTION,
    docs_url       = "/docs",
    redoc_url      = "/redoc",
    lifespan       = lifespan,
)


# ──────────────────────────────────────────────
# CORS
# ──────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins     = CORS_ORIGINS,
    allow_credentials = True,
    allow_methods     = ["*"],
    allow_headers     = ["*"],
)


# ──────────────────────────────────────────────
# Routers
# ──────────────────────────────────────────────
app.include_router(transaction_router)
app.include_router(alerts_router)
app.include_router(simulation_router)
app.include_router(graph_router)
app.include_router(websocket_router)
app.include_router(ai_router)


# ──────────────────────────────────────────────
# Health Check
# ──────────────────────────────────────────────
@app.get("/", tags=["Health"])
def root():
    return {
        "service": APP_NAME,
        "version": APP_VERSION,
        "status":  "running",
        "docs":    "/docs"
    }


@app.get("/health", tags=["Health"])
def health():
    return {"status": "ok"}
