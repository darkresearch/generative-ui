import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, TextInput } from 'react-native-paper';
import Slider from '@react-native-community/slider';
import { COLORS } from '../../../constants/colors';

interface SpeedSliderProps {
  streamSpeed: number;
  onSpeedChange: (speed: number) => void;
}

export const SpeedSlider = React.memo(function SpeedSlider({ streamSpeed, onSpeedChange }: SpeedSliderProps) {
  const [inputValue, setInputValue] = useState(streamSpeed.toString());

  useEffect(() => {
    setInputValue(streamSpeed.toString());
  }, [streamSpeed]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text variant="labelLarge">Speed</Text>
        <View style={styles.inputContainer}>
          <TextInput
            value={inputValue}
            onChangeText={(text) => {
              setInputValue(text);
              const num = parseInt(text, 10);
              if (!isNaN(num) && num > 0) {
                onSpeedChange(num);
              }
            }}
            onBlur={() => {
              const num = parseInt(inputValue, 10);
              if (isNaN(num) || num <= 0) {
                setInputValue(streamSpeed.toString());
              }
            }}
            keyboardType="numeric"
            mode="outlined"
            dense
            style={styles.input}
            right={<TextInput.Affix text="ms" />}
          />
        </View>
      </View>
      <Slider
        value={streamSpeed}
        onValueChange={onSpeedChange}
        minimumValue={10}
        maximumValue={200}
        step={5}
        minimumTrackTintColor={COLORS.accent}
        maximumTrackTintColor={COLORS.border}
        thumbTintColor={COLORS.accent}
      />
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    gap: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  inputContainer: {
    minWidth: 80,
    flex: 1,
    maxWidth: 100,
  },
  input: {
    height: 40,
  },
});

