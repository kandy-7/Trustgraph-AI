import React, { Suspense, lazy } from 'react';
import { Network, AlertTriangle, Globe, Activity } from 'lucide-react';
import { motion } from 'framer-motion';
import { useCallback } from 'react';
import ReactFlow, { Background, Controls, applyNodeChanges, applyEdgeChanges, MarkerType } from 'reactflow';
import 'reactflow/dist/style.css';

const ThreatGlobe = lazy(() => import('../components/ThreatGlobe'));

const ATTACK_ORIGINS = [
  { country: '🇷🇺 Russia',           pct: 34, color: '#f43f5e' },
  { country: '🇳🇬 Nigeria',           pct: 22, color: '#fb923c' },
  { country: '🇬🇧 United Kingdom',    pct: 18, color: '#a78bfa' },
  { country: '🇦🇪 Dubai',             pct: 15, color: '#facc15' },
  { country: '🇸🇬 Singapore',         pct: 11, color: '#06b6d4' },
];

const nodeStyle = { background: '#0f172a', border: '1px solid #334155', color: '#e2e8f0', borderRadius: 10, padding: '8px 14px', fontSize: 11, fontWeight: 600 };

const initialNodes = [
  { id: '1', type: 'input', position: { x: 250, y: 30 },  data: { label: '⚠️ 185.15.42.100 · Botnet C&C' }, style: { ...nodeStyle, background: '#450a0a', border: '1.5px solid #f43f5e', color: '#fca5a5' } },
  { id: '2', position: { x: 60,  y: 160 }, data: { label: '📱 Emulator · DEV-FRD-001' }, style: { ...nodeStyle, background: '#431407', border: '1px solid #fb923c', color: '#fdba74' } },
  { id: '3', position: { x: 420, y: 160 }, data: { label: '👤 John Doe · USR-38362' }, style: { ...nodeStyle, background: '#1e1b4b', border: '1px solid #6366f1', color: '#a5b4fc' } },
  { id: '4', position: { x: 420, y: 270 }, data: { label: '👤 Sarah J. · USR-10293' }, style: { ...nodeStyle, background: '#1e1b4b', border: '1px solid #6366f1', color: '#a5b4fc' } },
  { id: '5', position: { x: 240, y: 385 }, data: { label: '🏦 Mule Account · BEN-992' }, style: { ...nodeStyle, background: '#451a03', border: '1.5px solid #f59e0b', color: '#fcd34d' } },
  { id: '6', type: 'output', position: { x: 240, y: 490 }, data: { label: '💸 Mule Dropoff · Final Layer' }, style: { ...nodeStyle, background: '#1c0a0a', border: '1.5px dashed #f43f5e', color: '#fca5a5' } },
];

const initialEdges = [
  { id: 'e1-2', source: '1', target: '2', label: 'controls', animated: true, style: { stroke: '#475569' }, labelStyle: { fill: '#64748b', fontSize: 10 }, markerEnd: { type: MarkerType.ArrowClosed } },
  { id: 'e1-3', source: '1', target: '3', label: 'credential stuffing', animated: true, style: { stroke: '#f43f5e', strokeWidth: 1.5 }, labelStyle: { fill: '#f87171', fontSize: 10 }, markerEnd: { type: MarkerType.ArrowClosed, color: '#f43f5e' } },
  { id: 'e1-4', source: '1', target: '4', label: 'credential stuffing', animated: true, style: { stroke: '#f43f5e', strokeWidth: 1.5 }, labelStyle: { fill: '#f87171', fontSize: 10 }, markerEnd: { type: MarkerType.ArrowClosed, color: '#f43f5e' } },
  { id: 'e3-5', source: '3', target: '5', label: '₹4.9L IMPS', style: { stroke: '#f59e0b', strokeWidth: 2.5 }, labelStyle: { fill: '#fbbf24', fontSize: 10 }, markerEnd: { type: MarkerType.ArrowClosed, color: '#f59e0b' } },
  { id: 'e4-5', source: '4', target: '5', label: '₹2.1L IMPS', style: { stroke: '#f59e0b', strokeWidth: 2.5 }, labelStyle: { fill: '#fbbf24', fontSize: 10 }, markerEnd: { type: MarkerType.ArrowClosed, color: '#f59e0b' } },
  { id: 'e5-6', source: '5', target: '6', label: 'layering', animated: true, style: { stroke: '#475569' }, labelStyle: { fill: '#64748b', fontSize: 10 } },
];

