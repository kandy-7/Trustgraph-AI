import React from 'react';
import { FileText, Download, Clock, ShieldCheck, BarChart3, FileWarning } from 'lucide-react';
import { motion } from 'framer-motion';
import PageHeader from '../components/ui/PageHeader';
import Panel from '../components/ui/Panel';

const TYPE_META = {
  System: { icon: ShieldCheck, tone: 'text-cyan-700 bg-cyan-50 border-cyan-200' },
  Incident: { icon: FileWarning, tone: 'text-rose-700 bg-rose-50 border-rose-200' },
  Analytics: { icon: BarChart3, tone: 'text-violet-700 bg-violet-50 border-violet-200' },
  Compliance: { icon: FileText, tone: 'text-amber-700 bg-amber-50 border-amber-200' },
};

const REPORTS = [
  { id: 'RPT-2026-07-16-1', name: 'Daily Threat Summary', type: 'System', date: 'Today, 08:00 AM', status: 'Ready' },
  { id: 'RPT-2026-07-16-2', name: 'Incident: CASE-10293', type: 'Incident', date: 'Today, 09:42 AM', status: 'Ready' },
  { id: 'RPT-2026-07-15-1', name: 'Weekly Fraud Trends', type: 'Analytics', date: 'Yesterday, 18:00 PM', status: 'Archived' },
  { id: 'RPT-2026-07-14-1', name: 'Compliance RBI Audit', type: 'Compliance', date: 'Jul 14, 2026', status: 'Archived' },
];

export default function Reports() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Compliance & Incident"
        title="Reports Archive"
        icon={FileText}
        subtitle="Exportable incident, analytics, and RBI compliance reports"
      />

      <Panel className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-400">
              <tr>
                <th className="px-6 py-4 font-medium">Report ID</th>
                <th className="px-6 py-4 font-medium">Name</th>
                <th className="px-6 py-4 font-medium">Type</th>
                <th className="px-6 py-4 font-medium">Generated</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 text-right font-medium">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {REPORTS.map((rpt, idx) => {
                const meta = TYPE_META[rpt.type] || TYPE_META.System;
                const Icon = meta.icon;
                return (
                  <motion.tr
                    key={rpt.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.08 }}
                    className="transition-colors hover:bg-slate-50"
                  >
                    <td className="px-6 py-4 font-mono text-xs text-slate-400">{rpt.id}</td>
                    <td className="px-6 py-4 font-medium text-slate-900">{rpt.name}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-medium ${meta.tone}`}>
                        <Icon className="h-3.5 w-3.5" /> {rpt.type}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-2 text-slate-500">
                        <Clock className="h-4 w-4 text-slate-400" /> {rpt.date}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={rpt.status === 'Ready' ? 'pill-low' : 'pill-neutral'}>{rpt.status}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="inline-grid h-9 w-9 place-items-center rounded-lg text-indigo-600 transition-colors hover:bg-indigo-50">
                        <Download className="h-4 w-4" />
                      </button>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
}
