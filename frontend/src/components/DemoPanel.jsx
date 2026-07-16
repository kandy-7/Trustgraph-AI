import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { Play, Settings2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function DemoPanel() {
  const { runSimulation } = useAppContext();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedMode, setSelectedMode] = useState('Account Takeover');

  const modes = [
    'Normal Customer',
    'Account Takeover',
    'SIM Swap',
    'Credential Stuffing',
    'Money Laundering',
    'UPI Fraud'
  ];

  return (
    <div className="fixed bottom-6 right-80 mr-6 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute bottom-14 right-0 w-64 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl overflow-hidden"
          >
            <div className="p-3 bg-slate-900 border-b border-slate-700">
              <h4 className="text-sm font-semibold text-white">Demo Mode</h4>
            </div>
            <div className="p-3">
              <label className="block text-xs font-medium text-slate-400 mb-2">Simulate Attack</label>
              <select 
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-sm text-white focus:ring-1 focus:ring-indigo-500 mb-4 outline-none"
                value={selectedMode}
                onChange={(e) => setSelectedMode(e.target.value)}
              >
                {modes.map(mode => (
                  <option key={mode} value={mode}>{mode}</option>
                ))}
              </select>
              <button 
                onClick={() => {
                  runSimulation(selectedMode);
                  setIsOpen(false);
                }}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-lg flex items-center justify-center transition-colors text-sm"
              >
                <Play className="w-4 h-4 mr-2" fill="currentColor" />
                Run Simulation
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-12 h-12 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full flex items-center justify-center shadow-lg transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-slate-900"
      >
        <Settings2 className="w-6 h-6" />
      </button>
    </div>
  );
}
