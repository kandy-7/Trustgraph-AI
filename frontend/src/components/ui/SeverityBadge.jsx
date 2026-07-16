import React from 'react';

const MAP = {
  CRITICAL: 'pill-critical',
  HIGH: 'pill-high',
  MEDIUM: 'pill-medium',
  LOW: 'pill-low',
  INFO: 'pill-info',
};

/** Small severity chip. Accepts CRITICAL | HIGH | MEDIUM | LOW | INFO. */
export default function SeverityBadge({ level = 'LOW', children }) {
  const cls = MAP[String(level).toUpperCase()] || 'pill-neutral';
  return <span className={cls}>{children || level}</span>;
}
