/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#1a1c24', // Main page background
        surface: '#252832', // Cards, Sidebar, Element backgrounds
        'surface-hover': '#2d303b', // Interactive elements (hover state)
        border: '#3a3d4a', // Borders, Separators
        primary: '#ffffff', // Primary Text (White)
        secondary: '#9ca3af', // Secondary Text (Gray)
        accent: '#9333ea', // Highlights, Buttons (Purple)

        // Extended Palette (Status & Alerts)
        purple: {
          500: '#9333ea',
          600: '#7c3aed',
        },
        blue: {
          50: '#eff6ff',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
        },
        emerald: {
          50: '#ecfdf5',
          100: '#d1fae5',
          600: '#059669',
          700: '#047857',
        },
        rose: {
          100: '#ffe4e6',
          500: '#f43f5e',
          700: '#be123c',
        },
        orange: {
          100: '#ffedd5',
          200: '#fed7aa',
          800: '#9a3412',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
  darkMode: 'class',
}
