/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],

  safelist: [
    // Opacity
    'opacity-0',
    'opacity-20',
    'opacity-80',
    'opacity-100',

    // Translate X
    'translate-x-0',
    '-translate-x-10',

    // Translate Y
    'translate-y-0',
    'translate-y-20',

    // Scale
    'scale-100',
    'scale-105',
    'scale-110',

    // Grayscale
    'grayscale',
    'grayscale-0',

    // Transitions usadas no scrollytelling
    'transition-all',
    'transition-transform',
    'duration-700',
    'duration-1000',
    'duration-[2000ms]',
  ],

  theme: {
    extend: {},
  },

  plugins: [],
}
