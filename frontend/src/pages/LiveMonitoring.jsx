import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Filter, RefreshCw, AlertTriangle, ShieldX } from 'lucide-react'
import { getRiskColor, getRiskLabel, getRiskBadgeClass, getStatusBadge } from '../utils/riskColor'

const BASE = [
  { id: 'TXN-9821', acc: 'ACC-4521', to: 'ACC-7712', amount: '₹45,000', method: 'UPI',  risk: 92, type: 'Account Takeover', status: 'blocked',   city: 'Mumbai' },
  { id: 'TXN-9822', acc: 'ACC-3391', to: 'ACC-1145', amount: '₹12,500', method: 'NEFT', risk: 64, type: 'UPI Fraud',         status: 'flagged',   city: 'Delhi' },
  { id: 'TXN-9823', acc: 'ACC-8801', to: 'ACC-5522', amount: '₹2,200',  method: 'IMPS', risk: 18, type: 'Normal',            status: 'cleared',   city: 'Pune' },
  { id: 'TXN-9824', acc: 'ACC-7832', to: 'ACC-9910', amount: '₹88,000', method: 'UPI',  risk: 85, type: 'Mule Account',      status: 'escalated', city: 'Bangalore' },
  { id: 'TXN-9825', acc: 'ACC-2245', to: 'ACC-3301', amount: '₹5,200',  method: 'UPI',  risk: 55, type: 'SIM Swap',          status: 'reviewing', city: 'Chennai' },
  { id: 'TXN-9826', acc: 'ACC-6610', to: 'ACC-7730', amount: '₹1,500',  method: 'IMPS', risk: 9,  type: 'Normal',            status: 'cleared',   city: 'Hyderabad' },
  { id: 'TXN-9827', acc: 'ACC-1122', to: 'ACC-4400', amount: '₹30,000', method: 'NEFT', risk: 78, type: 'Phishing',          status: 'flagged',   city: 'Kolkata' },
]

let idxCounter = 200

export default function LiveMonitoring() {
  const [txns, setTxns] = useState(BASE)
  const [search, setSearch] = useState('')
  const [filterRisk, setFilterRisk] = useState('all')
  const [paused, setPaused] = useState(false)

  useEffect(() => {
    if (paused) return
    const iv = setInterval(() => {
      const base = BASE[Math.floor(Math.random() * BASE.length)]
      const newTxn = {
        ...base,
        id: `TXN-${++idxCounter}`,
        risk: Math.floor(Math.random() * 100),
        time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      }
      setTxns((prev) => [newTxn, ...prev].slice(0, 30))
    }, 1800)
    return () => clearInterval(iv)
  }, [paused])

  const filtered = txns.filter((t) => {
    const q = search.toLowerCase()
    const matchSearch = !q || t.id.toLowerCase().includes(q) || t.acc.toLowerCase().includes(q) || t.type.toLowerCase().includes(q)
    const matchRisk = filterRisk === 'all' || (filterRisk === 'high' && t.risk >= 70) || (filterRisk === 'medium' && t.risk >= 40 && t.risk < 70) || (filterRisk === 'low' && t.risk < 40)
    return matchSearch && matchRisk
  })

  return (
    <div className="space-y-5 fade-in">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Live Monitoring</h1>
          <p className="text-sm text-gray-400 mt-0.5">Real-time transaction stream · SOC View</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5 mt-0.5">
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${paused ? 'bg-gray-400' : 'bg-emerald-400'} opacity-75`} />
            <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${paused ? 'bg-gray-400' : 'bg-emerald-500'}`} />
          </span>
          <span className={`text-xs font-semibold ${paused ? 'text-gray-500' : 'text-emerald-600'}`}>{paused ? 'Paused' : 'Live'}</span>
          <button onClick={() => setPaused((v) => !v)} className="btn-secondary text-xs gap-1.5">
            <RefreshCw size={12} className={paused ? '' : 'animate-spin'} />
            {paused ? 'Resume' : 'Pause'}
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="glass-card p-4 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-200 placeholder-gray-400"
            placeholder="Search by ID, account, type..." />
        </div>
        <div className="flex items-center gap-1.5">
          <Filter size={13} className="text-gray-400" />
          {['all', 'high', 'medium', 'low'].map((r) => (
            <button key={r} onClick={() => setFilterRisk(r)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${filterRisk === r ? 'bg-sky-400 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
              {r.charAt(0).toUpperCase() + r.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Summary badges */}
      <div className="flex flex-wrap gap-3">
        {[
          { label: 'Blocked',   count: txns.filter(t=>t.status==='blocked').length,   cls: 'badge-red' },
          { label: 'Flagged',   count: txns.filter(t=>t.status==='flagged').length,   cls: 'badge-amber' },
          { label: 'Reviewing', count: txns.filter(t=>t.status==='reviewing').length, cls: 'badge-blue' },
          { label: 'Cleared',   count: txns.filter(t=>t.status==='cleared').length,   cls: 'badge-green' },
        ].map((b) => (
          <div key={b.label} className={`${b.cls} px-3 py-1.5 text-xs`}>
            {b.label}: <span className="font-bold ml-1">{b.count}</span>
          </div>
        ))}
      </div>

      {/* Stream table */}
      <div className="glass-card p-5">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                {['Txn ID','From','To','Amount','Type','Risk','Status','City'].map(h=>(
                  <th key={h} className="pb-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide pr-4">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {filtered.map((t) => (
                  <motion.tr key={t.id}
                    initial={{ opacity: 0, backgroundColor: '#EFF6FF' }}
                    animate={{ opacity: 1, backgroundColor: 'transparent' }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="border-b border-gray-50 hover:bg-gray-50/60 transition-colors"
                  >
                    <td className="py-3 pr-4 font-mono text-xs text-gray-500">{t.id}</td>
                    <td className="py-3 pr-4 font-mono text-xs text-sky-600 font-medium">{t.acc}</td>
                    <td className="py-3 pr-4 font-mono text-xs text-sky-600">{t.to}</td>
                    <td className="py-3 pr-4 text-xs font-bold text-gray-800">{t.amount}</td>
                    <td className="py-3 pr-4 text-xs text-gray-600">{t.type}</td>
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-2">
                        <div className="w-12 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full rounded-full" style={{ width:`${t.risk}%`, background: getRiskColor(t.risk) }} />
                        </div>
                        <span className={`${getRiskBadgeClass(t.risk)} text-[10px]`}>{t.risk}</span>
                      </div>
                    </td>
                    <td className="py-3 pr-4"><span className={`capitalize ${getStatusBadge(t.status)}`}>{t.status}</span></td>
                    <td className="py-3 text-xs text-gray-400">{t.city}</td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="text-center py-12 text-gray-400 text-sm">No transactions match your filter.</div>
          )}
        </div>
      </div>
    </div>
  )
}
