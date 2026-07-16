import React from 'react';
import { Shield, TrendingUp, AlertTriangle, Users } from 'lucide-react';
import { motion } from 'framer-motion';

const CATEGORIES = [
  { name: 'Account Takeover', count: 124, severity: 'CRITICAL', trend: '+12%', users: 89 },
  { name: 'Credential Stuffing', count: 850, severity: 'HIGH', trend: '+45%', users: 412 },
  { name: 'SIM Swap', count: 42, severity: 'CRITICAL', trend: '-5%', users: 42 },
  { name: 'Money Laundering', count: 15, severity: 'HIGH', trend: '+2%', users: 68 },
  { name: 'Bot Activity', count: 4200, severity: 'MEDIUM', trend: '+120%', users: 1250 },
  { name: 'Card Fraud', count: 310, severity: 'HIGH', trend: '-18%', users: 295 },
  { name: 'Insider Threat', count: 2, severity: 'CRITICAL', trend: '0%', users: 2 },
  { name: 'UPI Fraud', count: 890, severity: 'HIGH', trend: '+15%', users: 810 },
];

export default function ThreatIntelligence() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white tracking-tight">Threat Intelligence</h1>
        <div className="text-sm text-slate-400">Live Attack Signatures</div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {CATEGORIES.map((cat, idx) => (
          <motion.div 
            key={cat.name}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.05 }}
            className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition-colors"
          >
            <div className="flex justify-between items-start mb-4">
              <h3 className="font-semibold text-white">{cat.name}</h3>
              <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${
                cat.severity === 'CRITICAL' ? 'bg-red-950 text-red-400' :
                cat.severity === 'HIGH' ? 'bg-orange-950 text-orange-400' :
                'bg-yellow-950 text-yellow-400'
              }`}>
                {cat.severity}
              </span>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-xs text-slate-500 mb-1 flex items-center"><Shield className="w-3 h-3 mr-1"/> Count</div>
                <div className="text-lg text-white font-medium">{cat.count.toLocaleString()}</div>
              </div>
              <div>
                <div className="text-xs text-slate-500 mb-1 flex items-center"><TrendingUp className="w-3 h-3 mr-1"/> Trend</div>
                <div className={`text-lg font-medium ${cat.trend.startsWith('+') ? 'text-red-400' : 'text-emerald-400'}`}>
                  {cat.trend}
                </div>
              </div>
              <div className="col-span-2 pt-3 border-t border-slate-800">
                <div className="text-xs text-slate-500 mb-1 flex items-center"><Users className="w-3 h-3 mr-1"/> Affected Customers</div>
                <div className="text-sm text-white font-medium">{cat.users.toLocaleString()} users</div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
