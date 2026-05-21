"""
TrustGraph AI - Graph Analysis Service
Builds a beneficiary transaction graph and detects fraud rings.
"""

from __future__ import annotations
import logging
from collections import defaultdict
from typing import Any

import networkx as nx

logger = logging.getLogger(__name__)


# ──────────────────────────────────────────────
# In-memory graph store (refreshed on each build)
# ──────────────────────────────────────────────
_G: nx.DiGraph = nx.DiGraph()


def build_graph(transactions: list[dict]) -> nx.DiGraph:
    """
    Build a directed graph from a list of transaction dicts.
    Node types: 'user' and 'beneficiary'.
    Edge weight = sum of amounts transferred.
    """
    G = nx.DiGraph()

    for txn in transactions:
        user_id   = txn.get("user_id") or txn.get("transaction", {}).get("user_id")
        ben_id    = txn.get("beneficiary_id")
        amount    = float(txn.get("amount") or txn.get("TransactionAmt", 0))
        is_fraud  = bool(txn.get("is_fraud") or txn.get("isFraud", 0))

        if not user_id or not ben_id:
            continue

        # Add nodes with metadata
        if not G.has_node(user_id):
            G.add_node(user_id, type="user", flagged=is_fraud)
        else:
            if is_fraud:
                G.nodes[user_id]["flagged"] = True

        if not G.has_node(ben_id):
            G.add_node(ben_id, type="beneficiary", flagged=is_fraud)
        else:
            if is_fraud:
                G.nodes[ben_id]["flagged"] = True

        # Add / accumulate edge weight
        if G.has_edge(user_id, ben_id):
            G[user_id][ben_id]["weight"] += amount
            if is_fraud:
                G[user_id][ben_id]["flagged"] = True
        else:
            G.add_edge(user_id, ben_id, weight=amount, flagged=is_fraud)

    global _G
    _G = G
    return G


def get_graph_data(transactions: list[dict]) -> dict[str, Any]:
    """
    Returns graph nodes, edges, flagged nodes, and detected risk clusters.
    Suitable for direct serialisation into GraphResponse.
    """
    G = build_graph(transactions)

    nodes = [
        {
            "id":      node,
            "label":   node,
            "type":    data.get("type", "user"),
            "flagged": data.get("flagged", False)
        }
        for node, data in G.nodes(data=True)
    ]

    edges = [
        {
            "source":  u,
            "target":  v,
            "weight":  round(data.get("weight", 1.0), 2),
            "flagged": data.get("flagged", False)
        }
        for u, v, data in G.edges(data=True)
    ]

    flagged_nodes = [n for n, d in G.nodes(data=True) if d.get("flagged")]

    # Weakly connected components with ≥2 flagged nodes → risk cluster
    risk_clusters: list[list[str]] = []
    for component in nx.weakly_connected_components(G):
        flagged_in_component = [n for n in component if G.nodes[n].get("flagged")]
        if len(flagged_in_component) >= 2:
            risk_clusters.append(sorted(component))

    logger.info(
        "Graph built: %d nodes, %d edges, %d flagged, %d clusters",
        len(nodes), len(edges), len(flagged_nodes), len(risk_clusters)
    )

    return {
        "nodes":         nodes,
        "edges":         edges,
        "flagged_nodes": flagged_nodes,
        "risk_clusters": risk_clusters
    }


def get_user_connections(user_id: str) -> dict[str, Any]:
    """
    Returns immediate neighbours (beneficiaries) and second-degree connections
    for a specific user node. Useful for the /graph/user/{user_id} endpoint.
    """
    if not _G.has_node(user_id):
        return {"user_id": user_id, "direct": [], "indirect": [], "flagged_indirect": 0}

    direct   = list(_G.successors(user_id))
    indirect = []
    for ben in direct:
        for second in _G.successors(ben):
            if second != user_id and second not in direct:
                indirect.append(second)

    flagged_indirect = sum(1 for n in indirect if _G.nodes[n].get("flagged"))

    return {
        "user_id":          user_id,
        "direct":           direct,
        "indirect":         list(set(indirect)),
        "flagged_indirect": flagged_indirect
    }
