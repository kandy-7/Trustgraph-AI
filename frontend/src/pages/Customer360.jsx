import React, { useEffect, useState } from 'react';
import { getCustomerProfile } from '../services/customerService';
import { getCustomerTimeline, getCustomerAlerts } from '../services/api';
import { ShieldAlert, MapPin, Smartphone, CreditCard, Activity, Download, Fingerprint, Clock, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';

const RadialGauge = ({ label, value, color, delay = 0 }) => {
  const radius = 40, circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;
  const isRisk = value > 70;
  return (
    <div className="flex flex-col items-center">
      <div className={`relative grid h-28 w-28 place-items-center rounded-full ${isRisk ? 'ring-2 ring-rose-500/20' : ''}`}>
        <svg className="h-full w-full -rotate-90" viewBox="0 0 96 96">
          <circle cx="48" cy="48" r={radius} stroke="#1e293b" strokeWidth="8" fill="none" />
          <motion.circle cx="48" cy="48" r={radius} stroke={color} strokeWidth="8" fill="none" strokeLinecap="round"
            strokeDasharray={circumference} initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }} transition={{ duration: 1.4, ease: 'easeOut', delay }} />
        </svg>
        <div className="absolute text-center">
          <span className="text-2xl font-black text-slate-100">{value}</span>
          <span className="text-xs text-slate-500">%</span>
        </div>
      </div>
      <span className="mt-2 text-sm font-medium text-slate-400">{label}</span>
    </div>
  );
};

