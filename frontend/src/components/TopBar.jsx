import React, { useState, useEffect } from 'react';
import { Search, Bell, User, Clock } from 'lucide-react';

export default function TopBar() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="h-16 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-6 z-10">
      
      {/* Global Search */}
      <div className="flex-1 max-w-xl">
        <div className="relative group">
          <Search className="w-5 h-5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 group-focus-within:text-indigo-400 transition-colors" />
          <input 
            type="text" 
            placeholder="Search User, Account, Device, Transaction, IP, Case..." 
            className="w-full bg-slate-950/50 border border-slate-800 text-slate-300 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all placeholder:text-slate-600"
          />
        </div>
      </div>

      <div className="flex items-center space-x-6">
        {/* Time */}
        <div className="flex items-center text-slate-400 text-sm">
          <Clock className="w-4 h-4 mr-2" />
          {time.toLocaleTimeString()}
        </div>

        {/* Notifications */}
        <div className="relative">
          <button className="p-2 text-slate-400 hover:text-white transition-colors relative">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
          </button>
        </div>

        {/* Analyst Profile */}
        <div className="flex items-center pl-6 border-l border-slate-800">
          <div className="flex flex-col items-end mr-3">
            <span className="text-sm font-medium text-white">Analyst</span>
            <span className="text-xs text-slate-500">SOC Tier 2</span>
          </div>
          <div className="w-9 h-9 rounded-full bg-indigo-600 flex items-center justify-center text-white font-semibold">
            JD
          </div>
        </div>
      </div>
    </div>
  );
}
