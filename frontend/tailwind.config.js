/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'brand': 'var(--bg-base)',
        'surface': 'var(--bg-surface)',
        'elevated': 'var(--bg-elevated)',
        'card': 'var(--bg-card)',
        'gold': 'var(--gold)',
        'gold-dim': 'var(--gold-dim)',
      },
    },
  },
  plugins: [],
}
