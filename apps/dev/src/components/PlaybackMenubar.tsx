import React from 'react';
import { View, Platform, Pressable } from 'react-native';
import { ChevronLeft, Play, Pause, ChevronRight, StyleSheet, useStyles } from '@darkresearch/design-system';

const styles = StyleSheet.create((theme) => ({
  container: {
    ...Platform.select({
      web: {
        position: 'absolute',
        bottom: 16,
        left: 0,
        right: 0,
        alignItems: 'center',
        zIndex: 50,
        pointerEvents: 'box-none',
      },
      default: {
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
      },
    }),
  },
  menubar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    gap: 4,
    padding: 4,
    justifyContent: 'space-evenly',
    backgroundColor: theme.colors.fg,
    height: 38,
    minWidth: 140,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  button: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 6,
  },
}));

interface PlaybackMenubarProps {
  isStreaming: boolean;
  isPaused: boolean;
  streamingLength: number;
  markdownLength: number;
  onStepBackward: () => void;
  onPlayPause: () => void;
  onStepForward: () => void;
}

export function PlaybackMenubar({
  isStreaming,
  isPaused,
  streamingLength,
  markdownLength,
  onStepBackward,
  onPlayPause,
  onStepForward,
}: PlaybackMenubarProps) {
  const { styles: themeStyles } = useStyles();
  const handlePlayPause = () => {
    onPlayPause();
  };

  return (
    <View style={themeStyles.container}>
      <View style={themeStyles.menubar}>
        <Pressable
          onPress={onStepBackward}
          disabled={streamingLength === 0}
          style={themeStyles.button}
        >
          <ChevronLeft size={20} color="#EEEDED" />
        </Pressable>

        <Pressable
          onPress={handlePlayPause}
          style={themeStyles.button}
        >
          {isStreaming && !isPaused ? (
            <Pause size={20} color="#EEEDED" />
          ) : (
            <Play size={20} color="#EEEDED" />
          )}
        </Pressable>

        <Pressable
          onPress={onStepForward}
          disabled={streamingLength >= markdownLength}
          style={themeStyles.button}
        >
          <ChevronRight size={20} color="#EEEDED" />
        </Pressable>
      </View>
    </View>
  );
}

