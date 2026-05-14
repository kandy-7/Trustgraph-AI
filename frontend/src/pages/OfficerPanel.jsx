import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Shield, Clock, CheckCircle, XCircle, ArrowUpCircle, FileText, ChevronDown, ChevronUp } from 'lucide-react'
import { getRiskBadgeClass, getRiskLabel } from '../utils/riskColor'

const CASES = [
  {
    id: 'CASE-001', account: 'ACC-4521', type: 'Account Takeover', amount: '₹1,20,000',
    risk: 94, status: 'escalated', officer: 'Riya Shah', assignedAt: '09:05 AM',
    history: [
      { action: 'Flagged by AI engine', time: '09:02 AM', actor: 'System' },
      { action: 'Assigned to Officer', time: '09:05 AM', actor: 'Supervisor' },
      { action: 'Escalated to FIT',    time: '09:18 AM', actor: 'Riya Shah' },
    ],
    notes: 'Customer contacted at 09:10 AM. Did not recognize the transaction. Device fingerprint mismatch confirmed. Escalated to Fraud Investigation Team.',
  },
  {
    id: 'CASE-002', account: 'ACC-7832', type: 'SIM Swap',        amount: '₹45,000',
    risk: 87, status: 'reviewing', officer: 'Arjun Mehta', assignedAt: '09:10 AM',
    history: [
      { action: 'SIM change detected',       time: '09:07 AM', actor: 'System' },
      { action: 'UPI transaction flagged',   time: '09:08 AM', actor: 'System' },
      { action: 'Case opened for review',    time: '09:10 AM', actor: 'Arjun Mehta' },
    ],
    notes: 'Awaiting carrier confirmation on SIM swap request timestamp. Transaction temporarily held.',
  },
  {
    id: 'CASE-003', account: 'ACC-3391', type: 'UPI Fraud',       amount: '₹12,500',
    risk: 72, status: 'flagged',  officer: 'Priya Nair', assignedAt: '09:20 AM',
    history: [
      { action: 'High-velocity UPI detected', time: '09:15 AM', actor: 'System' },
      { action: 'Case assigned',              time: '09:20 AM', actor: 'Supervisor' },
    ],
    notes: '',
  },
]

const statusBadge = {
  escalated: 'badge-red',
  reviewing: 'badge-blue',
  flagged:   'badge-amber',
  cleared:   'badge-green',
}

export default function OfficerPanel() {
  const [selected, setSelected] = useState(CASES[0])
  const [note, setNote] = useState(selected.notes)
  const [expanded, setExpanded] = useState(false)

  const selectCase = (c) => { setSelected(c); setNote(c.notes); setExpanded(false) }

  return (
    <div className="space-y-5 fade-in">
      <div>
        <h1 className="text-xl font-bold text-gray-800">Officer Investigation Panel</h1>
        <p className="text-sm text-gray-400 mt-0.5">Fraud case management & escalation center</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        {/* Case list */}
        <div className="glass-card p-5">
          <p className="section-title mb-4">Flagged Cases <span className="ml-2 badge-red">{CASES.length}</span></p>
          <div className="space-y-3">
            {CASES.map((c) => (
              <motion.button key={c.id} whileHover={{ x: 2 }} onClick={() => selectCase(c)}
                className={`w-full text-left p-3.5 rounded-xl border transition-all ${selected.id === c.id ? 'border-sky-400 bg-sky-50' : 'border-gray-100 bg-gray-50 hover:border-sky-200'}`}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-gray-700">{c.id}</span>
                  <span className={statusBadge[c.status]}>{c.status}</span>
                </div>
                <p className="text-sm font-semibold text-gray-800">{c.type}</p>
                <div className="mt-1.5 flex items-center justify-between text-[10px] text-gray-400">
                  <span className="font-mono">{c.account}</span>
                  <span className="font-bold text-gray-600">{c.amount}</span>
                </div>
                <div className="mt-2 h-1 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${c.risk}%`, background: c.risk >= 80 ? '#EF4444' : '#F59E0B' }} />
                </div>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Detail panel */}
        <div className="xl:col-span-2 space-y-4">
          {/* Case header */}
          <div className="glass-card p-5">
            <div className="flex items-start justify-between flex-wrap gap-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-mono text-gray-400">{selected.id}</span>
                  <span className={statusBadge[selected.status]}>{selected.status}</span>
                  <span className={getRiskBadgeClass(selected.risk)}>{getRiskLabel(selected.risk)} Risk · {selected.risk}</span>
                </div>
                <h2 className="text-lg font-bold text-gray-800">{selected.type}</h2>
                <p className="text-sm text-gray-500 mt-0.5">Account: <span className="font-mono text-sky-600 font-semibold">{selected.account}</span> · Amount: <span className="font-bold text-gray-700">{selected.amount}</span></p>
              </div>
              <div className="text-right text-xs text-gray-400">
                <p>Assigned to: <span className="font-semibold text-gray-700">{selected.officer}</span></p>
                <p className="mt-0.5">Since: {selected.assignedAt}</p>
              </div>
            </div>

            {/* Action buttons */}
            <div className="mt-5 flex flex-wrap gap-2">
              <button className="btn-success gap-2"><CheckCircle size={14} /> Approve & Clear</button>
              <button className="btn-danger gap-2"><XCircle size={14} /> Block Account</button>
              <button className="btn-warning gap-2"><ArrowUpCircle size={14} /> Escalate to FIT</button>
              <button className="btn-secondary gap-2"><Shield size={14} /> Mark Safe</button>
            </div>
          </div>

          {/* Timeline */}
          <div className="glass-card p-5">
            <button onClick={() => setExpanded((v) => !v)} className="flex items-center justify-between w-full">
              <p className="section-title flex items-center gap-2"><Clock size={15} className="text-sky-400" /> Investigation Timeline</p>
              {expanded ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
            </button>
            <AnimatePresence>
              {expanded && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden mt-4 space-y-3">
                  {selected.history.map((h, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="w-2 h-2 rounded-full bg-sky-400 mt-1.5 shrink-0" />
                      <div>
                        <p className="text-xs font-semibold text-gray-700">{h.action}</p>
                        <p className="text-[10px] text-gray-400 mt-0.5">{h.time} · {h.actor}</p>
                      </div>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
            {!expanded && (
              <p className="text-xs text-gray-400 mt-1">{selected.history.length} events — click to expand</p>
            )}
          </div>

          {/* Notes */}
          <div className="glass-card p-5">
            <p className="section-title flex items-center gap-2 mb-3"><FileText size={15} className="text-sky-400" /> Investigation Notes</p>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={4}
              placeholder="Add your investigation notes here..."
              className="w-full text-sm text-gray-700 bg-gray-50 border border-gray-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-sky-200 resize-none placeholder-gray-400"
            />
            <div className="mt-2 flex justify-end">
              <button className="btn-primary text-xs">Save Notes</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
