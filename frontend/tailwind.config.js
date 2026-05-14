/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: { primary: '#38BDF8', secondary: '#0EA5E9', light: '#E0F2FE' },
        surface: { DEFAULT: '#FFFFFF', 50: '#F8FAFC', 100: '#F3F4F6' },
        risk: { high: '#EF4444', medium: '#F59E0B', low: '#10B981', none: '#6B7280' },
      },
      fontFamily: { sans: ['Inter', 'system-ui', 'sans-serif'] },
      boxShadow: {
        card: '0 1px 3px 0 rgba(0,0,0,0.05), 0 1px 2px -1px rgba(0,0,0,0.05)',
        'card-hover': '0 4px 6px -1px rgba(0,0,0,0.07), 0 2px 4px -2px rgba(0,0,0,0.07)',
      },
    },
  },
  plugins: [],
}
