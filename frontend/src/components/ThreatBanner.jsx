import React from 'react';
import { motion } from 'framer-motion';
import { Shield, ShieldAlert, ShieldCheck, Zap } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

const LEVELS = [
  { id: 'LOW',      label: 'System Secure',        icon: ShieldCheck,  bg: 'from-emerald-600/20 to-emerald-500/5', border: 'border-emerald-500/30', text: 'text-emerald-400', dot: 'bg-emerald-500', pulse: false },
  { id: 'ELEVATED', label: 'Elevated Activity',     icon: Zap,          bg: 'from-amber-600/20 to-amber-500/5',     border: 'border-amber-500/30',   text: 'text-amber-400',   dot: 'bg-amber-500',   pulse: true  },
  { id: 'HIGH',     label: 'Active Threat',          icon: ShieldAlert,  bg: 'from-orange-600/20 to-orange-500/5',   border: 'border-orange-500/30',  text: 'text-orange-400',  dot: 'bg-orange-500',  pulse: true  },
  { id: 'CRITICAL', label: 'CRITICAL INCIDENT',      icon: ShieldAlert,  bg: 'from-rose-700/30 to-rose-500/5',       border: 'border-rose-500/40',    text: 'text-rose-400',    dot: 'bg-rose-500',    pulse: true  },
];

export default function ThreatBanner() {
  const { stats } = useAppContext();
  const level = LEVELS.find(l => l.id === stats.threatLevel) || LEVELS[0];
  const Icon = level.icon;
  const isCritical = level.id === 'CRITICAL';

  return (
    <motion.div
      key={level.id}
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`relative flex items-center gap-3 border-b ${level.border} bg-gradient-to-r ${level.bg} px-4 py-2.5`}
    >
      {isCritical && (
        <motion.div
          animate={{ opacity: [0.15, 0.35, 0.15] }}
          transition={{ repeat: Infinity, duration: 1.4 }}
          className="pointer-events-none absolute inset-0 bg-rose-500/10"
        />
      )}
      <div className="relative flex items-center gap-2">
        <span className={`h-2 w-2 rounded-full ${level.dot} ${level.pulse ? 'animate-pulse' : ''}`} />
        <Icon className={`h-4 w-4 ${level.text}`} />
        <span className={`text-xs font-bold uppercase tracking-widest ${level.text}`}>
          {level.id}
        </span>
        <span className="text-xs text-slate-400">—</span>
        <span className="text-xs text-slate-400">{level.label}</span>
      </div>

      <div className="ml-auto flex items-center gap-4 text-xs text-slate-500">
        <span className="hidden sm:block">Prevented: <span className="font-semibold text-slate-300">₹{stats.preventedLoss}L</span></span>
        <span className="hidden md:block">Events: <span className="font-semibold text-slate-300">{stats.todayEvents?.toLocaleString()}</span></span>
        <span>Critical: <span className={`font-semibold ${isCritical ? 'text-rose-400' : 'text-slate-300'}`}>{stats.criticalIncidents}</span></span>
      </div>
    </motion.div>
  );
}
