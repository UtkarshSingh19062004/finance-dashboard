/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      keyframes: {
        fadeUp: {
          '0%':   { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        scaleIn: {
          '0%':   { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
      animation: {
        'fade-up':    'fadeUp 0.4s ease both',
        'fade-up-1':  'fadeUp 0.4s 0.05s ease both',
        'fade-up-2':  'fadeUp 0.4s 0.10s ease both',
        'fade-up-3':  'fadeUp 0.4s 0.15s ease both',
        'fade-up-4':  'fadeUp 0.4s 0.20s ease both',
        'fade-in':    'fadeIn 0.5s ease both',
        'scale-in':   'scaleIn 0.35s ease both',
      },
    },
  },
  plugins: [],
}
