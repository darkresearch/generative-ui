import React from 'react';
import { View, Platform } from 'react-native';
import { Text, colors } from '@darkresearch/design-system';

interface SectionLabelProps {
  children: React.ReactNode;
}

export function SectionLabel({ children }: SectionLabelProps) {
  return (
    <View style={{ paddingHorizontal: 8, marginBottom: 12 }}>
      <Text style={{ 
        color: colors.fg, 
        fontSize: 16, 
        fontWeight: '500',
        fontFamily: Platform.select({
          ios: 'Satoshi-Medium',
          android: 'Satoshi-Medium',
          web: 'Satoshi-Medium',
          default: 'Satoshi-Medium',
        }),
      }}>
        {children}
      </Text>
    </View>
  );
}

