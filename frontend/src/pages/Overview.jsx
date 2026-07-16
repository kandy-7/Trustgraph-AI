import React, { useEffect, useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { fetchRiskTrend } from '../services/dashboardService';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ShieldAlert, TrendingDown, Activity, AlertOctagon } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Overview() {
  const { stats } = useAppContext();
  const [trendData, setTrendData] = useState([]);

  useEffect(() => {
    fetchRiskTrend().then(setTrendData);
  }, []);

  // Make the chart spike if in critical threat level (Demo mode sync)
  const chartData = stats.threatLevel === 'CRITICAL' ? [
    ...trendData.slice(0, 4),
    { time: '16:00', risk: 98 },
    { time: '20:00', risk: 100 }
  ] : trendData;

  const kpis = [
    { label: 'Threat Level', value: stats.threatLevel, icon: ShieldAlert, color: stats.threatLevel === 'CRITICAL' ? 'text-red-500' : 'text-emerald-500' },
    { label: 'Prevented Loss', value: `₹${stats.preventedLoss} Cr`, icon: TrendingDown, color: 'text-indigo-500' },
    { label: "Today's Events", value: stats.todayEvents.toLocaleString(), icon: Activity, color: 'text-blue-500' },
    { label: 'Critical Incidents', value: stats.criticalIncidents, icon: AlertOctagon, color: stats.threatLevel === 'CRITICAL' ? 'text-red-500' : 'text-orange-500' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white tracking-tight">Executive Dashboard</h1>
        <div className="text-sm text-slate-400">TrustGraph AI Banking Defense Platform</div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {kpis.map((kpi, idx) => (
          <motion.div 
            key={kpi.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className={`bg-slate-900 border rounded-xl p-5 ${
              kpi.label === 'Threat Level' && kpi.value === 'CRITICAL' 
                ? 'border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.2)] bg-red-950/10'
                : 'border-slate-800'
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-400">{kpi.label}</p>
                <p className={`text-3xl font-bold mt-1 ${
                  kpi.label === 'Threat Level' && kpi.value === 'CRITICAL' ? 'text-red-500 animate-pulse' : 'text-white'
                }`}>
                  {kpi.value}
                </p>
              </div>
              <div className={`p-3 rounded-lg bg-slate-800 ${kpi.color}`}>
                <kpi.icon className="w-6 h-6" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Risk Trend Chart */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="bg-slate-900 border border-slate-800 rounded-xl p-6 lg:col-span-2"
        >
          <h3 className="text-lg font-semibold text-white mb-6">Global Risk Trend (24h)</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="time" stroke="#64748b" tick={{fill: '#64748b'}} />
                <YAxis stroke="#64748b" tick={{fill: '#64748b'}} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="risk" 
                  stroke={stats.threatLevel === 'CRITICAL' ? '#ef4444' : '#6366f1'} 
                  strokeWidth={3}
                  dot={{ r: 4, fill: '#1e293b', strokeWidth: 2 }}
                  activeDot={{ r: 6, fill: '#6366f1' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* System Health */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="bg-slate-900 border border-slate-800 rounded-xl p-6"
        >
          <h3 className="text-lg font-semibold text-white mb-6">System Health</h3>
          <div className="space-y-6">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-slate-400">Event Collector</span>
                <span className="text-emerald-400 font-medium">99.9% Uptime</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-2">
                <div className="bg-emerald-500 h-2 rounded-full" style={{ width: '99%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-slate-400">Threat Intelligence</span>
                <span className="text-emerald-400 font-medium">Active</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-2">
                <div className="bg-emerald-500 h-2 rounded-full" style={{ width: '100%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-slate-400">Avg Response Time</span>
                <span className="text-indigo-400 font-medium">{stats.avgResponse}s</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-2">
                <div className="bg-indigo-500 h-2 rounded-full" style={{ width: '85%' }}></div>
              </div>
            </div>
          </div>
        </motion.div>

      </div>
    </div>
  );
}
