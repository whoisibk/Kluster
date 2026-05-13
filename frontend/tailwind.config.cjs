/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          deep: '#0F766E',
          DEFAULT: '#14B8A6',
          light: '#5EEAD4',
        },
        secondary: {
          orange: '#F97316',
          gold: '#FBBF24',
          slate: '#1E293B',
        },
        success: '#10B981',
        danger: '#DC2626',
      },
      fontFamily: {
        inter: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}