import { StyleSheet } from 'react-native-unistyles';

// Theme definition
const darkTheme = {
  colors: {
    bg: '#1a1a1a',
    statusBg: '#141414',
    border: '#333',
    text: '#888',
    placeholder: '#666',
    connected: '#4ade80',
  },
} as const;

type AppThemes = {
  dark: typeof darkTheme;
};

// Module augmentation for react-native-unistyles
declare module 'react-native-unistyles' {
  export interface UnistylesThemes extends AppThemes {}
}

// Configure Unistyles theme - must run before any StyleSheet.create()
// This file is imported at the entry point (index.js) to ensure proper initialization order
StyleSheet.configure({
  themes: {
    dark: darkTheme,
  },
  settings: {
    initialTheme: 'dark',
  },
});

