import React from 'react';
import { SegmentedButtons } from 'react-native-paper';

interface ThemeToggleProps {
  theme: 'dark' | 'light';
  onThemeChange: (theme: 'dark' | 'light') => void;
}

export function ThemeToggle({ theme, onThemeChange }: ThemeToggleProps) {
  return (
    <SegmentedButtons
      value={theme}
      onValueChange={(value) => onThemeChange(value as 'dark' | 'light')}
      buttons={[
        { value: 'light', label: 'Light' },
        { value: 'dark', label: 'Dark' },
      ]}
    />
  );
}

