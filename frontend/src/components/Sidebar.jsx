import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  Shield, LayoutDashboard, AlertTriangle, Users, FileSearch,
  Network, Bot, FileText, Settings, Radar,
} from 'lucide-react';
import { useAppContext } from '../context/AppContext';

const NAV_SECTIONS = [
  {
    title: 'Command Center',
    items: [
      { path: '/overview', label: 'Overview', icon: LayoutDashboard },
      { path: '/threat-intelligence', label: 'Threat Intelligence', icon: AlertTriangle },
      { path: '/network-intelligence', label: 'Network Intelligence', icon: Network },
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
  const { stats } = useAppContext();
  const critical = stats.threatLevel === 'CRITICAL';

  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-slate-200 bg-white/80 backdrop-blur-xl md:flex">
      {/* Brand */}
      <div className="flex h-16 items-center gap-3 border-b border-slate-200 px-5">
        <div className="grid h-9 w-9 place-items-center rounded-xl bg-accent-gradient shadow-glow">
          <Shield className="h-5 w-5 text-white" />
        </div>
        <div className="leading-tight">
          <div className="text-[15px] font-extrabold tracking-tight text-slate-900">
            TrustGraph<span className="gradient-text">AI</span>
          </div>
          <div className="text-[10px] font-medium uppercase tracking-[0.2em] text-slate-400">
            Cyber Defense
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-5">
        {NAV_SECTIONS.map((section) => (
          <div key={section.title}>
            <div className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
              {section.title}
            </div>
            <div className="space-y-1">
              {section.items.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? 'bg-indigo-50 text-indigo-700'
                        : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      {isActive && (
                        <span className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-accent-gradient" />
                      )}
                      <item.icon
                        className={`h-[18px] w-[18px] transition-colors ${
                          isActive ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-600'
                        }`}
                      />
                      {item.label}
                    </>
                  )}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Live status */}
      <div className="border-t border-slate-200 p-3">
        <div className={`flex items-center gap-3 rounded-xl border px-3 py-2.5 ${
          critical ? 'border-rose-200 bg-rose-50' : 'border-emerald-200 bg-emerald-50'
        }`}>
          <Radar className={`h-4 w-4 ${critical ? 'animate-pulse text-rose-500' : 'text-emerald-500'}`} />
          <div className="flex-1 leading-tight">
            <div className="text-[11px] font-semibold text-slate-700">System Status</div>
            <div className={`text-[10px] font-medium ${critical ? 'text-rose-500' : 'text-emerald-600'}`}>
              {critical ? 'Active Threat Detected' : 'All Systems Nominal'}
            </div>
          </div>
          <span className={`h-2 w-2 rounded-full ${critical ? 'animate-pulse-glow bg-rose-500' : 'bg-emerald-500'}`} />
        </div>
        <button className="mt-2 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-800">
          <Settings className="h-[18px] w-[18px] text-slate-400" />
          Settings
        </button>
      </div>
    </aside>
  );
}
