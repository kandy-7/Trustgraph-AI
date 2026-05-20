"""
TrustGraph AI - WebSocket Routes
WS /ws/transactions  – Live transaction feed (broadcasts each new transaction result)
WS /ws/alerts        – Live alert feed (broadcasts each new HIGH/MEDIUM alert)
"""

from __future__ import annotations
import asyncio
import json
import logging
from datetime import datetime

from fastapi import APIRouter, WebSocket, WebSocketDisconnect

router = APIRouter(tags=["WebSocket"])
logger = logging.getLogger(__name__)


# ──────────────────────────────────────────────
# Connection Managers
# ──────────────────────────────────────────────

class ConnectionManager:
    """Manages a pool of active WebSocket connections."""

    def __init__(self):
        self.active: list[WebSocket] = []

    async def connect(self, ws: WebSocket):
        await ws.accept()
        self.active.append(ws)
        logger.info("WS client connected. Total: %d", len(self.active))

    def disconnect(self, ws: WebSocket):
        self.active.remove(ws)
        logger.info("WS client disconnected. Total: %d", len(self.active))

    async def broadcast(self, message: dict):
        payload = json.dumps(message, default=str)
        dead = []
        for ws in self.active:
            try:
                await ws.send_text(payload)
            except Exception:
                dead.append(ws)
        for ws in dead:
            self.active.remove(ws)


transaction_manager = ConnectionManager()
alert_manager       = ConnectionManager()


# ──────────────────────────────────────────────
# WS /ws/transactions
# ──────────────────────────────────────────────

@router.websocket("/ws/transactions")
async def transaction_feed(websocket: WebSocket):
    """
    Live transaction stream.
    The server pushes a welcome ping immediately, then waits.
    Actual transaction events are published via `broadcast_transaction()`.
    """
    await transaction_manager.connect(websocket)
    await websocket.send_text(json.dumps({
        "type":    "connected",
        "channel": "transactions",
        "message": "TrustGraph AI live transaction feed ready.",
        "ts":      datetime.utcnow().isoformat()
    }))
    try:
        while True:
            # Keep alive – client can send pings
            data = await websocket.receive_text()
            if data == "ping":
                await websocket.send_text(json.dumps({"type": "pong"}))
    except WebSocketDisconnect:
        transaction_manager.disconnect(websocket)


# ──────────────────────────────────────────────
# WS /ws/alerts
# ──────────────────────────────────────────────

@router.websocket("/ws/alerts")
async def alert_feed(websocket: WebSocket):
    """
    Live fraud alert stream.
    Pushes alert events whenever MEDIUM/HIGH transactions are detected.
    """
    await alert_manager.connect(websocket)
    await websocket.send_text(json.dumps({
        "type":    "connected",
        "channel": "alerts",
        "message": "TrustGraph AI fraud alert feed ready.",
        "ts":      datetime.utcnow().isoformat()
    }))
    try:
        while True:
            data = await websocket.receive_text()
            if data == "ping":
                await websocket.send_text(json.dumps({"type": "pong"}))
    except WebSocketDisconnect:
        alert_manager.disconnect(websocket)


# ──────────────────────────────────────────────
# Broadcast helpers (called by REST routes)
# ──────────────────────────────────────────────

async def broadcast_transaction(result: dict):
    """Push a transaction analysis result to all connected WS clients."""
    await transaction_manager.broadcast({
        "type":   "transaction",
        "data":   result,
        "ts":     datetime.utcnow().isoformat()
    })


async def broadcast_alert(result: dict):
    """Push a fraud alert to all connected WS alert clients."""
    await alert_manager.broadcast({
        "type":   "alert",
        "data":   result,
        "ts":     datetime.utcnow().isoformat()
    })
