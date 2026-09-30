import type { Config } from 'tailwindcss'
import typography from '@tailwindcss/typography'

// 顏色、字型、圓角、光暈的實際值都在 app/assets/css/theme.css，這裡只做對應
const themeColors = [
  'page', 'surface', 'surface-muted', 'header', 'ink', 'ink-muted', 'line', 'section',
  'blog', 'cs', 'videos', 'works', 'success', 'error', 'warning', 'overlay',
]

export default {
  darkMode: 'class',
  content: [
    './app/**/*.{vue,ts,js}',
    './content/**/*.md',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-sans)'],
        mono: ['var(--font-mono)'],
      },
      colors: Object.fromEntries(
        themeColors.map(name => [name, `rgb(var(--color-${name}) / <alpha-value>)`]),
      ),
      borderRadius: {
        chip: 'var(--radius-chip)',
        card: 'var(--radius-card)',
        panel: 'var(--radius-panel)',
      },
      boxShadow: {
        glow: 'var(--glow) rgb(var(--color-section) / 0.4)',
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
            h2: {
              color: 'rgb(var(--color-prose-h2))',
              fontWeight: '800',
            },
            h3: {
              color: 'rgb(var(--color-prose-h3))',
              fontWeight: '700',
            },
            strong: {
              color: 'rgb(var(--color-prose-strong))',
            },
            kbd: {
              backgroundColor: 'rgb(var(--color-surface-muted))',
              border: '1px solid rgb(var(--color-line))',
              borderRadius: '0.375rem',
              padding: '0.25rem 0.5rem',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.875em',
            },
            blockquote: {
              borderLeftWidth: '0',
              backgroundColor: 'rgb(var(--color-surface-muted))',
              padding: '0.875rem 1.25rem',
              borderRadius: '0.5rem',
              fontStyle: 'normal',
              color: 'inherit',
            },

            code: {
              backgroundColor: 'rgb(var(--color-surface-muted))',
              padding: '0.2rem 0.4rem',
              borderRadius: '0.25rem',
              fontWeight: '600',
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
