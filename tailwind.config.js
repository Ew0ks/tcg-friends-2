/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}",
    "./src/context/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'game-dark': '#1a1b26',
        'game-light': '#24283b',
        'game-accent': '#7aa2f7',
        'game-success': '#9ece6a',
        'game-error': '#f7768e',
        'game-text': '#c0caf5',
        'game-muted': '#565f89',
      },
      boxShadow: {
        'game': '0 0 15px rgba(122, 162, 247, 0.3)',
      },
    },
  },
  plugins: [],
}

