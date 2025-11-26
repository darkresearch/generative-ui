import React from 'react';
import { View, ViewStyle, Platform } from 'react-native';
import { StyleSheet, useStyles } from '@darkresearch/design-system';

interface StyledContainerProps {
  children: React.ReactNode;
  theme?: 'dark' | 'light';
  style?: ViewStyle;
}

const styles = StyleSheet.create((theme) => ({
  container: {
    flex: 1,
    borderWidth: 1,
    borderColor: theme.colors.slate[200],
    backgroundColor: theme.colors.bg,
    borderRadius: 24,
    overflow: 'hidden',
    ...Platform.select({
      web: {
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      },
      default: {
        shadowColor: theme.colors.slate[200],
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.5,
        shadowRadius: 8,
        elevation: 8,
      },
    }),
  },
}));

export function StyledContainer({ children, theme = 'light', style }: StyledContainerProps) {
  const { styles: themeStyles } = useStyles();
  
  return (
    <View style={[themeStyles.container, style]}>
      {children}
    </View>
  );
}

