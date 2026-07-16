import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

/**
 * CountUp — animates from 0 to a target number
 * Supports prefix (₹) and suffix (L, %, s)
 */
export default function CountUp({ to, prefix = '', suffix = '', decimals = 0, duration = 1.5 }) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const start = performance.now();
    const from = 0;
    const target = parseFloat(to) || 0;

    const tick = (now) => {
      const elapsed = (now - start) / 1000;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(from + (target - from) * eased);
      if (progress < 1) requestAnimationFrame(tick);
    };

    requestAnimationFrame(tick);
  }, [to, duration]);

  return (
    <span>
      {prefix}{decimals > 0 ? display.toFixed(decimals) : Math.round(display).toLocaleString()}{suffix}
    </span>
  );
}
