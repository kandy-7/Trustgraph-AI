import React, { useState } from 'react';
import { Download, FileText, Clock, CheckCircle, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';
import { getIncidentReport, getReportsSummary } from '../services/api';
import { useAppContext } from '../context/AppContext';

const MOCK_INCIDENTS = [
  { id: 'EVT-82941', customer: 'John Doe · USR-38362', threat: 'Account Takeover', risk: 96, level: 'CRITICAL', time: 'Today 08:45', action: 'BLOCK', status: 'REPORTED' },
  { id: 'EVT-71823', customer: 'Sarah J. · USR-10293', threat: 'UPI Phishing', risk: 72, level: 'HIGH', time: 'Today 06:12', action: 'VERIFY', status: 'PENDING' },
  { id: 'EVT-59012', customer: 'Rahul M. · USR-29012', threat: 'SIM Swap', risk: 88, level: 'CRITICAL', time: 'Yesterday 22:41', action: 'FREEZE', status: 'REPORTED' },
  { id: 'EVT-44820', customer: 'Priya K. · USR-44820', threat: 'Credential Stuffing', risk: 61, level: 'HIGH', time: 'Yesterday 18:22', action: 'VERIFY', status: 'CLOSED' },
];

const SEV_PILL = { CRITICAL: 'pill-critical', HIGH: 'pill-high', MEDIUM: 'pill-medium', LOW: 'pill-low' };

export default function Reports() {
  const { investigationCase, addToast } = useAppContext();
  const [exporting, setExporting] = useState(null);

  const handleExport = async (id, format) => {
    setExporting(`${id}-${format}`);
    try {
      if (format === 'json') {
        const data = await getIncidentReport(id, 'json');
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a'); a.href = url; a.download = `incident_${id}.json`; a.click();
      } else {
        const data = await getIncidentReport(id, 'csv');
        const blob = new Blob([data], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a'); a.href = url; a.download = `incident_${id}.csv`; a.click();
      }
      addToast({ severity: 'LOW', msg: `Report exported: ${id}.${format}` });
    } catch {
      // Mock export
      const mock = { report_id: `REP-${id}`, generated_time: new Date().toISOString(), event_id: id, status: 'mock_export' };
      const blob = new Blob([JSON.stringify(mock, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = `incident_${id}.json`; a.click();
      addToast({ severity: 'LOW', msg: `Report exported: ${id}` });
    }
    setExporting(null);
  };

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="eyebrow">Incident Reporting Engine</p>
          <h1 className="mt-1 text-2xl font-bold text-slate-100">Reports & Compliance</h1>
          <p className="mt-0.5 text-sm text-slate-500">RBI-compliant incident reports · JSON & CSV export</p>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { k: "Today's Incidents", v: '27',    c: 'text-rose-400', b: 'border-rose-500/20' },
          { k: 'Critical Reports',  v: '7',     c: 'text-amber-400',b: 'border-amber-500/20' },
          { k: 'Funds Protected',   v: '₹42.6L',c: 'text-emerald-400', b: 'border-emerald-500/20' },
          { k: 'Reported to FIU',   v: '3',     c: 'text-indigo-400', b: 'border-indigo-500/20' },
        ].map(s => (
          <div key={s.k} className={`panel panel-top border rounded-2xl p-5 ${s.b}`}>
            <div className="text-xs uppercase tracking-wide text-slate-500">{s.k}</div>
            <div className={`mt-1 text-3xl font-black ${s.c}`}>{s.v}</div>
          </div>
        ))}
      </div>

      {/* Incident List */}
      <div className="panel panel-top overflow-hidden rounded-2xl">
        <div className="border-b border-slate-800 px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-indigo-400" />
            <h3 className="font-semibold text-slate-100">Incident Reports</h3>
          </div>
          <span className="text-xs text-slate-500">{MOCK_INCIDENTS.length} reports</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-800 bg-slate-900/50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                {['Incident ID', 'Customer', 'Threat', 'Risk', 'Level', 'Time', 'Action', 'Status', 'Export'].map(h =>
                  <th key={h} className="px-4 py-3 font-medium">{h}</th>)}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {MOCK_INCIDENTS.map((inc, i) => (
                <motion.tr key={inc.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.06 }}
                  className="hover:bg-slate-800/30">
                  <td className="px-4 py-3 font-mono text-xs text-slate-400">{inc.id}</td>
                  <td className="px-4 py-3 text-sm text-slate-300">{inc.customer}</td>
                  <td className="px-4 py-3 font-semibold text-slate-200">{inc.threat}</td>
                  <td className="px-4 py-3">
                    <span className={`text-lg font-black ${inc.risk > 80 ? 'text-rose-400' : 'text-amber-400'}`}>{inc.risk}</span>
                  </td>
                  <td className="px-4 py-3"><span className={`pill ${SEV_PILL[inc.level]}`}>{inc.level}</span></td>
                  <td className="px-4 py-3 text-xs text-slate-500 whitespace-nowrap">
                    <div className="flex items-center gap-1"><Clock className="h-3 w-3" /> {inc.time}</div>
                  </td>
                  <td className="px-4 py-3 font-semibold text-slate-200">{inc.action}</td>
                  <td className="px-4 py-3">
                    <span className={`pill ${inc.status === 'REPORTED' ? 'pill-low' : inc.status === 'PENDING' ? 'pill-medium' : 'pill-neutral'}`}>
                      {inc.status === 'REPORTED' && <CheckCircle className="h-3 w-3" />}
                      {inc.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleExport(inc.id, 'json')}
                        disabled={exporting === `${inc.id}-json`}
                        className="rounded-lg border border-slate-700 bg-slate-800 px-2 py-1 text-xs text-slate-300 hover:border-indigo-500 hover:text-indigo-300 transition-colors"
                      >JSON</button>
                      <button
                        onClick={() => handleExport(inc.id, 'csv')}
                        disabled={exporting === `${inc.id}-csv`}
                        className="rounded-lg border border-slate-700 bg-slate-800 px-2 py-1 text-xs text-slate-300 hover:border-emerald-500 hover:text-emerald-300 transition-colors"
                      >CSV</button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Compliance note */}
      <div className="flex items-start gap-3 rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
        <AlertTriangle className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
        <div>
          <div className="text-sm font-semibold text-amber-300">RBI Compliance Notice</div>
          <div className="mt-1 text-xs text-slate-400">All Critical and High incidents are automatically logged per RBI Circular RBI/2020-21/16. Fraud incidents exceeding ₹1L must be reported to FIU within 24 hours of detection.</div>
        </div>
      </div>
    </div>
  );
}
