import React from 'react';

/**
 * Frosted-glass surface used across the app.
 * Props:
 *  - hover:  add hover elevation
 *  - glow:   'none' | 'red' | 'indigo' | 'cyan'
 *  - as:     element/component override (default 'div')
 */
export default function Panel({ children, className = '', hover = false, glow = 'none', as: Tag = 'div', ...rest }) {
  const glowClass =
    glow === 'red' ? 'shadow-glow-red border-rose-500/40'
    : glow === 'indigo' ? 'shadow-glow'
    : glow === 'cyan' ? 'shadow-glow-cyan'
    : '';

  return (
    <Tag
      className={`panel panel-top ${hover ? 'panel-hover' : ''} ${glowClass} ${className}`}
      {...rest}
    >
      {children}
    </Tag>
  );
}
