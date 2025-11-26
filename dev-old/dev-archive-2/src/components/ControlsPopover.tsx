import React, { useState } from 'react';
import { ScrollView, View, Text } from 'react-native';
import { Card, CardHeader, CardTitle, CardContent, Button, Input, StyleSheet, useStyles } from '@darkresearch/design-system';
import { PRESETS, PresetKey } from '../constants/presets';
import { RotateCcw } from '@darkresearch/design-system';

const styles = StyleSheet.create(() => ({
  scrollContent: {
    gap: 16,
  },
  presetContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  speedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  speedInput: {
    flex: 1,
  },
  speedLabel: {
    fontSize: 14,
    opacity: 0.6,
  },
  contentGap: {
    gap: 8,
  },
}));

interface ControlsPopoverProps {
  isStreaming: boolean;
  isPaused: boolean;
  selectedPreset?: string;
  streamSpeed?: number;
  onPresetChange?: (preset: string) => void;
  onSpeedChange?: (speed: number) => void;
  onStart?: () => void;
  onReset?: () => void;
}

export function ControlsPopover({
  isStreaming,
  isPaused,
  selectedPreset,
  streamSpeed = 50,
  onPresetChange,
  onSpeedChange,
  onStart,
  onReset,
}: ControlsPopoverProps) {
  const [speedInput, setSpeedInput] = useState(streamSpeed.toString());
  const { styles: themeStyles } = useStyles();

  const handleSpeedChange = (text: string) => {
    setSpeedInput(text);
    const num = parseInt(text, 10);
    if (!isNaN(num) && num > 0 && onSpeedChange) {
      onSpeedChange(num);
    }
  };

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={themeStyles.scrollContent}>
      {/* Preset Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Presets</CardTitle>
        </CardHeader>
        <CardContent>
          <View style={themeStyles.presetContainer}>
            {(Object.keys(PRESETS) as PresetKey[]).map((preset) => (
              <Button
                key={preset}
                variant={selectedPreset === preset ? 'default' : 'outline'}
                size="sm"
                onPress={() => {
                  onPresetChange?.(preset);
                }}
              >
                {preset}
              </Button>
            ))}
          </View>
        </CardContent>
      </Card>

      {/* Speed Control */}
      <Card>
        <CardHeader>
          <CardTitle>Speed</CardTitle>
        </CardHeader>
        <CardContent>
          <View style={themeStyles.speedContainer}>
            <Input
              value={speedInput}
              onChangeText={handleSpeedChange}
              keyboardType="numeric"
              placeholder="50"
              style={themeStyles.speedInput}
            />
            <Text style={themeStyles.speedLabel}>ms</Text>
          </View>
        </CardContent>
      </Card>

      {/* Playback Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Playback</CardTitle>
        </CardHeader>
        <CardContent style={themeStyles.contentGap}>
          {!isStreaming && (
            <Button onPress={onStart}>
              Start Streaming
            </Button>
          )}
          <Button variant="outline" onPress={onReset}>
            <RotateCcw size={16} />
            Reset
          </Button>
        </CardContent>
      </Card>
    </ScrollView>
  );
}

