/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#FEF5EC',
          100: '#FDE5CB',
          200: '#FCCB97',
          300: '#FAB163',
          400: '#F8972F',
          500: '#F6821F',
          600: '#D4630A',
          700: '#A34C08',
          800: '#723405',
          900: '#411D02',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-slide':     'fadeSlide 0.22s ease-out',
        'slide-in-right': 'slideInRight 0.28s ease-out',
      },
      keyframes: {
        fadeSlide: {
          '0%':   { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInRight: {
          '0%':   { opacity: '0', transform: 'translateX(24px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
      },
    },
  },
  plugins: [],
}
