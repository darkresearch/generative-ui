import React from 'react';
import { View, StyleSheet, Platform, useWindowDimensions } from 'react-native';
import { InputArea } from './InputArea';
import { OutputArea } from './OutputArea';
import type { ComponentRegistry } from 'streamdown-rn';
import type { ComponentExtractionState } from 'streamdown-rn';
import type { IncompleteTagState } from '../../../packages/streamdown-rn/src/core/types';

interface ContentAreaProps {
  markdown: string;
  onMarkdownChange: (text: string) => void;
  streamingMarkdown: string;
  isStreaming: boolean;
  componentRegistry: ComponentRegistry;
  theme: 'dark' | 'light';
  onComponentError: (error: Error) => void;
  onStateUpdate: (state: IncompleteTagState) => void;
  onComponentExtractionUpdate: (state: ComponentExtractionState) => void;
  fontFamily: string;
  controlPanelWidth?: number;
}

export function ContentArea({
  markdown,
  onMarkdownChange,
  streamingMarkdown,
  isStreaming,
  componentRegistry,
  theme,
  onComponentError,
  onStateUpdate,
  onComponentExtractionUpdate,
  fontFamily,
  controlPanelWidth = 280,
}: ContentAreaProps) {
  const { width } = useWindowDimensions();
  const isMobile = width < 768;

  return (
    <View style={[
      styles.contentArea,
      isMobile ? styles.contentAreaMobile : styles.contentAreaDesktop,
      Platform.OS === 'web' && !isMobile && { paddingRight: controlPanelWidth }
    ]}>
      <InputArea
        markdown={markdown}
        onMarkdownChange={onMarkdownChange}
        editable={!isStreaming}
        fontFamily={fontFamily}
      />
      <OutputArea
        streamingMarkdown={streamingMarkdown}
        componentRegistry={componentRegistry}
        theme={theme}
        onComponentError={onComponentError}
        onStateUpdate={onStateUpdate}
        onComponentExtractionUpdate={onComponentExtractionUpdate}
        fontFamily={fontFamily}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  contentArea: {
    flex: 1,
    backgroundColor: 'transparent',
    zIndex: 10,
    position: 'relative',
  },
  contentAreaDesktop: {
    flexDirection: 'row', // Side by side on desktop
  },
  contentAreaMobile: {
    flexDirection: 'column', // Stacked on mobile
  },
});

