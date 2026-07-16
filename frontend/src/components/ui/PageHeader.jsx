import React from 'react';
import { motion } from 'framer-motion';

export default function PageHeader({ eyebrow, title, subtitle, icon: Icon, actions }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
    >
      <div className="flex items-center gap-4">
        {Icon && (
          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl border border-indigo-500/20 bg-indigo-500/10 text-indigo-400">
            <Icon className="h-6 w-6" />
          </div>
        )}
        <div>
          {eyebrow && <p className="eyebrow mb-1">{eyebrow}</p>}
          <h1 className="text-2xl font-bold tracking-tight text-slate-100 sm:text-[26px]">{title}</h1>
          {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
        </div>
      </div>
      {actions && <div className="flex flex-wrap items-center gap-3">{actions}</div>}
    </motion.div>
  );
}
