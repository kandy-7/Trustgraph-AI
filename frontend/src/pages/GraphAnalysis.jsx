import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { GitBranch, AlertTriangle, Info, Users } from 'lucide-react'
import GraphView from '../components/GraphView'

const clusters = [
  { id: 'C-01', label: 'Mule Ring Alpha', accounts: 3, totalFlow: '₹2.4L', risk: 'critical', color: '#EF4444', desc: 'ACC-4521 → ACC-9910 → ACC-1122: suspected orchestrated layering pattern.' },
  { id: 'C-02', label: 'SIM Swap Group', accounts: 2, totalFlow: '₹57K',  risk: 'high',     color: '#F59E0B', desc: 'ACC-7832 → ACC-3391: SIM swap followed by UPI fund transfer.' },
]

const insights = [
  { icon: AlertTriangle, text: 'ACC-4521 is the likely initiator node — 6 downstream accounts identified.', color: 'text-red-500',    bg: 'bg-red-50'    },
  { icon: Users,         text: 'Cluster of 3 mule accounts detected with circular fund movements.',          color: 'text-amber-500', bg: 'bg-amber-50' },
  { icon: Info,          text: 'Transaction velocity: 12 transfers in 4 minutes across the ring.',           color: 'text-sky-500',   bg: 'bg-sky-50'   },
  { icon: GitBranch,     text: 'Graph depth 3 — typical signature of organized fraud syndicate.',            color: 'text-purple-500',bg: 'bg-purple-50' },
]

export default function GraphAnalysis() {
  const [activeCluster, setActiveCluster] = useState(null)

  return (
    <div className="space-y-5 fade-in">
      <div>
        <h1 className="text-xl font-bold text-gray-800">Graph Analysis</h1>
        <p className="text-sm text-gray-400 mt-0.5">Fraud ring detection & transaction network visualization</p>
      </div>

      {/* Legend */}
      <div className="glass-card p-4 flex flex-wrap gap-4 items-center">
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Node Risk</span>
        {[
          { color: '#EF4444', bg: '#FEF2F2', label: 'Critical / Blocked' },
          { color: '#F59E0B', bg: '#FFFBEB', label: 'High Risk' },
          { color: '#10B981', bg: '#F0FDF4', label: 'Low Risk' },
        ].map((l) => (
          <div key={l.label} className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-lg border-2" style={{ background: l.bg, borderColor: l.color }} />
            <span className="text-xs text-gray-600">{l.label}</span>
          </div>
        ))}
        <div className="flex items-center gap-2 ml-4">
          <div className="w-10 h-0.5 bg-red-400 relative">
            <div className="absolute right-0 top-1/2 -translate-y-1/2 border-t-4 border-b-4 border-l-4 border-transparent border-l-red-400" />
          </div>
          <span className="text-xs text-gray-600">Suspicious flow (animated)</span>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-5">
        {/* Graph */}
        <div className="xl:col-span-3 glass-card p-2" style={{ height: 500 }}>
          <GraphView />
        </div>

        {/* Side panel */}
        <div className="space-y-4">
          {/* Clusters */}
          <div className="glass-card p-4">
            <p className="section-title mb-3">Fraud Clusters</p>
            <div className="space-y-3">
              {clusters.map((c) => (
                <motion.button
                  key={c.id}
                  whileHover={{ x: 2 }}
                  onClick={() => setActiveCluster(activeCluster?.id === c.id ? null : c)}
                  className={`w-full text-left p-3 rounded-xl border transition-all ${activeCluster?.id === c.id ? 'border-sky-300 bg-sky-50' : 'border-gray-100 bg-gray-50 hover:border-sky-200'}`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-800">{c.label}</span>
                    <div className="w-2 h-2 rounded-full" style={{ background: c.color }} />
                  </div>
                  <div className="mt-1 flex gap-3 text-[10px] text-gray-400">
                    <span>{c.accounts} accounts</span>
                    <span>{c.totalFlow} flow</span>
                  </div>
                  {activeCluster?.id === c.id && (
                    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-2 text-[10px] text-gray-600 leading-relaxed">
                      {c.desc}
                    </motion.p>
                  )}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Insights */}
          <div className="glass-card p-4">
            <p className="section-title mb-3">Suspicious Insights</p>
            <div className="space-y-2.5">
              {insights.map((ins, i) => {
                const Icon = ins.icon
                return (
                  <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                    className={`flex items-start gap-2.5 p-2.5 rounded-xl ${ins.bg}`}>
                    <Icon size={13} className={`${ins.color} mt-0.5 shrink-0`} />
                    <p className="text-[10px] text-gray-700 leading-relaxed">{ins.text}</p>
                  </motion.div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
