import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Zap, Smartphone, UserX, GitBranch, ShieldCheck, AlertTriangle, X, CheckCircle } from 'lucide-react'

const SIMULATIONS = [
  {
    id: 'upi',
    label: 'UPI Phishing',
    desc: 'Simulate a phishing attack via fake UPI payment link targeting a savings account.',
    icon: Zap,
    iconBg: 'bg-red-50',
    iconColor: 'text-red-500',
    border: 'border-red-200',
    riskScore: 91,
    alert: {
      title: '🚨 UPI Phishing Detected!',
      severity: 'CRITICAL',
      account: 'ACC-4521',
      amount: '₹45,000',
      detail: 'Victim clicked a malicious UPI deeplink. Transaction origin: spoofed merchant ID. Account flagged and blocked.',
      color: 'red',
    },
  },
  {
    id: 'sim',
    label: 'SIM Swap Attack',
    desc: 'Simulate a SIM swap followed by immediate high-value UPI transfer from the compromised account.',
    icon: Smartphone,
    iconBg: 'bg-amber-50',
    iconColor: 'text-amber-500',
    border: 'border-amber-200',
    riskScore: 87,
    alert: {
      title: '📱 SIM Swap Alert!',
      severity: 'HIGH',
      account: 'ACC-7832',
      amount: '₹88,000',
      detail: 'SIM ported at 03:12 AM. New SIM used within 4 minutes for UPI transfer. Carrier notified.',
      color: 'amber',
    },
  },
  {
    id: 'ato',
    label: 'Account Takeover',
    desc: 'Simulate credential stuffing → new device login → immediate fund transfer pattern.',
    icon: UserX,
    iconBg: 'bg-purple-50',
    iconColor: 'text-purple-500',
    border: 'border-purple-200',
    riskScore: 94,
    alert: {
      title: '🔐 Account Takeover Detected!',
      severity: 'CRITICAL',
      account: 'ACC-9910',
      amount: '₹1,20,000',
      detail: 'New iPhone login from Bangalore. Credential stuffing match found. Account frozen. Customer notified via registered email.',
      color: 'red',
    },
  },
  {
    id: 'mule',
    label: 'Mule Account',
    desc: 'Simulate a mule network receiving layered transfers from multiple flagged accounts.',
    icon: GitBranch,
    iconBg: 'bg-pink-50',
    iconColor: 'text-pink-500',
    border: 'border-pink-200',
    riskScore: 82,
    alert: {
      title: '🕸 Mule Network Detected!',
      severity: 'HIGH',
      account: 'ACC-1122',
      amount: '₹2,40,000',
      detail: '3 upstream accounts detected. Fund layering pattern identified across 6 transactions in 8 minutes. Ring flagged for FIT.',
      color: 'pink',
    },
  },
  {
    id: 'normal',
    label: 'Normal Transaction',
    desc: 'Simulate a legitimate low-risk transaction that passes all fraud detection checks.',
    icon: ShieldCheck,
    iconBg: 'bg-emerald-50',
    iconColor: 'text-emerald-500',
    border: 'border-emerald-200',
    riskScore: 6,
    alert: {
      title: '✅ Transaction Cleared',
      severity: 'SAFE',
      account: 'ACC-6610',
      amount: '₹1,500',
      detail: 'All fraud checks passed. Known device, consistent location, normal spending pattern. Transaction approved.',
      color: 'green',
    },
  },
]

const colorMap = {
  red:   { bg: 'bg-red-50',    border: 'border-red-200',    title: 'text-red-700',    badge: 'badge-red',    icon: 'text-red-500' },
  amber: { bg: 'bg-amber-50',  border: 'border-amber-200',  title: 'text-amber-700',  badge: 'badge-amber',  icon: 'text-amber-500' },
  pink:  { bg: 'bg-pink-50',   border: 'border-pink-200',   title: 'text-pink-700',   badge: 'badge-red',    icon: 'text-pink-500' },
  green: { bg: 'bg-emerald-50',border: 'border-emerald-200',title: 'text-emerald-700',badge: 'badge-green',  icon: 'text-emerald-500' },
}

