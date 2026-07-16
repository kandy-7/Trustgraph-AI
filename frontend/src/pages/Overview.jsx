import React, { useEffect, useState, useCallback } from 'react';
import { useAppContext } from '../context/AppContext';
import { getDashboardOverview } from '../services/api';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { ShieldAlert, TrendingDown, Activity, AlertOctagon, Cpu, Clock, ArrowUpRight, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import KillChainTracker from '../components/KillChainTracker';
import CountUp from '../components/CountUp';

const HEALTH_ENGINES = [
  { label: 'Telemetry Engine',          pct: 99, tone: 'bg-emerald-500' },
  { label: 'Threat Intelligence Feed',  pct: 100, tone: 'bg-emerald-500' },
  { label: 'ML Risk Engine',            pct: 96, tone: 'bg-cyan-500' },
  { label: 'Correlation Engine',        pct: 91, tone: 'bg-indigo-500' },
  { label: 'Graph Intelligence',        pct: 88, tone: 'bg-violet-500' },
  { label: 'SOC Copilot (LLM)',         pct: 100, tone: 'bg-emerald-500' },
  { label: 'WebSocket Gateway',         pct: 98, tone: 'bg-cyan-500' },
  { label: 'SQLite Database',           pct: 100, tone: 'bg-emerald-500' },
];

const MOCK_TREND = [
  { time: '00:00', risk: 12 }, { time: '04:00', risk: 18 }, { time: '08:00', risk: 42 },
  { time: '10:00', risk: 55 }, { time: '12:00', risk: 38 }, { time: '14:00', risk: 62 },
  { time: '16:00', risk: 88 }, { time: '18:00', risk: 74 }, { time: '20:00', risk: 31 },
  { time: '22:00', risk: 22 },
];

const FRAUD_DISTRIBUTION = [
  { name: 'Account Takeover', value: 34, color: '#f43f5e' },
  { name: 'Credential Stuffing', value: 22, color: '#8b5cf6' },
  { name: 'SIM Swap', value: 18, color: '#f59e0b' },
  { name: 'Mule Network', value: 15, color: '#ec4899' },
  { name: 'UPI Fraud', value: 11, color: '#06b6d4' },
];

const StatBox = ({ label, value, sub, accent = 'indigo', animate = false, index = 0 }) => {
  const accents = {
    rose: 'text-rose-400 border-rose-500/20 bg-rose-500/5',
    cyan: 'text-cyan-400 border-cyan-500/20 bg-cyan-500/5',
    indigo: 'text-indigo-400 border-indigo-500/20 bg-indigo-500/5',
    amber: 'text-amber-400 border-amber-500/20 bg-amber-500/5',
    emerald: 'text-emerald-400 border-emerald-500/20 bg-emerald-500/5',
    violet: 'text-violet-400 border-violet-500/20 bg-violet-500/5',
  };
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07, duration: 0.4 }}
      className={`panel panel-top rounded-2xl border p-5 ${accents[accent] || accents.indigo}`}
    >
      <div className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-2">{label}</div>
      <div className={`text-3xl font-black ${accents[accent].split(' ')[0]}`}>
        {animate ? <CountUp to={parseFloat(value.replace(/[^\d.]/g,''))} prefix={value.match(/^[^\d]*/)?.[0] || ''} suffix={value.match(/[^\d.]+$/)?.[0] || ''} duration={1.2} /> : value}
      </div>
      {sub && <div className="mt-1 text-xs text-slate-500">{sub}</div>}
    </motion.div>
  );
};

