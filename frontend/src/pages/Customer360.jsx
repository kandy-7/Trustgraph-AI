import React, { useEffect, useState } from 'react';
import { getCustomerProfile } from '../services/customerService';
import {
  ShieldAlert, MapPin, Smartphone, CreditCard, Activity, Download, Fingerprint, Clock,
} from 'lucide-react';
import { motion } from 'framer-motion';
import PageHeader from '../components/ui/PageHeader';
import Panel from '../components/ui/Panel';

const RadialGauge = ({ label, value, color, delay = 0 }) => {
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      <div className="relative grid h-28 w-28 place-items-center">
        <svg className="h-full w-full -rotate-90" viewBox="0 0 96 96">
          <circle cx="48" cy="48" r={radius} stroke="#e2e8f0" strokeWidth="7" fill="none" />
          <motion.circle
            cx="48" cy="48" r={radius}
            stroke={color} strokeWidth="7" fill="none" strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.4, ease: 'easeOut', delay }}
          />
        </svg>
        <div className="absolute text-center">
          <span className="text-2xl font-bold text-slate-900">{value}</span>
          <span className="text-xs text-slate-400">%</span>
        </div>
      </div>
      <span className="mt-2 text-sm font-medium text-slate-500">{label}</span>
    </div>
  );
};

const Row = ({ icon: Icon, label, children }) => (
  <div>
    <div className="mb-1.5 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-slate-400">
      <Icon className="h-3.5 w-3.5" /> {label}
    </div>
    {children}
  </div>
);

export default function Customer360() {
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    getCustomerProfile().then(setProfile);
  }, []);

  if (!profile) {
    return (
      <div className="space-y-6">
        <div className="skeleton h-20 w-full" />
        <div className="skeleton h-48 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Behavioral Identity"
        title={profile.name}
        subtitle={`${profile.id} · ${profile.tier} tier · member since ${profile.accountSince}`}
        actions={
          <button className="btn-ghost">
            <Download className="h-4 w-4" /> Export Profile
          </button>
        }
      />

      {/* Risk gauges */}
      <Panel className="p-6">
        <div className="mb-6 flex items-center gap-2">
          <ShieldAlert className="h-5 w-5 text-rose-500" />
          <h3 className="text-lg font-semibold text-slate-900">Customer Cyber Risk Profile</h3>
        </div>
        <div className="flex flex-wrap justify-around gap-8">
          <RadialGauge label="Overall Risk" value={profile.overallRisk} color="#f43f5e" delay={0} />
          <RadialGauge label="Identity Risk" value={profile.identityRisk} color="#fb923c" delay={0.1} />
          <RadialGauge label="Behaviour Risk" value={profile.behaviourRisk} color="#f59e0b" delay={0.2} />
          <RadialGauge label="Device Trust" value={profile.deviceTrust} color="#0ea5e9" delay={0.3} />
        </div>
      </Panel>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Identity */}
        <Panel className="p-6">
          <div className="mb-5 flex items-center gap-2">
            <Fingerprint className="h-5 w-5 text-indigo-500" />
            <h3 className="text-lg font-semibold text-slate-900">Identity Intelligence</h3>
          </div>
          <div className="space-y-5">
            <Row icon={Smartphone} label="Known Devices">
              <div className="space-y-1">
                {profile.knownDevices.map((d) => (
                  <div key={d} className="text-sm font-medium text-slate-700">{d}</div>
                ))}
              </div>
            </Row>
            <div className="border-t border-slate-100 pt-4">
              <Row icon={MapPin} label="Trusted Locations">
                <div className="flex flex-wrap gap-2">
                  {profile.trustedLocations.map((d) => (
                    <span key={d} className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs text-slate-600">{d}</span>
                  ))}
                </div>
              </Row>
            </div>
          </div>
        </Panel>

        {/* Behaviour */}
        <Panel className="p-6">
          <div className="mb-5 flex items-center gap-2">
            <Activity className="h-5 w-5 text-indigo-500" />
            <h3 className="text-lg font-semibold text-slate-900">Behaviour Baseline</h3>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="text-xs text-slate-500">Average Transfer</div>
              <div className="mt-1 text-lg font-bold text-slate-900">₹{profile.avgAmount.toLocaleString()}</div>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="text-xs text-slate-500">Max Recorded</div>
              <div className="mt-1 text-lg font-bold text-slate-900">₹{profile.maxAmount.toLocaleString()}</div>
            </div>
            <div className="col-span-2 border-t border-slate-100 pt-4">
              <Row icon={Clock} label="Usual Login Hours">
                <div className="text-sm font-medium text-slate-700">{profile.usualLoginHour}</div>
              </Row>
            </div>
            <div className="col-span-2 border-t border-slate-100 pt-4">
              <Row icon={CreditCard} label="Trusted Merchants">
                <div className="flex flex-wrap gap-2">
                  {profile.trustedMerchants.map((m) => (
                    <span key={m} className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs text-slate-600">{m}</span>
                  ))}
                </div>
              </Row>
            </div>
          </div>
        </Panel>
      </div>

      {/* Recent transactions */}
      <Panel className="overflow-hidden">
        <div className="border-b border-slate-100 p-6">
          <h3 className="text-lg font-semibold text-slate-900">Recent Transactions</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-400">
              <tr>
                <th className="px-6 py-3 font-medium">ID</th>
                <th className="px-6 py-3 font-medium">Type</th>
                <th className="px-6 py-3 font-medium">Date</th>
                <th className="px-6 py-3 font-medium">Amount</th>
                <th className="px-6 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {profile.recentTransactions.map((txn) => (
                <tr key={txn.id} className="transition-colors hover:bg-slate-50">
                  <td className="px-6 py-4 font-mono text-xs text-slate-400">{txn.id}</td>
                  <td className="px-6 py-4 text-slate-600">{txn.type}</td>
                  <td className="px-6 py-4 text-slate-400">{txn.date}</td>
                  <td className="px-6 py-4 font-semibold text-slate-900">₹{txn.amount.toLocaleString()}</td>
                  <td className="px-6 py-4">
                    <span className={txn.status === 'BLOCKED' ? 'pill-critical' : 'pill-low'}>{txn.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
}
