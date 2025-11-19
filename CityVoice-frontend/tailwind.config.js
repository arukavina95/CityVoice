/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // <-- OVO JE BITNO
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'Plus Jakarta Sans', 'ui-sans-serif', 'system-ui'],
        display: ['Plus Jakarta Sans', 'Inter', 'ui-sans-serif', 'system-ui'],
      },
      colors: {
        'cv-primary': '#2563eb',
        'cv-primary-dark': '#1d4ed8',
        'cv-secondary': '#1f2937',
        'cv-muted': '#64748b',
        'cv-surface': '#ffffff',
        'cv-surface-alt': '#f8fafc',
      },
      boxShadow: {
        'soft-xl': '0 25px 50px -12px rgba(15, 23, 42, 0.18)',
        'brand': '0 20px 45px -20px rgba(37, 99, 235, 0.45)',
      },
      borderRadius: {
        '3xl': '1.75rem',
      },
      backgroundImage: {
        'cv-gradient': 'linear-gradient(135deg, rgba(37,99,235,0.18) 0%, rgba(14,116,144,0.14) 35%, rgba(15,23,42,0.75) 100%)',
      },
    },
  },
  plugins: [],
}

