import React from 'react';
import { FileText, Download, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

const REPORTS = [
  { id: 'RPT-2026-07-16-1', name: 'Daily Threat Summary', type: 'System', date: 'Today, 08:00 AM', status: 'Ready' },
  { id: 'RPT-2026-07-16-2', name: 'Incident: CASE-10293', type: 'Incident', date: 'Today, 09:42 AM', status: 'Ready' },
  { id: 'RPT-2026-07-15-1', name: 'Weekly Fraud Trends', type: 'Analytics', date: 'Yesterday, 18:00 PM', status: 'Archived' },
  { id: 'RPT-2026-07-14-1', name: 'Compliance RBI Audit', type: 'Compliance', date: 'Jul 14, 2026', status: 'Archived' },
];

export default function Reports() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center">
          <FileText className="w-8 h-8 text-indigo-400 mr-3" />
          Reports Archive
        </h1>
        <div className="text-sm text-slate-400">Exportable Incident & Compliance Reports</div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <table className="w-full text-left text-sm text-slate-300">
          <thead className="bg-slate-950 border-b border-slate-800 text-slate-400">
            <tr>
              <th className="px-6 py-4 font-medium">Report ID</th>
              <th className="px-6 py-4 font-medium">Name</th>
              <th className="px-6 py-4 font-medium">Type</th>
              <th className="px-6 py-4 font-medium">Generated</th>
              <th className="px-6 py-4 font-medium">Status</th>
              <th className="px-6 py-4 font-medium text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {REPORTS.map((rpt, idx) => (
              <motion.tr 
                key={rpt.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="hover:bg-slate-800/50 transition-colors"
              >
                <td className="px-6 py-4 font-mono text-xs">{rpt.id}</td>
                <td className="px-6 py-4 font-medium text-white">{rpt.name}</td>
                <td className="px-6 py-4">
                  <span className="bg-slate-800 text-slate-300 px-2 py-1 rounded text-xs">{rpt.type}</span>
                </td>
                <td className="px-6 py-4 flex items-center"><Clock className="w-4 h-4 mr-2 text-slate-500"/> {rpt.date}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${
                    rpt.status === 'Ready' ? 'bg-emerald-950 text-emerald-400' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {rpt.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button className="text-indigo-400 hover:text-indigo-300 transition-colors p-2 hover:bg-slate-800 rounded-lg">
                    <Download className="w-4 h-4" />
                  </button>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
