import React from 'react';
import { View, Platform } from 'react-native';
import { StyleSheet, useStyles } from '@darkresearch/design-system';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ControlsFAB } from './ControlsFAB';
import { DebugFAB } from './DebugFAB';

const styles = StyleSheet.create(() => ({
  container: {
    position: 'absolute',
    right: 16,
    gap: 12,
    alignItems: 'flex-end',
    ...Platform.select({
      web: {
        overflow: 'visible',
        zIndex: 100,
      },
    }),
  },
}));

interface RightSideFABsProps {
  isStreaming: boolean;
  isPaused: boolean;
  selectedPreset?: string;
  streamSpeed?: number;
  onPresetChange?: (preset: string) => void;
  onSpeedChange?: (speed: number) => void;
  onStart?: () => void;
  onReset?: () => void;
}

export function RightSideFABs({
  isStreaming,
  isPaused,
  selectedPreset,
  streamSpeed,
  onPresetChange,
  onSpeedChange,
  onStart,
  onReset,
}: RightSideFABsProps) {
  const insets = useSafeAreaInsets();
  const { styles: themeStyles } = useStyles();

  return (
    <View
      style={[
        themeStyles.container,
        {
          bottom: Math.max(insets.bottom, 16) + 32,
        },
      ]}
    >
      <ControlsFAB />
      <DebugFAB />
    </View>
  );
}

