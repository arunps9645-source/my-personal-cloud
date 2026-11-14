/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          950: '#050816',
          900: '#080d1f',
          800: '#0d1429',
          700: '#131c38',
          600: '#1b2647',
        },
        accent: { blue: '#4f8cff', violet: '#8b5cf6', cyan: '#22d3ee' },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['"Space Grotesk"', 'Inter', 'ui-sans-serif', 'sans-serif'],
      },
      boxShadow: {
        glow: '0 0 0 1px rgba(99,140,255,.25), 0 8px 40px -8px rgba(99,102,241,.45)',
      },
    },
  },
  plugins: [],
}
