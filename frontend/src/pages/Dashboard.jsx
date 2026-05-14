import React from 'react'
import { motion } from 'framer-motion'
import {
  LineChart, Line, AreaChart, Area, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts'
import { Activity, AlertTriangle, ShieldX, ShieldCheck, ArrowRight } from 'lucide-react'
import StatsCard from '../components/StatsCard'
import AlertTable from '../components/AlertTable'
import LiveFeed from '../components/LiveFeed'
import FraudTimeline from '../components/FraudTimeline'

const trendData = [
  { time: '06:00', transactions: 120, frauds: 3 },
  { time: '07:00', transactions: 280, frauds: 8 },
  { time: '08:00', transactions: 510, frauds: 14 },
  { time: '09:00', transactions: 740, frauds: 22 },
  { time: '10:00', transactions: 620, frauds: 18 },
  { time: '11:00', transactions: 890, frauds: 31 },
  { time: '12:00', transactions: 1020, frauds: 27 },
]

const pieData = [
  { name: 'UPI Fraud',        value: 34, color: '#EF4444' },
  { name: 'Account Takeover', value: 22, color: '#8B5CF6' },
  { name: 'SIM Swap',         value: 18, color: '#F59E0B' },
  { name: 'Mule Account',     value: 15, color: '#EC4899' },
  { name: 'Phishing',         value: 11, color: '#F97316' },
]

const stats = [
  { title: 'Total Transactions', value: '1,02,847', subtitle: 'Today', icon: Activity,    iconBg: 'bg-sky-50',     iconColor: 'text-sky-500',     trend: 12.4, trendLabel: 'vs yesterday' },
  { title: 'Fraud Alerts',       value: '247',       subtitle: 'Active',icon: AlertTriangle,iconBg: 'bg-red-50',     iconColor: 'text-red-500',     trend: -3.1, trendLabel: 'vs yesterday' },
  { title: 'High Risk Txns',     value: '89',        subtitle: 'Score > 80',icon: ShieldX,iconBg: 'bg-amber-50',   iconColor: 'text-amber-500',   trend: 5.2,  trendLabel: 'vs yesterday' },
  { title: 'Fraud Prevented',    value: '₹48.2L',    subtitle: 'Saved today',icon: ShieldCheck,iconBg:'bg-emerald-50',iconColor:'text-emerald-500', trend: 19.8, trendLabel: 'vs yesterday' },
]

export default function Dashboard() {
  return (
    <div className="space-y-6 fade-in">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-gray-800">Fraud Intelligence Dashboard</h1>
        <p className="text-sm text-gray-400 mt-0.5">Real-time overview · Updated every 30 seconds</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((s, i) => <StatsCard key={s.title} {...s} delay={i * 0.08} />)}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Risk trend */}
        <div className="xl:col-span-2 glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="section-title">Risk Trend</p>
              <p className="section-subtitle">Transactions vs fraud alerts — today</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={trendData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="txnGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#38BDF8" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#38BDF8" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="fraudGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#EF4444" stopOpacity={0.12} />
                  <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
              <XAxis dataKey="time" tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #E5E7EB', fontSize: 12 }} />
              <Area type="monotone" dataKey="transactions" name="Transactions" stroke="#38BDF8" strokeWidth={2} fill="url(#txnGrad)" dot={false} />
              <Area type="monotone" dataKey="frauds" name="Fraud Alerts" stroke="#EF4444" strokeWidth={2} fill="url(#fraudGrad)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Fraud type pie */}
        <div className="glass-card p-5">
          <p className="section-title">Fraud Distribution</p>
          <p className="section-subtitle mb-4">By attack type today</p>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={45} outerRadius={72} paddingAngle={3} dataKey="value">
                {pieData.map((entry) => <Cell key={entry.name} fill={entry.color} />)}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #E5E7EB', fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-3 space-y-1.5">
            {pieData.map((d) => (
              <div key={d.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ background: d.color }} />
                  <span className="text-xs text-gray-600">{d.name}</span>
                </div>
                <span className="text-xs font-semibold text-gray-700">{d.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Alert table */}
        <div className="xl:col-span-2 glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="section-title">Latest Fraud Alerts</p>
              <p className="section-subtitle">Most recent flagged transactions</p>
            </div>
            <button className="btn-secondary text-xs">View All <ArrowRight size={12} /></button>
          </div>
          <AlertTable />
        </div>

        {/* Live feed + timeline */}
        <div className="space-y-4">
          <div className="glass-card p-5">
            <p className="section-title mb-3">Live Transactions</p>
            <LiveFeed maxItems={5} />
          </div>
          <div className="glass-card p-5">
            <p className="section-title mb-3">Event Timeline</p>
            <FraudTimeline items={[
              { id:1, title:'Account Takeover',  desc:'ACC-4521 — New device',       time:'09:02', severity:'critical', icon: ShieldX },
              { id:2, title:'SIM Swap Warning',  desc:'ACC-7832 — Carrier change',   time:'09:08', severity:'high',     icon: AlertTriangle },
              { id:3, title:'System Clear',      desc:'Routine scan complete',        time:'09:30', severity:'low',      icon: ShieldCheck },
            ]} />
          </div>
        </div>
      </div>
    </div>
  )
}
