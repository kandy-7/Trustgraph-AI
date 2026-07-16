import React from 'react';
import { useAppContext } from '../context/AppContext';
import { Fingerprint, Map, Download, CheckCircle, ShieldAlert, Cpu } from 'lucide-react';
import { motion } from 'framer-motion';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import PageHeader from '../components/ui/PageHeader';
import Panel from '../components/ui/Panel';

const FACTORS = [
  { label: 'Impossible Travel / Location Anomaly', impact: 45, tone: 'bg-rose-500', text: 'text-rose-500' },
  { label: 'Device Fingerprint Mismatch', impact: 30, tone: 'bg-orange-500', text: 'text-orange-500' },
  { label: 'Velocity & Amount Drift', impact: 25, tone: 'bg-amber-400', text: 'text-amber-500' },
];

const SEV_DOT = {
  CRITICAL: 'bg-rose-500 ring-rose-100',
  HIGH: 'bg-orange-500 ring-orange-100',
  MEDIUM: 'bg-amber-400 ring-amber-100',
  LOW: 'bg-indigo-500 ring-indigo-100',
};

export default function Investigations() {
  const { investigationCase } = useAppContext();

  const caseData = investigationCase || {
    id: 'CASE-10293',
    customer: 'Sarah Jenkins',
    threat: 'UPI Phishing',
    stage: 'Reconnaissance',
    confidence: 85,
    riskScore: 72,
    timeline: [
      { time: '14:20', type: 'LOGIN', msg: 'Login Succeeded', severity: 'LOW' },
      { time: '14:22', type: 'BENEFICIARY_ADDED', msg: 'New UPI Handle Added', severity: 'MEDIUM' },
    ],
  };

  const highRisk = caseData.riskScore > 90;

  const handleGeneratePDF = async () => {
    const input = document.getElementById('report-content');
    if (!input) return;
    const canvas = await html2canvas(input, { scale: 2, backgroundColor: '#f4f7fb' });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(`Incident_Report_${caseData.id}.pdf`);
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6" id="report-content">
      <PageHeader
        eyebrow="Incident Response"
        title={`Investigation · ${caseData.id}`}
        subtitle={`Customer: ${caseData.customer}`}
        actions={
          <>
            <button className="btn-success">
              <CheckCircle className="h-4 w-4" /> Resolve Case
            </button>
            <button onClick={handleGeneratePDF} className="btn-ghost">
              <Download className="h-4 w-4" /> Generate Report
            </button>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left */}
        <div className="space-y-6 lg:col-span-2">
          {/* Summary */}
          <Panel glow={highRisk ? 'red' : 'none'} className="overflow-hidden p-6">
            <div className={`absolute inset-y-0 left-0 w-1.5 ${highRisk ? 'bg-rose-500' : 'bg-orange-500'}`} />
            <div className="flex items-start justify-between gap-6">
              <div className="flex-1">
                <div className="mb-4 flex items-center gap-2">
                  <ShieldAlert className={`h-5 w-5 ${highRisk ? 'text-rose-500' : 'text-orange-500'}`} />
                  <h3 className="text-lg font-semibold text-slate-900">Incident Summary</h3>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <div className="text-xs text-slate-400">Threat Type</div>
                    <div className="mt-1 text-sm font-semibold text-slate-900">{caseData.threat}</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-400">Attack Stage</div>
                    <div className="mt-1 text-sm font-semibold text-orange-500">{caseData.stage}</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-400">AI Confidence</div>
                    <div className="mt-1 text-sm font-semibold text-indigo-600">{caseData.confidence}%</div>
                  </div>
                </div>
              </div>
              <div className="text-center">
                <div className="text-xs text-slate-400">Risk Score</div>
                <div className={`text-5xl font-black ${highRisk ? 'text-rose-500' : 'text-orange-500'}`}>
                  {caseData.riskScore}
                </div>
              </div>
            </div>
          </Panel>

          {/* Explainability */}
          <Panel className="p-6">
            <div className="mb-5 flex items-center gap-2">
              <Cpu className="h-5 w-5 text-indigo-500" />
              <h3 className="text-lg font-semibold text-slate-900">Explainable AI · Score Attribution</h3>
            </div>
            <div className="space-y-4">
              {FACTORS.map((f, i) => (
                <div key={f.label}>
                  <div className="mb-1.5 flex justify-between text-sm">
                    <span className="text-slate-600">{f.label}</span>
                    <span className={`font-semibold ${f.text}`}>{f.impact}% impact</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${f.impact}%` }}
                      transition={{ duration: 0.9, delay: i * 0.12, ease: 'easeOut' }}
                      className={`h-full rounded-full ${f.tone}`}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Panel>

          {/* Evidence */}
          <Panel className="p-6">
            <h3 className="mb-4 text-lg font-semibold text-slate-900">Digital Evidence</h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <Map className="mb-2 h-5 w-5 text-indigo-500" />
                <div className="font-mono text-sm font-medium text-slate-900">185.15.42.100</div>
                <div className="mt-1 text-xs text-slate-500">London, UK · flagged VPN exit node</div>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <Fingerprint className="mb-2 h-5 w-5 text-indigo-500" />
                <div className="text-sm font-medium text-slate-900">Emulated Device</div>
                <div className="mt-1 font-mono text-xs text-slate-500">Android 11 · f8a9223f</div>
              </div>
            </div>
          </Panel>
        </div>

        {/* Right — Timeline */}
        <Panel className="p-6">
          <h3 className="mb-6 text-lg font-semibold text-slate-900">Threat Story Reconstruction</h3>
          <div className="relative ml-2 space-y-7 border-l border-slate-200 pl-6">
            {caseData.timeline.map((event, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.15 }}
                className="relative"
              >
                <div
                  className={`absolute -left-[31px] top-0.5 h-3.5 w-3.5 rounded-full ring-4 ${SEV_DOT[event.severity] || SEV_DOT.LOW}`}
                />
                <div className="font-mono text-[11px] text-slate-400">{event.time}</div>
                <div className="text-sm font-semibold text-slate-900">{event.type.replace(/_/g, ' ')}</div>
                <div className="mt-0.5 text-sm text-slate-500">{event.msg}</div>
                {event.status === 'BLOCKED' && (
                  <span className="mt-2 inline-block rounded-md border border-rose-200 bg-rose-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-rose-600">
                    Action · Blocked
                  </span>
                )}
              </motion.div>
            ))}
          </div>
        </Panel>
      </div>
    </div>
  );
}
