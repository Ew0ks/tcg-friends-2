/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      scale: {
        '55': '0.55',
      },
      colors: {
        'game-dark': '#1e1b2c',
        'game-light': '#2a2639',
        'game-accent': '#9f7aea',
        'game-text': '#f7fafc',
        'game-muted': '#a0aec0',
        'game-success': '#48bb78',
      },
      animation: {
        'shine': 'shine 2s linear infinite',
      },
      keyframes: {
        shine: {
          '0%': { filter: 'brightness(1)' },
          '50%': { filter: 'brightness(1.2)' },
          '100%': { filter: 'brightness(1)' },
        },
      },
    },
  },
  plugins: [],
} 