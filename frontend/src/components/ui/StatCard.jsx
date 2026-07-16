import React from 'react';
import { motion } from 'framer-motion';

const ACCENTS = {
  indigo:  { icon: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20', glow: 'from-indigo-500/10' },
  cyan:    { icon: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',       glow: 'from-cyan-500/10' },
  emerald: { icon: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20', glow: 'from-emerald-500/10' },
  amber:   { icon: 'text-amber-400 bg-amber-500/10 border-amber-500/20',    glow: 'from-amber-500/10' },
  rose:    { icon: 'text-rose-400 bg-rose-500/10 border-rose-500/20',       glow: 'from-rose-500/10' },
  violet:  { icon: 'text-violet-400 bg-violet-500/10 border-violet-500/20', glow: 'from-violet-500/10' },
  orange:  { icon: 'text-orange-400 bg-orange-500/10 border-orange-500/20', glow: 'from-orange-500/10' },
};

export default function StatCard({ label, value, icon: Icon, accent = 'indigo', hint, trend, alert = false, index = 0 }) {
  const a = ACCENTS[accent] || ACCENTS.indigo;
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.4 }}
      className={`panel panel-top group overflow-hidden p-5 transition-all hover:border-slate-700 ${
        alert ? 'border-rose-500/40 shadow-glow-red' : ''
      }`}
    >
      <div className={`pointer-events-none absolute -right-8 -top-8 h-20 w-20 rounded-full bg-gradient-to-br ${a.glow} to-transparent blur-xl`} />
      <div className="relative flex items-start justify-between">
        <div className="min-w-0">
          <p className="eyebrow">{label}</p>
          <p className={`mt-2 truncate text-3xl font-black tracking-tight ${
            alert ? 'animate-pulse text-rose-400' : 'text-slate-100'
          }`}>{value}</p>
          {(hint || trend) && (
            <div className="mt-2 flex items-center gap-2 text-xs">
              {trend && <span className={trend.startsWith('-') ? 'font-semibold text-emerald-400' : 'font-semibold text-rose-400'}>{trend}</span>}
              {hint && <span className="text-slate-500">{hint}</span>}
            </div>
          )}
        </div>
        {Icon && (
          <div className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl border ${a.icon} transition-transform duration-300 group-hover:scale-110`}>
            <Icon className="h-5 w-5" />
          </div>
        )}
      </div>
    </motion.div>
  );
}
