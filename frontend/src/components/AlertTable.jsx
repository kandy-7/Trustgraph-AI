import React from 'react'
import { motion } from 'framer-motion'
import { AlertTriangle, ShieldX, Smartphone, UserX, GitBranch, ArrowUpRight } from 'lucide-react'
import { getRiskBadgeClass, getRiskLabel } from '../utils/riskColor'

const iconMap = {
  'UPI Fraud': AlertTriangle,
  'SIM Swap': Smartphone,
  'Account Takeover': UserX,
  'Mule Account': GitBranch,
  'Phishing': ShieldX,
}

const mockAlerts = [
  { id: 'ALT-001', type: 'Account Takeover', account: 'ACC-4521', amount: '₹1,20,000', risk: 94, time: '2m ago', status: 'blocked' },
  { id: 'ALT-002', type: 'SIM Swap',          account: 'ACC-7832', amount: '₹45,000',  risk: 87, time: '8m ago', status: 'flagged' },
  { id: 'ALT-003', type: 'UPI Fraud',          account: 'ACC-3391', amount: '₹12,500',  risk: 76, time: '15m ago', status: 'reviewing' },
  { id: 'ALT-004', type: 'Mule Account',       account: 'ACC-9910', amount: '₹88,000',  risk: 82, time: '23m ago', status: 'escalated' },
  { id: 'ALT-005', type: 'Phishing',           account: 'ACC-2245', amount: '₹5,200',   risk: 61, time: '31m ago', status: 'flagged' },
]

export default function AlertTable({ alerts = mockAlerts, maxRows = 5 }) {
  const rows = alerts.slice(0, maxRows)

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-100">
            {['Alert ID', 'Type', 'Account', 'Amount', 'Risk', 'Time', 'Status'].map((h) => (
              <th key={h} className="pb-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide pr-4">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((a, i) => {
            const Icon = iconMap[a.type] || AlertTriangle
            return (
              <motion.tr
                key={a.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="border-b border-gray-50 hover:bg-gray-50/60 transition-colors"
              >
                <td className="py-3 pr-4 font-mono text-xs text-gray-500">{a.id}</td>
                <td className="py-3 pr-4">
                  <div className="flex items-center gap-1.5">
                    <Icon size={13} className="text-gray-400 shrink-0" />
                    <span className="text-gray-700 font-medium text-xs">{a.type}</span>
                  </div>
                </td>
                <td className="py-3 pr-4 font-mono text-xs text-sky-600 font-medium">{a.account}</td>
                <td className="py-3 pr-4 text-xs font-semibold text-gray-700">{a.amount}</td>
                <td className="py-3 pr-4">
                  <span className={`${getRiskBadgeClass(a.risk)}`}>{a.risk}%</span>
                </td>
                <td className="py-3 pr-4 text-xs text-gray-400">{a.time}</td>
                <td className="py-3">
                  <span className={`capitalize ${getRiskBadgeClass(a.risk)}`}>{a.status}</span>
                </td>
              </motion.tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
