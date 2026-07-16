import React, { useState } from 'react';
import { TrendingUp, TrendingDown, Users, Radar, AlertTriangle, Globe, Download } from 'lucide-react';
import { motion } from 'framer-motion';
import MitreBadges from '../components/MitreBadges';

const CATEGORIES = [
  { name: 'Account Takeover',    count: 124,  severity: 'CRITICAL', trend: '+12%', users: 89  },
  { name: 'Credential Stuffing', count: 850,  severity: 'HIGH',     trend: '+45%', users: 412 },
  { name: 'SIM Swap',            count: 42,   severity: 'CRITICAL', trend: '-5%',  users: 42  },
  { name: 'Money Laundering',    count: 15,   severity: 'HIGH',     trend: '+2%',  users: 68  },
  { name: 'Bot Activity',        count: 4200, severity: 'MEDIUM',   trend: '+120%',users: 1250},
  { name: 'Card Fraud',          count: 310,  severity: 'HIGH',     trend: '-18%', users: 295 },
  { name: 'Insider Threat',      count: 2,    severity: 'CRITICAL', trend: '0%',   users: 2   },
  { name: 'UPI Fraud',           count: 890,  severity: 'HIGH',     trend: '+15%', users: 810 },
];

const ORIGINS = [
  { country: '🇷🇺 Russia',           pct: 34, color: 'bg-rose-500'  },
  { country: '🇳🇬 Nigeria',           pct: 22, color: 'bg-orange-500'},
  { country: '🇮🇳 India (VPN)',        pct: 18, color: 'bg-amber-400' },
  { country: '🇬🇧 United Kingdom',    pct: 15, color: 'bg-indigo-500'},
  { country: '🌍 Others',             pct: 11, color: 'bg-slate-600' },
];

const IOC_FEED = [
  { ioc: '185.15.42.100', type: 'IP', severity: 'CRITICAL', category: 'Credential Stuffing', confidence: 97 },
  { ioc: 'malicious-upi@fraud', type: 'UPI', severity: 'HIGH', category: 'UPI Fraud', confidence: 91 },
  { ioc: 'BEN-99282', type: 'Account', severity: 'HIGH', category: 'Money Mule', confidence: 88 },
  { ioc: 'f8a9223f', type: 'Device', severity: 'CRITICAL', category: 'Emulator', confidence: 99 },
];

const SEV_PILL = {
  CRITICAL: 'pill-critical', HIGH: 'pill-high', MEDIUM: 'pill-medium', LOW: 'pill-low',
};

const maxCount = Math.max(...CATEGORIES.map(c => c.count));

