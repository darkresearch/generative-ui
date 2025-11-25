import React from 'react';
import { View, ScrollView } from 'react-native';
import { StreamdownRN } from '@darkresearch/streamdown-rn';
import type { ComponentRegistry } from '@darkresearch/streamdown-rn';
import type { IncompleteTagState } from '../../../packages/streamdown-rn/src/core/types';
import type { ComponentExtractionState } from '@darkresearch/streamdown-rn';
import { SectionLabel } from './SectionLabel';
import { StyledContainer } from './StyledContainer';
import { ContentPadding } from './ContentPadding';

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
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/ba72c841-4600-456b-adad-25adf0868af7',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'OutputArea.tsx:18',message:'OutputArea render',data:{markdownLength:markdown.length,theme},timestamp:Date.now(),sessionId:'debug-session',runId:'web-debug',hypothesisId:'E'})}).catch(()=>{});
  // #endregion
  
  return (
    <View style={{ flex: 1, backgroundColor: '#fafafa' }}>
      <SectionLabel>Output</SectionLabel>
      <StyledContainer theme={theme}>
        <ContentPadding>
          <ScrollView 
            style={{ flex: 1 }}
            contentContainerStyle={{ flexGrow: 1 }}
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

