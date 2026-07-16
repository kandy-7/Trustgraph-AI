import React from 'react';
import { useAppContext } from '../context/AppContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, ShieldAlert, ShieldCheck } from 'lucide-react';

export default function LiveEventStream() {
  const { liveEvents } = useAppContext();

  return (
    <div className="w-80 bg-slate-900 border-l border-slate-800 flex flex-col">
      <div className="p-4 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center">
          <Activity className="w-5 h-5 text-indigo-400 mr-2 animate-pulse" />
          <h3 className="text-sm font-semibold text-white">Live Event Stream</h3>
        </div>
        <span className="text-xs font-medium text-slate-500 bg-slate-800 px-2 py-1 rounded-full">
          Monitoring
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <AnimatePresence initial={false}>
          {liveEvents.map((event, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.3 }}
              className={`p-3 rounded-lg border relative overflow-hidden ${
                event.severity === 'CRITICAL'
                  ? 'bg-red-950/20 border-red-900/50'
                  : event.severity === 'HIGH'
                  ? 'bg-orange-950/20 border-orange-900/50'
                  : 'bg-slate-800/50 border-slate-700/50'
              }`}
            >
              {/* Left accent line */}
              <div className={`absolute left-0 top-0 bottom-0 w-1 ${
                event.severity === 'CRITICAL' ? 'bg-red-500' :
                event.severity === 'HIGH' ? 'bg-orange-500' :
                'bg-slate-500'
              }`} />

              <div className="flex justify-between items-start ml-2 mb-1">
                <span className="text-xs text-slate-400 font-mono">{event.time}</span>
                {event.status === 'BLOCKED' && (
                  <span className="text-[10px] font-bold text-red-400 bg-red-950 px-1.5 py-0.5 rounded uppercase tracking-wider">
                    Blocked
                  </span>
                )}
              </div>
              
              <div className="ml-2">
                <div className="text-sm font-medium text-white">{event.type}</div>
                <div className={`text-xs mt-1 flex items-center ${
                  event.severity === 'CRITICAL' ? 'text-red-400' : 'text-slate-400'
                }`}>
                  {event.severity === 'CRITICAL' ? (
                    <ShieldAlert className="w-3 h-3 mr-1" />
                  ) : (
                    <ShieldCheck className="w-3 h-3 mr-1" />
                  )}
                  {event.msg}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {liveEvents.length === 0 && (
          <div className="text-center text-slate-500 text-sm mt-10">
            Waiting for events...
          </div>
        )}
      </div>
    </div>
  );
}
