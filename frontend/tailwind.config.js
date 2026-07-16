/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Core surface palette (deep space navy)
        ink: {
          950: '#060912',
          900: '#0a0f1e',
          850: '#0e1424',
          800: '#131a2e',
          700: '#1b2440',
        },
        brand: {
          cyan: '#22d3ee',
          primary: '#6366f1',
          violet: '#8b5cf6',
          light: '#a5b4fc',
        },
        risk: {
          critical: '#f43f5e',
          high: '#fb7185',
          medium: '#f59e0b',
          low: '#10b981',
          none: '#64748b',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      boxShadow: {
        card: '0 1px 2px 0 rgba(15,23,42,0.04), 0 8px 24px -12px rgba(15,23,42,0.12)',
        'card-hover': '0 2px 4px 0 rgba(15,23,42,0.05), 0 16px 40px -16px rgba(15,23,42,0.22)',
        glow: '0 6px 18px -6px rgba(99,102,241,0.45)',
        'glow-red': '0 0 0 1px rgba(244,63,94,0.25), 0 10px 28px -10px rgba(244,63,94,0.4)',
        'glow-cyan': '0 6px 18px -6px rgba(56,189,248,0.4)',
      },
      backgroundImage: {
        'accent-gradient': 'linear-gradient(135deg, #38bdf8 0%, #6366f1 55%, #8b5cf6 100%)',
        'grid-faint':
          'linear-gradient(rgba(15,23,42,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(15,23,42,0.04) 1px, transparent 1px)',
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': { opacity: '1', boxShadow: '0 0 0 0 rgba(244,63,94,0.5)' },
          '50%': { opacity: '0.85', boxShadow: '0 0 0 8px rgba(244,63,94,0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        'fade-in': {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-in': {
          from: { opacity: '0', transform: 'translateX(-14px)' },
          to: { opacity: '1', transform: 'translateX(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
        scan: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(400%)' },
        },
      },
      animation: {
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        float: 'float 4s ease-in-out infinite',
        'fade-in': 'fade-in 0.4s ease-out both',
        'slide-in': 'slide-in 0.3s ease-out both',
        shimmer: 'shimmer 1.8s infinite',
        scan: 'scan 3s linear infinite',
      },
    },
  },
  plugins: [],
}
