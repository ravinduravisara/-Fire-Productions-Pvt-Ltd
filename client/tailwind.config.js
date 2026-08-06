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
          DEFAULT: '#E8491D'
        },
        secondary: {
          DEFAULT: '#B3220C'
        },
        highlight: {
          DEFAULT: '#C97E0A'
        },
        ember: {
          DEFAULT: '#E8491D'
        },
        'ember-deep': {
          DEFAULT: '#B3220C'
        },
        gold: {
          DEFAULT: '#C97E0A'
        },
        brand: {
          50: '#FFF1EE',
          100: '#FFE1DC',
          500: '#E8491D',
          600: '#B3220C'
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