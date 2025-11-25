import React from 'react';
import { View, Platform } from 'react-native';
import { InputArea } from './InputArea';
import { OutputArea } from './OutputArea';
import type { ComponentRegistry } from '@darkresearch/streamdown-rn';
import type { IncompleteTagState } from '../../../packages/streamdown-rn/src/core/types';
import type { ComponentExtractionState } from '@darkresearch/streamdown-rn';

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
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/ba72c841-4600-456b-adad-25adf0868af7',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ContentLayout.tsx:21',message:'ContentLayout render',data:{platform:Platform.OS,safeViewportHeight,markdownLength:markdown.length},timestamp:Date.now(),sessionId:'debug-session',runId:'web-debug',hypothesisId:'A'})}).catch(()=>{});
  // #endregion
  
  // Each section gets equal height with 24px gap between them
  const gapBetweenSections = 24;
  const sectionHeight = (safeViewportHeight - gapBetweenSections) / 2;

  // Web: side-by-side layout
  if (Platform.OS === 'web') {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/ba72c841-4600-456b-adad-25adf0868af7',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ContentLayout.tsx:28',message:'Rendering web layout',data:{safeViewportHeight},timestamp:Date.now(),sessionId:'debug-session',runId:'web-debug',hypothesisId:'B'})}).catch(()=>{});
    // #endregion
    return (
      <View 
        style={{ 
          flex: 1, 
          flexDirection: 'row', 
          width: '100%',
        }}
      >
        <View 
          style={{ 
            flex: 1,
            marginRight: 12,
          }}
        >
          <InputArea
            markdown={markdown}
            onMarkdownChange={onMarkdownChange}
            theme={theme}
          />
        </View>
        <View 
          style={{ 
            flex: 1,
            marginLeft: 12,
          }}
        >
          <OutputArea
            markdown={streamingMarkdown ?? markdown}
            componentRegistry={componentRegistry}
            theme={theme}
            onStateUpdate={onStateUpdate}
            onComponentExtractionUpdate={onComponentExtractionUpdate}
          />
        </View>
      </View>
    );
  }

  // Mobile: stacked layout (input on top, output on bottom)
  return (
    <View className="flex-1" style={{ height: safeViewportHeight }}>
      <View className="flex-1" style={{ height: sectionHeight, marginBottom: 24 }}>
        <InputArea
          markdown={markdown}
          onMarkdownChange={onMarkdownChange}
          theme={theme}
        />
      </View>
      <View className="flex-1" style={{ height: sectionHeight }}>
        <OutputArea
          markdown={streamingMarkdown ?? markdown}
          componentRegistry={componentRegistry}
          theme={theme}
          onStateUpdate={onStateUpdate}
          onComponentExtractionUpdate={onComponentExtractionUpdate}
        />
      </View>
    </View>
  );
}

