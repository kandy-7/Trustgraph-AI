import React, { useState } from 'react'
import { motion } from 'framer-motion'
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import { Brain, Smartphone, Clock, CreditCard, MapPin, AlertTriangle, ShieldCheck, ChevronDown } from 'lucide-react'
import RiskGauge from '../components/RiskGauge'

const CASES = [
  { id: 'ALT-001', account: 'ACC-4521', score: 94, type: 'Account Takeover', amount: '₹1,20,000', time: '09:02 AM' },
  { id: 'ALT-002', account: 'ACC-7832', score: 87, type: 'SIM Swap',         amount: '₹45,000',  time: '09:08 AM' },
  { id: 'ALT-003', account: 'ACC-3391', score: 72, type: 'UPI Fraud',        amount: '₹12,500',  time: '09:15 AM' },
]

const radarData = [
  { axis: 'Login Anomaly',    value: 90 },
  { axis: 'Device Mismatch',  value: 85 },
  { axis: 'Txn Velocity',     value: 78 },
  { axis: 'Geo Anomaly',      value: 60 },
  { axis: 'Time Deviation',   value: 72 },
  { axis: 'Amount Spike',     value: 95 },
]

const spendingData = [
  { month: 'Jan', normal: 18000, current: 18500 },
  { month: 'Feb', normal: 22000, current: 21000 },
  { month: 'Mar', normal: 19000, current: 20000 },
  { month: 'Apr', normal: 21000, current: 19500 },
  { month: 'May', normal: 20000, current: 120000 },
]

const anomalies = [
  { icon: Smartphone, label: 'Device Mismatch',    detail: 'New iPhone 15 — never used before',        severity: 'critical' },
  { icon: MapPin,     label: 'Location Anomaly',   detail: 'Login from Bangalore, last: Mumbai',        severity: 'high' },
  { icon: Clock,      label: 'Login Time Anomaly', detail: 'Activity at 3:14 AM — first time ever',     severity: 'high' },
  { icon: CreditCard, label: 'Spending Deviation', detail: '6× above 6-month average spending',         severity: 'critical' },
  { icon: Brain,      label: 'Behavioural Score',  detail: 'Pattern divergence: 94/100',                severity: 'critical' },
]

const sevStyle = {
  critical: 'badge-red',
  high: 'badge-amber',
  medium: 'badge-blue',
}

