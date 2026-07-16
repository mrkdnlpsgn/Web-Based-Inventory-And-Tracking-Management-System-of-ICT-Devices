const EASE_ENTER = 'cubic-bezier(0.16, 1, 0.3, 1)' // strong ease-out — used for every entrance animation
const EASE_EXIT  = 'cubic-bezier(0.25, 1, 0.5, 1)' // slightly softer ease-out — used for exits and a couple of fades

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
        'fade-slide':        `fadeSlide 0.28s ${EASE_ENTER}`,
        'fade-in':           `fadeIn 0.2s ${EASE_EXIT} both`,
        'slide-in-right':    `slideInRight 0.32s ${EASE_ENTER}`,
        'toast-out':         `toastOut 0.2s ${EASE_EXIT} forwards`,
        'slide-down':        `slideDown 0.26s ${EASE_ENTER}`,
        'slide-up':          `slideUp 0.18s ${EASE_EXIT} forwards`,
        'scale-in':          `scaleIn 0.22s ${EASE_ENTER}`,
        'slide-in-drawer':   `slideInDrawer 0.32s ${EASE_ENTER} both`,
        'slide-out-drawer':  `slideOutDrawer 0.22s ${EASE_EXIT} both`,
        'fade-out':          `fadeOut 0.2s ${EASE_EXIT} both`,
      },
      keyframes: {
        fadeSlide: {
          '0%':   { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideInRight: {
          '0%':   { opacity: '0', transform: 'translateX(28px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        toastOut: {
          '0%':   { opacity: '1', transform: 'translateX(0)' },
          '100%': { opacity: '0', transform: 'translateX(28px)' },
        },
        slideDown: {
          '0%':   { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%':   { opacity: '1', transform: 'translateY(0)' },
          '100%': { opacity: '0', transform: 'translateY(-10px)' },
        },
        scaleIn: {
          '0%':   { opacity: '0', transform: 'scale(0.96)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        slideInDrawer: {
          '0%':   { opacity: '0', transform: 'translateX(100%)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        slideOutDrawer: {
          '0%':   { opacity: '1', transform: 'translateX(0)' },
          '100%': { opacity: '0', transform: 'translateX(100%)' },
        },
        fadeOut: {
          '0%':   { opacity: '1' },
          '100%': { opacity: '0' },
        },
      },
    },
  },
  plugins: [],
}
