import type { Config } from 'tailwindcss'
import typography from '@tailwindcss/typography'

export default {
  darkMode: 'class',
  content: [
    './app/**/*.{vue,ts,js}',
    './content/**/*.md',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        serif: ['Georgia', 'ui-serif', 'serif'],
      },
      colors: {
        'dark-bg': '#1a1a1a',
        'dark-card': '#2d2d2d',
        'dark-border': '#404040',
      },
      animation: {
        fadeInUp: 'fadeInUp 0.8s ease-out forwards',
        'pulse-scale': 'pulse-scale 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'theme-transition': 'theme-transition 0.3s ease-in-out',
      },
      keyframes: {
        fadeInUp: {
          'from': {
            opacity: '0',
            transform: 'translateY(20px)',
          },
          'to': {
            opacity: '1',
            transform: 'translateY(0)',
          },
        },
        'pulse-scale': {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.05)' },
        },
        'theme-transition': {
          'from': { opacity: '0.8' },
          'to': { opacity: '1' },
        },
      },
      typography: {
        DEFAULT: {
          css: {
            'h1 a, h2 a, h3 a, h4 a, h5 a, h6 a': {
              textDecoration: 'none',
              color: 'inherit',
              fontWeight: 'inherit',
            },
            blockquote: {
              borderLeftWidth: '4px',
              borderLeftColor: '#3b82f6',
              backgroundColor: '#eff6ff',
              padding: '1rem 1.5rem',
              borderRadius: '0.5rem',
              fontStyle: 'normal',
              color: '#1e40af',
            },
            '.dark blockquote': {
              backgroundColor: '#172554',
              borderLeftColor: '#60a5fa',
              color: '#dbeafe',
            },
            code: {
              backgroundColor: '#f3f4f6',
              padding: '0.2rem 0.4rem',
              borderRadius: '0.25rem',
              fontWeight: '600',
            },
            '.dark code': {
              backgroundColor: '#1f2937',
            },
            'code::before': { content: '""' },
            'code::after': { content: '""' },
          },
        },
      },
    },
  },
  plugins: [
    typography,
  ],
} satisfies Config
