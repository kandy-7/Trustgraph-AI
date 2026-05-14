import React from 'react'
import { NavLink } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  LayoutDashboard, Activity, AlertTriangle, GitBranch,
  Shield, Zap, ShieldCheck, Circle
} from 'lucide-react'

const navItems = [
  { to: '/dashboard',       label: 'Dashboard',       icon: LayoutDashboard },
  { to: '/live-monitoring', label: 'Live Monitoring',  icon: Activity },
  { to: '/fraud-analysis',  label: 'Fraud Analysis',   icon: AlertTriangle },
  { to: '/graph-analysis',  label: 'Graph Analysis',   icon: GitBranch },
  { to: '/officer-panel',   label: 'Officer Panel',    icon: Shield },
  { to: '/fraud-simulator', label: 'Fraud Simulator',  icon: Zap },
]

export default function Sidebar() {
  return (
    <aside className="w-64 shrink-0 bg-white border-r border-gray-100 flex flex-col h-full z-20">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-sky-400 to-sky-600 flex items-center justify-center shadow-sm">
            <ShieldCheck size={18} className="text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-800 leading-none">TrustGraph</p>
            <p className="text-[10px] text-sky-500 font-semibold tracking-wide mt-0.5">AI FRAUD INTELLIGENCE</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        <p className="px-3 mb-2 text-[10px] font-semibold text-gray-400 uppercase tracking-widest">Navigation</p>
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink key={to} to={to}>
            {({ isActive }) => (
              <motion.div
                whileHover={{ x: 2 }}
                whileTap={{ scale: 0.98 }}
                className={`nav-item ${isActive ? 'nav-item-active' : 'nav-item-inactive'}`}
              >
                <Icon size={17} className={isActive ? 'text-sky-500' : 'text-gray-400'} />
                <span>{label}</span>
                {isActive && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-sky-400" />
                )}
              </motion.div>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Status footer */}
      <div className="px-5 py-4 border-t border-gray-100">
        <div className="flex items-center gap-2.5 bg-emerald-50 rounded-xl px-3 py-2.5">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <div>
            <p className="text-xs font-semibold text-emerald-700">System Live</p>
            <p className="text-[10px] text-emerald-500">All engines operational</p>
          </div>
        </div>
        <div className="mt-3 flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-full bg-sky-100 flex items-center justify-center text-sky-600 text-xs font-bold">R</div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-gray-700 truncate">Risk Analyst</p>
            <p className="text-[10px] text-gray-400">SOC Level 2</p>
          </div>
        </div>
      </div>
    </aside>
  )
}
