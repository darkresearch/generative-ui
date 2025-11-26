import React from 'react';
import { View, StyleSheet } from 'react-native';
import { IconButton, Button } from 'react-native-paper';

interface PlaybackControlsProps {
  isStreaming: boolean;
  isPaused: boolean;
  streamingLength: number;
  markdownLength: number;
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onReset: () => void;
  onStepBackward: () => void;
  onStepForward: () => void;
}

export const PlaybackControls = React.memo(function PlaybackControls({
  isStreaming,
  isPaused,
  streamingLength,
  markdownLength,
  onStart,
  onPause,
  onResume,
  onReset,
  onStepBackward,
  onStepForward,
}: PlaybackControlsProps) {
  return (
    <View style={styles.container}>
      {/* Main Playback Row */}
      <View style={styles.playbackRow}>
        {!isStreaming ? (
          <Button 
            mode="contained" 
            onPress={onStart}
            icon="play"
            style={styles.mainButton}
          >
            Start
          </Button>
        ) : isPaused ? (
          <>
            <IconButton
              icon="step-backward"
              size={24}
              onPress={onStepBackward}
              disabled={streamingLength === 0}
            />
            <Button 
              mode="contained" 
              onPress={onResume}
              icon="play"
              style={styles.mainButton}
            >
              Resume
            </Button>
            <IconButton
              icon="step-forward"
              size={24}
              onPress={onStepForward}
              disabled={streamingLength >= markdownLength}
            />
          </>
        ) : (
          <Button 
            mode="contained" 
            onPress={onPause}
            icon="pause"
            style={styles.mainButton}
          >
            Pause
          </Button>
        )}
      </View>

      {/* Reset Button */}
      <Button 
        mode="outlined" 
        onPress={onReset}
        compact
      >
        Reset
      </Button>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  playbackRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  mainButton: {
    minWidth: 100,
  },
});

