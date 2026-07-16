import React from 'react';

const MITRE_MAP = {
  'Credential Stuffing':  { tactic: 'Credential Access',  id: 'T1110.004', color: 'border-rose-500/40 bg-rose-500/10 text-rose-300' },
  'Account Takeover':     { tactic: 'Initial Access',      id: 'T1078',     color: 'border-orange-500/40 bg-orange-500/10 text-orange-300' },
  'SIM Swap':             { tactic: 'Persistence',         id: 'T1098',     color: 'border-amber-500/40 bg-amber-500/10 text-amber-300' },
  'VPN Login':            { tactic: 'Defense Evasion',     id: 'T1090',     color: 'border-purple-500/40 bg-purple-500/10 text-purple-300' },
  'Money Extraction':     { tactic: 'Exfiltration',        id: 'T1041',     color: 'border-rose-700/40 bg-rose-700/10 text-rose-400' },
  'Mule Network':         { tactic: 'Impact',              id: 'T1486',     color: 'border-red-500/40 bg-red-500/10 text-red-300' },
  'Phishing':             { tactic: 'Phishing',            id: 'T1566',     color: 'border-cyan-500/40 bg-cyan-500/10 text-cyan-300' },
  'Bot Activity':         { tactic: 'Resource Development', id: 'T1583',    color: 'border-indigo-500/40 bg-indigo-500/10 text-indigo-300' },
};

export default function MitreBadges({ threats = [] }) {
  const badges = threats
    .map(t => ({ name: t, ...(MITRE_MAP[t] || { tactic: 'Unknown', id: 'T0000', color: 'border-slate-500/40 bg-slate-500/10 text-slate-300' }) }))
    .filter((v, i, a) => a.findIndex(x => x.id === v.id) === i);

  if (!badges.length) return null;

  return (
    <div>
      <div className="mb-2 text-[10px] font-bold uppercase tracking-widest text-slate-500">
        MITRE ATT&CK
      </div>
      <div className="flex flex-wrap gap-1.5">
        {badges.map(b => (
          <div key={b.id} className={`flex items-center gap-1.5 rounded-md border px-2 py-1 text-[10px] font-semibold ${b.color}`}>
            <span className="font-mono opacity-70">{b.id}</span>
            <span>·</span>
            <span>{b.tactic}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
