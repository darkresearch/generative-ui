import React from 'react';
import { View, Platform, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ControlsFAB } from './ControlsFAB';
import { DebugFAB } from './DebugFAB';

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

  return (
    <View
      style={[
        styles.container,
        {
          bottom: Math.max(insets.bottom, 16) + 32,
        },
      ]}
    >
      <ControlsFAB
        isStreaming={isStreaming}
        isPaused={isPaused}
        selectedPreset={selectedPreset}
        streamSpeed={streamSpeed}
        onPresetChange={onPresetChange}
        onSpeedChange={onSpeedChange}
        onStart={onStart}
        onReset={onReset}
      />
      <DebugFAB />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    right: 16,
    gap: 12,
    alignItems: 'flex-end',
    ...(Platform.OS === 'web' && {
      overflow: 'visible',
      zIndex: 100,
    }),
  },
});

