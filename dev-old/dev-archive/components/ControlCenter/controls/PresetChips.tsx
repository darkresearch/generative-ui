import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Chip } from 'react-native-paper';
import { PRESETS, PresetKey } from '../../../constants/presets';

interface PresetChipsProps {
  selectedPreset: string;
  onPresetChange: (preset: string) => void;
}

export function PresetChips({ selectedPreset, onPresetChange }: PresetChipsProps) {
  return (
    <View style={styles.container}>
      {(Object.keys(PRESETS) as PresetKey[]).map((preset) => (
        <Chip
          key={preset}
          selected={selectedPreset === preset}
          onPress={() => onPresetChange(preset)}
          style={styles.chip}
          mode="outlined"
          compact
        >
          {preset}
        </Chip>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    marginRight: 0,
    minWidth: 110,
    justifyContent: 'center',
  },
});

