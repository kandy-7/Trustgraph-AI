import React, { useState } from 'react'
import { useLocation } from 'react-router-dom'
import { Bell, Search, ChevronRight, Settings } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const crumbMap = {
  '/dashboard': ['Dashboard'],
  '/live-monitoring': ['Live Monitoring'],
  '/fraud-analysis': ['Fraud Analysis'],
  '/graph-analysis': ['Graph Analysis'],
  '/officer-panel': ['Officer Panel'],
  '/fraud-simulator': ['Fraud Simulator'],
}

const ALERTS = [
  { id: 1, msg: 'Critical: SIM Swap detected on ACC-7823', time: '2m ago', color: 'text-red-500' },
  { id: 2, msg: 'High: Unusual UPI spike — ACC-4421', time: '5m ago', color: 'text-amber-500' },
  { id: 3, msg: 'Medium: Multiple failed logins — ACC-9910', time: '12m ago', color: 'text-sky-500' },
]

export default function TopBar() {
  const { pathname } = useLocation()
  const [showNotifs, setShowNotifs] = useState(false)
  const crumbs = crumbMap[pathname] || []

  return (
    <header className="h-14 shrink-0 bg-white border-b border-gray-100 flex items-center px-6 gap-4 z-10">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-sm">
        <span className="text-gray-400 font-medium">TrustGraph AI</span>
        {crumbs.map((c) => (
          <React.Fragment key={c}>
            <ChevronRight size={13} className="text-gray-300" />
            <span className="text-gray-700 font-semibold">{c}</span>
          </React.Fragment>
        ))}
      </div>

      <div className="flex-1" />

      {/* Search */}
      <div className="relative hidden md:block">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          className="pl-8 pr-4 py-1.5 text-sm bg-gray-50 border border-gray-200 rounded-xl w-52 focus:outline-none focus:ring-2 focus:ring-sky-200 placeholder-gray-400 transition"
          placeholder="Search transactions..."
        />
      </div>

      {/* Notification bell */}
      <div className="relative">
        <button
          onClick={() => setShowNotifs((v) => !v)}
          className="relative p-2 rounded-xl hover:bg-gray-50 transition"
        >
          <Bell size={18} className="text-gray-500" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white" />
        </button>
        <AnimatePresence>
          {showNotifs && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="absolute right-0 top-full mt-2 w-80 glass-card shadow-card-hover z-50 p-4"
            >
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Recent Alerts</p>
              <div className="space-y-3">
                {ALERTS.map((a) => (
                  <div key={a.id} className="flex items-start gap-3">
                    <div className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${a.color.replace('text-', 'bg-')}`} />
                    <div>
                      <p className="text-xs text-gray-700">{a.msg}</p>
                      <p className="text-[10px] text-gray-400 mt-0.5">{a.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <button className="p-2 rounded-xl hover:bg-gray-50 transition">
        <Settings size={18} className="text-gray-500" />
      </button>

      <div className="w-8 h-8 rounded-full bg-sky-100 flex items-center justify-center text-sky-600 text-xs font-bold cursor-pointer">
        A
      </div>
    </header>
  )
}
