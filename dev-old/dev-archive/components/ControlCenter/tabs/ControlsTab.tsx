import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Divider, Button } from 'react-native-paper';
import { PresetChips } from '../controls/PresetChips';
import { ThemeToggle } from '../controls/ThemeToggle';
import { PlaybackControls } from '../controls/PlaybackControls';
import { SpeedSlider } from '../controls/SpeedSlider';

interface ControlsTabProps {
  selectedPreset: string;
  onPresetChange: (preset: string) => void;
  theme: 'dark' | 'light';
  onThemeChange: (theme: 'dark' | 'light') => void;
  streamSpeed: number;
  onSpeedChange: (speed: number) => void;
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

export const ControlsTab = React.memo(function ControlsTab({
  selectedPreset,
  onPresetChange,
  theme,
  onThemeChange,
  streamSpeed,
  onSpeedChange,
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
}: ControlsTabProps) {
  // Create stable handlers that don't cause re-renders
  const handleStart = React.useCallback(() => {
    console.log('▶️ Start clicked');
    onStart();
  }, [onStart]);
  
  const handlePause = React.useCallback(() => {
    console.log('⏸️ Pause clicked');
    onPause();
  }, [onPause]);
  
  const handleResume = React.useCallback(() => {
    console.log('▶️ Resume clicked');
    onResume();
  }, [onResume]);
  
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Presets */}
      <View style={styles.section}>
        <Text variant="labelLarge" style={styles.sectionTitle}>Presets</Text>
        <PresetChips 
          selectedPreset={selectedPreset}
          onPresetChange={onPresetChange}
        />
      </View>

      <Divider />

      {/* Playback */}
      <View style={styles.section}>
        <Text variant="labelLarge" style={styles.sectionTitle}>Playback</Text>
        <PlaybackControls
          isStreaming={isStreaming}
          isPaused={isPaused}
          streamingLength={streamingLength}
          markdownLength={markdownLength}
          onStart={handleStart}
          onPause={handlePause}
          onResume={handleResume}
          onReset={onReset}
          onStepBackward={onStepBackward}
          onStepForward={onStepForward}
        />
      </View>

      <Divider />

      {/* Speed */}
      <View style={styles.section}>
        <SpeedSlider
          streamSpeed={streamSpeed}
          onSpeedChange={onSpeedChange}
        />
      </View>

      <Divider />

      {/* Theme */}
      <View style={styles.section}>
        <Text variant="labelLarge" style={styles.sectionTitle}>Theme</Text>
        <ThemeToggle
          theme={theme}
          onThemeChange={onThemeChange}
        />
      </View>

    </ScrollView>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    gap: 16,
  },
  section: {
    gap: 12,
    width: '100%',
  },
  sectionTitle: {
    marginBottom: 4,
  },
});

