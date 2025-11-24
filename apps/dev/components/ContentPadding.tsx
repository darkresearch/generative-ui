import React from 'react';
import { View, ViewStyle } from 'react-native';

interface ContentPaddingProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

export function ContentPadding({ children, style }: ContentPaddingProps) {
  return (
    <View
      style={[
        {
          flex: 1,
          paddingHorizontal: 12,
          paddingVertical: 8,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

