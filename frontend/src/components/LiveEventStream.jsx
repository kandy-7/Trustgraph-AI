import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppContext } from '../context/AppContext';

const SEV_STYLES = {
  CRITICAL: 'text-rose-400 bg-rose-500/10 border-rose-500/30',
  HIGH:     'text-orange-400 bg-orange-500/10 border-orange-500/30',
  MEDIUM:   'text-amber-400 bg-amber-500/10 border-amber-500/30',
  LOW:      'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
  BLOCKED:  'text-rose-500 bg-rose-500/20 border-rose-500/50',
};

const TYPE_LABELS = {
  FAILED_LOGIN:    '🔒 Failed Login',
  VPN_LOGIN:       '🌐 VPN Login',
  LOGIN:           '✅ Login',
  DEVICE_CHANGE:   '📱 Device Change',
  SIM_SWAP:        '📡 SIM Swap',
  PASSWORD_RESET:  '🔑 Password Reset',
  BENEFICIARY_ADDED: '👤 New Beneficiary',
  TRANSFER:        '💸 Transfer',
  ALERT:           '🚨 Alert',
  EVENT:           '📋 Event',
};

export default function LiveEventStream() {
  const { liveEvents } = useAppContext();
  const [ticker, setTicker] = useState(0);

  // Update "last updated" clock
  useEffect(() => {
    const id = setInterval(() => setTicker(t => t + 1), 1000);
    return () => clearInterval(id);
  }, []);

  const secondsAgo = ticker; // reset when events change

  return (
    <div className="hidden w-72 shrink-0 flex-col border-l border-slate-800 bg-slate-950 xl:flex">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
          <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Live Events</span>
        </div>
        <span className="text-[10px] text-slate-600">
          {liveEvents.length > 0 ? 'Live' : 'Waiting…'}
        </span>
      </div>

      {/* Stream */}
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1.5">
        <AnimatePresence initial={false}>
          {liveEvents.length === 0 ? (
            <div className="mt-8 text-center text-xs text-slate-600">
              <div className="mb-2 text-2xl">⚡</div>
              Run a simulation to see live events stream here
            </div>
          ) : (
            liveEvents.map((evt, i) => {
              const sev = evt.status === 'BLOCKED' ? 'BLOCKED' : (evt.severity || 'LOW');
              const style = SEV_STYLES[sev] || SEV_STYLES.LOW;
              const label = TYPE_LABELS[evt.type] || evt.type;
              return (
                <motion.div
                  key={`${evt.time}-${i}`}
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.25 }}
                  className={`rounded-lg border px-3 py-2.5 ${style}`}
                >
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="font-mono text-[10px] opacity-60">{evt.time}</span>
                    <span className={`text-[9px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded ${
                      sev === 'BLOCKED' ? 'bg-rose-500 text-white' : 'bg-current/10'
                    }`}>
                      {sev === 'BLOCKED' ? 'BLOCKED' : sev}
                    </span>
                  </div>
                  <div className="text-xs font-semibold">{label}</div>
                  {evt.msg && <div className="text-[10px] opacity-60 mt-0.5 truncate">{evt.msg}</div>}
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>

      {/* Footer stats */}
      <div className="border-t border-slate-800 px-4 py-3 grid grid-cols-2 gap-3">
        <div>
          <div className="text-[10px] text-slate-600 uppercase tracking-wide">Events</div>
          <div className="text-sm font-bold text-slate-300">{liveEvents.length}</div>
        </div>
        <div>
          <div className="text-[10px] text-slate-600 uppercase tracking-wide">Blocked</div>
          <div className="text-sm font-bold text-rose-400">
            {liveEvents.filter(e => e.status === 'BLOCKED' || e.severity === 'CRITICAL').length}
          </div>
        </div>
      </div>
    </div>
  );
}
