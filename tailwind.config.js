/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // pure black -> soft black scale
        ink: {
          950: '#000000',
          900: '#0a0a0a',
          800: '#111111',
          700: '#1a1a1a',
          600: '#262626',
        },
        // names kept so old classes still work, now monochrome
        accent: { blue: '#ffffff', violet: '#d4d4d4', cyan: '#a3a3a3' },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['"Space Grotesk"', 'Inter', 'ui-sans-serif', 'sans-serif'],
      },
      boxShadow: {
        glow: '0 0 0 1px rgba(255,255,255,.18), 0 8px 40px -8px rgba(255,255,255,.25)',
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
          '0%': { boxShadow: '0 0 0 0 rgba(255,255,255,.35)' },
          '100%': { boxShadow: '0 0 0 18px rgba(255,255,255,0)' },
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