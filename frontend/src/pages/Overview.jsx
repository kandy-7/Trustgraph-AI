import React, { useEffect, useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { fetchRiskTrend } from '../services/dashboardService';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { ShieldAlert, TrendingDown, Activity, AlertOctagon, Cpu, ArrowUpRight } from 'lucide-react';
import { motion } from 'framer-motion';
import PageHeader from '../components/ui/PageHeader';
import StatCard from '../components/ui/StatCard';
import Panel from '../components/ui/Panel';

const HEALTH = [
  { label: 'Event Collector', value: '99.9% uptime', pct: 99, tone: 'bg-emerald-500' },
  { label: 'Threat Intelligence Feed', value: 'Active', pct: 100, tone: 'bg-emerald-500' },
  { label: 'ML Risk Engine', value: 'Healthy', pct: 96, tone: 'bg-cyan-500' },
  { label: 'Correlation Engine', value: 'Nominal', pct: 88, tone: 'bg-indigo-500' },
];

export default function Overview() {
  const { stats } = useAppContext();
  const [trendData, setTrendData] = useState([]);

  useEffect(() => {
    fetchRiskTrend().then(setTrendData);
  }, []);

  const critical = stats.threatLevel === 'CRITICAL';
  const chartData = critical
    ? [...trendData.slice(0, 4), { time: '16:00', risk: 98 }, { time: '20:00', risk: 100 }]
    : trendData;

  const kpis = [
    { label: 'Threat Level', value: stats.threatLevel, icon: ShieldAlert, accent: critical ? 'rose' : 'emerald', alert: critical, hint: critical ? 'Escalation active' : 'Baseline' },
    { label: 'Prevented Loss', value: `₹${stats.preventedLoss} Cr`, icon: TrendingDown, accent: 'cyan', trend: '+8.2%', hint: 'last 24h' },
    { label: "Today's Events", value: stats.todayEvents.toLocaleString(), icon: Activity, accent: 'indigo', hint: 'ingested' },
    { label: 'Critical Incidents', value: stats.criticalIncidents, icon: AlertOctagon, accent: critical ? 'rose' : 'amber', hint: 'open cases' },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Command Center"
        title="Executive Dashboard"
        subtitle="Real-time posture across cyber telemetry, behaviour, and money movement"
        actions={
          <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-500 shadow-sm">
            <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
            Banking Defense Platform · Online
          </div>
        }
      />

      {/* KPIs */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((kpi, idx) => (
          <StatCard key={kpi.label} index={idx} {...kpi} />
        ))}
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Risk Trend */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="lg:col-span-2">
          <Panel className="p-6">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Global Risk Trend</h3>
                <p className="text-sm text-slate-500">Aggregate risk score · last 24 hours</p>
              </div>
              <span className={`pill ${critical ? 'pill-critical' : 'pill-low'}`}>
                {critical ? 'Spike detected' : 'Stable'}
              </span>
            </div>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
                  <defs>
                    <linearGradient id="riskFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={critical ? '#f43f5e' : '#6366f1'} stopOpacity={0.35} />
                      <stop offset="100%" stopColor={critical ? '#f43f5e' : '#6366f1'} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(15,23,42,0.07)" vertical={false} />
                  <XAxis dataKey="time" stroke="#94a3b8" tickLine={false} axisLine={false} />
                  <YAxis stroke="#94a3b8" tickLine={false} axisLine={false} />
                  <Tooltip cursor={{ stroke: 'rgba(99,102,241,0.3)' }} />
                  <Area
                    type="monotone"
                    dataKey="risk"
                    stroke={critical ? '#f43f5e' : '#6366f1'}
                    strokeWidth={2.5}
                    fill="url(#riskFill)"
                    dot={{ r: 3, fill: '#fff', stroke: critical ? '#f43f5e' : '#6366f1', strokeWidth: 2 }}
                    activeDot={{ r: 6 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Panel>
        </motion.div>

        {/* System Health */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
          <Panel className="h-full p-6">
            <div className="mb-6 flex items-center gap-2">
              <Cpu className="h-5 w-5 text-indigo-500" />
              <h3 className="text-lg font-semibold text-slate-900">System Health</h3>
            </div>
            <div className="space-y-5">
              {HEALTH.map((h) => (
                <div key={h.label}>
                  <div className="mb-2 flex justify-between text-sm">
                    <span className="text-slate-500">{h.label}</span>
                    <span className="font-medium text-slate-700">{h.value}</span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${h.pct}%` }}
                      transition={{ duration: 1, ease: 'easeOut' }}
                      className={`h-full rounded-full ${h.tone}`}
                    />
                  </div>
                </div>
              ))}
              <div className="mt-2 flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                <div>
                  <div className="text-xs text-slate-500">Avg Response Time</div>
                  <div className="text-xl font-bold text-slate-900">{stats.avgResponse}s</div>
                </div>
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600">
                  <ArrowUpRight className="h-3.5 w-3.5" /> 32% faster
                </span>
              </div>
            </div>
          </Panel>
        </motion.div>
      </div>
    </div>
  );
}
