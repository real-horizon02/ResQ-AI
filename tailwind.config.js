/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'bg': '#06090F',
        'bg-surface': '#0D1525',
        'bg-elevated': '#141E30',
        'accent-red': '#FF2D2D',
        'accent-orange': '#FF6B1A',
        'accent-cyan': '#00D4FF',
        'accent-green': '#00E676',
        'accent-gold': '#C8A96E',
        'text-primary': '#EEF2FF',
        'text-muted': '#5A6A8A',
        'text-dim': '#2A3A55',
      },
      fontFamily: {
        playfair: ['Playfair Display', 'Georgia', 'serif'],
        dm: ['DM Sans', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Courier New', 'monospace'],
        sans: ['DM Sans', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        glass: '16px',
      },
      boxShadow: {
        sos: '0 0 32px rgba(255,45,45,0.5)',
        'sos-lg': '0 0 48px rgba(255,45,45,0.7)',
        glass: '0 8px 32px rgba(0,0,0,0.4)',
        'glass-lg': '0 24px 64px rgba(0,0,0,0.5)',
        cyan: '0 0 24px rgba(0,212,255,0.3)',
      },
      animation: {
        'marquee': 'marquee 30s linear infinite',
        'marquee-reverse': 'marquee-reverse 30s linear infinite',
        'float-drift': 'float-drift 8s ease-in-out infinite',
        'sos-ring': 'sos-ring 2s ease-out infinite',
        'pulse-dot': 'pulse-dot 2s ease-in-out infinite',
        'bounce-dot': 'bounce-dot 1.5s ease-in-out infinite',
        'radar': 'radar-sweep 3s linear infinite',
        'slide-up': 'slide-up 0.6s cubic-bezier(0.16,1,0.3,1)',
      },
      keyframes: {
        'sos-ring': {
          '0%': { transform: 'scale(1)', opacity: '0.8' },
          '100%': { transform: 'scale(2)', opacity: '0' },
        },
        'float-drift': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'marquee': {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        'marquee-reverse': {
          '0%': { transform: 'translateX(-50%)' },
          '100%': { transform: 'translateX(0)' },
        },
        'pulse-dot': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.3' },
        },
        'bounce-dot': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        'radar-sweep': {
          from: { transform: 'rotate(0deg)' },
          to: { transform: 'rotate(360deg)' },
        },
        'slide-up': {
          from: { opacity: '0', transform: 'translateY(40px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
      backdropBlur: {
        glass: '24px',
      },
    },
  },
  plugins: [],
}
