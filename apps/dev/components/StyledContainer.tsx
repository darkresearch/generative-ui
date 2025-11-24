import React from 'react';
import { View, ViewStyle } from 'react-native';

interface StyledContainerProps {
  children: React.ReactNode;
  theme?: 'dark' | 'light';
  style?: ViewStyle;
}

export function StyledContainer({ children, theme = 'light', style }: StyledContainerProps) {
  const containerBg = theme === 'dark' ? '#262626' : '#fafafa';
  
  return (
    <View
      style={[
        {
          flex: 1,
          borderWidth: 1,
          borderColor: '#e5e7eb', // gray-200
          backgroundColor: containerBg,
          borderRadius: 24,
          shadowColor: '#e5e7eb', // gray-200
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.5,
          shadowRadius: 8,
          elevation: 8, // Android shadow
          overflow: 'hidden',
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

