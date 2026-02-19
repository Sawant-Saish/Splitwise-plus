/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        display: ['Syne', 'sans-serif'],
        body: ['DM Sans', 'sans-serif'],
      },
      colors: {
        accent: {
          DEFAULT: '#6c63ff',
          light: '#8b83ff',
          dark: '#4f46e5',
        },
      },
    },
  },
  plugins: [],
};
