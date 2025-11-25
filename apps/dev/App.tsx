import React, { useState, useCallback } from 'react';
import { View, useWindowDimensions } from 'react-native';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { colors } from '@darkresearch/design-system';
import { useAppFonts } from './useFonts';
import { ContentLayout } from './components/ContentLayout';
import { DebugProvider } from './contexts/DebugContext';
import { useStreaming } from './hooks/useStreaming';
import { useKeyboardNavigation } from './hooks/useKeyboardNavigation';
import { RightSideFABs } from './components/RightSideFABs';
import { BottomMenubar } from './components/BottomMenubar';
import { PRESETS, PresetKey } from './constants/presets';
import type { IncompleteTagState } from '../../packages/streamdown-rn/src/core/types';
import type { ComponentExtractionState } from '@darkresearch/streamdown-rn';

const DEFAULT_MARKDOWN = PRESETS.Basic;

function AppContent() {
  const [markdown, setMarkdown] = useState(DEFAULT_MARKDOWN);
  const [streamSpeed, setStreamSpeed] = useState(50);
  const [selectedPreset, setSelectedPreset] = useState<PresetKey>('Basic');
  const [debugState, setDebugState] = useState<IncompleteTagState | null>(null);
  const [componentExtractionState, setComponentExtractionState] = useState<ComponentExtractionState | null>(null);
  
  const insets = useSafeAreaInsets();
  const { height: windowHeight, width: windowWidth } = useWindowDimensions();

  // Calculate safe viewport height (full height minus safe area insets)
  const safeViewportHeight = windowHeight - insets.top - insets.bottom;
  const safeViewportWidth = windowWidth - insets.left - insets.right;
  
  // Streaming hooks
  const {
    streamingMarkdown,
    isStreaming,
    isPaused,
    startStreaming,
    pauseStreaming,
    resumeStreaming,
    stopStreaming,
    reset,
    stepBackward,
    stepForward,
  } = useStreaming({ markdown, streamSpeed });

  useKeyboardNavigation({
    isPaused,
    markdown,
    onStepBackward: stepBackward,
    onStepForward: stepForward,
  });

  // Stable callbacks (performance.mdc - Rule 2)
  const handleMarkdownChange = useCallback((text: string) => {
    setMarkdown(text);
  }, []);

  const handlePresetChange = useCallback((preset: string) => {
    setSelectedPreset(preset as PresetKey);
    setMarkdown(PRESETS[preset as PresetKey] || '');
    stopStreaming();
  }, [stopStreaming]);

  const handleStateUpdate = useCallback((state: IncompleteTagState) => {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/ba72c841-4600-456b-adad-25adf0868af7',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'App.tsx:handleStateUpdate',message:'Debug state updated',data:{stackDepth:state.stack.length,earliestPosition:state.earliestPosition,tagCounts:Object.keys(state.tagCounts).length},timestamp:Date.now(),sessionId:'debug-session',runId:'streaming-test',hypothesisId:'I'})}).catch(()=>{});
    // #endregion
    // Schedule state update for next tick to avoid updating during render
    setTimeout(() => setDebugState(state), 0);
  }, []);

  const handleComponentExtractionUpdate = useCallback((state: ComponentExtractionState) => {
    // Schedule state update for next tick to avoid updating during render
    setTimeout(() => setComponentExtractionState(state), 0);
  }, []);

  const handlePlayPause = useCallback(() => {
    if (isStreaming && !isPaused) {
      pauseStreaming();
    } else if (isPaused) {
      resumeStreaming();
    } else {
      startStreaming();
    }
  }, [isStreaming, isPaused, pauseStreaming, resumeStreaming, startStreaming]);

  return (
    <DebugProvider
      value={{
        debugState,
        currentText: streamingMarkdown,
        componentExtractionState,
        components: [],
      }}
    >
    <View 
      style={{ 
        flex: 1,
        backgroundColor: '#fafafa',
        paddingTop: insets.top,
        paddingBottom: insets.bottom,
        paddingLeft: insets.left,
        paddingRight: insets.right,
      }}
    >
      <StatusBar style="dark" />
      <View
        style={{
          flex: 1,
          paddingHorizontal: 24,
          paddingVertical: 16,
        }}
      >
        <ContentLayout
          markdown={markdown}
            streamingMarkdown={streamingMarkdown}
          onMarkdownChange={handleMarkdownChange}
          theme="light"
          safeViewportHeight={safeViewportHeight}
            onStateUpdate={handleStateUpdate}
            onComponentExtractionUpdate={handleComponentExtractionUpdate}
          />
        </View>
        
        {/* Debug Controls */}
        <RightSideFABs
          isStreaming={isStreaming}
          isPaused={isPaused}
          selectedPreset={selectedPreset}
          streamSpeed={streamSpeed}
          onPresetChange={handlePresetChange}
          onSpeedChange={setStreamSpeed}
          onStart={startStreaming}
          onReset={reset}
        />
        
        <BottomMenubar
          isStreaming={isStreaming}
          isPaused={isPaused}
          streamingLength={isPaused ? streamingMarkdown.length : 0}
          markdownLength={markdown.length}
          onStepBackward={stepBackward}
          onPlayPause={handlePlayPause}
          onStepForward={stepForward}
        />
      </View>
    </DebugProvider>
  );
}

export default function App() {
  // Load Satoshi OTF fonts (works on both web and native)
  const [fontsLoaded] = useAppFonts();

  // Wait for fonts to load on both platforms
  if (!fontsLoaded) {
    return null; // Loading screen
  }

  return (
    <SafeAreaProvider>
      <AppContent />
    </SafeAreaProvider>
  );
}

