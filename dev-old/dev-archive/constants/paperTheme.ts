import { MD3LightTheme, MD3DarkTheme } from 'react-native-paper';
import { COLORS } from './colors';

export const lightPaperTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: COLORS.accent, // #494C53
    background: COLORS.background, // rgb(251, 251, 251)
    surface: COLORS.inputBg, // #FFFFFF
    surfaceVariant: COLORS.background,
    onSurface: COLORS.textPrimary, // #2A2A2A
    onSurfaceVariant: COLORS.textSecondary,
    outline: COLORS.border, // #E5E5E5
    outlineVariant: COLORS.border,
  },
};

export const darkPaperTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: COLORS.accent,
    background: '#1a1a1a',
    surface: '#2a2a2a',
    surfaceVariant: '#1a1a1a',
    onSurface: '#fafafa',
    onSurfaceVariant: '#e5e5e5',
    outline: '#3a3a3a',
    outlineVariant: '#3a3a3a',
  },
};

