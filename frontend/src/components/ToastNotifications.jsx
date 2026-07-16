import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useAppContext } from '../context/AppContext';
import { X, ShieldAlert, ShieldCheck, AlertTriangle, Info } from 'lucide-react';

const ICONS = {
  CRITICAL: ShieldAlert,
  HIGH: AlertTriangle,
  MEDIUM: Info,
  LOW: ShieldCheck,
};

const COLORS = {
  CRITICAL: 'border-rose-500 bg-rose-950 text-rose-200',
  HIGH: 'border-orange-500 bg-orange-950 text-orange-200',
  MEDIUM: 'border-amber-500 bg-amber-950 text-amber-200',
  LOW: 'border-emerald-500 bg-emerald-950 text-emerald-200',
};

const DOT_COLORS = {
  CRITICAL: 'bg-rose-500',
  HIGH: 'bg-orange-500',
  MEDIUM: 'bg-amber-400',
  LOW: 'bg-emerald-500',
};

export default function ToastNotifications() {
  const { toasts, removeToast } = useAppContext();

  return (
    <div className="fixed top-20 right-4 z-[100] flex flex-col gap-2 w-80">
      <AnimatePresence>
        {toasts.map((toast) => {
          const Icon = ICONS[toast.severity] || Info;
          const colorClass = COLORS[toast.severity] || COLORS.LOW;
          const dotColor = DOT_COLORS[toast.severity] || DOT_COLORS.LOW;
          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: 60, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 60, scale: 0.9 }}
              transition={{ type: 'spring', stiffness: 380, damping: 30 }}
              className={`flex items-start gap-3 rounded-xl border px-4 py-3 shadow-2xl backdrop-blur-xl ${colorClass}`}
            >
              <div className="relative mt-0.5">
                <Icon className="h-4 w-4 shrink-0" />
                <span className={`absolute -right-0.5 -top-0.5 h-2 w-2 animate-ping rounded-full ${dotColor} opacity-75`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-bold uppercase tracking-wide opacity-70">{toast.severity}</div>
                <div className="text-sm font-medium mt-0.5 leading-snug">{toast.msg}</div>
              </div>
              <button onClick={() => removeToast(toast.id)} className="opacity-50 hover:opacity-100 transition-opacity">
                <X className="h-3.5 w-3.5" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
