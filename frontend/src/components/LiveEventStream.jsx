import React from 'react';
import { useAppContext } from '../context/AppContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, ShieldAlert, ShieldCheck, Radio } from 'lucide-react';

const SEV_STYLES = {
  CRITICAL: { wrap: 'border-rose-200 bg-rose-50', bar: 'bg-rose-500', text: 'text-rose-600', Icon: ShieldAlert },
  HIGH: { wrap: 'border-orange-200 bg-orange-50', bar: 'bg-orange-500', text: 'text-orange-600', Icon: ShieldAlert },
  MEDIUM: { wrap: 'border-amber-200 bg-amber-50', bar: 'bg-amber-400', text: 'text-amber-600', Icon: ShieldCheck },
  LOW: { wrap: 'border-slate-200 bg-slate-50', bar: 'bg-slate-400', text: 'text-slate-500', Icon: ShieldCheck },
};

export default function LiveEventStream() {
  const { liveEvents } = useAppContext();

  return (
    <aside className="hidden w-80 shrink-0 flex-col border-l border-slate-200 bg-white/70 backdrop-blur-xl lg:flex">
      {/* Header with scan-line */}
      <div className="relative flex h-16 items-center justify-between overflow-hidden border-b border-slate-200 px-4">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-8 animate-scan bg-gradient-to-b from-cyan-200/40 to-transparent" />
        <div className="relative flex items-center gap-2">
          <Activity className="h-[18px] w-[18px] animate-pulse text-indigo-500" />
          <h3 className="text-sm font-semibold text-slate-800">Live Event Stream</h3>
        </div>
        <span className="relative inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-600">
          <Radio className="h-3 w-3 animate-pulse" /> Live
        </span>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        <AnimatePresence initial={false}>
          {liveEvents.map((event, i) => {
            const s = SEV_STYLES[event.severity] || SEV_STYLES.LOW;
            return (
              <motion.div
                key={`${event.time}-${event.type}-${i}`}
                layout
                initial={{ opacity: 0, y: -16, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className={`relative overflow-hidden rounded-xl border p-3 pl-4 ${s.wrap}`}
              >
                <div className={`absolute inset-y-0 left-0 w-1 ${s.bar}`} />

                <div className="mb-1 flex items-center justify-between">
                  <span className="font-mono text-[11px] text-slate-400">{event.time}</span>
                  {event.status === 'BLOCKED' && (
                    <span className="rounded bg-rose-100 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-rose-600">
                      Blocked
                    </span>
                  )}
                </div>

                <div className="text-sm font-semibold text-slate-800">
                  {event.type.replace(/_/g, ' ')}
                </div>
                <div className={`mt-1 flex items-center gap-1 text-xs ${s.text}`}>
                  <s.Icon className="h-3 w-3" />
                  {event.msg}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {liveEvents.length === 0 && (
          <div className="flex flex-col items-center justify-center pt-20 text-center">
            <div className="mb-3 grid h-12 w-12 place-items-center rounded-full border border-slate-200 bg-slate-50">
              <Radio className="h-5 w-5 text-slate-400" />
            </div>
            <p className="text-sm text-slate-500">Monitoring telemetry…</p>
            <p className="mt-1 text-xs text-slate-400">Run a simulation to see live events</p>
          </div>
        )}
      </div>
    </aside>
  );
}
