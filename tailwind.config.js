/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Cream surfaces (pazhaya "ink" dark scale ippo cream aanu)
        ink: {
          950: '#f6f0e6', // page background
          900: '#fbf7f0', // light surface
          800: '#ffffff', // cards
          700: '#efe7d9',
          600: '#e4d9c7',
        },
        // Main text colour (warm black)
        fg: '#1a1410',
        // Pazhaya component-ukal "text-white", "bg-white/5", "border-white/10"
        // upayogikkunnundenkil ath ippo warm black aayi varum (light theme-il shariyaakum)
        white: '#1a1410',
        // Orange / amber accent (pazhaya blue/violet/cyan names kept)
        accent: { blue: '#f97316', violet: '#f59e0b', cyan: '#ea580c' },
        // Slate scale light theme-inu vendi thirichittu (text-slate-200 = dark text)
        slate: {
          50: '#1a1410',
          100: '#1f1812',
          200: '#2b221a',
          300: '#3e3328',
          400: '#5e5143',
          500: '#80705f',
          600: '#a39482',
          700: '#c9bcaa',
          800: '#e2d8c7',
          900: '#eee6d8',
          950: '#f6f0e6',
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['"Space Grotesk"', 'Inter', 'ui-sans-serif', 'sans-serif'],
      },
      boxShadow: {
        glow: '0 0 0 1px rgba(249,115,22,.25), 0 8px 30px -8px rgba(249,115,22,.45)',
        card: '0 1px 2px rgba(26,20,16,.05), 0 8px 30px -12px rgba(26,20,16,.12)',
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        gridDrift: {
          '0%': { backgroundPosition: '0 0' },
          '100%': { backgroundPosition: '48px 48px' },
        },
        pulseRing: {
          '0%': { boxShadow: '0 0 0 0 rgba(249,115,22,.4)' },
          '100%': { boxShadow: '0 0 0 18px rgba(249,115,22,0)' },
        },
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
      },
      animation: {
        'fade-up': 'fadeUp .7s cubic-bezier(.2,.8,.2,1) both',
        'fade-in': 'fadeIn .8s ease both',
        float: 'float 6s ease-in-out infinite',
        shimmer: 'shimmer 4s linear infinite',
        'grid-drift': 'gridDrift 6s linear infinite',
        'pulse-ring': 'pulseRing 1.8s ease-out infinite',
        marquee: 'marquee 25s linear infinite',
      },
    },
  },
  plugins: [],
}