export default function NetworkIntelligence() {
  const [nodes, setNodes] = React.useState(initialNodes);
  const [edges, setEdges] = React.useState(initialEdges);
  const onNodesChange = useCallback((c) => setNodes((ns) => applyNodeChanges(c, ns)), []);
  const onEdgesChange = useCallback((c) => setEdges((es) => applyEdgeChanges(c, es)), []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <p className="eyebrow">Money Flow Intelligence</p>
        <h1 className="mt-1 text-2xl font-bold text-slate-100">Network Intelligence</h1>
        <p className="mt-0.5 text-sm text-slate-500">Fraud ring, shared-device, and mule-network reconstruction</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { k: 'Linked Accounts', v: '6',    c: 'text-slate-100' },
          { k: 'Mule Nodes',      v: '2',    c: 'text-amber-400' },
          { k: 'Funds at Risk',   v: '₹7.0L', c: 'text-rose-400' },
          { k: 'Ring Confidence', v: '94%',  c: 'text-indigo-400' },
        ].map(s => (
          <div key={s.k} className="panel panel-top p-4">
            <div className="text-xs uppercase tracking-wide text-slate-500">{s.k}</div>
            <div className={`mt-1 text-2xl font-bold ${s.c}`}>{s.v}</div>
          </div>
        ))}
      </div>

      {/* Globe + Flow side by side */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* THREE.JS GLOBE — the hero visualization */}
        <div className="panel panel-top overflow-hidden rounded-2xl" style={{ height: 480 }}>
          <div className="absolute inset-x-0 top-0 z-10 flex items-center gap-2 border-b border-slate-800 px-4 py-3">
            <Globe className="h-4 w-4 text-indigo-400" />
            <span className="text-sm font-semibold text-slate-200">Global Threat Map</span>
            <span className="ml-auto flex items-center gap-1.5 text-xs text-rose-400">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-rose-500" />
              {ATTACK_ORIGINS.length} active origins
            </span>
          </div>
          <Suspense fallback={<div className="flex h-full items-center justify-center text-slate-600 text-sm">Loading globe…</div>}>
            <ThreatGlobe />
          </Suspense>
          {/* Origin legend */}
          <div className="absolute bottom-4 left-4 z-10 space-y-1.5 rounded-xl border border-slate-800 bg-slate-900/90 p-3 backdrop-blur-md">
            {ATTACK_ORIGINS.map(o => (
              <div key={o.country} className="flex items-center gap-2 text-xs">
                <div className="h-1.5 w-8 rounded-full" style={{ background: o.color }} />
                <span className="text-slate-300">{o.country}</span>
                <span className="ml-auto font-mono text-slate-500">{o.pct}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* React Flow Fraud Network */}
        <div className="panel panel-top overflow-hidden rounded-2xl" style={{ height: 480 }}>
          <div className="absolute inset-x-0 top-0 z-10 flex items-center gap-2 border-b border-slate-800 px-4 py-3">
            <Network className="h-4 w-4 text-amber-400" />
            <span className="text-sm font-semibold text-slate-200">Fraud Ring Graph</span>
            <span className="ml-auto pill pill-critical">Mule Detected</span>
          </div>
          <div style={{ width: '100%', height: '100%', background: '#020617' }}>
            <ReactFlow
              nodes={nodes} edges={edges}
              onNodesChange={onNodesChange} onEdgesChange={onEdgesChange}
              fitView fitViewOptions={{ padding: 0.2 }} minZoom={0.3}
              proOptions={{ hideAttribution: true }}
              style={{ width: '100%', height: '100%' }}
            >
              <Background color="rgba(99,102,241,0.07)" gap={28} />
              <Controls style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 8 }} />
            </ReactFlow>
          </div>
          {/* Alert overlay */}
          <div className="absolute bottom-4 right-4 z-10 flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-xs font-semibold text-rose-400">
            <AlertTriangle className="h-3.5 w-3.5" />
            Circular layering pattern detected
          </div>
        </div>
      </div>
    </div>
  );
}
