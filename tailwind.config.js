/** @type {import('tailwindcss').Config} */
const path = require('path');

module.exports = {
  content: [
    path.resolve(__dirname, './apps/**/*.{js,jsx,ts,tsx}'),
    path.resolve(__dirname, './packages/**/*.{js,jsx,ts,tsx}'),
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        // Dark Design System - Base Colors
        dark: {
          bg: '#EEEDED',
          fg: '#262626',
        },
        
        // React Native Reusables Semantic Tokens
        // Mapped to Dark color system (#EEEDED + #262626 + opacity)
        border: 'rgba(38, 38, 38, 0.1)',        // fg at 10%
        input: 'rgba(38, 38, 38, 0.1)',         // fg at 10%
        ring: 'rgba(38, 38, 38, 0.2)',          // fg at 20%
        background: '#EEEDED',                   // Dark bg
        foreground: '#262626',                   // Dark fg
        
        primary: {
          DEFAULT: '#262626',                    // Dark fg
          foreground: '#EEEDED',                 // Dark bg (contrast)
        },
        
        secondary: {
          DEFAULT: 'rgba(38, 38, 38, 0.1)',     // fg at 10%
          foreground: '#262626',                 // Dark fg
        },
        
        destructive: {
          DEFAULT: '#DC2626',                    // Red for destructive actions
          foreground: '#FFFFFF',                 // White text on red
        },
        
        muted: {
          DEFAULT: 'rgba(38, 38, 38, 0.05)',    // fg at 5%
          foreground: 'rgba(38, 38, 38, 0.6)',  // fg at 60%
        },
        
        accent: {
          DEFAULT: 'rgba(38, 38, 38, 0.1)',     // fg at 10%
          foreground: '#262626',                 // Dark fg
        },
        
        popover: {
          DEFAULT: '#EEEDED',                    // Dark bg
          foreground: '#262626',                 // Dark fg
        },
        
        card: {
          DEFAULT: '#EEEDED',                    // Dark bg
          foreground: '#262626',                 // Dark fg
        },
      },
      borderRadius: {
        lg: '12px',
        md: '8px',
        sm: '4px',
      },
    },
  },
  plugins: [],
};

