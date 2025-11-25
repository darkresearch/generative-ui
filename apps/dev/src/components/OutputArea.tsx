import React from 'react';
import { View, ScrollView } from 'react-native';
import { StyleSheet, useStyles } from '@darkresearch/design-system';
import { StreamdownRN } from '@darkresearch/streamdown-rn';
import type { ComponentRegistry } from '@darkresearch/streamdown-rn';
import type { IncompleteTagState } from '../../../../packages/streamdown-rn/src/core/types';
import type { ComponentExtractionState } from '@darkresearch/streamdown-rn';
import { SectionLabel } from './SectionLabel';
import { StyledContainer } from './StyledContainer';
import { ContentPadding } from './ContentPadding';

const styles = StyleSheet.create((theme) => ({
  container: {
    flex: 1,
    backgroundColor: theme.colors.bg,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
}));

interface OutputAreaProps {
  markdown: string;
  componentRegistry?: ComponentRegistry;
  theme?: 'dark' | 'light';
  onStateUpdate?: (state: IncompleteTagState) => void;
  onComponentExtractionUpdate?: (state: ComponentExtractionState) => void;
}

export function OutputArea({ 
  markdown, 
  componentRegistry,
  theme = 'light',
  onStateUpdate,
  onComponentExtractionUpdate,
}: OutputAreaProps) {
  const { styles: themeStyles } = useStyles();
  
  return (
    <View style={themeStyles.container}>
      <SectionLabel>Output</SectionLabel>
      <StyledContainer theme={theme}>
        <ContentPadding>
          <ScrollView 
            style={themeStyles.scrollView}
            contentContainerStyle={themeStyles.scrollContent}
          >
            <StreamdownRN
              componentRegistry={componentRegistry}
              theme={theme}
              onStateUpdate={onStateUpdate}
              onComponentExtractionUpdate={onComponentExtractionUpdate}
            >
              {markdown}
            </StreamdownRN>
          </ScrollView>
        </ContentPadding>
      </StyledContainer>
    </View>
  );
}

