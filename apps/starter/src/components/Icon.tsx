import React from 'react';
import { Lucide } from '@react-native-vector-icons/lucide';

type IconProps = {
  name: string;
  size?: number;
  color?: string;
  strokeWidth?: number; // Note: font icons don't support strokeWidth, but kept for API consistency
};

/**
 * Icon component for mobile (iOS/Android) - uses Lucide font icons
 * 
 * Font icons are more performant on mobile than SVG rendering.
 * Icon names should match Lucide icon names (e.g., "plus", "chevron-right").
 */
export function Icon({ name, size = 24, color = '#000', strokeWidth }: IconProps) {
  // Font icons don't support strokeWidth, but we accept it for API consistency
  return <Lucide name={name.toLowerCase()} size={size} color={color} />;
}

