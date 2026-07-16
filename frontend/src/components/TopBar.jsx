import React, { useState, useEffect, useRef } from 'react';
import { Search, Bell, Clock, ShieldCheck, ShieldAlert, X } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { motion, AnimatePresence } from 'framer-motion';

const SEARCH_SHORTCUTS = [
  { label: 'USR-38362 · John Doe', tag: 'Customer', color: 'text-indigo-400' },
  { label: 'CASE-82941 · Account Takeover', tag: 'Case', color: 'text-rose-400' },
  { label: '185.15.42.100 · Russia', tag: 'IP', color: 'text-amber-400' },
  { label: 'DEV-FRD-001 · Android Emulator', tag: 'Device', color: 'text-orange-400' },
];

export default function TopBar() {
  const { stats } = useAppContext();
  const [time, setTime] = useState(new Date());
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState('');
  const inputRef = useRef(null);
  const critical = stats.threatLevel === 'CRITICAL';

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  // Ctrl+K global shortcut
  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(v => !v);
      }
      if (e.key === 'Escape') setSearchOpen(false);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  useEffect(() => {
    if (searchOpen) setTimeout(() => inputRef.current?.focus(), 50);
  }, [searchOpen]);

  const filtered = SEARCH_SHORTCUTS.filter(s =>
    !query || s.label.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <>
      <header className="flex h-16 items-center justify-between gap-4 border-b border-slate-800 bg-slate-950/80 px-4 backdrop-blur-xl md:px-5">
        {/* Search */}
        <div className="min-w-0 flex-1 max-w-lg">
          <button
            onClick={() => setSearchOpen(true)}
            className="group flex w-full items-center gap-3 rounded-xl border border-slate-800 bg-slate-900/60 py-2.5 pl-3 pr-4 text-sm text-slate-500 transition-all hover:border-slate-700 hover:bg-slate-800/60"
          >
            <Search className="h-4 w-4 text-slate-600" />
            <span className="flex-1 text-left">Search user, case, IP, device…</span>
            <kbd className="rounded border border-slate-700 bg-slate-800 px-1.5 py-0.5 text-[10px] font-medium text-slate-500">⌘K</kbd>
          </button>
        </div>

        <div className="flex items-center gap-3">
          {/* Threat level pill */}
          <div className={`hidden items-center gap-2 rounded-full border px-3 py-1.5 sm:flex ${
            critical ? 'border-rose-500/40 bg-rose-500/10 text-rose-400' : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
          }`}>
            {critical ? <ShieldAlert className="h-4 w-4 animate-pulse" /> : <ShieldCheck className="h-4 w-4" />}
            <span className="text-xs font-bold uppercase tracking-wide">
              {stats.threatLevel}
            </span>
          </div>

          {/* Clock */}
          <div className="hidden items-center gap-2 font-mono text-sm text-slate-500 md:flex">
            <Clock className="h-4 w-4 text-slate-600" />
            {time.toLocaleTimeString([], { hour12: false })}
          </div>

          {/* Notifications */}
          <button className="relative rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-800 hover:text-slate-200">
            <Bell className="h-5 w-5" />
            <span className="absolute right-1.5 top-1.5 h-2 w-2 animate-pulse rounded-full bg-rose-500 ring-2 ring-slate-950" />
          </button>

          {/* Analyst */}
          <div className="flex items-center gap-2.5 border-l border-slate-800 pl-3">
            <div className="hidden flex-col items-end leading-tight sm:flex">
              <span className="text-sm font-semibold text-slate-200">J. Doe</span>
              <span className="text-[11px] text-slate-500">SOC Analyst · Tier 2</span>
            </div>
            <div className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 text-sm font-bold text-white shadow-glow">
              JD
            </div>
          </div>
        </div>
      </header>

      {/* Global Search Modal */}
      <AnimatePresence>
        {searchOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setSearchOpen(false)}
              className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm" />
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: -20 }}
              transition={{ type: 'spring', stiffness: 380, damping: 30 }}
              className="fixed left-1/2 top-24 z-50 w-full max-w-xl -translate-x-1/2 overflow-hidden rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl"
            >
              <div className="flex items-center gap-3 border-b border-slate-800 px-4 py-3">
                <Search className="h-4 w-4 text-slate-400 shrink-0" />
                <input ref={inputRef} value={query} onChange={e => setQuery(e.target.value)}
                  placeholder="Search users, cases, IPs, devices, transactions…"
                  className="flex-1 bg-transparent text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none" />
                <button onClick={() => setSearchOpen(false)} className="text-slate-500 hover:text-slate-300">
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="max-h-72 overflow-y-auto p-2">
                {filtered.map(s => (
                  <button key={s.label} onClick={() => setSearchOpen(false)}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-slate-800">
                    <span className={`text-[10px] font-bold uppercase tracking-wide rounded px-1.5 py-0.5 bg-current/10 ${s.color}`}>{s.tag}</span>
                    <span className="text-sm text-slate-300">{s.label}</span>
                  </button>
                ))}
              </div>
              <div className="border-t border-slate-800 px-4 py-2 text-xs text-slate-600">
                Press <kbd className="rounded border border-slate-700 bg-slate-800 px-1 py-0.5 text-[10px]">↵</kbd> to select · <kbd className="rounded border border-slate-700 bg-slate-800 px-1 py-0.5 text-[10px]">Esc</kbd> to close
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
