/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        'dark-bg': '#151116', // THE SINGLE SOURCE OF TRUTH
        'dark-card': '#2a232d', // Consistent Glassy Background
        'dark-border': 'rgba(174, 160, 248, 0.15)',
        'dark-text': '#EAE0F8',
        'dark-text-secondary': '#A998BC',
        'light-bg': '#F5F5F5', 
        'light-card': '#FFFFFF', 
        'light-border': '#E5E7EB',
        'light-text': '#111827', 
        'light-text-secondary': '#6B7280',
        'accent-primary': '#EE7200', 
        'accent-secondary': '#FE5000', 
        'accent-cyan': '#00FFFF',
        'accent-green': '#10B981', 
        'accent-red': '#F43F5E',
        // Added new light mode chart colors
        'light-chart-1': '#360269',
        'light-chart-2': '#C51383',
      },
      fontFamily: { sans: ['Inter', 'system-ui', 'sans-serif'], mono: ['Fira Code', 'monospace'] },
      boxShadow: { 'glow-cyan': '0 0 25px 3px rgba(0, 255, 255, 0.25)' },
      saturate: { 150: '1.5' },
      animation: { 'fade-in-up': 'fadeInUp 0.5s ease-out forwards' },
      keyframes: { fadeInUp: { '0%': { opacity: 0, transform: 'translateY(20px)' }, '100%': { opacity: 1, transform: 'translateY(0)' } } },
    },
  },
  plugins: [],
};
