/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        finance: {
          green: '#10b981', // emerald-500
          'green-light': '#34d399',
          'green-dark': '#047857',
          'green-bg': 'rgba(16, 185, 129, 0.12)',
          red: '#ef4444', // red-500
          'red-light': '#f87171',
          'red-dark': '#b91c1c',
          'red-bg': 'rgba(239, 68, 68, 0.12)',
          surface: '#111827', // gray-900
          card: '#1f2937', // gray-800
          border: '#374151', // gray-700
          text: '#f9fafb', // gray-50
          muted: '#9ca3af', // gray-400
        }
      }
    },
  },
  plugins: [],
}
