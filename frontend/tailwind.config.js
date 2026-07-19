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
          DEFAULT: '#0F172A',
          dark: '#020617',
        },
        royal: {
          DEFAULT: '#0F172A',
          dark: '#D4AF37',
        },
        secondary: {
          DEFAULT: '#D4AF37',
          dark: '#B5902B',
        },
        light: {
          bg: '#F1F5F9',
          text: '#0F172A'
        },
        dark: {
          bg: '#020617',
          text: '#F8FAFC'
        },
        gray: {
          50: '#F8FAFC',
          100: '#F1F5F9',
          150: '#E2E8F0',
          200: '#E2E8F0',
          250: '#CBD5E1',
          300: '#CBD5E1',
          400: '#94A3B8',
          450: '#64748B',
          500: '#64748B',
          550: '#475569',
          600: '#475569',
          700: '#334155',
          750: '#1E293B',
          800: '#1E293B',
          850: '#0F172A',
          900: '#0F172A',
          950: '#020617',
          955: '#030712',
        },
        slate: {
          50: '#F8FAFC',
          100: '#F1F5F9',
          150: '#E2E8F0',
          200: '#E2E8F0',
          250: '#CBD5E1',
          300: '#CBD5E1',
          400: '#94A3B8',
          450: '#64748B',
          500: '#64748B',
          550: '#475569',
          600: '#475569',
          700: '#334155',
          750: '#1E293B',
          800: '#1E293B',
          850: '#0F172A',
          900: '#0F172A',
          950: '#020617',
          955: '#030712',
        },
        red: {
          955: '#450a0a',
        },
        blue: {
          955: '#172554',
        },
        amber: {
          955: '#451a03',
        },
        yellow: {
          955: '#422006',
        },
        emerald: {
          955: '#022c22',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
