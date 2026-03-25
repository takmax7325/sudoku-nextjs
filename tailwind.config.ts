import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        sudoku: {
          bg: '#0f172a',
          surface: '#1e293b',
          border: '#334155',
          given: '#f1f5f9',
          user: '#7dd3fc',
          error: '#f87171',
          highlight: '#1d4ed8',
          hint: '#a78bfa',
          selected: '#1e40af',
          peer: '#1e3a5f',
          sameNum: '#1d4ed8',
          pencil: '#94a3b8',
        },
      },
      animation: {
        'pop': 'pop 0.15s ease-out',
        'pulse-hint': 'pulse-hint 1s ease-in-out infinite',
        'fade-in': 'fade-in 0.2s ease-out',
        'slide-up': 'slide-up 0.3s ease-out',
      },
      keyframes: {
        pop: {
          '0%': { transform: 'scale(0.8)', opacity: '0' },
          '60%': { transform: 'scale(1.15)' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        'pulse-hint': {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(167,139,250,0.7)' },
          '50%': { boxShadow: '0 0 0 8px rgba(167,139,250,0)' },
        },
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        'slide-up': {
          from: { transform: 'translateY(20px)', opacity: '0' },
          to: { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
