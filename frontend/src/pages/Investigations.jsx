import React from 'react';
import { useAppContext } from '../context/AppContext';
import { ShieldAlert, Fingerprint, Map, User, Download, CheckCircle, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

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
      { time: '14:22', type: 'BENEFICIARY_ADDED', msg: 'New UPI Handle Added', severity: 'MEDIUM' }
    ]
  };

  const handleGeneratePDF = async () => {
    const input = document.getElementById('report-content');
    if (!input) return;
    
    // Slight delay to ensure rendering
    const canvas = await html2canvas(input, {
      scale: 2,
      backgroundColor: '#0f172a',
    });
    
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(`Incident_Report_${caseData.id}.pdf`);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto" id="report-content">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Investigation: {caseData.id}</h1>
          <div className="text-sm text-slate-400 mt-1">Customer: {caseData.customer}</div>
        </div>
        <div className="flex gap-3">
          <button className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center transition-colors">
            <CheckCircle className="w-4 h-4 mr-2" /> Resolve Case
          </button>
          <button onClick={handleGeneratePDF} className="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center transition-colors">
            <Download className="w-4 h-4 mr-2" /> Generate Report
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Summary & Evidence */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Summary Box */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 relative overflow-hidden">
            <div className={`absolute left-0 top-0 bottom-0 w-2 ${caseData.riskScore > 90 ? 'bg-red-500' : 'bg-orange-500'}`}></div>
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Incident Summary</h3>
                <div className="flex flex-wrap gap-4 mt-4">
                  <div>
                    <div className="text-xs text-slate-500 mb-1">Threat Type</div>
                    <div className="text-sm font-semibold text-white">{caseData.threat}</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 mb-1">Attack Stage</div>
                    <div className="text-sm font-semibold text-orange-400">{caseData.stage}</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 mb-1">AI Confidence</div>
                    <div className="text-sm font-semibold text-indigo-400">{caseData.confidence}%</div>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-slate-500 mb-1">Risk Score</div>
                <div className={`text-4xl font-bold ${caseData.riskScore > 90 ? 'text-red-500' : 'text-orange-500'}`}>
                  {caseData.riskScore}
                </div>
              </div>
            </div>
          </div>

          {/* AI Analysis (Explainability) */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">AI Explainability</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-300">Impossible Travel / Location Anomaly</span>
                  <span className="text-red-400">45% impact</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2"><div className="bg-red-500 h-2 rounded-full w-[45%]"></div></div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-300">Device Fingerprint Mismatch</span>
                  <span className="text-orange-400">30% impact</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2"><div className="bg-orange-500 h-2 rounded-full w-[30%]"></div></div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-300">Velocity & Amount Drift</span>
                  <span className="text-yellow-400">25% impact</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2"><div className="bg-yellow-500 h-2 rounded-full w-[25%]"></div></div>
              </div>
            </div>
          </div>

          {/* Evidence */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Digital Evidence</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-800/50 p-4 rounded-lg">
                <Map className="w-5 h-5 text-indigo-400 mb-2" />
                <div className="text-sm font-medium text-white">IP: 185.15.42.100</div>
                <div className="text-xs text-slate-400 mt-1">London, UK (VPN Node)</div>
              </div>
              <div className="bg-slate-800/50 p-4 rounded-lg">
                <Fingerprint className="w-5 h-5 text-indigo-400 mb-2" />
                <div className="text-sm font-medium text-white">Device: Emulator</div>
                <div className="text-xs text-slate-400 mt-1">Android 11 (f8a9223f)</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Timeline */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-6">Threat Story Reconstruction</h3>
          <div className="relative border-l-2 border-slate-700 ml-3 space-y-8">
            {caseData.timeline.map((event, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.2 }}
                className="relative pl-6"
              >
                <div className={`absolute -left-[9px] top-1 w-4 h-4 rounded-full border-2 border-slate-900 ${
                  event.severity === 'CRITICAL' ? 'bg-red-500' :
                  event.severity === 'HIGH' ? 'bg-orange-500' :
                  'bg-indigo-500'
                }`}></div>
                <div className="text-xs text-slate-500 font-mono mb-1">{event.time}</div>
                <div className="text-sm font-semibold text-white">{event.type}</div>
                <div className="text-sm text-slate-400 mt-1">{event.msg}</div>
                {event.status === 'BLOCKED' && (
                  <div className="mt-2 inline-block px-2 py-1 bg-red-950/50 text-red-400 text-xs font-bold rounded border border-red-900/50 uppercase">
                    Action: BLOCKED
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
