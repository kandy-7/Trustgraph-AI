import React from 'react'
import { motion } from 'framer-motion'
import { getRiskColor, getRiskBgColor, getRiskLabel, getRiskBadgeClass } from '../utils/riskColor'

export default function RiskCard({ account = 'ACC-4521', score = 87, type = 'Account Takeover', amount = '₹1,20,000', time = '09:02 AM', onClick }) {
  const color = getRiskColor(score)
  const bg = getRiskBgColor(score)
  return (
    <motion.div
      whileHover={{ y: -2, boxShadow: '0 8px 16px -4px rgba(0,0,0,0.08)' }}
      onClick={onClick}
      className="glass-card p-4 cursor-pointer border-l-4 transition-all duration-200"
      style={{ borderLeftColor: color }}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-gray-400 font-medium">{account}</p>
          <p className="text-sm font-bold text-gray-800 mt-0.5">{type}</p>
          <p className="text-lg font-bold mt-1" style={{ color }}>{score}<span className="text-xs font-normal text-gray-400 ml-0.5">/ 100</span></p>
        </div>
        <div className="text-right">
          <span className={getRiskBadgeClass(score)}>{getRiskLabel(score)}</span>
          <p className="text-sm font-semibold text-gray-700 mt-2">{amount}</p>
          <p className="text-[10px] text-gray-400 mt-0.5">{time}</p>
        </div>
      </div>
      <div className="mt-3 h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ background: color }}
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        />
      </div>
    </motion.div>
  )
}
