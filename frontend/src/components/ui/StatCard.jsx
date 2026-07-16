import React from 'react';
import { motion } from 'framer-motion';

const ACCENTS = {
  indigo: { icon: 'text-indigo-600 bg-indigo-50 border-indigo-100', ring: 'from-indigo-200/50' },
  cyan: { icon: 'text-cyan-600 bg-cyan-50 border-cyan-100', ring: 'from-cyan-200/50' },
  emerald: { icon: 'text-emerald-600 bg-emerald-50 border-emerald-100', ring: 'from-emerald-200/50' },
  amber: { icon: 'text-amber-600 bg-amber-50 border-amber-100', ring: 'from-amber-200/50' },
  rose: { icon: 'text-rose-600 bg-rose-50 border-rose-100', ring: 'from-rose-200/50' },
  violet: { icon: 'text-violet-600 bg-violet-50 border-violet-100', ring: 'from-violet-200/50' },
};

/**
 * KPI tile. `alert` puts it into a pulsing red critical state.
 */
export default function StatCard({ label, value, icon: Icon, accent = 'indigo', hint, trend, alert = false, index = 0 }) {
  const a = ACCENTS[accent] || ACCENTS.indigo;

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.4 }}
      className={`panel panel-top panel-hover group overflow-hidden p-5 ${
        alert ? 'border-rose-300 shadow-glow-red' : ''
      }`}
    >
      {/* corner glow */}
      <div className={`pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-gradient-to-br ${a.ring} to-transparent blur-2xl`} />

      <div className="relative flex items-start justify-between">
        <div className="min-w-0">
          <p className="eyebrow">{label}</p>
          <p className={`mt-2 truncate text-3xl font-bold tracking-tight ${alert ? 'animate-pulse text-rose-600' : 'text-slate-900'}`}>
            {value}
          </p>
          {(hint || trend) && (
            <div className="mt-2 flex items-center gap-2 text-xs">
              {trend && (
                <span className={trend.startsWith('-') ? 'font-semibold text-emerald-600' : 'font-semibold text-rose-500'}>
                  {trend}
                </span>
              )}
              {hint && <span className="text-slate-400">{hint}</span>}
            </div>
          )}
        </div>
        {Icon && (
          <div className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl border ${a.icon} transition-transform duration-300 group-hover:scale-110`}>
            <Icon className="h-5 w-5" />
          </div>
        )}
      </div>
    </motion.div>
  );
}
