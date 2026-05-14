import React from 'react'
import { ShieldCheck } from 'lucide-react'

// Navbar is a thin top strip used in standalone views (not in the main layout).
export default function Navbar() {
  return (
    <nav className="h-14 bg-white border-b border-gray-100 flex items-center px-6 gap-3">
      <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-sky-400 to-sky-600 flex items-center justify-center">
        <ShieldCheck size={16} className="text-white" />
      </div>
      <span className="text-sm font-bold text-gray-800">TrustGraph AI</span>
    </nav>
  )
}
