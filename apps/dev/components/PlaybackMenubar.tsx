import React from 'react';
import { View, Platform, StyleSheet, Pressable } from 'react-native';
import { ChevronLeft, Play, Pause, ChevronRight } from '@darkresearch/design-system';

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
  const handlePlayPause = () => {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/ba72c841-4600-456b-adad-25adf0868af7',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'PlaybackMenubar.tsx:playPause',message:'Play/Pause clicked',data:{isStreaming,isPaused,action:isStreaming&&!isPaused?'pause':'play'},timestamp:Date.now(),sessionId:'debug-session',runId:'streaming-test',hypothesisId:'H'})}).catch(()=>{});
    // #endregion
    onPlayPause();
  };

  return (
    <View style={styles.container}>
      <View style={styles.menubar}>
        <Pressable
          onPress={onStepBackward}
          disabled={streamingLength === 0}
          style={styles.button}
        >
          <ChevronLeft size={20} color="#EEEDED" />
        </Pressable>

        <Pressable
          onPress={handlePlayPause}
          style={styles.button}
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
          style={styles.button}
        >
          <ChevronRight size={20} color="#EEEDED" />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
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
    backgroundColor: '#2a2a2a',
    height: 38,
    minWidth: 140,
    // Same shadow as FAB - consistent across mobile and web
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
});

