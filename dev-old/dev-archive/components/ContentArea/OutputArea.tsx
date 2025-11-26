import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { StreamdownRN } from 'streamdown-rn';
import { COLORS } from '../../constants/colors';
import type { ComponentRegistry } from 'streamdown-rn';
import type { ComponentExtractionState } from 'streamdown-rn';
import type { IncompleteTagState } from '../../../packages/streamdown-rn/src/core/types';

interface OutputAreaProps {
  streamingMarkdown: string;
  componentRegistry: ComponentRegistry;
  theme: 'dark' | 'light';
  onComponentError: (error: Error) => void;
  onStateUpdate: (state: IncompleteTagState) => void;
  onComponentExtractionUpdate: (state: ComponentExtractionState) => void;
  fontFamily: string;
}

export function OutputArea({
  streamingMarkdown,
  componentRegistry,
  theme,
  onComponentError,
  onStateUpdate,
  onComponentExtractionUpdate,
  fontFamily,
}: OutputAreaProps) {
  return (
    <View style={styles.outputArea}>
      <Text style={[styles.sectionTitle, { fontFamily }]}>Output</Text>
      <View style={[styles.outputContainer, { backgroundColor: theme === 'light' ? '#fafafa' : '#2a2a2a' }]}>
        <ScrollView style={styles.outputScroll} contentContainerStyle={styles.outputContent}>
          <StreamdownRN
            componentRegistry={componentRegistry}
            theme={theme}
            onComponentError={onComponentError}
            onStateUpdate={onStateUpdate}
            onComponentExtractionUpdate={onComponentExtractionUpdate}
          >
            {streamingMarkdown}
          </StreamdownRN>
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outputArea: {
    flex: 1,
    padding: 16,
    backgroundColor: 'transparent',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.textPrimary,
    marginBottom: 12,
  },
  outputContainer: {
    flex: 1,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
    borderRadius: 8,
    padding: 12,
    overflow: 'hidden',
  },
  outputScroll: {
    flex: 1,
  },
  outputContent: {
    padding: 8,
  },
});

