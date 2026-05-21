"""
TrustGraph AI - Graph Analysis Routes
GET /api/graph              – Full transaction graph (nodes + edges + clusters)
GET /api/graph/user/{id}    – Connection map for a specific user
"""

from __future__ import annotations
import logging

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from backend.database import get_db
from backend.models.db_models import Transaction
from backend.models.schemas import GraphResponse, GraphNode, GraphEdge
from backend.services.graph_engine import get_graph_data, get_user_connections

router = APIRouter(prefix="/api/graph", tags=["Graph Analysis"])
logger = logging.getLogger(__name__)


# ──────────────────────────────────────────────
# GET /api/graph
# ──────────────────────────────────────────────

@router.get(
    "",
    response_model=GraphResponse,
    summary="Full beneficiary transaction graph",
    description=(
        "Builds a directed graph from all stored transactions. "
        "Nodes = users and beneficiaries. Edges = money flows. "
        "Flagged nodes and fraud ring clusters are highlighted."
    )
)
def full_graph(
    limit:      int  = Query(500, ge=1, le=5000, description="Max transactions to include"),
    fraud_only: bool = Query(False, description="Include only fraud-flagged transactions"),
    db: Session = Depends(get_db)
):
    q = db.query(Transaction)
    if fraud_only:
        q = q.filter(Transaction.is_fraud == 1)

    records = q.order_by(Transaction.created_at.desc()).limit(limit).all()

    txn_list = [
        {
            "user_id":        t.user_id,
            "beneficiary_id": t.beneficiary_id,
            "amount":         t.amount,
            "is_fraud":       t.is_fraud,
        }
        for t in records if t.beneficiary_id
    ]

    data = get_graph_data(txn_list)

    return GraphResponse(
        nodes         = [GraphNode(**n) for n in data["nodes"]],
        edges         = [GraphEdge(**e) for e in data["edges"]],
        flagged_nodes = data["flagged_nodes"],
        risk_clusters = data["risk_clusters"]
    )


# ──────────────────────────────────────────────
# GET /api/graph/user/{user_id}
# ──────────────────────────────────────────────

@router.get(
    "/user/{user_id}",
    summary="Connection map for a specific user",
    description=(
        "Returns the direct beneficiaries and second-degree connections for a user. "
        "Highlights indirectly flagged accounts – key for fraud ring detection."
    )
)
def user_connections(user_id: str, db: Session = Depends(get_db)):
    # Rebuild graph with all transactions first
    records = db.query(Transaction).limit(1000).all()
    txn_list = [
        {
            "user_id":        t.user_id,
            "beneficiary_id": t.beneficiary_id,
            "amount":         t.amount,
            "is_fraud":       t.is_fraud,
        }
        for t in records if t.beneficiary_id
    ]
    get_graph_data(txn_list)   # populates internal graph cache

    return get_user_connections(user_id)
