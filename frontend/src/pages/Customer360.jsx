import React, { useEffect, useState } from 'react';
import { getCustomerProfile } from '../services/customerService';
import { ShieldAlert, MapPin, Smartphone, CreditCard, Activity } from 'lucide-react';
import { motion } from 'framer-motion';

const RadialGauge = ({ label, value, color }) => {
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (value / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-24 h-24 flex items-center justify-center">
        <svg className="w-full h-full transform -rotate-90">
          <circle cx="48" cy="48" r={radius} stroke="#1e293b" strokeWidth="8" fill="none" />
          <motion.circle
            cx="48" cy="48" r={radius}
            stroke={color} strokeWidth="8" fill="none"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            strokeLinecap="round"
          />
        </svg>
        <span className="absolute text-xl font-bold text-white">{value}<span className="text-xs text-slate-400">%</span></span>
      </div>
      <span className="mt-2 text-sm font-medium text-slate-400">{label}</span>
    </div>
  );
};

export default function Customer360() {
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    getCustomerProfile().then(setProfile);
  }, []);

  if (!profile) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">{profile.name}</h1>
          <div className="text-sm text-slate-400 mt-1">ID: {profile.id} • Tier: {profile.tier} • Member since {profile.accountSince}</div>
        </div>
        <button className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors border border-slate-700">
          Export Profile PDF
        </button>
      </div>

      {/* Risk Gauges */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-6">Customer Risk Profile</h3>
        <div className="flex flex-wrap gap-8 justify-around">
          <RadialGauge label="Overall Risk" value={profile.overallRisk} color="#ef4444" />
          <RadialGauge label="Identity Risk" value={profile.identityRisk} color="#f97316" />
          <RadialGauge label="Behaviour Risk" value={profile.behaviourRisk} color="#f59e0b" />
          <RadialGauge label="Device Trust" value={profile.deviceTrust} color="#ef4444" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Identity Information */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            <ShieldAlert className="w-5 h-5 mr-2 text-indigo-400" /> Identity Intelligence
          </h3>
          <div className="space-y-4">
            <div>
              <div className="text-sm text-slate-400 mb-1 flex items-center"><Smartphone className="w-4 h-4 mr-1"/> Known Devices</div>
              {profile.knownDevices.map(d => <div key={d} className="text-sm text-white font-medium">{d}</div>)}
            </div>
            <div className="pt-3 border-t border-slate-800">
              <div className="text-sm text-slate-400 mb-1 flex items-center"><MapPin className="w-4 h-4 mr-1"/> Trusted Locations</div>
              {profile.trustedLocations.map(d => <div key={d} className="text-sm text-white font-medium">{d}</div>)}
            </div>
          </div>
        </div>

        {/* Behaviour Information */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            <Activity className="w-5 h-5 mr-2 text-indigo-400" /> Behaviour Baseline
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-slate-400 mb-1">Average Transfer</div>
              <div className="text-lg text-white font-semibold">₹{profile.avgAmount.toLocaleString()}</div>
            </div>
            <div>
              <div className="text-sm text-slate-400 mb-1">Max Recorded</div>
              <div className="text-lg text-white font-semibold">₹{profile.maxAmount.toLocaleString()}</div>
            </div>
            <div className="col-span-2 pt-3 border-t border-slate-800">
              <div className="text-sm text-slate-400 mb-1">Usual Login Hours</div>
              <div className="text-sm text-white font-medium">{profile.usualLoginHour}</div>
            </div>
            <div className="col-span-2 pt-3 border-t border-slate-800">
              <div className="text-sm text-slate-400 mb-1 flex items-center"><CreditCard className="w-4 h-4 mr-1"/> Trusted Merchants</div>
              <div className="flex gap-2 mt-1">
                {profile.trustedMerchants.map(m => (
                  <span key={m} className="bg-slate-800 text-slate-300 px-2 py-1 rounded text-xs">{m}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <div className="p-6 border-b border-slate-800">
          <h3 className="text-lg font-semibold text-white">Recent Transactions</h3>
        </div>
        <table className="w-full text-left text-sm text-slate-300">
          <thead className="bg-slate-950 text-slate-500 font-medium">
            <tr>
              <th className="px-6 py-3">ID</th>
              <th className="px-6 py-3">Type</th>
              <th className="px-6 py-3">Date</th>
              <th className="px-6 py-3">Amount</th>
              <th className="px-6 py-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {profile.recentTransactions.map(txn => (
              <tr key={txn.id} className="hover:bg-slate-800/50">
                <td className="px-6 py-4">{txn.id}</td>
                <td className="px-6 py-4">{txn.type}</td>
                <td className="px-6 py-4">{txn.date}</td>
                <td className="px-6 py-4">₹{txn.amount.toLocaleString()}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    txn.status === 'BLOCKED' ? 'bg-red-950 text-red-400' : 'bg-emerald-950 text-emerald-400'
                  }`}>
                    {txn.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
