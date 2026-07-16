import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { Play, Zap, X, ShieldCheck, KeyRound, Smartphone, UserX, Banknote, QrCode } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const SCENARIOS = [
  { name: 'Normal Customer', icon: ShieldCheck, tone: 'text-emerald-500', desc: 'Baseline healthy activity' },
  { name: 'Account Takeover', icon: UserX, tone: 'text-rose-500', desc: 'Full ATO kill-chain', hot: true },
  { name: 'SIM Swap', icon: Smartphone, tone: 'text-orange-500', desc: 'SIM replacement attack' },
  { name: 'Credential Stuffing', icon: KeyRound, tone: 'text-amber-500', desc: 'Bulk login attempts' },
  { name: 'Money Laundering', icon: Banknote, tone: 'text-violet-500', desc: 'Layering via mules' },
  { name: 'UPI Fraud', icon: QrCode, tone: 'text-cyan-500', desc: 'Malicious UPI handle' },
];

export default function DemoPanel() {
  const { runSimulation } = useAppContext();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-6 right-6 z-50 lg:right-[22rem]">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 320, damping: 26 }}
            className="absolute bottom-16 right-0 w-72 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-4 py-3">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-indigo-500" />
                <h4 className="text-sm font-semibold text-slate-800">Attack Simulator</h4>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="max-h-[60vh] space-y-1.5 overflow-y-auto p-2">
              {SCENARIOS.map((s) => (
                <button
                  key={s.name}
                  onClick={() => {
                    runSimulation(s.name);
                    setIsOpen(false);
                  }}
                  className="group flex w-full items-center gap-3 rounded-xl border border-transparent px-3 py-2.5 text-left transition-all hover:border-slate-200 hover:bg-slate-50"
                >
                  <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-slate-200 bg-slate-50">
                    <s.icon className={`h-[18px] w-[18px] ${s.tone}`} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 text-sm font-medium text-slate-800">
                      {s.name}
                      {s.hot && (
                        <span className="rounded bg-rose-100 px-1 py-px text-[9px] font-bold uppercase text-rose-600">
                          Demo
                        </span>
                      )}
                    </div>
                    <div className="truncate text-[11px] text-slate-400">{s.desc}</div>
                  </div>
                  <Play className="h-3.5 w-3.5 shrink-0 text-slate-300 transition-colors group-hover:text-indigo-500" fill="currentColor" />
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.94 }}
        onClick={() => setIsOpen((v) => !v)}
        className="grid h-14 w-14 place-items-center rounded-full bg-accent-gradient text-white shadow-glow focus:outline-none focus:ring-2 focus:ring-brand-primary/50"
        title="Attack Simulator"
      >
        {isOpen ? <X className="h-6 w-6" /> : <Zap className="h-6 w-6" />}
      </motion.button>
    </div>
  );
}
