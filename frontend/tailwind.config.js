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
          50: '#f0fdfa',
          100: '#ccfbf1',
          500: '#14b8a6',
          600: '#0d9488', // Vibrant Teal Accent
          700: '#0f766e',
          900: '#134e4a',
        },
        navy: {
          800: '#1e293b',
          900: '#0f172a', // Deep Blue / Slate Primary
          950: '#0b0f19', // Dark Charcoal Background
        },
        surface: {
          light: '#ffffff', // Pure White surface cards
          dark: '#1e293b',  // Deep Gray surface cards
          bg: '#f8fafc',    // Off-white background
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(15, 23, 42, 0.05)',
        'soft-lg': '0 10px 30px -5px rgba(15, 23, 42, 0.08)',
        'glow': '0 0 25px -5px rgba(13, 148, 136, 0.25)',
      }
    },
  },
  plugins: [],
};
