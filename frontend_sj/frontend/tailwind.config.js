/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#edfcf2',
          100: '#d2f9e0',
          200: '#a8f0c0',
          300: '#6de39a',
          400: '#3dce73',
          500: '#1fad55',
          600: '#158c42',
          700: '#126e36',
          800: '#11572c',
          900: '#0e4824',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        '2xs': ['0.6875rem', { lineHeight: '1rem' }],
      },
      animation: {
        'fade-slide':     'fadeSlide 0.28s cubic-bezier(0.16, 1, 0.3, 1)',
        'slide-in-right': 'slideInRight 0.32s cubic-bezier(0.16, 1, 0.3, 1)',
        'toast-out':      'toastOut 0.2s cubic-bezier(0.25, 1, 0.5, 1) forwards',
      },
      keyframes: {
        fadeSlide: {
          '0%':   { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInRight: {
          '0%':   { opacity: '0', transform: 'translateX(28px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        toastOut: {
          '0%':   { opacity: '1', transform: 'translateX(0)' },
          '100%': { opacity: '0', transform: 'translateX(28px)' },
        },
      },
    },
  },
  plugins: [],
}
