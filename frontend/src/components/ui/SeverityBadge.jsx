import React from 'react';

const LEVELS = {
  CRITICAL: 'bg-rose-500/20 text-rose-400 border border-rose-500/30',
  HIGH:     'bg-orange-500/20 text-orange-400 border border-orange-500/30',
  MEDIUM:   'bg-amber-500/20 text-amber-400 border border-amber-500/30',
  LOW:      'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
  INFO:     'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30',
};

export default function SeverityBadge({ level = 'LOW' }) {
  const cls = LEVELS[level?.toUpperCase()] || LEVELS.LOW;
  return (
    <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide ${cls}`}>
      {level}
    </span>
  );
}
