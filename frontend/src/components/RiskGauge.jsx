import React from 'react'
import { getRiskLabel, getRiskColor, getRiskBgColor } from '../utils/riskColor'

export default function RiskGauge({ score = 0, size = 160 }) {
  const radius = (size - 24) / 2
  const cx = size / 2
  const cy = size / 2
  const startAngle = -210
  const endAngle = 30
  const totalAngle = endAngle - startAngle
  const scoreAngle = startAngle + (score / 100) * totalAngle

  const toRad = (deg) => (deg * Math.PI) / 180
  const getPoint = (angle, r) => ({
    x: cx + r * Math.cos(toRad(angle)),
    y: cy + r * Math.sin(toRad(angle)),
  })

  const arcPath = (start, end, r) => {
    const s = getPoint(start, r)
    const e = getPoint(end, r)
    const large = end - start > 180 ? 1 : 0
    return `M ${s.x} ${s.y} A ${r} ${r} 0 ${large} 1 ${e.x} ${e.y}`
  }

  const needleEnd = getPoint(scoreAngle, radius - 10)
  const color = getRiskColor(score)
  const bg = getRiskBgColor(score)

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size * 0.7 + 20 }}>
        <svg width={size} height={size} className="overflow-visible">
          {/* Background arc */}
          <path d={arcPath(startAngle, endAngle, radius)} fill="none" stroke="#E5E7EB" strokeWidth="10" strokeLinecap="round" />
          {/* Score arc */}
          {score > 0 && (
            <path d={arcPath(startAngle, scoreAngle, radius)} fill="none" stroke={color} strokeWidth="10" strokeLinecap="round" />
          )}
          {/* Needle */}
          <line x1={cx} y1={cy} x2={needleEnd.x} y2={needleEnd.y} stroke={color} strokeWidth="2.5" strokeLinecap="round" />
          <circle cx={cx} cy={cy} r="5" fill={color} />
          {/* Score text */}
          <text x={cx} y={cy + 28} textAnchor="middle" fontSize="22" fontWeight="700" fill={color} fontFamily="Inter">{score}</text>
          <text x={cx} y={cy + 44} textAnchor="middle" fontSize="10" fill="#9CA3AF" fontFamily="Inter">Risk Score</text>
        </svg>
      </div>
      <div
        className="mt-1 px-4 py-1 rounded-full text-sm font-semibold"
        style={{ background: bg, color }}
      >
        {getRiskLabel(score)} Risk
      </div>
    </div>
  )
}