export default function FraudAnalysis() {
  const [selected, setSelected] = useState(CASES[0])

  return (
    <div className="space-y-5 fade-in">
      <div>
        <h1 className="text-xl font-bold text-gray-800">Fraud Analysis</h1>
        <p className="text-sm text-gray-400 mt-0.5">Detailed risk breakdown & AI explanation</p>
      </div>

      {/* Case selector */}
      <div className="glass-card p-4 flex flex-wrap gap-3">
        {CASES.map((c) => (
          <button key={c.id} onClick={() => setSelected(c)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all border ${selected.id === c.id ? 'bg-sky-400 text-white border-sky-400 shadow-sm' : 'bg-white text-gray-600 border-gray-200 hover:border-sky-200'}`}>
            {c.id} — {c.type}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        {/* Left column */}
        <div className="space-y-5">
          {/* Gauge */}
          <div className="glass-card p-6 flex flex-col items-center">
            <p className="section-title mb-4 self-start">Risk Score</p>
            <RiskGauge score={selected.score} size={200} />
            <div className="mt-4 w-full space-y-2 text-sm">
              <div className="flex justify-between text-gray-600"><span>Account</span><span className="font-mono font-semibold text-sky-600">{selected.account}</span></div>
              <div className="flex justify-between text-gray-600"><span>Amount</span><span className="font-bold text-gray-800">{selected.amount}</span></div>
              <div className="flex justify-between text-gray-600"><span>Time</span><span className="text-gray-500">{selected.time}</span></div>
              <div className="flex justify-between text-gray-600"><span>Confidence</span><span className="font-semibold text-red-500">{selected.score}%</span></div>
            </div>
          </div>

          {/* AI Explanation */}
          <div className="glass-card p-5 border-l-4 border-sky-400">
            <div className="flex items-center gap-2 mb-3">
              <Brain size={16} className="text-sky-500" />
              <p className="text-sm font-semibold text-gray-800">AI Explanation</p>
            </div>
            <p className="text-xs text-gray-600 leading-relaxed">
              High probability of <span className="font-semibold text-red-500">{selected.type}</span>. The account shows a new device
              login from a geographically distant location followed by an immediate high-value UPI transaction —
              a classic account takeover pattern. Behavioural deviation score is critically high at {selected.score}/100.
            </p>
            <div className="mt-3 flex items-center gap-2 p-2.5 bg-amber-50 rounded-xl border border-amber-100">
              <AlertTriangle size={13} className="text-amber-500 shrink-0" />
              <p className="text-xs font-medium text-amber-700">Recommendation: Block transaction & notify account holder immediately.</p>
            </div>
          </div>
        </div>

        {/* Middle — anomalies + radar */}
        <div className="space-y-5">
          {/* Anomaly breakdown */}
          <div className="glass-card p-5">
            <p className="section-title mb-4">Anomaly Breakdown</p>
            <div className="space-y-3">
              {anomalies.map((a) => {
                const Icon = a.icon
                return (
                  <motion.div key={a.label} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                    className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                    <div className="w-7 h-7 rounded-lg bg-white border border-gray-200 flex items-center justify-center shrink-0">
                      <Icon size={13} className="text-gray-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-semibold text-gray-700">{a.label}</p>
                        <span className={sevStyle[a.severity]}>{a.severity}</span>
                      </div>
                      <p className="text-[10px] text-gray-400 mt-0.5">{a.detail}</p>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </div>

          {/* Radar chart */}
          <div className="glass-card p-5">
            <p className="section-title mb-4">Behavioural Radar</p>
            <ResponsiveContainer width="100%" height={220}>
              <RadarChart data={radarData} margin={{ top: 10, right: 20, bottom: 10, left: 20 }}>
                <PolarGrid stroke="#E5E7EB" />
                <PolarAngleAxis dataKey="axis" tick={{ fontSize: 10, fill: '#9CA3AF' }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                <Radar name="Risk" dataKey="value" stroke="#38BDF8" fill="#38BDF8" fillOpacity={0.15} strokeWidth={2} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right — spending deviation + officer card */}
        <div className="space-y-5">
          {/* Spending chart */}
          <div className="glass-card p-5">
            <p className="section-title mb-1">Spending Deviation</p>
            <p className="section-subtitle mb-4">Normal vs current month</p>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={spendingData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #E5E7EB', fontSize: 11 }} formatter={(v) => `₹${v.toLocaleString()}`} />
                <Bar dataKey="normal"  name="Normal Avg" fill="#BAE6FD" radius={[4, 4, 0, 0]} />
                <Bar dataKey="current" name="This Month"  fill="#EF4444"  radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Officer recommendation */}
          <div className="glass-card p-5 border border-red-100 bg-red-50/30">
            <div className="flex items-center gap-2 mb-3">
              <ShieldCheck size={15} className="text-red-500" />
              <p className="text-sm font-bold text-red-700">Officer Recommendation</p>
            </div>
            <p className="text-xs font-bold text-red-800 mb-2">⚠ HIGH RISK: Possible Account Takeover</p>
            <ul className="space-y-1.5 text-xs text-red-700">
              <li>• Immediately block outgoing transactions</li>
              <li>• Send OTP verification to registered mobile</li>
              <li>• Escalate to Fraud Investigation Team</li>
              <li>• Initiate 24-hour account freeze</li>
            </ul>
            <div className="mt-4 flex gap-2">
              <button className="btn-danger text-xs flex-1 justify-center">Block Account</button>
              <button className="btn-warning text-xs flex-1 justify-center">Escalate</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
