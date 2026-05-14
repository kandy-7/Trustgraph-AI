import React from 'react'
import { motion } from 'framer-motion'
import { getRiskBadgeClass, getStatusBadge } from '../utils/riskColor'

const mockTxns = [
  { id: 'TXN-9821', from: 'ACC-4521', to: 'ACC-7712', amount: '₹45,000', method: 'UPI',  risk: 91, status: 'blocked',   time: '09:12 AM' },
  { id: 'TXN-9822', from: 'ACC-3391', to: 'ACC-1145', amount: '₹12,500', method: 'NEFT', risk: 62, status: 'flagged',   time: '09:15 AM' },
  { id: 'TXN-9823', from: 'ACC-8801', to: 'ACC-5522', amount: '₹2,200',  method: 'IMPS', risk: 18, status: 'cleared',   time: '09:17 AM' },
  { id: 'TXN-9824', from: 'ACC-7832', to: 'ACC-9910', amount: '₹88,000', method: 'UPI',  risk: 85, status: 'escalated', time: '09:19 AM' },
  { id: 'TXN-9825', from: 'ACC-2245', to: 'ACC-3301', amount: '₹5,200',  method: 'UPI',  risk: 44, status: 'reviewing', time: '09:21 AM' },
  { id: 'TXN-9826', from: 'ACC-6610', to: 'ACC-7730', amount: '₹1,500',  method: 'IMPS', risk: 9,  status: 'cleared',   time: '09:23 AM' },
]

const methodColors = { UPI: 'badge-blue', NEFT: 'badge-purple', IMPS: 'badge-gray', RTGS: 'badge-amber' }

export default function TransactionTable({ transactions = mockTxns }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-100">
            {['Txn ID', 'From', 'To', 'Amount', 'Method', 'Risk', 'Status', 'Time'].map((h) => (
              <th key={h} className="pb-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide pr-4">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {transactions.map((t, i) => (
            <motion.tr
              key={t.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.04 }}
              className="border-b border-gray-50 hover:bg-gray-50/60 transition-colors cursor-pointer"
            >
              <td className="py-3 pr-4 font-mono text-xs text-gray-500">{t.id}</td>
              <td className="py-3 pr-4 font-mono text-xs text-sky-600">{t.from}</td>
              <td className="py-3 pr-4 font-mono text-xs text-sky-600">{t.to}</td>
              <td className="py-3 pr-4 text-xs font-semibold text-gray-800">{t.amount}</td>
              <td className="py-3 pr-4"><span className={methodColors[t.method] || 'badge-gray'}>{t.method}</span></td>
              <td className="py-3 pr-4">
                <div className="flex items-center gap-2">
                  <div className="w-16 bg-gray-100 rounded-full h-1.5">
                    <div className="h-1.5 rounded-full" style={{ width: `${t.risk}%`, background: t.risk >= 70 ? '#EF4444' : t.risk >= 40 ? '#F59E0B' : '#10B981' }} />
                  </div>
                  <span className="text-xs text-gray-600">{t.risk}</span>
                </div>
              </td>
              <td className="py-3 pr-4"><span className={`capitalize ${getStatusBadge(t.status)}`}>{t.status}</span></td>
              <td className="py-3 text-xs text-gray-400">{t.time}</td>
            </motion.tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
