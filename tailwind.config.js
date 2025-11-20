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
        background: '#0F1115', // Very dark, almost black
        surface: '#161920',    // Slightly lighter for sidebars/cards
        'surface-hover': '#1C1F26',
        border: '#242730',     // Subtle border
        primary: '#5E6AD2',    // Linear-like accent (optional usage)
        secondary: '#8A8F98',  // Text secondary
        success: '#22C55E',    // Keep emerald for kills but standardizing
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
  darkMode: 'class',
}
