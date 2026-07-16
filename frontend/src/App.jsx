import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';
import ThreatBanner from './components/ThreatBanner';
import LiveEventStream from './components/LiveEventStream';
import DemoPanel from './components/DemoPanel';
import ToastNotifications from './components/ToastNotifications';
import { AppProvider } from './context/AppContext';

// Pages — lazy loaded for speed
const Overview = lazy(() => import('./pages/Overview'));
const ThreatIntelligence = lazy(() => import('./pages/ThreatIntelligence'));
const Customer360 = lazy(() => import('./pages/Customer360'));
const Investigations = lazy(() => import('./pages/Investigations'));
const NetworkIntelligence = lazy(() => import('./pages/NetworkIntelligence'));
const SOCCopilot = lazy(() => import('./pages/SOCCopilot'));
const Reports = lazy(() => import('./pages/Reports'));

function PageLoader() {
  return (
    <div className="flex h-full items-center justify-center">
      <div className="flex gap-1.5">
        {[0, 1, 2].map(i => (
          <span key={i} className="h-2 w-2 animate-bounce rounded-full bg-indigo-500"
            style={{ animationDelay: `${i * 0.15}s` }} />
        ))}
      </div>
    </div>
  );
}

function App() {
  return (
    <AppProvider>
      <Router>
        <div className="flex h-screen overflow-hidden bg-slate-950 font-sans text-slate-200">
          <Sidebar />

          <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
            <TopBar />
            <ThreatBanner />

            <div className="flex flex-1 overflow-hidden">
              <main className="relative flex-1 overflow-y-auto">
                {/* Subtle grid overlay */}
                <div className="pointer-events-none absolute inset-0 opacity-[0.03]"
                  style={{ backgroundImage: 'linear-gradient(rgba(99,102,241,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.5) 1px, transparent 1px)', backgroundSize: '40px 40px' }}
                />
                <div className="relative p-6 lg:p-8">
                  <Suspense fallback={<PageLoader />}>
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
                  </Suspense>
                </div>
              </main>

              {/* Right-docked Live Event Stream */}
              <LiveEventStream />
            </div>
          </div>

          <DemoPanel />
          <ToastNotifications />
        </div>
      </Router>
    </AppProvider>
  );
}

export default App;
