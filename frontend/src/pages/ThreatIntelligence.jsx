import React from 'react';
import { TrendingUp, TrendingDown, Users, Radar, AlertTriangle, Globe } from 'lucide-react';
import { motion } from 'framer-motion';
import PageHeader from '../components/ui/PageHeader';
import StatCard from '../components/ui/StatCard';
import Panel from '../components/ui/Panel';
import SeverityBadge from '../components/ui/SeverityBadge';

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

const ORIGINS = [
  { country: 'Russia', pct: 34, tone: 'bg-rose-500' },
  { country: 'Nigeria', pct: 22, tone: 'bg-orange-500' },
  { country: 'India (VPN exit)', pct: 18, tone: 'bg-amber-400' },
  { country: 'United Kingdom', pct: 15, tone: 'bg-indigo-500' },
  { country: 'Others', pct: 11, tone: 'bg-slate-500' },
];

export default function ThreatIntelligence() {
  const totalAttacks = CATEGORIES.reduce((s, c) => s + c.count, 0);
  const criticalCats = CATEGORIES.filter((c) => c.severity === 'CRITICAL').length;
  const affected = CATEGORIES.reduce((s, c) => s + c.users, 0);
  const maxCount = Math.max(...CATEGORIES.map((c) => c.count));

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Threat Intelligence"
        title="Live Attack Signatures"
        icon={Radar}
        subtitle="Correlated threat categories detected across the customer base"
      />

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <StatCard label="Attacks (24h)" value={totalAttacks.toLocaleString()} icon={AlertTriangle} accent="rose" index={0} hint="all vectors" />
        <StatCard label="Critical Categories" value={criticalCats} icon={Radar} accent="amber" index={1} hint="need review" />
        <StatCard label="Affected Customers" value={affected.toLocaleString()} icon={Users} accent="indigo" index={2} hint="flagged" />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        {/* Category grid */}
        <div className="xl:col-span-2">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {CATEGORIES.map((cat, idx) => {
              const up = cat.trend.startsWith('+');
              return (
                <motion.div
                  key={cat.name}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.04 }}
                >
                  <Panel hover className="p-5">
                    <div className="mb-4 flex items-start justify-between">
                      <h3 className="font-semibold text-slate-900">{cat.name}</h3>
                      <SeverityBadge level={cat.severity} />
                    </div>
                    <div className="flex items-end justify-between">
                      <div>
                        <div className="text-2xl font-bold text-slate-900">{cat.count.toLocaleString()}</div>
                        <div className="mt-0.5 flex items-center gap-1 text-xs text-slate-400">
                          <Users className="h-3 w-3" /> {cat.users.toLocaleString()} users
                        </div>
                      </div>
                      <span className={`inline-flex items-center gap-1 text-sm font-semibold ${up ? 'text-rose-500' : 'text-emerald-600'}`}>
                        {up ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                        {cat.trend}
                      </span>
                    </div>
                    <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                      <div
                        className={`h-full rounded-full ${cat.severity === 'CRITICAL' ? 'bg-rose-500' : cat.severity === 'HIGH' ? 'bg-orange-500' : 'bg-amber-400'}`}
                        style={{ width: `${Math.max(6, (cat.count / maxCount) * 100)}%` }}
                      />
                    </div>
                  </Panel>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Attack origins */}
        <motion.div initial={{ opacity: 0, x: 14 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
          <Panel className="h-full p-6">
            <div className="mb-6 flex items-center gap-2">
              <Globe className="h-5 w-5 text-indigo-500" />
              <h3 className="text-lg font-semibold text-slate-900">Attack Origins</h3>
            </div>
            <div className="space-y-5">
              {ORIGINS.map((o) => (
                <div key={o.country}>
                  <div className="mb-2 flex justify-between text-sm">
                    <span className="text-slate-600">{o.country}</span>
                    <span className="font-mono text-slate-400">{o.pct}%</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${o.pct}%` }}
                      transition={{ duration: 0.9, ease: 'easeOut' }}
                      className={`h-full rounded-full ${o.tone}`}
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 rounded-xl border border-rose-200 bg-rose-50 p-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-rose-600">
                <AlertTriangle className="h-4 w-4" /> Elevated Activity
              </div>
              <p className="mt-1 text-xs leading-relaxed text-slate-500">
                Bot-driven credential stuffing up <span className="font-semibold text-rose-600">120%</span> in the last hour. Adaptive rate-limiting engaged.
              </p>
            </div>
          </Panel>
        </motion.div>
      </div>
    </div>
  );
}
