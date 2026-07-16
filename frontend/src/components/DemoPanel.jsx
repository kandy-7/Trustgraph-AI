import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { Play, Zap, X, ShieldCheck, KeyRound, Smartphone, UserX, Banknote, QrCode, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const SCENARIOS = [
  { name: 'Normal Customer',      icon: ShieldCheck, tone: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/30', desc: 'Baseline healthy activity' },
  { name: 'Account Takeover',     icon: UserX,       tone: 'text-rose-400',    bg: 'bg-rose-500/10 border-rose-500/30',    desc: 'Full ATO kill-chain', hot: true },
  { name: 'SIM Swap',             icon: Smartphone,  tone: 'text-orange-400',  bg: 'bg-orange-500/10 border-orange-500/30',desc: 'SIM replacement attack' },
  { name: 'Credential Stuffing',  icon: KeyRound,    tone: 'text-amber-400',   bg: 'bg-amber-500/10 border-amber-500/30',  desc: 'Bulk login attempts' },
  { name: 'Money Laundering',     icon: Banknote,    tone: 'text-violet-400',  bg: 'bg-violet-500/10 border-violet-500/30',desc: 'Layering via mules' },
  { name: 'UPI Fraud',            icon: QrCode,      tone: 'text-cyan-400',    bg: 'bg-cyan-500/10 border-cyan-500/30',    desc: 'Malicious UPI handle' },
];

export default function DemoPanel() {
  const { runSimulation } = useAppContext();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-6 z-50" style={{ right: '19rem' }}>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 320, damping: 26 }}
            className="absolute bottom-16 right-0 w-72 overflow-hidden rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-slate-800 bg-slate-950/50 px-4 py-3">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-indigo-400" />
                <span className="text-sm font-semibold text-slate-200">Attack Simulator</span>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-slate-500 hover:text-slate-300">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-2 max-h-[70vh] overflow-y-auto space-y-1">
              {SCENARIOS.map(s => (
                <button
                  key={s.name}
                  onClick={() => { runSimulation(s.name); setIsOpen(false); }}
                  className={`group flex w-full items-center gap-3 rounded-xl border px-3 py-3 text-left transition-all hover:brightness-110 ${s.bg}`}
                >
                  <div className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg border ${s.bg}`}>
                    <s.icon className={`h-[18px] w-[18px] ${s.tone}`} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 text-sm font-semibold text-slate-200">
                      {s.name}
                      {s.hot && <span className="rounded bg-rose-500/30 px-1 py-px text-[9px] font-bold uppercase text-rose-400">LIVE</span>}
                    </div>
                    <div className="text-[11px] text-slate-500">{s.desc}</div>
                  </div>
                  <Play className={`h-3.5 w-3.5 shrink-0 ${s.tone} opacity-60 group-hover:opacity-100`} fill="currentColor" />
                </button>
              ))}
            </div>

            <div className="border-t border-slate-800 px-4 py-2 text-[10px] text-slate-600">
              Simulations trigger real backend pipeline when online
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.94 }}
        onClick={() => setIsOpen(v => !v)}
        className="grid h-14 w-14 place-items-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-glow focus:outline-none"
        title="Attack Simulator — Demo Mode"
      >
        {isOpen ? <X className="h-6 w-6" /> : <Zap className="h-6 w-6" />}
      </motion.button>
    </div>
  );
}
