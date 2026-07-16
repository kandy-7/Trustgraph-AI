import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Circle } from 'lucide-react';

const STAGES = [
  { id: 'recon',       label: 'Recon',              sub: 'Credential Stuffing' },
  { id: 'initial',     label: 'Initial Access',     sub: 'VPN + New Device'   },
  { id: 'identity',    label: 'Identity Compromise', sub: 'SIM Swap + Reset'   },
  { id: 'persistence', label: 'Persistence',         sub: 'Session Hijack'     },
  { id: 'exfil',       label: 'Money Extraction',    sub: 'Transfer Attempt'   },
];

const STAGE_ORDER = ['recon', 'initial', 'identity', 'persistence', 'exfil'];

export default function KillChainTracker({ activeStage }) {
  const activeIdx = activeStage ? STAGE_ORDER.indexOf(activeStage.toLowerCase().replace(' ', '_')) : -1;

  return (
    <div className="w-full">
      <div className="mb-3 text-xs font-bold uppercase tracking-widest text-slate-400">
        Attack Kill Chain
      </div>
      <div className="flex items-center gap-0">
        {STAGES.map((stage, i) => {
          const isDone = i < activeIdx;
          const isActive = i === activeIdx;
          const isPending = i > activeIdx;

          return (
            <React.Fragment key={stage.id}>
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.08 }}
                className="flex flex-col items-center gap-1.5 min-w-0"
              >
                <div className={`flex h-8 w-8 items-center justify-center rounded-full border-2 transition-all duration-500 ${
                  isDone ? 'border-rose-500 bg-rose-500/20' :
                  isActive ? 'border-orange-400 bg-orange-500/20 ring-4 ring-orange-500/20' :
                  'border-slate-700 bg-slate-900'
                }`}>
                  {isDone ? (
                    <CheckCircle className="h-4 w-4 text-rose-400" />
                  ) : isActive ? (
                    <motion.div
                      animate={{ scale: [1, 1.3, 1] }}
                      transition={{ repeat: Infinity, duration: 1 }}
                      className="h-3 w-3 rounded-full bg-orange-400"
                    />
                  ) : (
                    <Circle className="h-3.5 w-3.5 text-slate-600" />
                  )}
                </div>
                <div className="text-center">
                  <div className={`text-[10px] font-bold ${
                    isDone ? 'text-rose-400' : isActive ? 'text-orange-300' : 'text-slate-600'
                  }`}>{stage.label}</div>
                  <div className="text-[9px] text-slate-500 hidden sm:block">{stage.sub}</div>
                </div>
              </motion.div>

              {i < STAGES.length - 1 && (
                <motion.div
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: isDone ? 1 : 0.1 }}
                  transition={{ duration: 0.6, delay: i * 0.15 }}
                  className={`h-0.5 flex-1 origin-left transition-colors duration-500 ${
                    isDone ? 'bg-rose-500' : 'bg-slate-800'
                  }`}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
