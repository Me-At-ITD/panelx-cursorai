
export default {
  content: [
  './index.html',
  './src/**/*.{js,ts,jsx,tsx}'
],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: '#004a64',
        accent: '#2E86AB',
        'page-bg': 'var(--bg-page)',
        'card-bg': 'var(--bg-card)',
        'subtle-bg': 'var(--bg-subtle)',
        'section-bg': 'var(--bg-section)',
        'text-primary': 'var(--text-primary)',
        'text-secondary': 'var(--text-secondary)',
        'text-placeholder': 'var(--text-placeholder)',
        border: 'var(--border)',
        sidebar: 'var(--sidebar)',
        'stat-users': '#2E86AB',
        'stat-projects': '#7C3AED',
        'stat-syncs': '#059669',
        'stat-alerts': '#DC2626',
        'status-installed': '#16A34A',
        'status-installed-bg': 'rgba(22,163,74,0.1)',
        'status-installed-text': '#15803D',
        'status-pending': '#D97706',
        'status-pending-bg': 'rgba(217,119,6,0.1)',
        'status-pending-text': '#B45309',
        'status-problem': '#DC2626',
        'status-problem-bg': 'rgba(220,38,38,0.1)',
        'status-problem-text': '#B91C1C',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        heading: ['"Space Grotesk"', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
