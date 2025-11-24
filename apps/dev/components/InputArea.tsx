import React from 'react';
import { View, Platform } from 'react-native';
import { Textarea } from '@darkresearch/design-system';
import { SectionLabel } from './SectionLabel';
import { StyledContainer } from './StyledContainer';
import { ContentPadding } from './ContentPadding';

interface InputAreaProps {
  markdown: string;
  onMarkdownChange: (text: string) => void;
  editable?: boolean;
  theme?: 'dark' | 'light';
}

export function InputArea({ markdown, onMarkdownChange, editable = true, theme = 'light' }: InputAreaProps) {
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/ba72c841-4600-456b-adad-25adf0868af7',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'InputArea.tsx:12',message:'InputArea render',data:{platform:Platform.OS,markdownLength:markdown.length,theme},timestamp:Date.now(),sessionId:'debug-session',runId:'web-debug',hypothesisId:'D'})}).catch(()=>{});
  // #endregion
  
  return (
    <View style={{ flex: 1, backgroundColor: '#fafafa' }}>
      <SectionLabel>Input</SectionLabel>
      <StyledContainer theme={theme}>
        <ContentPadding>
          <Textarea
            value={markdown}
            onChangeText={onMarkdownChange}
            placeholder="Enter markdown here..."
            editable={editable}
            className="flex-1 font-mono border-0 focus-visible:ring-0 focus-visible:ring-offset-0 px-0 py-0 rounded-none"
            style={{ 
              backgroundColor: 'transparent',
              borderWidth: 0,
              padding: 0,
              borderRadius: 0,
              flex: 1,
              minHeight: 0,
              fontFamily: Platform.select({ 
                ios: 'Menlo',
                android: 'monospace',
                web: 'monospace',
                default: 'monospace',
              }),
              ...(Platform.OS === 'web' && {
                outlineStyle: 'none',
                outlineWidth: 0,
              }),
            }}
            numberOfLines={Platform.select({ web: 10, native: 20 })}
          />
        </ContentPadding>
      </StyledContainer>
    </View>
  );
}

