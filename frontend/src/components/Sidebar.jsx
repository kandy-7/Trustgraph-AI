import React from 'react';
import { NavLink } from 'react-router-dom';
import { Shield, LayoutDashboard, AlertTriangle, Users, FileSearch, Network, Bot, FileText, Settings } from 'lucide-react';

const NAV_ITEMS = [
  { path: '/overview', label: 'Overview', icon: LayoutDashboard },
  { path: '/threat-intelligence', label: 'Threat Intelligence', icon: AlertTriangle },
  { path: '/customer-360', label: 'Customer 360', icon: Users },
  { path: '/investigations', label: 'Investigations', icon: FileSearch },
  { path: '/network-intelligence', label: 'Network Intelligence', icon: Network },
  { path: '/soc-copilot', label: 'SOC Copilot', icon: Bot },
  { path: '/reports', label: 'Reports', icon: FileText },
];

export default function Sidebar() {
  return (
    <div className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col">
      <div className="h-16 flex items-center px-6 border-b border-slate-800">
        <Shield className="w-8 h-8 text-indigo-500 mr-3" />
        <span className="text-xl font-bold text-white tracking-tight">TrustGraph<span className="text-indigo-500">AI</span></span>
      </div>
      
      <div className="p-4 flex-1 overflow-y-auto">
        <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4 px-3">
          SOC Platform
        </div>
        <nav className="space-y-1">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive 
                    ? 'bg-indigo-500/10 text-indigo-400' 
                    : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                }`
              }
            >
              <item.icon className="w-5 h-5 mr-3" />
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="p-4 border-t border-slate-800">
        <button className="flex items-center w-full px-3 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-colors">
          <Settings className="w-5 h-5 mr-3" />
          Settings
        </button>
      </div>
    </div>
  );
}
