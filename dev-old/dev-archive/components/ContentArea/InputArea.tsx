import React from 'react';
import { View, Text, TextInput, StyleSheet, Platform } from 'react-native';
import { COLORS } from '../../constants/colors';

interface InputAreaProps {
  markdown: string;
  onMarkdownChange: (text: string) => void;
  editable: boolean;
  fontFamily: string;
}

export function InputArea({ markdown, onMarkdownChange, editable, fontFamily }: InputAreaProps) {
  return (
    <View style={styles.inputArea}>
      <Text style={[styles.sectionTitle, { fontFamily }]}>Input</Text>
      <TextInput
        style={[styles.textInput, { fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace' }]}
        multiline
        value={markdown}
        onChangeText={onMarkdownChange}
        placeholder="Enter markdown here..."
        placeholderTextColor={COLORS.accentLight}
        editable={editable}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  inputArea: {
    flex: 1,
    borderRightWidth: 1,
    borderRightColor: COLORS.border,
    padding: 16,
    backgroundColor: 'transparent',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.textPrimary,
    marginBottom: 12,
  },
  textInput: {
    flex: 1,
    backgroundColor: COLORS.inputBg,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
    borderRadius: 8,
    padding: 12,
    color: COLORS.textPrimary,
    fontSize: 14,
    textAlignVertical: 'top',
  },
});

