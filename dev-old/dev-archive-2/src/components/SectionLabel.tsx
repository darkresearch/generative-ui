import React from 'react';
import { View, Text } from 'react-native';
import { StyleSheet, useStyles } from '@darkresearch/design-system';

interface SectionLabelProps {
  children: React.ReactNode;
}

const styles = StyleSheet.create((theme) => ({
  container: {
    paddingHorizontal: 8,
    marginBottom: 12,
  },
  text: {
    color: theme.colors.fg,
    fontSize: 16,
    fontWeight: theme.typography.fontWeight.medium,
    fontFamily: theme.typography.fontFamily['satoshi-medium'],
  },
}));

export function SectionLabel({ children }: SectionLabelProps) {
  const { styles: themeStyles } = useStyles();
  
  return (
    <View style={themeStyles.container}>
      <Text style={themeStyles.text}>
        {children}
      </Text>
    </View>
  );
}

