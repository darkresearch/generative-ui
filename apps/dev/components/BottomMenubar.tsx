import React from 'react';
import { View, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PlaybackMenubar } from './PlaybackMenubar';

interface BottomMenubarProps {
  isStreaming: boolean;
  isPaused: boolean;
  streamingLength: number;
  markdownLength: number;
  onStepBackward: () => void;
  onPlayPause: () => void;
  onStepForward: () => void;
}

export function BottomMenubar({
  isStreaming,
  isPaused,
  streamingLength,
  markdownLength,
  onStepBackward,
  onPlayPause,
  onStepForward,
}: BottomMenubarProps) {
  const insets = useSafeAreaInsets();
  
  // Web: PlaybackMenubar handles its own positioning (fixed bottom)
  if (Platform.OS === 'web') {
    return (
      <PlaybackMenubar
        isStreaming={isStreaming}
        isPaused={isPaused}
        streamingLength={streamingLength}
        markdownLength={markdownLength}
        onStepBackward={onStepBackward}
        onPlayPause={onPlayPause}
        onStepForward={onStepForward}
      />
    );
  }

  // Mobile: Position menubar at bottom with safe area insets
  return (
    <View
      style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        paddingBottom: Math.max(insets.bottom, 0),
      }}
    >
      <PlaybackMenubar
        isStreaming={isStreaming}
        isPaused={isPaused}
        streamingLength={streamingLength}
        markdownLength={markdownLength}
        onStepBackward={onStepBackward}
        onPlayPause={onPlayPause}
        onStepForward={onStepForward}
      />
    </View>
  );
}

