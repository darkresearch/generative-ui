import React, { useState, useCallback } from 'react';
import { View, StyleSheet, Platform, SafeAreaView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { PaperProvider } from 'react-native-paper';
import { DebugProvider } from './contexts/DebugContext';
import { Header } from './components/Header';
import { ContentArea } from './components/ContentArea/ContentArea';
import { ControlCenter } from './components/ControlCenter/ControlCenter';
import { createTestComponentRegistry, componentSourceCode } from './components/TestComponents';
import { useStreaming } from './hooks/useStreaming';
import { useFonts } from './hooks/useFonts';
import { useKeyboardNavigation } from './hooks/useKeyboardNavigation';
import { PRESETS, PresetKey } from './constants/presets';
import { lightPaperTheme, darkPaperTheme } from './constants/paperTheme';
import type { ComponentExtractionState } from 'streamdown-rn';
import type { IncompleteTagState } from '../packages/streamdown-rn/src/core/types';

export default function App() {
  const [markdown, setMarkdown] = useState(PRESETS.Basic);
  const [streamSpeed, setStreamSpeed] = useState(50);
  const [theme, setTheme] = useState<'dark' | 'light'>('light');
  const [selectedPreset, setSelectedPreset] = useState<string>('Basic');
  const [debugState, setDebugState] = useState<IncompleteTagState | null>(null);
  const [componentExtractionState, setComponentExtractionState] = useState<ComponentExtractionState | null>(null);
  const [controlPanelWidth, setControlPanelWidth] = useState(280);
  
  const componentRegistry = createTestComponentRegistry();

  // Custom hooks
  useFonts();
  
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

  const handlePresetChange = useCallback((preset: string) => {
    setSelectedPreset(preset);
    setMarkdown(PRESETS[preset as PresetKey] || '');
    stopStreaming();
  }, [stopStreaming]);

  // Memoize callbacks to prevent re-renders
  const handleComponentError = useCallback((error: Error) => {
    console.warn('Component error:', error);
  }, []);

  const handleStateUpdate = useCallback((state: IncompleteTagState) => {
    // Schedule state update for next tick to avoid updating during render
    setTimeout(() => setDebugState(state), 0);
  }, []);

  const handleComponentExtractionUpdate = useCallback((state: ComponentExtractionState) => {
    // Schedule state update for next tick to avoid updating during render
    setTimeout(() => setComponentExtractionState(state), 0);
  }, []);

  // Use Satoshi font on web, system font on native
  const fontFamily = Platform.OS === 'web' ? 'Satoshi' : '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif';

  // Always use light theme for control panel
  const paperTheme = lightPaperTheme;

  return (
      <DebugProvider 
        value={{
          debugState,
          currentText: streamingMarkdown,
          componentExtractionState,
          components: [
            {
              name: 'TokenCard',
              code: componentSourceCode.TokenCard,
              description: 'Displays token information with progressive rendering',
            },
            {
              name: 'Button',
              code: componentSourceCode.Button,
              description: 'A simple button component with progressive rendering',
            },
            {
              name: 'Badge',
              code: componentSourceCode.Badge,
              description: 'A badge component with progressive rendering',
            },
          ],
        }}
      >
      <PaperProvider theme={paperTheme}>
        <SafeAreaView style={styles.container}>
          <StatusBar style="dark" />

          {/* Content area */}
          <ContentArea
            markdown={markdown}
            onMarkdownChange={setMarkdown}
            streamingMarkdown={streamingMarkdown}
            isStreaming={isStreaming}
            componentRegistry={componentRegistry}
            theme={theme}
            onComponentError={handleComponentError}
            onStateUpdate={handleStateUpdate}
            onComponentExtractionUpdate={handleComponentExtractionUpdate}
            fontFamily={fontFamily}
            controlPanelWidth={controlPanelWidth}
          />

            {/* Unified Control Center */}
            <ControlCenter
              selectedPreset={selectedPreset}
              onPresetChange={handlePresetChange}
              theme={theme}
              onThemeChange={setTheme}
              streamSpeed={streamSpeed}
              onSpeedChange={setStreamSpeed}
              isStreaming={isStreaming}
              isPaused={isPaused}
              streamingLength={isPaused ? streamingMarkdown.length : 0}
              markdownLength={markdown.length}
              onStart={startStreaming}
              onPause={pauseStreaming}
              onResume={resumeStreaming}
              onReset={reset}
              onStepBackward={stepBackward}
              onStepForward={stepForward}
              onPanelWidthChange={setControlPanelWidth}
            />
          </SafeAreaView>
        </PaperProvider>
      </DebugProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF', // Solid white background
    position: 'relative',
  },
});
