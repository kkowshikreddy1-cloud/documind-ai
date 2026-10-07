/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        parchment: {
          50: '#fdfbf7',
          100: '#f8f4ec',
          200: '#f0e8d9',
          300: '#e5d7c0',
          400: '#d5c0a0',
          500: '#be9f76',
          600: '#a78458',
          700: '#8c6b44',
          800: '#715539',
          900: '#5c4530',
        },
        vedic: {
          saffron: '#d97706',
          gold: '#d4af37',
          goldLight: '#f59e0b',
          crimson: '#991b1b',
          terracotta: '#c2410c',
          indigo: '#1e1b4b',
          slate: '#0f172a',
          teal: '#115e59',
          amber: '#b45309',
        }
      },
      fontFamily: {
        serif: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        display: ['"Cinzel"', 'Georgia', 'serif'],
        sanskrit: ['"Noto Serif Devanagari"', '"Cormorant Garamond"', 'serif'],
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'warm': '0 4px 20px -2px rgba(138, 92, 42, 0.12)',
        'vedic': '0 10px 30px -4px rgba(180, 83, 9, 0.15)',
        'subtle': '0 2px 10px 0 rgba(0, 0, 0, 0.05)',
      }
    },
  },
  plugins: [],
}
