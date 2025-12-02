/** @type {import('tailwindcss').Config} */
const path = require('path');

// Define constants for base colors and opacities
const BG_COLOR = '#EEEDED';
const FG_COLOR = '#262626';
const FG_RGBA = (alpha) => `rgba(38, 38, 38, ${alpha})`;
const FG_10 = FG_RGBA(0.1);
const FG_20 = FG_RGBA(0.2);
const FG_5 = FG_RGBA(0.05);
const FG_60 = FG_RGBA(0.6);
const RED = '#DC2626';
const WHITE = '#FFFFFF';

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
          bg: BG_COLOR,
          fg: FG_COLOR,
        },

        // React Native Reusables Semantic Tokens
        border: FG_10,           // fg at 10%
        input: FG_10,            // fg at 10%
        ring: FG_20,             // fg at 20%
        background: BG_COLOR,    // Dark bg
        foreground: FG_COLOR,    // Dark fg

        primary: {
          DEFAULT: FG_COLOR,      // Dark fg
          foreground: BG_COLOR,   // Dark bg (contrast)
        },

        secondary: {
          DEFAULT: FG_10,         // fg at 10%
          foreground: FG_COLOR,   // Dark fg
        },

        destructive: {
          DEFAULT: RED,           // Red for destructive actions
          foreground: WHITE,      // White text on red
        },

        muted: {
          DEFAULT: FG_5,          // fg at 5%
          foreground: FG_60,      // fg at 60%
        },

        accent: {
          DEFAULT: FG_10,         // fg at 10%
          foreground: FG_COLOR,   // Dark fg
        },

        popover: {
          DEFAULT: BG_COLOR,      // Dark bg
          foreground: FG_COLOR,   // Dark fg
        },

        card: {
          DEFAULT: BG_COLOR,      // Dark bg
          foreground: FG_COLOR,   // Dark fg
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
