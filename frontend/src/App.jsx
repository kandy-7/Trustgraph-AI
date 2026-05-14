import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import TopBar from './components/TopBar'
import Dashboard from './pages/Dashboard'
import LiveMonitoring from './pages/LiveMonitoring'
import FraudAnalysis from './pages/FraudAnalysis'
import GraphAnalysis from './pages/GraphAnalysis'
import OfficerPanel from './pages/OfficerPanel'
import FraudSimulator from './pages/FraudSimulator'

function App() {
  return (
    <Router>
      <div className="flex h-screen bg-surface-50 overflow-hidden">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden min-w-0">
          <TopBar />
          <main className="flex-1 overflow-y-auto p-6">
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/live-monitoring" element={<LiveMonitoring />} />
              <Route path="/fraud-analysis" element={<FraudAnalysis />} />
              <Route path="/graph-analysis" element={<GraphAnalysis />} />
              <Route path="/officer-panel" element={<OfficerPanel />} />
              <Route path="/fraud-simulator" element={<FraudSimulator />} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  )
}

export default App