export default function Customer360() {
  const [profile, setProfile] = useState(null);
  const [timeline, setTimeline] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [tab, setTab] = useState('profile');

  useEffect(() => {
    getCustomerProfile().then(setProfile);
    getCustomerTimeline('USR-38362').then(data => { if (data?.length) setTimeline(data); }).catch(() => {});
    getCustomerAlerts('USR-38362').then(data => { if (data?.length) setAlerts(data); }).catch(() => {});
  }, []);

  if (!profile) return (
    <div className="space-y-4">
      {[1,2,3].map(i => <div key={i} className="skeleton h-24 w-full" />)}
    </div>
  );

  const gauges = [
    { label: 'Overall Risk',    value: profile.overallRisk,   color: '#f43f5e', delay: 0 },
    { label: 'Identity Risk',   value: profile.identityRisk,  color: '#fb923c', delay: 0.1 },
    { label: 'Behaviour Risk',  value: profile.behaviourRisk, color: '#f59e0b', delay: 0.2 },
    { label: 'Device Trust',    value: profile.deviceTrust,   color: '#0ea5e9', delay: 0.3 },
  ];

  const mockTimeline = [
    { type: 'TRANSFER', timestamp: 'Today 08:45', ip_address: '45.22.11.99', location: 'Unknown', risk_score: 96, status: 'FLAGGED' },
    { type: 'LOGIN_SUCCESS', timestamp: 'Today 08:34', ip_address: '185.15.42.100', location: 'Russia', risk_score: 72, status: 'FLAGGED' },
    { type: 'LOGIN_FAILED', timestamp: 'Today 08:31', ip_address: '185.15.42.100', location: 'Russia', risk_score: 45, status: 'PROCESSED' },
    { type: 'POS', timestamp: 'Yesterday 14:20', ip_address: '103.24.x.x', location: 'Mumbai', risk_score: 5, status: 'PROCESSED' },
    { type: 'UPI', timestamp: 'Yesterday 09:15', ip_address: '103.24.x.x', location: 'Mumbai', risk_score: 3, status: 'PROCESSED' },
  ];
  const displayTimeline = timeline.length > 0 ? timeline : mockTimeline;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <p className="eyebrow">Behavioral Identity</p>
          <h1 className="mt-1 text-2xl font-bold text-slate-100">{profile.name}</h1>
          <p className="mt-0.5 text-sm text-slate-500">{profile.id} · {profile.tier} tier · Member since {profile.accountSince}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="pill pill-critical"><AlertTriangle className="h-3 w-3" /> High Risk Customer</span>
          <button className="btn-ghost"><Download className="h-4 w-4" /> Export</button>
        </div>
      </div>

      {/* Risk Gauges */}
      <div className="panel panel-top p-6">
        <div className="mb-5 flex items-center gap-2">
          <ShieldAlert className="h-5 w-5 text-rose-400" />
          <h3 className="font-semibold text-slate-100">Customer Cyber Risk Profile</h3>
        </div>
        <div className="flex flex-wrap justify-around gap-8">
          {gauges.map(g => <RadialGauge key={g.label} {...g} />)}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-slate-800">
        {['profile', 'timeline', 'devices', 'alerts'].map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2.5 text-sm font-medium capitalize transition-colors border-b-2 -mb-px ${
              tab === t ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-slate-500 hover:text-slate-300'
            }`}>{t}</button>
        ))}
      </div>

      {/* Profile */}
      {tab === 'profile' && (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <div className="panel panel-top p-5 space-y-5">
            <div className="flex items-center gap-2">
              <Fingerprint className="h-5 w-5 text-indigo-400" />
              <h3 className="font-semibold text-slate-100">Identity Intelligence</h3>
            </div>
            <div>
              <div className="text-xs uppercase tracking-wide text-slate-500 mb-2 flex items-center gap-1"><Smartphone className="h-3.5 w-3.5" /> Known Devices</div>
              {profile.knownDevices.map(d => (
                <div key={d} className="flex items-center gap-2 py-2 border-b border-slate-800 last:border-0">
                  <div className="h-2 w-2 rounded-full bg-emerald-500" />
                  <span className="text-sm text-slate-300">{d}</span>
                  <span className="ml-auto text-xs text-emerald-400 pill-low pill">Trusted</span>
                </div>
              ))}
            </div>
            <div>
              <div className="text-xs uppercase tracking-wide text-slate-500 mb-2 flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> Trusted Locations</div>
              <div className="flex flex-wrap gap-2">
                {profile.trustedLocations.map(l => (
                  <span key={l} className="rounded-lg border border-slate-700 bg-slate-900 px-2.5 py-1 text-xs text-slate-300">{l}</span>
                ))}
              </div>
            </div>
          </div>
          <div className="panel panel-top p-5 space-y-4">
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-indigo-400" />
              <h3 className="font-semibold text-slate-100">Behaviour Baseline</h3>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { k: 'Average Transfer', v: `₹${profile.avgAmount?.toLocaleString()}`, warn: false },
                { k: 'Max Recorded', v: `₹${profile.maxAmount?.toLocaleString()}`, warn: false },
                { k: 'Today\'s Transfer', v: '₹4,90,000', warn: true },
                { k: 'Deviation', v: '337x avg', warn: true },
              ].map(s => (
                <div key={s.k} className={`rounded-xl border p-3 ${s.warn ? 'border-rose-500/30 bg-rose-500/10' : 'border-slate-800 bg-slate-900/50'}`}>
                  <div className="text-xs text-slate-500">{s.k}</div>
                  <div className={`mt-1 text-lg font-bold ${s.warn ? 'text-rose-400' : 'text-slate-100'}`}>{s.v}</div>
                </div>
              ))}
            </div>
            <div className="border-t border-slate-800 pt-4">
              <div className="text-xs uppercase tracking-wide text-slate-500 mb-2 flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> Usual Login Hours</div>
              <div className="text-sm font-medium text-slate-300">{profile.usualLoginHour}</div>
            </div>
            <div>
              <div className="text-xs uppercase tracking-wide text-slate-500 mb-2 flex items-center gap-1"><CreditCard className="h-3.5 w-3.5" /> Trusted Merchants</div>
              <div className="flex flex-wrap gap-2">
                {profile.trustedMerchants.map(m => (
                  <span key={m} className="rounded-lg border border-slate-700 bg-slate-900 px-2.5 py-1 text-xs text-slate-300">{m}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Timeline */}
      {tab === 'timeline' && (
        <div className="panel panel-top overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-800 bg-slate-900/50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                {['Time', 'Type', 'Location', 'IP', 'Risk', 'Status'].map(h =>
                  <th key={h} className="px-4 py-3 font-medium">{h}</th>)}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {displayTimeline.map((e, i) => {
                const score = e.risk_score || 0;
                return (
                  <motion.tr key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}
                    className="transition-colors hover:bg-slate-800/30">
                    <td className="px-4 py-3 font-mono text-xs text-slate-400">{e.timestamp}</td>
                    <td className="px-4 py-3 font-semibold text-slate-200">{e.type?.replace(/_/g, ' ')}</td>
                    <td className="px-4 py-3 text-slate-400">{e.location || '—'}</td>
                    <td className="px-4 py-3 font-mono text-xs text-slate-500">{e.ip_address || '—'}</td>
                    <td className="px-4 py-3">
                      <span className={`font-bold ${score > 80 ? 'text-rose-400' : score > 50 ? 'text-amber-400' : 'text-emerald-400'}`}>
                        {score}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`pill ${e.status === 'FLAGGED' ? 'pill-critical' : 'pill-low'}`}>{e.status}</span>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Devices */}
      {tab === 'devices' && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { name: 'iPhone 14 Pro', os: 'iOS 17.4', trusted: true, lastSeen: 'Today 08:20', vpn: false, sim: false, fp: 'Matched' },
            { name: 'MacBook Pro', os: 'macOS 14.3', trusted: true, lastSeen: 'Yesterday', vpn: false, sim: false, fp: 'Matched' },
            { name: '🚨 Android Emulator', os: 'Android 11', trusted: false, lastSeen: 'Today 08:35', vpn: true, sim: true, fp: 'Unknown' },
          ].map(d => (
            <div key={d.name} className={`panel panel-top p-5 space-y-3 ${!d.trusted ? 'border-rose-500/30 bg-rose-950/10' : ''}`}>
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-100">{d.name}</span>
                <span className={`pill ${d.trusted ? 'pill-low' : 'pill-critical'}`}>{d.trusted ? 'Trusted' : 'Suspicious'}</span>
              </div>
              <div className="space-y-1.5 text-xs">
                {[['OS', d.os], ['Last Seen', d.lastSeen], ['Fingerprint', d.fp],
                  ['VPN', d.vpn ? '⚠️ Detected' : '✅ None'], ['SIM', d.sim ? '⚠️ Changed' : '✅ Unchanged']].map(([k,v]) => (
                  <div key={k} className="flex justify-between border-b border-slate-800 pb-1.5">
                    <span className="text-slate-500">{k}</span>
                    <span className={`font-medium ${v.includes('⚠️') ? 'text-rose-400' : 'text-slate-300'}`}>{v}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Alerts */}
      {tab === 'alerts' && (
        <div className="panel panel-top overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-800 bg-slate-900/50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                {['Alert ID', 'Risk Score', 'Level', 'Action', 'Status'].map(h =>
                  <th key={h} className="px-4 py-3 font-medium">{h}</th>)}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {[
                { alert_id: 'ALT-82941', risk_score: 96, risk_level: 'Critical', action: 'BLOCK', status: 'OPEN' },
                { alert_id: 'ALT-71823', risk_score: 72, risk_level: 'High',     action: 'VERIFY', status: 'CLOSED' },
              ].map((a, i) => (
                <tr key={i} className="hover:bg-slate-800/30">
                  <td className="px-4 py-3 font-mono text-xs text-slate-400">{a.alert_id}</td>
                  <td className="px-4 py-3"><span className={`font-bold text-2xl ${a.risk_score > 80 ? 'text-rose-400' : 'text-amber-400'}`}>{a.risk_score}</span></td>
                  <td className="px-4 py-3"><span className={`pill pill-${a.risk_level.toLowerCase()}`}>{a.risk_level}</span></td>
                  <td className="px-4 py-3 font-semibold text-slate-200">{a.action}</td>
                  <td className="px-4 py-3"><span className={`pill ${a.status === 'OPEN' ? 'pill-critical' : 'pill-low'}`}>{a.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