export default function ThreatIntelligence() {
  const total = CATEGORIES.reduce((s, c) => s + c.count, 0);
  const critCats = CATEGORIES.filter(c => c.severity === 'CRITICAL').length;
  const affected = CATEGORIES.reduce((s, c) => s + c.users, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="eyebrow">Threat Intelligence Engine</p>
          <h1 className="mt-1 text-2xl font-bold text-slate-100">Live Attack Signatures</h1>
          <p className="mt-0.5 text-sm text-slate-500">Correlated threat categories detected across the customer base</p>
        </div>
        <button className="btn-ghost"><Download className="h-4 w-4" /> Export IoCs</button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Attacks (24h)',      value: total.toLocaleString(), color: 'text-rose-400',    border: 'border-rose-500/20' },
          { label: 'Critical Categories', value: critCats,             color: 'text-amber-400',   border: 'border-amber-500/20' },
          { label: 'Affected Customers', value: affected.toLocaleString(), color: 'text-indigo-400', border: 'border-indigo-500/20' },
        ].map(s => (
          <div key={s.label} className={`panel panel-top border rounded-2xl p-5 ${s.border}`}>
            <div className="text-xs uppercase tracking-wide text-slate-500">{s.label}</div>
            <div className={`mt-1 text-3xl font-black ${s.color}`}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* IoC Feed */}
      <div className="panel panel-top overflow-hidden rounded-2xl">
        <div className="border-b border-slate-800 px-5 py-3 flex items-center gap-2">
          <Radar className="h-4 w-4 text-rose-400 animate-pulse" />
          <h3 className="font-semibold text-slate-100">Active IoC Intelligence Feed</h3>
        </div>
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-800 bg-slate-900/50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              {['Indicator', 'Type', 'Category', 'Confidence', 'Severity'].map(h =>
                <th key={h} className="px-4 py-3 font-medium">{h}</th>)}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {IOC_FEED.map((ioc, i) => (
              <motion.tr key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.08 }}
                className="hover:bg-slate-800/30 cursor-pointer">
                <td className="px-4 py-3 font-mono text-sm text-slate-200">{ioc.ioc}</td>
                <td className="px-4 py-3"><span className="pill pill-neutral">{ioc.type}</span></td>
                <td className="px-4 py-3 text-slate-400">{ioc.category}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-16 overflow-hidden rounded-full bg-slate-800">
                      <div className={`h-full rounded-full ${ioc.confidence > 90 ? 'bg-rose-500' : 'bg-amber-500'}`} style={{ width: `${ioc.confidence}%` }} />
                    </div>
                    <span className="font-mono text-xs text-slate-400">{ioc.confidence}%</span>
                  </div>
                </td>
                <td className="px-4 py-3"><span className={`pill ${SEV_PILL[ioc.severity]}`}>{ioc.severity}</span></td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MITRE ATT&CK */}
      <div className="panel panel-top p-5">
        <MitreBadges threats={['Credential Stuffing', 'Account Takeover', 'SIM Swap', 'Money Extraction', 'Phishing', 'Bot Activity']} />
      </div>

      {/* Category grid + Origins */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {CATEGORIES.map((cat, idx) => {
            const up = cat.trend.startsWith('+');
            return (
              <motion.div key={cat.name} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.04 }}>
                <div className={`panel panel-top p-5 cursor-pointer transition-colors hover:border-slate-700 border ${cat.severity === 'CRITICAL' ? 'border-rose-500/20' : cat.severity === 'HIGH' ? 'border-orange-500/20' : 'border-slate-800'}`}>
                  <div className="mb-4 flex items-start justify-between">
                    <h3 className="font-semibold text-slate-100">{cat.name}</h3>
                    <span className={`pill ${SEV_PILL[cat.severity]}`}>{cat.severity}</span>
                  </div>
                  <div className="flex items-end justify-between">
                    <div>
                      <div className="text-2xl font-bold text-slate-100">{cat.count.toLocaleString()}</div>
                      <div className="mt-0.5 flex items-center gap-1 text-xs text-slate-500">
                        <Users className="h-3 w-3" /> {cat.users.toLocaleString()} customers
                      </div>
                    </div>
                    <span className={`inline-flex items-center gap-1 text-sm font-semibold ${up ? 'text-rose-400' : 'text-emerald-400'}`}>
                      {up ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                      {cat.trend}
                    </span>
                  </div>
                  <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${Math.max(4, (cat.count / maxCount) * 100)}%` }} transition={{ duration: 0.9, ease: 'easeOut' }}
                      className={`h-full rounded-full ${cat.severity === 'CRITICAL' ? 'bg-rose-500' : cat.severity === 'HIGH' ? 'bg-orange-500' : 'bg-amber-400'}`} />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Origins */}
        <motion.div initial={{ opacity: 0, x: 14 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
          <div className="panel panel-top h-full p-6">
            <div className="mb-5 flex items-center gap-2">
              <Globe className="h-5 w-5 text-indigo-400" />
              <h3 className="font-semibold text-slate-100">Attack Origins</h3>
            </div>
            <div className="space-y-4">
              {ORIGINS.map(o => (
                <div key={o.country}>
                  <div className="mb-1.5 flex justify-between text-sm">
                    <span className="text-slate-300">{o.country}</span>
                    <span className="font-mono text-slate-500">{o.pct}%</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-slate-800">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${o.pct}%` }} transition={{ duration: 0.9, ease: 'easeOut' }}
                      className={`h-full rounded-full ${o.color}`} />
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-5 rounded-xl border border-rose-500/20 bg-rose-500/10 p-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-rose-400">
                <AlertTriangle className="h-4 w-4" /> Elevated Activity
              </div>
              <p className="mt-1 text-xs leading-relaxed text-slate-400">
                Bot-driven credential stuffing up <span className="font-semibold text-rose-400">120%</span> in the last hour. Adaptive rate-limiting engaged.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
