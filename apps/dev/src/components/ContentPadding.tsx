import React from 'react';
import { View, ViewStyle } from 'react-native';
import { StyleSheet, useStyles } from '@darkresearch/design-system';

interface ContentPaddingProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

const styles = StyleSheet.create(() => ({
  container: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
}));

export function ContentPadding({ children, style }: ContentPaddingProps) {
  const { styles: themeStyles } = useStyles();
  
  return (
    <View style={[themeStyles.container, style]}>
      {children}
    </View>
  );
}

