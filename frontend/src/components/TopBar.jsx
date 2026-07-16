import React, { useState, useEffect } from 'react';
import { Search, Bell, Clock, ShieldCheck, ShieldAlert } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

export default function TopBar() {
  const { stats } = useAppContext();
  const [time, setTime] = useState(new Date());
  const critical = stats.threatLevel === 'CRITICAL';

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="flex h-16 items-center justify-between gap-4 border-b border-slate-200 bg-white/70 px-4 backdrop-blur-xl md:px-6">
      {/* Global Search */}
      <div className="min-w-0 flex-1 max-w-xl">
        <div className="group relative">
          <Search className="absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-indigo-500" />
          <input
            type="text"
            placeholder="Search user, account, device, IP, case…"
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm text-slate-700 placeholder:text-slate-400 transition-all focus:border-indigo-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100"
          />
          <kbd className="pointer-events-none absolute right-3 top-1/2 hidden -translate-y-1/2 rounded border border-slate-200 bg-white px-1.5 py-0.5 text-[10px] font-medium text-slate-400 lg:block">
            ⌘K
          </kbd>
        </div>
      </div>

      <div className="flex items-center gap-3 md:gap-5">
        {/* Threat level pill */}
        <div
          className={`hidden items-center gap-2 rounded-full border px-3 py-1.5 sm:flex ${
            critical
              ? 'border-rose-200 bg-rose-50 text-rose-600'
              : 'border-emerald-200 bg-emerald-50 text-emerald-600'
          }`}
        >
          {critical ? (
            <ShieldAlert className="h-4 w-4 animate-pulse" />
          ) : (
            <ShieldCheck className="h-4 w-4" />
          )}
          <span className="text-xs font-bold uppercase tracking-wide">
            Threat: {stats.threatLevel}
          </span>
        </div>

        {/* Clock */}
        <div className="hidden items-center gap-2 font-mono text-sm text-slate-500 md:flex">
          <Clock className="h-4 w-4 text-slate-400" />
          {time.toLocaleTimeString([], { hour12: false })}
        </div>

        {/* Notifications */}
        <button className="relative rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800">
          <Bell className="h-5 w-5" />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 animate-pulse rounded-full bg-rose-500 ring-2 ring-white" />
        </button>

        {/* Analyst Profile */}
        <div className="flex items-center gap-3 border-l border-slate-200 pl-3 md:pl-5">
          <div className="hidden flex-col items-end leading-tight sm:flex">
            <span className="text-sm font-semibold text-slate-800">J. Doe</span>
            <span className="text-[11px] text-slate-400">SOC Analyst · Tier 2</span>
          </div>
          <div className="grid h-9 w-9 place-items-center rounded-full bg-accent-gradient text-sm font-bold text-white shadow-glow">
            JD
          </div>
        </div>
      </div>
    </header>
  );
}
