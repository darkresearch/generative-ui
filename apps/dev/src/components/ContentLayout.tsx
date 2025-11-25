import React from 'react';
import { View, Platform } from 'react-native';
import { StyleSheet, useStyles } from '@darkresearch/design-system';
import { InputArea } from './InputArea';
import { OutputArea } from './OutputArea';
import type { ComponentRegistry } from '@darkresearch/streamdown-rn';
import type { IncompleteTagState } from '../../../../packages/streamdown-rn/src/core/types';
import type { ComponentExtractionState } from '@darkresearch/streamdown-rn';

const styles = StyleSheet.create(() => ({
  webContainer: {
    flex: 1,
    flexDirection: 'row',
    width: '100%',
  },
  webSection: {
    flex: 1,
  },
  mobileContainer: {
    flex: 1,
  },
  mobileSection: {
    flex: 1,
  },
}));

interface ContentLayoutProps {
  markdown: string;
  streamingMarkdown?: string;
  onMarkdownChange: (text: string) => void;
  componentRegistry?: ComponentRegistry;
  theme?: 'dark' | 'light';
  safeViewportHeight: number;
  onStateUpdate?: (state: IncompleteTagState) => void;
  onComponentExtractionUpdate?: (state: ComponentExtractionState) => void;
}

export function ContentLayout({
  markdown,
  streamingMarkdown,
  onMarkdownChange,
  componentRegistry,
  theme = 'light',
  safeViewportHeight,
  onStateUpdate,
  onComponentExtractionUpdate,
}: ContentLayoutProps) {
  const { styles: themeStyles } = useStyles();
  
  // Each section gets equal height with 24px gap between them
  const gapBetweenSections = 24;
  const sectionHeight = (safeViewportHeight - gapBetweenSections) / 2;

  // Extract common props to avoid duplication
  const inputAreaProps = {
    markdown,
    onMarkdownChange,
    theme,
  };

  const outputAreaProps = {
    markdown: streamingMarkdown ?? markdown,
    componentRegistry,
    theme,
    onStateUpdate,
    onComponentExtractionUpdate,
  };

  // Web: side-by-side layout
  if (Platform.OS === 'web') {
    return (
      <View style={themeStyles.webContainer}>
        <View style={[themeStyles.webSection, { marginRight: 12 }]}>
          <InputArea {...inputAreaProps} />
        </View>
        <View style={[themeStyles.webSection, { marginLeft: 12 }]}>
          <OutputArea {...outputAreaProps} />
        </View>
      </View>
    );
  }

  // Mobile: stacked layout (input on top, output on bottom)
  return (
    <View style={[themeStyles.mobileContainer, { height: safeViewportHeight }]}>
      <View style={[themeStyles.mobileSection, { height: sectionHeight, marginBottom: gapBetweenSections }]}>
        <InputArea {...inputAreaProps} />
      </View>
      <View style={[themeStyles.mobileSection, { height: sectionHeight }]}>
        <OutputArea {...outputAreaProps} />
      </View>
    </View>
  );
}
