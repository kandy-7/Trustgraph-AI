import React, { Suspense, lazy, useState } from 'react';
import { AlertTriangle, Network, Globe, X, ChevronRight, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppContext } from '../context/AppContext';
import ReactFlow, { Background, Controls, applyNodeChanges, applyEdgeChanges, MarkerType } from 'reactflow';
import 'reactflow/dist/style.css';
import { useCallback } from 'react';

const ThreatGlobe = lazy(() => import('../components/ThreatGlobe'));

const ATTACK_ORIGINS = [
  { country: 'Russia',         flag: '🇷🇺', pct: 34, type: 'Botnet C&C',         color: '#f43f5e', attacks: 1240 },
  { country: 'Nigeria',        flag: '🇳🇬', pct: 22, type: 'Money Mule Network',  color: '#fb923c', attacks: 810  },
  { country: 'United Kingdom', flag: '🇬🇧', pct: 18, type: 'VPN Exit Nodes',      color: '#a78bfa', attacks: 620  },
  { country: 'Dubai',          flag: '🇦🇪', pct: 15, type: 'Credential Brokers',  color: '#facc15', attacks: 510  },
  { country: 'Singapore',      flag: '🇸🇬', pct: 11, type: 'Phishing Infrastructure', color: '#06b6d4', attacks: 380 },
];

const nodeStyle = { background: '#0f172a', border: '1px solid #334155', color: '#e2e8f0', borderRadius: 10, padding: '8px 14px', fontSize: 11, fontWeight: 600 };

const FRAUD_NODES = [
  { id: '1', type: 'input', position: { x: 250, y: 30 },  data: { label: '⚠️ 185.15.42.100 · Botnet C&C' }, style: { ...nodeStyle, background: '#450a0a', border: '1.5px solid #f43f5e', color: '#fca5a5' } },
  { id: '2', position: { x: 60,  y: 160 }, data: { label: '📱 Emulator · DEV-FRD-001' }, style: { ...nodeStyle, background: '#431407', border: '1px solid #fb923c', color: '#fdba74' } },
  { id: '3', position: { x: 420, y: 160 }, data: { label: '👤 John Doe · USR-38362' }, style: { ...nodeStyle, background: '#1e1b4b', border: '1px solid #6366f1', color: '#a5b4fc' } },
  { id: '4', position: { x: 420, y: 270 }, data: { label: '👤 Sarah J. · USR-10293' }, style: { ...nodeStyle, background: '#1e1b4b', border: '1px solid #6366f1', color: '#a5b4fc' } },
  { id: '5', position: { x: 240, y: 385 }, data: { label: '🏦 Mule Account · BEN-992' }, style: { ...nodeStyle, background: '#451a03', border: '1.5px solid #f59e0b', color: '#fcd34d' } },
  { id: '6', type: 'output', position: { x: 240, y: 490 }, data: { label: '💸 Mule Dropoff · Final Layer' }, style: { ...nodeStyle, background: '#1c0a0a', border: '1.5px dashed #f43f5e', color: '#fca5a5' } },
];

const FRAUD_EDGES = [
  { id: 'e1-2', source: '1', target: '2', label: 'controls', animated: true, style: { stroke: '#475569' }, labelStyle: { fill: '#64748b', fontSize: 10 }, markerEnd: { type: MarkerType.ArrowClosed } },
  { id: 'e1-3', source: '1', target: '3', label: 'credential stuffing', animated: true, style: { stroke: '#f43f5e', strokeWidth: 1.5 }, labelStyle: { fill: '#f87171', fontSize: 10 }, markerEnd: { type: MarkerType.ArrowClosed, color: '#f43f5e' } },
  { id: 'e1-4', source: '1', target: '4', label: 'credential stuffing', animated: true, style: { stroke: '#f43f5e', strokeWidth: 1.5 }, labelStyle: { fill: '#f87171', fontSize: 10 }, markerEnd: { type: MarkerType.ArrowClosed, color: '#f43f5e' } },
  { id: 'e3-5', source: '3', target: '5', label: '₹4.9L IMPS', style: { stroke: '#f59e0b', strokeWidth: 2.5 }, labelStyle: { fill: '#fbbf24', fontSize: 10 }, markerEnd: { type: MarkerType.ArrowClosed, color: '#f59e0b' } },
  { id: 'e4-5', source: '4', target: '5', label: '₹2.1L IMPS', style: { stroke: '#f59e0b', strokeWidth: 2.5 }, labelStyle: { fill: '#fbbf24', fontSize: 10 }, markerEnd: { type: MarkerType.ArrowClosed, color: '#f59e0b' } },
  { id: 'e5-6', source: '5', target: '6', label: 'layering', animated: true, style: { stroke: '#475569' }, labelStyle: { fill: '#64748b', fontSize: 10 } },
];

