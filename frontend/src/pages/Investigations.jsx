import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { Fingerprint, Map, Download, CheckCircle, ShieldAlert, Cpu, Clock, Activity, ChevronDown, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import KillChainTracker from '../components/KillChainTracker';
import MitreBadges from '../components/MitreBadges';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const SEV_DOT = {
  CRITICAL: 'bg-rose-500 ring-rose-900',
  HIGH:     'bg-orange-500 ring-orange-900',
  MEDIUM:   'bg-amber-400 ring-amber-900',
  LOW:      'bg-indigo-500 ring-indigo-900',
};

const EVIDENCE_ITEMS = [
  { label: 'Source IP', value: '185.15.42.100', sub: 'Russia · Botnet C&C · Blacklisted', icon: Map, color: 'text-rose-400 bg-rose-500/10 border-rose-500/20' },
  { label: 'Device', value: 'Android Emulator', sub: 'Fingerprint: f8a9223f · Rooted', icon: Fingerprint, color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' },
  { label: 'SIM Card', value: 'SIM Swapped', sub: 'Jio → Airtel · 08:36 IST', icon: Activity, color: 'text-orange-400 bg-orange-500/10 border-orange-500/20' },
  { label: 'Login Hours', value: '08:31 IST', sub: 'Customer usual: 09:00–11:00', icon: Clock, color: 'text-violet-400 bg-violet-500/10 border-violet-500/20' },
];

const RESPONSE_STEPS = [
  { step: 'Identity', actions: ['Force Password Reset', 'Revoke Sessions', 'Video KYC Required'], done: true },
  { step: 'Transaction', actions: ['Block Transfer', 'Hold Funds', 'Block Beneficiary BEN-992'], done: true },
  { step: 'Customer', actions: ['Push Notification', 'SMS Alert via Backup', 'Email Warning'], done: true },
  { step: 'Operations', actions: ['Escalate to Fraud Team', 'Assign Case Investigator'], done: false },
  { step: 'Compliance', actions: ['Generate RBI Report', 'Notify FIU', 'Log Audit Trail'], done: false },
];

export default function Investigations() {
  const { investigationCase } = useAppContext();
  const [activeTab, setActiveTab] = useState('summary');
  const [notes, setNotes] = useState('');
  const [caseStatus, setCaseStatus] = useState('Investigating');

  const caseData = investigationCase || {
    id: 'CASE-10293', customer: 'Sarah Jenkins', userId: 'USR-10293',
    threat: 'UPI Phishing', stage: 'Reconnaissance', confidence: 85, riskScore: 72,
    timeline: [
      { time: '14:20', type: 'LOGIN', msg: 'Login Succeeded', severity: 'LOW' },
      { time: '14:22', type: 'BENEFICIARY_ADDED', msg: 'New UPI Handle Added', severity: 'MEDIUM' },
    ],
  };

  const highRisk = caseData.riskScore > 90;
  const TABS = ['summary', 'timeline', 'evidence', 'response', 'notes', 'report'];

  const handleGeneratePDF = async () => {
    const el = document.getElementById('investigation-content');
    if (!el) return;
    const canvas = await html2canvas(el, { scale: 2, backgroundColor: '#020617' });
    const img = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const w = pdf.internal.pageSize.getWidth();
    const h = (canvas.height * w) / canvas.width;
    pdf.addImage(img, 'PNG', 0, 0, w, h);
    pdf.save(`TrustGraph_Incident_${caseData.id}.pdf`);
  };

  return (
    <div id="investigation-content" className="mx-auto max-w-6xl p-6 lg:p-8 space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <p className="eyebrow">Incident Response</p>
          <h1 className="mt-1 text-2xl font-bold text-slate-100">Investigation · {caseData.id}</h1>
          <p className="mt-0.5 text-sm text-slate-500">Customer: {caseData.customer} · {caseData.userId}</p>
        </div>
        <div className="flex items-center gap-2">
          <select value={caseStatus} onChange={e => setCaseStatus(e.target.value)}
            className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-sm text-slate-300 focus:outline-none">
            {['Open', 'Investigating', 'Contained', 'Resolved'].map(s =>
              <option key={s} value={s}>{s}</option>)}
          </select>
          <button className="btn-success" onClick={() => setCaseStatus('Resolved')}>
            <CheckCircle className="h-4 w-4" /> Resolve
          </button>
          <button onClick={handleGeneratePDF} className="btn-ghost">
            <Download className="h-4 w-4" /> Export PDF
          </button>
        </div>
      </div>

      {/* Kill Chain */}
      <div className="panel panel-top overflow-hidden rounded-2xl border border-rose-500/20 bg-rose-950/10 p-5">
        <KillChainTracker activeStage={caseData.stage} />
      </div>

      {/* MITRE badges */}
      <div className="panel panel-top p-4">
        <MitreBadges threats={['Credential Stuffing', 'Account Takeover', 'SIM Swap', 'Money Extraction']} />
      </div>

      {/* Tab navigation */}
      <div className="flex gap-1 overflow-x-auto border-b border-slate-800 pb-0">
        {TABS.map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`shrink-0 px-4 py-2.5 text-sm font-medium capitalize transition-colors border-b-2 -mb-px ${
              activeTab === tab
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-300'
            }`}>{tab}</button>
        ))}
      </div>

      {/* Tab content */}
      <AnimatePresence mode="wait">
        <motion.div key={activeTab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>

          {/* SUMMARY */}
          {activeTab === 'summary' && (
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
              <div className="lg:col-span-2 space-y-5">
                <div className={`panel panel-top relative overflow-hidden p-6 ${highRisk ? 'border-rose-500/30 bg-rose-950/10' : 'border-orange-500/20'}`}>
                  <div className={`absolute inset-y-0 left-0 w-1.5 ${highRisk ? 'bg-rose-500' : 'bg-orange-500'}`} />
                  <div className="flex items-start gap-6">
                    <div className="flex-1">
                      <div className="mb-4 flex items-center gap-2">
                        <ShieldAlert className={`h-5 w-5 ${highRisk ? 'text-rose-400' : 'text-orange-400'}`} />
                        <h3 className="font-semibold text-slate-100">Incident Summary</h3>
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        {[
                          { k: 'Threat Type', v: caseData.threat, c: 'text-slate-100' },
                          { k: 'Attack Stage', v: caseData.stage, c: 'text-orange-400' },
                          { k: 'AI Confidence', v: `${caseData.confidence}%`, c: 'text-indigo-400' },
                          { k: 'Case Status', v: caseStatus, c: 'text-emerald-400' },
                          { k: 'Detection Time', v: '1.2s', c: 'text-cyan-400' },
                          { k: 'Funds Protected', v: '₹4.9L', c: 'text-rose-400' },
                        ].map(s => (
                          <div key={s.k}>
                            <div className="text-xs text-slate-500">{s.k}</div>
                            <div className={`mt-1 text-sm font-semibold ${s.c}`}>{s.v}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs text-slate-500 mb-1">Risk Score</div>
                      <div className={`text-5xl font-black ${highRisk ? 'text-rose-400' : 'text-orange-400'}`}>{caseData.riskScore}</div>
                    </div>
                  </div>
                </div>
                {/* AI Score Breakdown */}
                <div className="panel panel-top p-6">
                  <div className="mb-4 flex items-center gap-2">
                    <Cpu className="h-5 w-5 text-indigo-400" />
                    <h3 className="font-semibold text-slate-100">Decision Intelligence · Risk Attribution</h3>
                  </div>
                  <div className="space-y-3">
                    {[
                      { label: 'Threat Correlation', pct: 35, color: 'bg-rose-500' },
                      { label: 'ML Intelligence', pct: 28, color: 'bg-indigo-500' },
                      { label: 'Behaviour Drift', pct: 20, color: 'bg-amber-500' },
                      { label: 'Telemetry (VPN/Device)', pct: 12, color: 'bg-orange-500' },
                      { label: 'Graph Intelligence', pct: 5, color: 'bg-violet-500' },
                    ].map((f, i) => (
                      <div key={f.label}>
                        <div className="mb-1 flex justify-between text-xs">
                          <span className="text-slate-400">{f.label}</span>
                          <span className="font-semibold text-slate-300">{f.pct}%</span>
                        </div>
                        <div className="h-2 w-full overflow-hidden rounded-full bg-slate-800">
                          <motion.div initial={{ width: 0 }} animate={{ width: `${f.pct}%` }} transition={{ duration: 0.9, delay: i * 0.1, ease: 'easeOut' }}
                            className={`h-full rounded-full ${f.color}`} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              {/* Right — Evidence quick view */}
              <div className="panel panel-top p-5 space-y-3">
                <h3 className="font-semibold text-slate-100">Key Evidence</h3>
                {EVIDENCE_ITEMS.map(e => (
                  <div key={e.label} className={`flex items-start gap-3 rounded-xl border p-3 ${e.color}`}>
                    <e.icon className={`h-4 w-4 mt-0.5 shrink-0 ${e.color.split(' ')[0]}`} />
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-slate-200">{e.value}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">{e.sub}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TIMELINE */}
          {activeTab === 'timeline' && (
            <div className="panel panel-top p-6">
              <h3 className="mb-6 font-semibold text-slate-100">Attack Timeline Reconstruction</h3>
              <div className="relative ml-2 space-y-6 border-l border-slate-800 pl-6">
                {caseData.timeline.map((evt, i) => (
                  <motion.div key={i} initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }} className="relative">
                    <div className={`absolute -left-[31px] top-0.5 h-3.5 w-3.5 rounded-full ring-4 ${SEV_DOT[evt.severity] || SEV_DOT.LOW}`} />
                    <div className="font-mono text-[11px] text-slate-500">{evt.time}</div>
                    <div className="text-sm font-semibold text-slate-200">{evt.type?.replace(/_/g, ' ')}</div>
                    <div className="mt-0.5 text-sm text-slate-400">{evt.msg}</div>
                    {evt.status === 'BLOCKED' && (
                      <span className="mt-2 inline-block rounded-md border border-rose-500/40 bg-rose-500/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-rose-400">
                        ⛔ Blocked by TrustGraph AI
                      </span>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* EVIDENCE */}
          {activeTab === 'evidence' && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {EVIDENCE_ITEMS.map(e => (
                <div key={e.label} className={`panel panel-top flex flex-col gap-3 rounded-2xl border p-5 ${e.color}`}>
                  <e.icon className={`h-5 w-5 ${e.color.split(' ')[0]}`} />
                  <div className="text-xs font-bold uppercase tracking-wide text-slate-400">{e.label}</div>
                  <div className="text-sm font-bold text-slate-100">{e.value}</div>
                  <div className="text-xs text-slate-400">{e.sub}</div>
                </div>
              ))}
            </div>
          )}

          {/* RESPONSE */}
          {activeTab === 'response' && (
            <div className="space-y-3">
              {RESPONSE_STEPS.map((r, i) => (
                <div key={r.step} className={`panel panel-top p-5 ${r.done ? 'border-emerald-500/20 bg-emerald-950/10' : 'border-slate-800'}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`h-7 w-7 rounded-full flex items-center justify-center ${r.done ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-500'}`}>
                        {r.done ? <CheckCircle className="h-4 w-4" /> : <span className="text-xs font-bold">{i + 1}</span>}
                      </div>
                      <span className="font-semibold text-slate-200">{r.step}</span>
                    </div>
                    <span className={`pill ${r.done ? 'pill-low' : 'pill-neutral'}`}>{r.done ? 'Executed' : 'Pending'}</span>
                  </div>
                  <div className="mt-3 ml-10 flex flex-wrap gap-2">
                    {r.actions.map(a => (
                      <span key={a} className="rounded-lg border border-slate-700 bg-slate-900 px-2.5 py-1 text-xs text-slate-300">{a}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* NOTES */}
          {activeTab === 'notes' && (
            <div className="panel panel-top p-6">
              <h3 className="mb-4 font-semibold text-slate-100">Analyst Notes</h3>
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                rows={10}
                placeholder="Add investigator notes, observations, or next steps here…"
                className="w-full rounded-xl border border-slate-700 bg-slate-900/60 p-4 text-sm text-slate-300 placeholder:text-slate-600 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
              <div className="mt-3 flex justify-end">
                <button className="btn-primary">Save Notes</button>
              </div>
            </div>
          )}

          {/* REPORT */}
          {activeTab === 'report' && (
            <div className="panel panel-top p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-slate-100">Incident Report Preview</h3>
                <button onClick={handleGeneratePDF} className="btn-ghost">
                  <Download className="h-4 w-4" /> Export PDF
                </button>
              </div>
              <div className="rounded-xl border border-slate-700 bg-slate-900/50 p-5 space-y-4 font-mono text-sm">
                {[
                  ['Report ID', `REP-${caseData.id}-2026`],
                  ['Generated', new Date().toLocaleString()],
                  ['Generated By', 'TrustGraph AI Platform v1.0'],
                  ['Incident ID', caseData.id],
                  ['Customer', `${caseData.customer} (${caseData.userId})`],
                  ['Threat', caseData.threat],
                  ['Risk Score', `${caseData.riskScore}/100`],
                  ['Attack Stage', caseData.stage],
                  ['AI Confidence', `${caseData.confidence}%`],
                  ['Funds Protected', '₹4,90,000'],
                  ['Status', caseStatus],
                  ['Compliance', 'RBI Circular RBI/2020-21/16 · Reported'],
                ].map(([k, v]) => (
                  <div key={k} className="grid grid-cols-2 border-b border-slate-800 pb-2">
                    <span className="text-slate-500">{k}</span>
                    <span className="text-slate-200">{v}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
