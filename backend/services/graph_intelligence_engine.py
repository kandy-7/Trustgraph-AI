import networkx as nx
from backend.models.db_models import CyberEvent

def analyze_graph_intelligence(current_event, db) -> dict:
    """
    Builds in-memory NetworkX graphs from recent DB events to detect:
    - Mule Networks
    - Shared Devices
    - Shared IPs
    - Circular Transfers
    """
    # Fetch recent events to build the graph
    recent_events = db.query(CyberEvent).order_by(CyberEvent.id.desc()).limit(1000).all()
    
    # Initialize Graphs
    G_tx = nx.DiGraph()
    G_device = nx.Graph()
    G_ip = nx.Graph()
    
    # Pre-populate graphs
    for ev in recent_events:
        user_id = ev.user_id
        
        # Transaction Graph
        if ev.event_type == 'TRANSFER' and ev.metadata_payload and ev.metadata_payload.get('beneficiary_id'):
            G_tx.add_edge(user_id, ev.metadata_payload.get('beneficiary_id'), amount=ev.metadata_payload.get('amount', 0))
            
        # Device & IP Bipartite Graphs
        if ev.device_id:
            G_device.add_edge(user_id, f"DEV_{ev.device_id}")
        if ev.ip_address:
            G_ip.add_edge(user_id, f"IP_{ev.ip_address}")
            
    # Also add the current event
    user_id = current_event.user_id
    if current_event.event_type.value == 'TRANSFER' and current_event.metadata_payload.get('beneficiary_id'):
        G_tx.add_edge(user_id, current_event.metadata_payload['beneficiary_id'], amount=current_event.metadata_payload.get('amount', 0))
    if current_event.device_id:
        G_device.add_edge(user_id, f"DEV_{current_event.device_id}")
    if current_event.ip_address:
        G_ip.add_edge(user_id, f"IP_{current_event.ip_address}")

    findings = []
    network_risk = 0
    
    # 1. Mule Detection (Many accounts -> One beneficiary)
    # Check if the current beneficiary has high in-degree
    if current_event.event_type.value == 'TRANSFER' and current_event.metadata_payload.get('beneficiary_id'):
        ben_id = current_event.metadata_payload['beneficiary_id']
        in_degree = G_tx.in_degree(ben_id) if G_tx.has_node(ben_id) else 0
        if in_degree >= 3:
            findings.append(f"Known Mule (Receiving from {in_degree} accounts)")
            network_risk += 40
            
    # 2. Circular Transfer Detection (A -> B -> C -> A)
    if current_event.event_type.value == 'TRANSFER' and current_event.metadata_payload.get('beneficiary_id'):
        try:
            # Check if there is a path from Beneficiary back to the User
            if nx.has_path(G_tx, current_event.metadata_payload['beneficiary_id'], user_id):
                path = nx.shortest_path(G_tx, current_event.metadata_payload['beneficiary_id'], user_id)
                if len(path) > 1:
                    findings.append("Circular Transfer")
                    network_risk += 50
        except nx.NetworkXError:
            pass

    # 3. Shared Device Detection
    if current_event.device_id:
        dev_node = f"DEV_{current_event.device_id}"
        if G_device.has_node(dev_node):
            connected_users = list(G_device.neighbors(dev_node))
            if len(connected_users) > 2:
                findings.append(f"Shared Device ({len(connected_users)} accounts)")
                network_risk += 30

    # 4. Shared IP Detection
    if current_event.ip_address:
        ip_node = f"IP_{current_event.ip_address}"
        if G_ip.has_node(ip_node):
            connected_users = list(G_ip.neighbors(ip_node))
            if len(connected_users) > 3:
                findings.append(f"Shared IP ({len(connected_users)} accounts)")
                network_risk += 20
                
    return {
        "network_risk": min(network_risk, 100),
        "graph_findings": findings
    }
