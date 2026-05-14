import React from 'react'
import { motion } from 'framer-motion'

export default function LoadingSpinner({ size = 'md' }) {
  const s = { sm: 'w-4 h-4', md: 'w-7 h-7', lg: 'w-10 h-10' }
  return (
    <div className="flex items-center justify-center">
      <motion.div
        className={`${s[size]} border-2 border-sky-100 border-t-sky-400 rounded-full`}
        animate={{ rotate: 360 }}
        transition={{ duration: 0.75, repeat: Infinity, ease: 'linear' }}
      />
    </div>
  )
}

export function PageLoader() {
  return (
    <div className="flex items-center justify-center h-full min-h-[320px]">
      <div className="text-center">
        <LoadingSpinner size="lg" />
        <p className="mt-3 text-sm text-gray-400">Loading...</p>
      </div>
    </div>
  )
}

export function SkeletonCard({ rows = 3 }) {
  return (
    <div className="glass-card p-5 space-y-3">
      <div className="skeleton h-4 w-1/3" />
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="skeleton h-3 w-full" />
      ))}
    </div>
  )
}
