import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import TopBar from './components/TopBar'
import LiveEventStream from './components/LiveEventStream'
import DemoPanel from './components/DemoPanel'
import Overview from './pages/Overview'
import ThreatIntelligence from './pages/ThreatIntelligence'
import Customer360 from './pages/Customer360'
import Investigations from './pages/Investigations'
import NetworkIntelligence from './pages/NetworkIntelligence'
import SOCCopilot from './pages/SOCCopilot'
import Reports from './pages/Reports'

function App() {
  return (
    <Router>
      <div className="flex h-screen bg-slate-900 text-slate-100 overflow-hidden font-sans">
        <Sidebar />
        
        <div className="flex-1 flex flex-col overflow-hidden min-w-0">
          <TopBar />
          
          <div className="flex-1 flex overflow-hidden">
            <main className="flex-1 overflow-y-auto p-6 bg-slate-950">
              <Routes>
                <Route path="/" element={<Navigate to="/overview" replace />} />
                <Route path="/overview" element={<Overview />} />
                <Route path="/threat-intelligence" element={<ThreatIntelligence />} />
                <Route path="/customer-360" element={<Customer360 />} />
                <Route path="/investigations" element={<Investigations />} />
                <Route path="/network-intelligence" element={<NetworkIntelligence />} />
                <Route path="/soc-copilot" element={<SOCCopilot />} />
                <Route path="/reports" element={<Reports />} />
              </Routes>
            </main>
            
            {/* The right-docked Live Event Stream */}
            <LiveEventStream />
          </div>
        </div>
        
        <DemoPanel />
      </div>
    </Router>
  )
}

export default App
