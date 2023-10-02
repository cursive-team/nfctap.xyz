/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    fontFamily: {
      helvetica: ['"Helvetica Neue"', 'sans-serif'],
      courier: ['var(--font-courier-prime)', 'sans-serif'],
    },
    extend: {
      colors: {
        'snow-flurry': {
          200: 'var(--snow-flurry-200)'
        },
        woodsmoke: {
          100: 'var(--woodsmoke-100)',
          400: 'var(--woodsmoke-400)',
          700: 'var(--woodsmoke-700)',
          800: 'var(--woodsmoke-800)',
          900: 'var(--woodsmoke-900)',
          950: 'var(--woodsmoke-950)',
        }
      }
    },
  },
  plugins: [],
};
