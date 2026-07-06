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
        primary: {
          DEFAULT: '#1a365d',
          dark: '#0d223f',
        },
        secondary: {
          DEFAULT: '#c9a84c',
          dark: '#af903b',
        },
        light: {
          bg: '#f8f6f0',
          text: '#1a1a2e'
        },
        dark: {
          bg: '#0f1423',
          text: '#e8e8e8'
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
