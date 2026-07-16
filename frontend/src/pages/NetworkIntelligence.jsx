import React, { useCallback } from 'react';
import ReactFlow, { Background, Controls, MiniMap, applyNodeChanges, applyEdgeChanges, MarkerType } from 'reactflow';
import 'reactflow/dist/style.css';

const initialNodes = [
  { id: '1', type: 'input', position: { x: 250, y: 50 }, data: { label: 'Attacker IP: 185.15.42.100' }, style: { background: '#ef4444', color: 'white', border: 'none', borderRadius: '8px', padding: '10px' } },
  { id: '2', position: { x: 100, y: 150 }, data: { label: 'Compromised Device (Emulator)' }, style: { background: '#f97316', color: 'white', border: 'none', borderRadius: '8px' } },
  { id: '3', position: { x: 400, y: 150 }, data: { label: 'Victim: John Doe (USR-38362)' }, style: { background: '#6366f1', color: 'white', border: 'none', borderRadius: '8px' } },
  { id: '4', position: { x: 400, y: 250 }, data: { label: 'Victim: Sarah J. (USR-10293)' }, style: { background: '#6366f1', color: 'white', border: 'none', borderRadius: '8px' } },
  { id: '5', position: { x: 250, y: 350 }, data: { label: 'Mule Account 1 (BEN-992)' }, style: { background: '#eab308', color: 'black', border: 'none', borderRadius: '8px' } },
  { id: '6', type: 'output', position: { x: 250, y: 450 }, data: { label: 'Mule Network Dropoff' }, style: { background: '#1e293b', color: 'white', border: '1px solid #ef4444', borderRadius: '8px' } },
];

const initialEdges = [
  { id: 'e1-2', source: '1', target: '2', label: 'Uses', animated: true },
  { id: 'e1-3', source: '1', target: '3', label: 'Logins', animated: true, markerEnd: { type: MarkerType.ArrowClosed } },
  { id: 'e1-4', source: '1', target: '4', label: 'Logins', animated: true, markerEnd: { type: MarkerType.ArrowClosed } },
  { id: 'e3-5', source: '3', target: '5', label: '₹4.9L Transfer', style: { stroke: '#ef4444' }, markerEnd: { type: MarkerType.ArrowClosed, color: '#ef4444' } },
  { id: 'e4-5', source: '4', target: '5', label: '₹2.1L Transfer', style: { stroke: '#ef4444' }, markerEnd: { type: MarkerType.ArrowClosed, color: '#ef4444' } },
  { id: 'e5-6', source: '5', target: '6', label: 'Layers Funds', animated: true },
];

export default function NetworkIntelligence() {
  const [nodes, setNodes] = React.useState(initialNodes);
  const [edges, setEdges] = React.useState(initialEdges);

  const onNodesChange = useCallback(
    (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
    []
  );
  const onEdgesChange = useCallback(
    (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    []
  );

  return (
    <div className="flex flex-col h-full space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white tracking-tight">Network Intelligence</h1>
        <div className="text-sm text-slate-400">Fraud Ring & Mule Network Visualization</div>
      </div>
      
      <div className="flex-1 bg-slate-900 border border-slate-800 rounded-xl overflow-hidden relative">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          fitView
          attributionPosition="bottom-right"
        >
          <Background color="#334155" gap={16} />
          <Controls className="bg-slate-800 fill-slate-300 border-slate-700" />
        </ReactFlow>
        
        <div className="absolute top-4 left-4 bg-slate-950/80 p-4 rounded-lg border border-slate-800 backdrop-blur-sm">
          <h4 className="text-sm font-semibold text-white mb-2">Graph Legend</h4>
          <div className="space-y-2 text-xs">
            <div className="flex items-center"><div className="w-3 h-3 bg-red-500 rounded mr-2"></div> Attacker Vector</div>
            <div className="flex items-center"><div className="w-3 h-3 bg-indigo-500 rounded mr-2"></div> Victim Account</div>
            <div className="flex items-center"><div className="w-3 h-3 bg-yellow-500 rounded mr-2"></div> Mule Account</div>
          </div>
        </div>
      </div>
    </div>
  );
}
