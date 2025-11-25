import React, { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { Card, CardHeader, CardTitle, CardContent, Button, Input, Text } from '@darkresearch/design-system';
import { PRESETS, PresetKey } from '../constants/presets';
import { RotateCcw } from '@darkresearch/design-system';

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

  const handleSpeedChange = (text: string) => {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/ba72c841-4600-456b-adad-25adf0868af7',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ControlsPopover.tsx:handleSpeedChange',message:'Speed changed',data:{input:text,parsed:parseInt(text,10),isValid:!isNaN(parseInt(text,10))&&parseInt(text,10)>0},timestamp:Date.now(),sessionId:'debug-session',runId:'streaming-test',hypothesisId:'F'})}).catch(()=>{});
    // #endregion
    setSpeedInput(text);
    const num = parseInt(text, 10);
    if (!isNaN(num) && num > 0 && onSpeedChange) {
      onSpeedChange(num);
    }
  };

  return (
    <ScrollView className="flex-1" contentContainerStyle={{ gap: 16 }}>
      {/* Preset Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Presets</CardTitle>
        </CardHeader>
        <CardContent>
          <View className="flex-row flex-wrap gap-2">
            {(Object.keys(PRESETS) as PresetKey[]).map((preset) => (
              <Button
                key={preset}
                variant={selectedPreset === preset ? 'default' : 'outline'}
                size="sm"
                onPress={() => {
                  // #region agent log
                  fetch('http://127.0.0.1:7242/ingest/ba72c841-4600-456b-adad-25adf0868af7',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ControlsPopover.tsx:presetChange',message:'Preset changed',data:{preset,previousPreset:selectedPreset},timestamp:Date.now(),sessionId:'debug-session',runId:'streaming-test',hypothesisId:'G'})}).catch(()=>{});
                  // #endregion
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
          <View className="flex-row items-center gap-2">
            <Input
              value={speedInput}
              onChangeText={handleSpeedChange}
              keyboardType="numeric"
              placeholder="50"
              className="flex-1"
            />
            <Text className="text-sm opacity-60">ms</Text>
          </View>
        </CardContent>
      </Card>

      {/* Playback Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Playback</CardTitle>
        </CardHeader>
        <CardContent className="gap-2">
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

