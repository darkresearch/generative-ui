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
  
  const playbackMenubarProps = {
    isStreaming,
    isPaused,
    streamingLength,
    markdownLength,
    onStepBackward,
    onPlayPause,
    onStepForward,
  };

  return (
    <View
      style={Platform.select({
        web: {
          // Web: PlaybackMenubar handles its own positioning
          // No wrapper needed, but we keep structure consistent
        },
        default: {
          // Mobile: Position menubar at bottom with safe area insets
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          paddingBottom: Math.max(insets.bottom, 0),
        },
      })}
    >
      <PlaybackMenubar {...playbackMenubarProps} />
    </View>
  );
}