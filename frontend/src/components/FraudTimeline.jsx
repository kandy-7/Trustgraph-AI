import React from 'react'
import { motion } from 'framer-motion'
import { AlertTriangle, ShieldCheck, Info, ShieldX } from 'lucide-react'

const events = [
  { id: 1, title: 'Account Takeover Detected',  desc: 'New device login from Bangalore — ACC-4521', time: '09:02 AM', severity: 'critical', icon: ShieldX },
  { id: 2, title: 'SIM Swap Warning',            desc: 'SIM change + immediate UPI request — ACC-7832', time: '09:08 AM', severity: 'high', icon: AlertTriangle },
  { id: 3, title: 'UPI Spike Alert',             desc: '12 UPI transactions in 3 minutes — ACC-3391', time: '09:15 AM', severity: 'high', icon: AlertTriangle },
  { id: 4, title: 'Behavioural Anomaly',         desc: 'Login at 3 AM from unknown IP — ACC-9910', time: '09:22 AM', severity: 'medium', icon: Info },
  { id: 5, title: 'Transaction Cleared',         desc: 'Low-risk transfer verified — ACC-6610', time: '09:30 AM', severity: 'low', icon: ShieldCheck },
]

const severityStyles = {
  critical: { dot: 'bg-red-500',    line: 'bg-red-100',    icon: 'bg-red-50 text-red-500',    text: 'text-red-600' },
  high:     { dot: 'bg-amber-500',  line: 'bg-amber-100',  icon: 'bg-amber-50 text-amber-500', text: 'text-amber-600' },
  medium:   { dot: 'bg-sky-400',    line: 'bg-sky-100',    icon: 'bg-sky-50 text-sky-500',    text: 'text-sky-600' },
  low:      { dot: 'bg-emerald-500',line: 'bg-emerald-100',icon: 'bg-emerald-50 text-emerald-600',text: 'text-emerald-600' },
}

export default function FraudTimeline({ items = events }) {
  return (
    <div className="relative space-y-0">
      {items.map((e, i) => {
        const s = severityStyles[e.severity]
        const Icon = e.icon
        return (
          <motion.div
            key={e.id}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.07 }}
            className="flex gap-3 pb-5 last:pb-0"
          >
            {/* Timeline line */}
            <div className="flex flex-col items-center">
              <div className={`w-8 h-8 rounded-xl ${s.icon} flex items-center justify-center shrink-0 z-10`}>
                <Icon size={15} />
              </div>
              {i < items.length - 1 && <div className={`w-0.5 flex-1 ${s.line} mt-1`} />}
            </div>
            {/* Content */}
            <div className="pt-1 pb-4 min-w-0">
              <p className={`text-xs font-semibold ${s.text}`}>{e.title}</p>
              <p className="text-xs text-gray-500 mt-0.5">{e.desc}</p>
              <p className="text-[10px] text-gray-400 mt-1">{e.time}</p>
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}
