/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        // Semantic palette
        background: 'rgb(var(--color-background) / <alpha-value>)',
        surface: 'rgb(var(--color-surface) / <alpha-value>)',
        'surface-alt': 'rgb(var(--color-surface-alt) / <alpha-value>)',
        card: 'rgb(var(--color-card) / <alpha-value>)',
        text: 'rgb(var(--color-text) / <alpha-value>)',
        foreground: 'rgb(var(--color-foreground) / <alpha-value>)',
        muted: 'rgb(var(--color-muted) / <alpha-value>)',
        border: 'rgb(var(--color-border) / <alpha-value>)',

        // Palette accents
        primary: {
          DEFAULT: '#FF8D02'
        },
        secondary: {
          DEFAULT: '#B22E02'
        },
        highlight: {
          DEFAULT: '#02B1FC'
        },
        'highlight-deep': {
          DEFAULT: '#0167A3'
        },
        ember: {
          DEFAULT: '#FF8D02'
        },
        'ember-deep': {
          DEFAULT: '#B22E02'
        },
        blue: {
          500: '#02B1FC',
          600: '#0167A3'
        },
        brand: {
          50: '#0E2232',
          100: '#132C40',
          500: '#FF8D02',
          600: '#B22E02'
        }
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(6px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        },
        pop: {
          '0%': { transform: 'scale(0.98)' },
          '100%': { transform: 'scale(1)' }
        }
      },
      animation: {
        'fade-in': 'fadeIn .25s ease-out both',
        'pop': 'pop .18s ease-out both'
      }
    }
  },
  plugins: []
}