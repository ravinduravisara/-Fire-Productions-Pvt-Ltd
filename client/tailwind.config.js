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
        text: 'rgb(var(--color-text) / <alpha-value>)',
        muted: 'rgb(var(--color-muted) / <alpha-value>)',
        border: 'rgb(var(--color-border) / <alpha-value>)',

        // Brand accents
        primary: {
          DEFAULT: '#FF4D2D'
        },
        secondary: {
          DEFAULT: '#FF8A1F'
        },
        highlight: {
          DEFAULT: '#FFD166'
        },
        brand: {
          50: '#FFF1EE',
          100: '#FFE1DC',
          500: '#FF4D2D', // Fire Orange
          600: '#E84528'
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