export default function FraudSimulator() {
  const [activeAlert, setActiveAlert] = useState(null)
  const [loading, setLoading] = useState(null)

  const runSim = (sim) => {
    setLoading(sim.id)
    setTimeout(() => { setLoading(null); setActiveAlert(sim) }, 1400)
  }

  const c = activeAlert ? (colorMap[activeAlert.alert.color] || colorMap.red) : null

  return (
    <div className="space-y-6 fade-in">
      <div>
        <h1 className="text-xl font-bold text-gray-800">Fraud Simulator</h1>
        <p className="text-sm text-gray-400 mt-0.5">Demo environment — simulate attack patterns for testing & demonstration</p>
      </div>

      <div className="glass-card p-4 flex items-center gap-3 border-l-4 border-sky-400">
        <AlertTriangle size={15} className="text-sky-500 shrink-0" />
        <p className="text-xs text-gray-600">
          This is a <span className="font-semibold text-sky-600">sandboxed simulation</span>. No real transactions are affected. Use this to demonstrate TrustGraph AI detection capabilities.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {SIMULATIONS.map((sim) => {
          const Icon = sim.icon
          const isLoading = loading === sim.id
          return (
            <motion.div key={sim.id} whileHover={{ y: -3 }} whileTap={{ scale: 0.98 }}
              className={`glass-card p-5 border ${sim.border} cursor-pointer hover:shadow-card-hover transition-all duration-200`}
              onClick={() => !isLoading && runSim(sim)}>
              <div className="flex items-start gap-3 mb-3">
                <div className={`w-10 h-10 rounded-xl ${sim.iconBg} flex items-center justify-center shrink-0`}>
                  {isLoading
                    ? <motion.div className="w-5 h-5 border-2 border-gray-200 border-t-gray-600 rounded-full" animate={{ rotate: 360 }} transition={{ duration: 0.7, repeat: Infinity, ease: 'linear' }} />
                    : <Icon size={18} className={sim.iconColor} />
                  }
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-800">{sim.label}</p>
                  <div className="mt-0.5 flex items-center gap-1.5">
                    <span className="text-[10px] text-gray-400">Risk Score:</span>
                    <span className="text-[10px] font-bold" style={{ color: sim.riskScore >= 70 ? '#EF4444' : sim.riskScore >= 40 ? '#F59E0B' : '#10B981' }}>{sim.riskScore}/100</span>
                  </div>
                </div>
              </div>
              <p className="text-xs text-gray-500 leading-relaxed mb-4">{sim.desc}</p>
              <button className={`w-full py-2 rounded-xl text-xs font-semibold transition-all ${isLoading ? 'bg-gray-100 text-gray-400' : 'bg-gray-800 hover:bg-gray-700 text-white'}`}>
                {isLoading ? 'Simulating...' : `▶ Run Simulation`}
              </button>
            </motion.div>
          )
        })}
      </div>

      {/* Alert Modal */}
      <AnimatePresence>
        {activeAlert && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setActiveAlert(null)}
          >
            <motion.div
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.85, opacity: 0 }}
              transition={{ type: 'spring', damping: 20, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className={`w-full max-w-md rounded-2xl border p-6 ${c.bg} ${c.border} shadow-2xl`}
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className={`text-base font-bold ${c.title}`}>{activeAlert.alert.title}</h3>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className={c.badge}>{activeAlert.alert.severity}</span>
                    <span className="text-xs text-gray-500">Risk: <strong>{activeAlert.riskScore}/100</strong></span>
                  </div>
                </div>
                <button onClick={() => setActiveAlert(null)} className="p-1 hover:bg-black/10 rounded-lg transition">
                  <X size={16} className="text-gray-500" />
                </button>
              </div>

              <div className="space-y-2.5 mb-4">
                <div className="flex justify-between text-xs text-gray-600">
                  <span className="font-medium">Account</span>
                  <span className="font-mono font-bold text-sky-600">{activeAlert.alert.account}</span>
                </div>
                <div className="flex justify-between text-xs text-gray-600">
                  <span className="font-medium">Amount</span>
                  <span className="font-bold text-gray-800">{activeAlert.alert.amount}</span>
                </div>
              </div>

              <div className="p-3 bg-white/60 rounded-xl border border-white mb-4">
                <p className="text-xs text-gray-700 leading-relaxed">{activeAlert.alert.detail}</p>
              </div>

              <div className="flex gap-2">
                {activeAlert.riskScore >= 40 ? (
                  <>
                    <button className="btn-danger text-xs flex-1 justify-center">Block Account</button>
                    <button className="btn-secondary text-xs flex-1 justify-center" onClick={() => setActiveAlert(null)}>Dismiss</button>
                  </>
                ) : (
                  <button className="btn-success text-xs flex-1 justify-center gap-2" onClick={() => setActiveAlert(null)}>
                    <CheckCircle size={13} /> Acknowledge & Close
                  </button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
