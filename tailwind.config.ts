import type { Config } from "tailwindcss";

export default {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        'game-dark': '#1a1b26',
        'game-light': '#24283b',
        'game-accent': '#7aa2f7',
        'game-success': '#9ece6a',
        'game-error': '#f7768e',
        'game-text': '#c0caf5',
        'game-muted': '#565f89',
      },
    },
  },
  plugins: [],
} satisfies Config;
