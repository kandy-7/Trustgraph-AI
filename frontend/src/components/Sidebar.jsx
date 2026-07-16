import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  Shield, LayoutDashboard, AlertTriangle, Users, FileSearch,
  Network, Bot, FileText, Settings, Radar, Globe, Activity,
} from 'lucide-react';
import { useAppContext } from '../context/AppContext';

const NAV_SECTIONS = [
  {
    title: 'Command Center',
    items: [
      { path: '/overview', label: 'Overview', icon: LayoutDashboard },
      { path: '/threat-intelligence', label: 'Threat Intelligence', icon: AlertTriangle },
      { path: '/network-intelligence', label: 'Network & Globe', icon: Globe },
    ],
  },
  {
    title: 'Investigate',
    items: [
      { path: '/customer-360', label: 'Customer 360', icon: Users },
      { path: '/investigations', label: 'Investigations', icon: FileSearch },
      { path: '/soc-copilot', label: 'SOC Copilot', icon: Bot },
      { path: '/reports', label: 'Reports', icon: FileText },
    ],
  },
];

export default function Sidebar() {
  const { stats, wsConnected, logout } = useAppContext();
  const critical = stats.threatLevel === 'CRITICAL';

  return (
    <aside className="hidden w-60 shrink-0 flex-col border-r border-slate-800 bg-slate-950 md:flex">
      {/* Brand */}
      <div className="flex h-16 items-center gap-3 border-b border-slate-800 px-4">
        <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-glow">
          <Shield className="h-5 w-5 text-white" />
        </div>
        <div className="leading-tight">
          <div className="text-[15px] font-extrabold tracking-tight text-slate-100">
            TrustGraph<span className="gradient-text">AI</span>
          </div>
          <div className="text-[10px] font-medium uppercase tracking-[0.2em] text-slate-500">
            Cyber Defense
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-5 overflow-y-auto px-3 py-4">
        {NAV_SECTIONS.map((section) => (
          <div key={section.title}>
            <div className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-600">
              {section.title}
            </div>
            <div className="space-y-0.5">
              {section.items.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? 'bg-indigo-500/15 text-indigo-400'
                        : 'text-slate-500 hover:bg-slate-800/60 hover:text-slate-200'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      {isActive && (
                        <span className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-gradient-to-b from-indigo-400 to-violet-500" />
                      )}
                      <item.icon className={`h-[18px] w-[18px] transition-colors ${isActive ? 'text-indigo-400' : 'text-slate-600 group-hover:text-slate-400'}`} />
                      {item.label}
                    </>
                  )}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* System status */}
      <div className="border-t border-slate-800 p-3 space-y-1.5">
        <div className={`flex items-center gap-3 rounded-xl border px-3 py-2.5 ${
          critical ? 'border-rose-500/30 bg-rose-500/10' : 'border-slate-800 bg-slate-900/50'
        }`}>
          <Radar className={`h-4 w-4 ${critical ? 'animate-pulse text-rose-400' : 'text-emerald-500'}`} />
          <div className="flex-1 leading-tight">
            <div className="text-[11px] font-semibold text-slate-300">System Status</div>
            <div className={`text-[10px] font-medium ${critical ? 'text-rose-400' : 'text-emerald-500'}`}>
              {critical ? 'Active Threat Detected' : 'All Systems Nominal'}
            </div>
          </div>
          <span className={`h-2 w-2 rounded-full ${critical ? 'animate-pulse bg-rose-500' : 'bg-emerald-500'}`} />
        </div>
        <div className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs ${
          wsConnected ? 'text-emerald-500' : 'text-slate-600'
        }`}>
          <Activity className="h-3.5 w-3.5" />
          {wsConnected ? 'WebSocket Connected' : 'WebSocket Offline (Demo)'}
        </div>
        <button
          onClick={logout}
          className="flex w-full items-center gap-2.5 rounded-xl border border-rose-500/20 bg-rose-500/5 px-3 py-2 text-xs font-semibold text-rose-400 transition-all hover:bg-rose-500/10"
        >
          <span>🚪</span>
          Sign Out
        </button>
      </div>
    </aside>
  );
}
