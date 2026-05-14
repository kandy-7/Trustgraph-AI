import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Zap } from 'lucide-react'
import { getRiskColor, getRiskLabel } from '../utils/riskColor'

const POOL = [
  { id: 1,  acc: 'ACC-4521', amount: '₹45,000', method: 'UPI',  risk: 92, type: 'Account Takeover' },
  { id: 2,  acc: 'ACC-7832', amount: '₹12,500', method: 'NEFT', risk: 67, type: 'UPI Fraud' },
  { id: 3,  acc: 'ACC-3391', amount: '₹2,800',  method: 'IMPS', risk: 14, type: 'Normal' },
  { id: 4,  acc: 'ACC-9910', amount: '₹88,000', method: 'UPI',  risk: 85, type: 'Mule Account' },
  { id: 5,  acc: 'ACC-2245', amount: '₹5,200',  method: 'UPI',  risk: 55, type: 'SIM Swap' },
  { id: 6,  acc: 'ACC-6610', amount: '₹1,500',  method: 'IMPS', risk: 8,  type: 'Normal' },
  { id: 7,  acc: 'ACC-1122', amount: '₹30,000', method: 'NEFT', risk: 78, type: 'Phishing' },
  { id: 8,  acc: 'ACC-5500', amount: '₹750',    method: 'UPI',  risk: 5,  type: 'Normal' },
]

let counter = 100

export default function LiveFeed({ maxItems = 8 }) {
  const [feed, setFeed] = useState(POOL.slice(0, 4).map((t) => ({ ...t, key: t.id })))

  useEffect(() => {
    const iv = setInterval(() => {
      const item = { ...POOL[Math.floor(Math.random() * POOL.length)], key: ++counter }
      setFeed((prev) => [item, ...prev].slice(0, maxItems))
    }, 2200)
    return () => clearInterval(iv)
  }, [maxItems])

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 mb-3">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-sky-500" />
        </span>
        <span className="text-xs font-semibold text-sky-600">Live Feed</span>
      </div>
      <AnimatePresence initial={false}>
        {feed.map((t) => {
          const color = getRiskColor(t.risk)
          return (
            <motion.div
              key={t.key}
              initial={{ opacity: 0, y: -14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25 }}
              className="flex items-center gap-3 p-2.5 bg-gray-50 rounded-xl border border-gray-100 hover:border-sky-100 hover:bg-sky-50/30 transition-colors"
            >
              <div className="w-1 h-8 rounded-full shrink-0" style={{ background: color }} />
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-gray-700 font-mono">{t.acc}</span>
                  <span className="text-xs font-bold text-gray-800">{t.amount}</span>
                </div>
                <div className="flex items-center justify-between mt-0.5">
                  <span className="text-[10px] text-gray-400">{t.type} · {t.method}</span>
                  <span className="text-[10px] font-semibold" style={{ color }}>{getRiskLabel(t.risk)}</span>
                </div>
              </div>
            </motion.div>
          )
        })}
      </AnimatePresence>
    </div>
  )
}
