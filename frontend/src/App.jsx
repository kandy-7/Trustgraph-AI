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
      <div className="flex h-screen overflow-hidden font-sans text-slate-700">
        <Sidebar />

        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <TopBar />

          <div className="flex flex-1 overflow-hidden">
            <main className="relative flex-1 overflow-y-auto">
              {/* faint grid overlay tying the workspace together */}
              <div className="pointer-events-none absolute inset-0 bg-grid-faint opacity-60 [background-size:40px_40px]" />
              <div className="relative p-6 lg:p-8">
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
              </div>
            </main>

            {/* Right-docked Live Event Stream */}
            <LiveEventStream />
          </div>
        </div>

        <DemoPanel />
      </div>
    </Router>
  )
}

export default App
