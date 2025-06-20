/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'krm3-primary': '#efb100',
        'krm3-primary-light': '#ffe082',
        'krm3-primary-dark': '#c89400',
      },
    },
  },
  plugins: [],
};
