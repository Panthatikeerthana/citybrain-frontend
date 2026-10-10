/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          950: '#F7F8F5', // Remapped for legacy compatibility: background
          900: '#FFFFFF', // Remapped for legacy compatibility: card
          850: '#F0F4F2',
          800: '#E1E7E2',
          700: '#C2CCC7',
          600: '#697773',
          500: '#4B5B57',
        },
        forest: {
          950: '#0B211C',
          900: '#173D35', // Deep Forest Green Sidebar
          800: '#1F4D43', // Sidebar Hover/Active
          700: '#2A6458',
          600: '#377E70',
        },
        emerald: {
          700: '#11654F',
          600: '#188568', // Primary Accent
          500: '#188568',
          400: '#239B7B',
          300: '#4BB296',
          200: '#9CE3D1',
          100: '#E2F4EF',
          50: '#F2FAF7',
        },
        teal: {
          600: '#347277',
          500: '#438C91', // Muted Teal Accent
          400: '#5BA0A5',
          300: '#84BCC0',
          100: '#EBF4F5',
          50: '#F4FAFA',
        },
        charcoal: {
          900: '#151C1A',
          800: '#202B29', // Main text
          700: '#344340',
          600: '#4E5F5B',
          500: '#697773', // Secondary text
          400: '#879692',
          300: '#B0BCB8',
          200: '#D2DAD6',
          100: '#E8ECE9',
          50: '#F7F8F5',  // Main background
        },
        border: {
          subtle: '#E1E7E2',
        },
        alert: {
          red: '#D64545',
          orange: '#D97732',
          amber: '#C49A24',
          green: '#23865D',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace']
      },
      boxShadow: {
        'sm': '0 1px 3px 0 rgba(23, 61, 53, 0.05)',
        'card': '0 1px 4px 0 rgba(23, 61, 53, 0.06)',
        'dropdown': '0 4px 16px -2px rgba(23, 61, 53, 0.12)',
      }
    },
  },
  plugins: [],
}