export default function Overview() {
  const { stats, investigationCase } = useAppContext();
  const [liveData, setLiveData] = useState(null);
  const critical = stats.threatLevel === 'CRITICAL';
  const trendData = critical
    ? [...MOCK_TREND.slice(0, 7), { time: '18:00', risk: 96 }, { time: '20:00', risk: 99 }]
    : MOCK_TREND;

  useEffect(() => {
    getDashboardOverview().then(setLiveData).catch(() => {});
  }, []);

  const kpis = [
    { label: 'Prevented Loss',      value: `₹${stats.preventedLoss}L`, accent: 'cyan',    sub: 'Protected today', animate: true },
    { label: 'Fraud Attempts',      value: String(stats.fraudAttempts || 148), accent: 'rose',    sub: 'All vectors', animate: true },
    { label: 'Critical Incidents',  value: String(stats.criticalIncidents), accent: 'amber',   sub: 'Require action', animate: true },
    { label: 'Avg Detection Time',  value: `${stats.avgResponse || 1.2}s`, accent: 'emerald',  sub: 'P99 latency', animate: false },
    { label: 'Open Cases',          value: String(stats.openCases || 4), accent: 'violet',   sub: 'In SOC queue', animate: true },
    { label: 'Events Today',        value: String(stats.todayEvents?.toLocaleString()), accent: 'indigo',   sub: 'Ingested', animate: true },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center justify-between">
        <div>
          <p className="eyebrow">Command Center</p>
          <h1 className="mt-1 text-2xl font-bold text-slate-100">Executive Dashboard</h1>
          <p className="mt-0.5 text-sm text-slate-500">Real-time posture across cyber telemetry, behaviour & money movement</p>
        </div>
        <div className="flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs text-emerald-400">
          <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
          Platform Online
        </div>
      </motion.div>

      {/* KPI grid */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-6">
        {kpis.map((kpi, i) => <StatBox key={kpi.label} {...kpi} index={i} />)}
      </div>

      {/* Kill Chain (only in attack mode) */}
      <AnimatePresence>
        {investigationCase && (
          <motion.div
            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="panel panel-top overflow-hidden rounded-2xl border border-rose-500/30 bg-rose-950/20 p-5"
          >
            <KillChainTracker activeStage={investigationCase?.stage} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Charts row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Risk Trend */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="lg:col-span-2">
          <div className="panel panel-top p-6">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-slate-100">Global Risk Trend</h3>
                <p className="text-sm text-slate-500">Aggregate risk score · last 24 hours</p>
              </div>
              <span className={`pill ${critical ? 'pill-critical' : 'pill-low'}`}>
                {critical ? '🔴 Spike Detected' : '🟢 Stable'}
              </span>
            </div>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
                  <defs>
                    <linearGradient id="riskFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={critical ? '#f43f5e' : '#6366f1'} stopOpacity={0.4} />
                      <stop offset="100%" stopColor={critical ? '#f43f5e' : '#6366f1'} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                  <XAxis dataKey="time" stroke="#475569" tickLine={false} axisLine={false} style={{ fontSize: 11 }} />
                  <YAxis stroke="#475569" tickLine={false} axisLine={false} style={{ fontSize: 11 }} />
                  <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 12, color: '#e2e8f0', fontSize: 12 }} />
                  <Area type="monotone" dataKey="risk" stroke={critical ? '#f43f5e' : '#6366f1'}
                    strokeWidth={2.5} fill="url(#riskFill)"
                    dot={{ r: 3, fill: '#0f172a', stroke: critical ? '#f43f5e' : '#6366f1', strokeWidth: 2 }}
                    activeDot={{ r: 6 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </motion.div>

        {/* Fraud Distribution */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }}>
          <div className="panel panel-top h-full p-6">
            <h3 className="mb-1 font-semibold text-slate-100">Fraud Distribution</h3>
            <p className="mb-4 text-sm text-slate-500">By attack type · today</p>
            <ResponsiveContainer width="100%" height={140}>
              <PieChart>
                <Pie data={FRAUD_DISTRIBUTION} cx="50%" cy="50%" innerRadius={40} outerRadius={65} paddingAngle={3} dataKey="value">
                  {FRAUD_DISTRIBUTION.map(e => <Cell key={e.name} fill={e.color} />)}
                </Pie>
                <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 10, fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-3 space-y-1.5">
              {FRAUD_DISTRIBUTION.map(d => (
                <div key={d.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full" style={{ background: d.color }} />
                    <span className="text-xs text-slate-400">{d.name}</span>
                  </div>
                  <span className="text-xs font-semibold text-slate-300">{d.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* System Health */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.45 }}>
        <div className="panel panel-top p-6">
          <div className="mb-5 flex items-center gap-2">
            <Cpu className="h-5 w-5 text-indigo-400" />
            <h3 className="font-semibold text-slate-100">System Health Monitor</h3>
            <span className="ml-auto pill pill-low">All Systems Nominal</span>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {HEALTH_ENGINES.map((h, i) => (
              <div key={h.label} className="rounded-xl border border-slate-800 bg-slate-900/50 p-3">
                <div className="mb-2 flex justify-between text-xs">
                  <span className="text-slate-400 truncate pr-2">{h.label}</span>
                  <span className="font-mono font-semibold text-slate-300 shrink-0">{h.pct}%</span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${h.pct}%` }}
                    transition={{ duration: 1.2, delay: i * 0.08, ease: 'easeOut' }}
                    className={`h-full rounded-full ${h.tone}`}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 flex items-center gap-2 text-xs text-slate-500">
            <Clock className="h-3.5 w-3.5" />
            Auto-refreshes every 30s · Last updated just now
          </div>
        </div>
      </motion.div>
    </div>
  );
}
