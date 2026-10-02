/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#F5F2EB', // Warm Ivory canvas
        surface: {
          DEFAULT: '#FAF9F6', // Soft Cream card/panel surface
          hover: '#F2EFE8',
        },
        primary: {
          DEFAULT: '#2B2B2B', // Soft Charcoal
          hover: '#3D3D3D',
          foreground: '#FFFFFF',
        },
        accent: {
          DEFAULT: '#B8955A', // Champagne Gold
          light: '#F0E7D5',   // Light champagne badge/pill tint
          hover: '#A4773A',
          foreground: '#FFFFFF',
        },
        main: {
          text: '#222222',    // Deep Charcoal high legibility text
        },
        secondary: {
          text: '#6B6B6B',    // Medium Muted text
        },
        border: {
          DEFAULT: '#DDD8CE', // Soft warm border
        },
        success: {
          DEFAULT: '#4F765E', // Sage green
          light: '#EAF0EC',
        },
        warning: {
          DEFAULT: '#A4773A', // Warm ochre
          light: '#F8F1E7',
        },
        error: {
          DEFAULT: '#A95C5C', // Terracotta red
          light: '#FAEDED',
        },
      },
      fontFamily: {
        headline: ['Manrope', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
      },
      spacing: {
        '1': '4px',
        '2': '8px',
        '3': '12px',
        '4': '16px',
        '6': '24px',
        '8': '32px',
        '10': '40px',
        '12': '48px',
        '16': '64px',
        '20': '80px',
      },
      borderRadius: {
        sm: '6px',   // small controls
        md: '8px',   // buttons, inputs
        lg: '12px',  // cards, tables, panels
        xl: '16px',  // major sections
      },
      boxShadow: {
        subtle: '0 1px 3px rgba(43, 43, 43, 0.04), 0 1px 2px rgba(43, 43, 43, 0.02)',
        card: '0 2px 8px -2px rgba(43, 43, 43, 0.05), 0 1px 4px -1px rgba(43, 43, 43, 0.03)',
        dropdown: '0 10px 25px -5px rgba(43, 43, 43, 0.08), 0 8px 10px -6px rgba(43, 43, 43, 0.04)',
      },
    },
  },
  plugins: [],
}
