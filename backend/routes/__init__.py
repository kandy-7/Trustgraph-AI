"""
TrustGraph AI - Routes Package
"""
from backend.routes.transaction import router as transaction_router
from backend.routes.events      import router as events_router
from backend.routes.alerts      import router as alerts_router
from backend.routes.simulation  import router as simulation_router
from backend.routes.graph       import router as graph_router
from backend.routes.websocket   import router as websocket_router
from backend.routes.ai          import router as ai_router

__all__ = [
    "transaction_router",
    "events_router",
    "alerts_router",
    "simulation_router",
    "graph_router",
    "websocket_router",
    "ai_router",
]
