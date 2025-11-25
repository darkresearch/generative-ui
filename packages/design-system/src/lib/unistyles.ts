import { StyleSheet } from 'react-native-unistyles';
import { Platform } from 'react-native';

/**
 * Dark Design System Theme Configuration for Unistyles
 * 
 * Philosophy: 2 base colors + opacity variants
 * - bg: #EEEDED (light gray background)
 * - fg: #262626 (dark gray foreground)
 * - Everything else: opacity modifiers
 */

// Helper function to create rgba color from hex + opacity
const rgba = (hex: string, opacity: number): string => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
};

const bg = '#EEEDED';
const fg = '#262626';

export const darkTheme = {
  colors: {
    // Base colors
    bg,
    fg,
    
    // Dark Design System semantic tokens
    dark: {
      bg,
      fg,
    },
    
    // React Native Reusables semantic tokens
    border: rgba(fg, 0.1),           // fg at 10%
    input: rgba(fg, 0.1),             // fg at 10%
    ring: rgba(fg, 0.2),              // fg at 20%
    background: bg,
    foreground: fg,
    
    primary: {
      DEFAULT: fg,
      foreground: bg,
    },
    
    secondary: {
      DEFAULT: rgba(fg, 0.1),         // fg at 10%
      foreground: fg,
    },
    
    destructive: {
      DEFAULT: '#DC2626',             // Red for destructive actions
      foreground: '#FFFFFF',           // White text on red
    },
    
    muted: {
      DEFAULT: rgba(fg, 0.05),        // fg at 5%
      foreground: rgba(fg, 0.6),      // fg at 60%
    },
    
    accent: {
      DEFAULT: rgba(fg, 0.1),         // fg at 10%
      foreground: fg,
    },
    
    popover: {
      DEFAULT: bg,
      foreground: fg,
    },
    
    card: {
      DEFAULT: bg,
      foreground: fg,
    },
    
    // Opacity variants for convenience
    opacity: {
      '5': rgba(fg, 0.05),
      '10': rgba(fg, 0.1),
      '20': rgba(fg, 0.2),
      '30': rgba(fg, 0.3),
      '40': rgba(fg, 0.4),
      '60': rgba(fg, 0.6),
    },
    
    // Slate colors used by Reusables components
    slate: {
      50: '#f8fafc',
      100: '#f1f5f9',
      200: '#e2e8f0',
      300: '#cbd5e1',
      400: '#94a3b8',
      500: '#64748b',
      600: '#475569',
      700: '#334155',
      800: '#1e293b',
      900: '#0f172a',
      950: '#020617',
    },
    
    // Red colors for destructive actions
    red: {
      500: '#DC2626',
      900: '#7f1d1d',
    },
    
    white: '#ffffff',
    black: '#000000',
  },
  
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    '2xl': 48,
    '3xl': 64,
  },
  
  borderRadius: {
    none: 0,
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    '2xl': 24,
    full: 9999,
  },
  
  typography: {
    fontFamily: {
      sans: Platform.select({
        ios: 'System',
        android: 'Roboto',
        web: 'system-ui, -apple-system, sans-serif',
        default: 'System',
      }),
      mono: Platform.select({
        ios: 'Menlo',
        android: 'monospace',
        web: 'Menlo, Monaco, monospace',
        default: 'monospace',
      }),
      satoshi: 'Satoshi-Regular',
      'satoshi-medium': 'Satoshi-Medium',
      'satoshi-bold': 'Satoshi-Bold',
    },
    fontSize: {
      xs: 12,
      sm: 14,
      base: 16,
      lg: 18,
      xl: 20,
      '2xl': 24,
      '3xl': 30,
      '4xl': 36,
    },
    fontWeight: {
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
      extrabold: '800',
    },
    lineHeight: {
      none: 1,
      tight: 1.25,
      snug: 1.375,
      normal: 1.5,
      relaxed: 1.625,
      loose: 2,
    },
  },
  
  shadows: {
    sm: Platform.select({
      web: {
        boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
      },
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
      },
    }),
    md: Platform.select({
      web: {
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      },
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
      },
    }),
    lg: Platform.select({
      web: {
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      },
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 4,
      },
    }),
  },
} as const;

// Configure Unistyles
  StyleSheet.configure({
    themes: {
      light: darkTheme,
      dark: darkTheme, // Same theme for now, can be extended later
    },
    settings: {
      initialTheme: 'light',
      adaptiveThemes: false,
    },
  });

// Declare module augmentation for Unistyles theme types
declare module 'react-native-unistyles' {
  export interface UnistylesThemes {
    light: typeof darkTheme;
    dark: typeof darkTheme;
  }
}

// Export StyleSheet from Unistyles for use in components
export { StyleSheet };
export { useStyles } from 'react-native-unistyles';

// Export theme type for TypeScript
export type DarkTheme = typeof darkTheme;

