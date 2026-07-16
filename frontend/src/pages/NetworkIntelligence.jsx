import React, { useCallback } from 'react';
import ReactFlow, { Background, Controls, applyNodeChanges, applyEdgeChanges, MarkerType } from 'reactflow';
import 'reactflow/dist/style.css';
import { Network, AlertTriangle } from 'lucide-react';
import PageHeader from '../components/ui/PageHeader';

const nodeBase = { color: 'white', border: 'none', borderRadius: '10px', padding: '10px 14px', fontSize: 12, fontWeight: 600 };

const initialNodes = [
  { id: '1', type: 'input', position: { x: 250, y: 40 }, data: { label: 'Attacker IP · 185.15.42.100' }, style: { ...nodeBase, background: '#f43f5e' } },
  { id: '2', position: { x: 60, y: 160 }, data: { label: 'Compromised Device (Emulator)' }, style: { ...nodeBase, background: '#fb7185' } },
  { id: '3', position: { x: 420, y: 160 }, data: { label: 'Victim · John Doe (USR-38362)' }, style: { ...nodeBase, background: '#6366f1' } },
  { id: '4', position: { x: 420, y: 270 }, data: { label: 'Victim · Sarah J. (USR-10293)' }, style: { ...nodeBase, background: '#6366f1' } },
  { id: '5', position: { x: 240, y: 380 }, data: { label: 'Mule Account (BEN-992)' }, style: { ...nodeBase, background: '#f59e0b', color: '#1a1205' } },
  { id: '6', type: 'output', position: { x: 240, y: 490 }, data: { label: 'Mule Network Dropoff' }, style: { ...nodeBase, background: '#fff', color: '#e11d48', border: '1.5px solid #f43f5e' } },
];

const initialEdges = [
  { id: 'e1-2', source: '1', target: '2', label: 'controls', animated: true, style: { stroke: '#94a3b8' } },
  { id: 'e1-3', source: '1', target: '3', label: 'logins', animated: true, style: { stroke: '#94a3b8' }, markerEnd: { type: MarkerType.ArrowClosed } },
  { id: 'e1-4', source: '1', target: '4', label: 'logins', animated: true, style: { stroke: '#94a3b8' }, markerEnd: { type: MarkerType.ArrowClosed } },
  { id: 'e3-5', source: '3', target: '5', label: '₹4.9L transfer', style: { stroke: '#f43f5e', strokeWidth: 2.5 }, markerEnd: { type: MarkerType.ArrowClosed, color: '#f43f5e' } },
  { id: 'e4-5', source: '4', target: '5', label: '₹2.1L transfer', style: { stroke: '#f43f5e', strokeWidth: 2.5 }, markerEnd: { type: MarkerType.ArrowClosed, color: '#f43f5e' } },
  { id: 'e5-6', source: '5', target: '6', label: 'layers funds', animated: true, style: { stroke: '#f59e0b' } },
];

const LEGEND = [
  { c: 'bg-rose-500', l: 'Attacker Vector' },
  { c: 'bg-indigo-500', l: 'Victim Account' },
  { c: 'bg-amber-400', l: 'Mule Account' },
];

export default function NetworkIntelligence() {
  const [nodes, setNodes] = React.useState(initialNodes);
  const [edges, setEdges] = React.useState(initialEdges);

  const onNodesChange = useCallback((changes) => setNodes((nds) => applyNodeChanges(changes, nds)), []);
  const onEdgesChange = useCallback((changes) => setEdges((eds) => applyEdgeChanges(changes, eds)), []);

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Money Flow Intelligence"
        title="Network Intelligence"
        icon={Network}
        subtitle="Fraud ring, shared-device, and mule-network reconstruction"
      />

      {/* Stat chips */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { k: 'Linked Accounts', v: '6', tone: 'text-slate-900' },
          { k: 'Mule Nodes', v: '2', tone: 'text-amber-500' },
          { k: 'Funds at Risk', v: '₹7.0L', tone: 'text-rose-500' },
          { k: 'Ring Confidence', v: '94%', tone: 'text-indigo-600' },
        ].map((s) => (
          <div key={s.k} className="panel panel-top p-4">
            <div className="text-xs uppercase tracking-wide text-slate-400">{s.k}</div>
            <div className={`mt-1 text-2xl font-bold ${s.tone}`}>{s.v}</div>
          </div>
        ))}
      </div>

      <div className="panel panel-top relative h-[600px] w-full overflow-hidden">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          fitView
          fitViewOptions={{ padding: 0.2 }}
          minZoom={0.2}
          proOptions={{ hideAttribution: true }}
          style={{ width: '100%', height: '100%' }}
        >
          <Background color="rgba(15,23,42,0.10)" gap={18} />
          <Controls />
        </ReactFlow>

        {/* Legend */}
        <div className="absolute left-4 top-4 rounded-xl border border-slate-200 bg-white/90 p-4 shadow-sm backdrop-blur-md">
          <h4 className="mb-3 text-xs font-bold uppercase tracking-wide text-slate-500">Graph Legend</h4>
          <div className="space-y-2">
            {LEGEND.map((item) => (
              <div key={item.l} className="flex items-center gap-2 text-xs text-slate-600">
                <span className={`h-3 w-3 rounded ${item.c}`} /> {item.l}
              </div>
            ))}
          </div>
        </div>

        {/* Alert */}
        <div className="absolute bottom-4 right-4 flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-600 shadow-sm backdrop-blur-md">
          <AlertTriangle className="h-4 w-4" /> Circular layering pattern detected
        </div>
      </div>
    </div>
  );
}
