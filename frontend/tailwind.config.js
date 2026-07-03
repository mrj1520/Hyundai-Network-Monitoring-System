/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          navy: '#0B1220',
          dark: '#111827',
          blue: '#3B82F6',
          cyan: '#06B6D4'
        }
      }
    },
  },
  plugins: [],
}