export default function NetworkIntelligence() {
  const { stats } = useAppContext();
  const [panel, setPanel] = useState(null); // null | 'origins' | 'fraudring'
  const [nodes, setNodes] = useState(FRAUD_NODES);
  const [edges, setEdges] = useState(FRAUD_EDGES);
  const onNodesChange = useCallback((c) => setNodes((ns) => applyNodeChanges(c, ns)), []);
  const onEdgesChange = useCallback((c) => setEdges((es) => applyEdgeChanges(c, es)), []);

  return (
    <div className="absolute inset-0 overflow-hidden bg-slate-950">

      {/* ─── FULL SCREEN THREE.JS GLOBE ─────────────────────────── */}
      <div className="absolute inset-0">
        <Suspense fallback={
          <div className="flex h-full items-center justify-center">
            <div className="text-center">
              <div className="mb-4 text-6xl">🌍</div>
              <div className="text-slate-400">Rendering Threat Globe…</div>
            </div>
          </div>
        }>
          <ThreatGlobe />
        </Suspense>
      </div>

      {/* ─── TOP HEADER OVERLAY ──────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 0.95, y: 0 }}
        className="absolute left-0 right-0 top-0 z-10 flex flex-col gap-4 px-8 py-5 md:flex-row md:items-center md:justify-between"
        style={{ background: 'linear-gradient(to bottom, rgba(2,6,23,0.95) 0%, transparent 100%)' }}
      >
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-slate-500">TrustGraph AI</p>
          <h1 className="mt-1 text-3xl font-black text-slate-100">Global Threat Map</h1>
          <p className="mt-1 text-sm text-slate-400">Real-time attack origins · Money flow intelligence · Fraud networks</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setPanel(panel === 'origins' ? null : 'origins')}
            className={`flex items-center gap-2 rounded-xl border px-4 py-2 text-xs font-semibold transition-all ${
              panel === 'origins'
                ? 'border-rose-500 bg-rose-500/20 text-rose-300'
                : 'border-slate-800 bg-slate-900/80 text-slate-300 hover:border-slate-700'
            }`}
          >
            <Globe className="h-4 w-4" />
            Attack Origins
          </button>
          <button
            onClick={() => setPanel(panel === 'fraudring' ? null : 'fraudring')}
            className={`flex items-center gap-2 rounded-xl border px-4 py-2 text-xs font-semibold transition-all ${
              panel === 'fraudring'
                ? 'border-amber-500 bg-amber-500/20 text-amber-300'
                : 'border-slate-800 bg-slate-900/80 text-slate-300 hover:border-slate-700'
            }`}
          >
            <Network className="h-4 w-4" />
            Fraud Ring Graph
          </button>
          <span className="flex items-center gap-2 rounded-full border border-rose-500/30 bg-rose-500/10 px-3.5 py-1.5 text-xs font-semibold text-rose-400">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-rose-500" />
            {ATTACK_ORIGINS.length} Active Origins
          </span>
        </div>
      </motion.div>

      {/* ─── STATS ROW OVERLAY (bottom-ish) ──────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="absolute bottom-28 left-8 z-10 flex flex-wrap gap-3"
      >
        {[
          { label: 'Active Threats', value: '5 nations', color: 'text-rose-400' },
          { label: 'Funds at Risk',  value: '₹7.0L',      color: 'text-amber-400' },
          { label: 'Ring Confidence', value: '94%',       color: 'text-indigo-400' },
          { label: 'Mule Nodes',    value: '2 detected',  color: 'text-orange-400' },
        ].map(s => (
          <div key={s.label}
            className="rounded-xl border border-slate-800/80 px-4 py-2.5"
            style={{ background: 'rgba(15,23,42,0.85)', backdropFilter: 'blur(8px)' }}
          >
            <div className="text-[9px] uppercase tracking-widest text-slate-500">{s.label}</div>
            <div className={`mt-0.5 text-base font-bold ${s.color}`}>{s.value}</div>
          </div>
        ))}
      </motion.div>



      {/* ─── SLIDE-IN SIDE PANEL ─────────────────────────────────── */}
      <AnimatePresence>
        {panel && (
          <motion.div
            key={panel}
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="absolute bottom-0 right-0 top-0 z-20 w-[420px] overflow-hidden border-l border-white/5"
            style={{ background: 'rgba(2,6,23,0.92)', backdropFilter: 'blur(20px)' }}
          >
            {/* Panel Header */}
            <div className="flex items-center justify-between border-b border-white/5 px-6 py-4">
              <div className="flex items-center gap-3">
                {panel === 'origins' ? (
                  <><Globe className="h-5 w-5 text-rose-400" /><span className="font-semibold text-slate-100">Attack Origins</span></>
                ) : (
                  <><Network className="h-5 w-5 text-amber-400" /><span className="font-semibold text-slate-100">Fraud Ring Graph</span></>
                )}
              </div>
              <button onClick={() => setPanel(null)} className="rounded-lg p-1.5 text-slate-500 hover:bg-white/5 hover:text-slate-200">
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Panel Content */}
            <div className="h-full overflow-y-auto pb-20">
              {panel === 'origins' && (
                <div className="space-y-3 p-6">
                  <p className="text-xs text-slate-500">Real-time attack origin distribution across {ATTACK_ORIGINS.length} threat actors</p>
                  {ATTACK_ORIGINS.map((o, i) => (
                    <motion.div
                      key={o.country}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.07 }}
                      className="rounded-2xl border border-white/5 p-5"
                      style={{ background: 'rgba(15,23,42,0.6)' }}
                    >
                      <div className="mb-3 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{o.flag}</span>
                          <div>
                            <div className="font-semibold text-slate-100">{o.country}</div>
                            <div className="text-xs text-slate-500">{o.type}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-black" style={{ color: o.color }}>{o.pct}%</div>
                          <div className="text-[10px] text-slate-500">{o.attacks.toLocaleString()} attacks</div>
                        </div>
                      </div>
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/5">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${o.pct}%` }}
                          transition={{ duration: 1, delay: i * 0.07 + 0.2, ease: 'easeOut' }}
                          className="h-full rounded-full"
                          style={{ background: o.color }}
                        />
                      </div>
                    </motion.div>
                  ))}
                  <div className="mt-4 rounded-2xl border border-rose-500/20 bg-rose-500/5 p-4">
                    <div className="flex items-center gap-2 text-sm font-semibold text-rose-400">
                      <AlertTriangle className="h-4 w-4" /> Elevated Activity
                    </div>
                    <p className="mt-1.5 text-xs leading-relaxed text-slate-400">
                      Credential stuffing from Russian botnet up <span className="font-bold text-rose-400">120%</span> in the last hour. Adaptive rate-limiting engaged on all endpoints.
                    </p>
                  </div>
                </div>
              )}

              {panel === 'fraudring' && (
                <div className="flex h-[calc(100vh-64px)] flex-col p-4">
                  <div className="mb-4 flex items-center justify-between px-2">
                    <div>
                      <div className="text-xs text-slate-500">Mule network · 6 nodes · ₹7.0L at risk</div>
                    </div>
                    <span className="pill pill-critical">
                      <AlertTriangle className="h-3 w-3" /> Circular Layering
                    </span>
                  </div>
                  <div className="flex-1 overflow-hidden rounded-2xl border border-white/5">
                    <ReactFlow
                      nodes={nodes} edges={edges}
                      onNodesChange={onNodesChange} onEdgesChange={onEdgesChange}
                      fitView fitViewOptions={{ padding: 0.2 }} minZoom={0.3}
                      proOptions={{ hideAttribution: true }}
                      style={{ width: '100%', height: '100%', background: '#020617' }}
                    >
                      <Background color="rgba(99,102,241,0.05)" gap={28} />
                      <Controls style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 8 }} />
                    </ReactFlow>
                  </div>
                  <div className="mt-3 grid grid-cols-3 gap-2">
                    {[
                      { l: 'Attacker Vector', c: 'bg-rose-500'  },
                      { l: 'Victim Account', c: 'bg-indigo-500' },
                      { l: 'Mule Account',   c: 'bg-amber-500'  },
                    ].map(leg => (
                      <div key={leg.l} className="flex items-center gap-2 rounded-xl border border-white/5 bg-white/5 px-3 py-2 text-xs text-slate-400">
                        <span className={`h-2.5 w-2.5 rounded-sm ${leg.c}`} />
                        {leg.l}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── BOTTOM LEGEND / HINT ─────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="absolute bottom-8 left-0 right-0 z-10 flex justify-center"
      >
        <div
          className="flex items-center gap-6 rounded-full border border-white/5 px-6 py-3 text-xs text-slate-500"
          style={{ background: 'rgba(2,6,23,0.8)', backdropFilter: 'blur(12px)' }}
        >
          <span className="flex items-center gap-2"><span className="h-1 w-6 rounded-full bg-rose-500" /> Credential Stuffing</span>
          <span className="flex items-center gap-2"><span className="h-1 w-6 rounded-full bg-orange-500" /> Money Mule</span>
          <span className="flex items-center gap-2"><span className="h-1 w-6 rounded-full bg-violet-500" /> VPN/Proxy</span>
          <span className="flex items-center gap-2"><span className="h-1 w-6 rounded-full bg-yellow-400" /> Financial Fraud</span>
          <span className="flex items-center gap-2"><span className="h-1 w-6 rounded-full bg-cyan-400" /> Protected (India)</span>
        </div>
      </motion.div>
    </div>
  );
}
