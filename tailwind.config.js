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
        'game-dark': '#2E222F',
        'game-light': '#3E323F',
        'game-accent': '#A855F7',
        'game-text': '#E2E8F0',
        'game-muted': '#94A3B8',
        'game-success': '#10B981',
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