import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  Platform,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Asset } from 'expo-asset';
import { StreamdownRN } from 'streamdown-rn';
import { Canvas, CanvasComponent } from 'galerie-rn';
import { createTestComponentRegistry, componentSourceCode } from './components/TestComponents';
import { Header } from './components/Header';
import { StateDebugPanel } from './components/StateDebugPanel';
import { ComponentLibrary } from './components/ComponentLibrary';
import type { IncompleteTagState, ComponentExtractionState } from 'streamdown-rn';

// Light mode colorway matching Dark website
const COLORS = {
  background: 'rgb(251, 251, 251)',
  textPrimary: '#2A2A2A',
  textSecondary: '#2A2A2A',
  heading: '#000000',
  border: '#E5E5E5',
  accent: '#494C53',
  accentLight: '#737373',
  accentLighter: '#d8d8d8',
  inputBg: '#FFFFFF',
  inputBorder: '#E5E5E5',
  buttonBorder: '#E5E5E5',
};

// Preset markdown examples
const PRESETS = {
  Basic: `# Hello World

This is **bold text** and *italic text*.

Here's some \`inline code\` and a list:

- Item 1
- Item 2
- Item 3

## Code Block

\`\`\`javascript
function greet(name) {
  return \`Hello, \${name}!\`;
}
\`\`\`

> This is a blockquote

[Link to example](https://example.com)
`,

  Components: `# Token Analysis

Here's the current Bitcoin data:

{{c:"TokenCard",p:{"sym":"BTC","name":"Bitcoin","price":45000,"change":2.5}}}

The price has been **trending upward** recently.

You can also use buttons inline: {{c:"Button",p:{"label":"View Details","variant":"primary"}}}

And badges: {{c:"Badge",p:{"text":"New","color":"#494C53"}}}
`,

  Code: `# Smart Contract Example

Here's a simple Solidity contract:

\`\`\`solidity
pragma solidity ^0.8.0;

contract SimpleToken {
    mapping(address => uint256) public balances;
    
    function transfer(address to, uint256 amount) public {
        require(balances[msg.sender] >= amount, "Insufficient balance");
        balances[msg.sender] -= amount;
        balances[to] += amount;
    }
}
\`\`\`

And some Python:

\`\`\`python
def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n-1) + fibonacci(n-2)
\`\`\`
`,

  Tables: `# Data Table

| Token | Price | Change |
|-------|-------|--------|
| BTC   | $45,000 | +2.5% |
| ETH   | $3,200 | +1.8% |
| SOL   | $150 | -0.5% |

## More Complex Table

| Component | Status | Version |
|-----------|--------|---------|
| StreamdownRN | ✅ Active | 0.1.5 |
| CodeBlock | ✅ Active | Latest |
| TableWrapper | ✅ Active | Latest |
`,
};

export default function App() {
  const [markdown, setMarkdown] = useState(PRESETS.Basic);
  const [streamingMarkdown, setStreamingMarkdown] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [streamSpeed, setStreamSpeed] = useState(50); // ms per character
  const [speedInputValue, setSpeedInputValue] = useState('50');
  const [theme, setTheme] = useState<'dark' | 'light'>('light');
  const [selectedPreset, setSelectedPreset] = useState<string>('Basic');
  const [showDebugPanel, setShowDebugPanel] = useState(false);
  const [showComponentLibrary, setShowComponentLibrary] = useState(false);
  const [debugState, setDebugState] = useState<IncompleteTagState | null>(null);
  const [componentExtractionState, setComponentExtractionState] = useState<ComponentExtractionState | null>(null);
  const [activeTab, setActiveTab] = useState<'streamdown' | 'galerie'>('streamdown');
  const streamingRef = useRef<NodeJS.Timeout | null>(null);
  const currentIndexRef = useRef<number>(0);
  const componentRegistry = createTestComponentRegistry();

  // Streaming simulation (typewriter effect)
  useEffect(() => {
    if (isStreaming && !isPaused && markdown.length > 0) {
      // Reset index if starting fresh (not resuming from pause)
      if (currentIndexRef.current === 0) {
        setStreamingMarkdown('');
      }

      const stream = () => {
        // Check if paused or stopped before continuing
        if (isPaused || !isStreaming) {
          return;
        }

        if (currentIndexRef.current < markdown.length) {
          setStreamingMarkdown(markdown.substring(0, currentIndexRef.current + 1));
          currentIndexRef.current++;
          streamingRef.current = setTimeout(stream, streamSpeed);
        } else {
          // Streaming complete
          setIsStreaming(false);
          setIsPaused(false);
          currentIndexRef.current = 0;
        }
      };

      stream();

      return () => {
        if (streamingRef.current) {
          clearTimeout(streamingRef.current);
          streamingRef.current = null;
        }
      };
    } else if (!isStreaming && !isPaused) {
      // Only reset if not paused (allows paused state to persist)
      currentIndexRef.current = 0;
      setStreamingMarkdown(markdown);
    }
  }, [isStreaming, isPaused, markdown, streamSpeed]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (streamingRef.current) {
        clearTimeout(streamingRef.current);
      }
    };
  }, []);

  // Keyboard event handlers for character-by-character navigation
  useEffect(() => {
    if (Platform.OS !== 'web') return;

    const handleKeyDown = (event: globalThis.KeyboardEvent) => {
      // Only handle arrow keys when paused
      if (!isPaused) return;

      // Prevent default scrolling behavior
      if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
        event.preventDefault();
      }

      if (event.key === 'ArrowLeft') {
        if (currentIndexRef.current > 0) {
          currentIndexRef.current--;
          setStreamingMarkdown(markdown.substring(0, currentIndexRef.current));
        }
      } else if (event.key === 'ArrowRight') {
        if (currentIndexRef.current < markdown.length) {
          currentIndexRef.current++;
          setStreamingMarkdown(markdown.substring(0, currentIndexRef.current));
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isPaused, markdown]);

  // Web font loading for web platform
  useEffect(() => {
    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      // Check if fonts are already loaded
      if (document.getElementById('satoshi-fonts')) return;
      
      const loadFonts = async () => {
        try {
          // Load fonts using expo-asset
          const [regularAsset, mediumAsset, boldAsset] = await Asset.loadAsync([
            require('./assets/fonts/Satoshi-Regular.woff2'),
            require('./assets/fonts/Satoshi-Medium.woff2'),
            require('./assets/fonts/Satoshi-Bold.woff2'),
          ]);
          
          const style = document.createElement('style');
          style.id = 'satoshi-fonts';
          style.textContent = `
            @font-face {
              font-family: 'Satoshi';
              src: url('${regularAsset.localUri || regularAsset.uri}') format('woff2');
              font-weight: 400;
              font-style: normal;
              font-display: swap;
            }
            @font-face {
              font-family: 'Satoshi';
              src: url('${mediumAsset.localUri || mediumAsset.uri}') format('woff2');
              font-weight: 500;
              font-style: normal;
              font-display: swap;
            }
            @font-face {
              font-family: 'Satoshi';
              src: url('${boldAsset.localUri || boldAsset.uri}') format('woff2');
              font-weight: 600;
              font-style: normal;
              font-display: swap;
            }
          `;
          document.head.appendChild(style);
        } catch (error) {
          console.warn('Failed to load Satoshi fonts:', error);
        }
      };
      
      loadFonts();
    }
  }, []);

  const handlePresetChange = (preset: string) => {
    setSelectedPreset(preset);
    setMarkdown(PRESETS[preset as keyof typeof PRESETS] || '');
    setIsStreaming(false);
    setIsPaused(false);
    currentIndexRef.current = 0;
    if (streamingRef.current) {
      clearTimeout(streamingRef.current);
      streamingRef.current = null;
    }
  };

  // Sync speedInputValue when streamSpeed changes externally
  useEffect(() => {
    setSpeedInputValue(streamSpeed.toString());
  }, [streamSpeed]);

  const startStreaming = () => {
    // Reset if starting fresh (not resuming)
    if (currentIndexRef.current === 0) {
      setStreamingMarkdown('');
    }
    setIsPaused(false);
    setIsStreaming(true);
  };

  const pauseStreaming = () => {
    setIsPaused(true);
    if (streamingRef.current) {
      clearTimeout(streamingRef.current);
      streamingRef.current = null;
    }
  };

  const stepBackward = () => {
    if (currentIndexRef.current > 0) {
      currentIndexRef.current--;
      setStreamingMarkdown(markdown.substring(0, currentIndexRef.current));
    }
  };

  const stepForward = () => {
    if (currentIndexRef.current < markdown.length) {
      currentIndexRef.current++;
      setStreamingMarkdown(markdown.substring(0, currentIndexRef.current));
    }
  };

  const resumeStreaming = () => {
    setIsPaused(false);
    setIsStreaming(true);
  };

  const stopStreaming = () => {
    setIsStreaming(false);
    setIsPaused(false);
    currentIndexRef.current = 0;
    if (streamingRef.current) {
      clearTimeout(streamingRef.current);
    }
    setStreamingMarkdown(markdown);
  };

  const reset = () => {
    setIsStreaming(false);
    setIsPaused(false);
    currentIndexRef.current = 0;
    if (streamingRef.current) {
      clearTimeout(streamingRef.current);
    }
    setStreamingMarkdown(markdown);
  };

  // Use Satoshi font on web, system font on native (woff2 not directly supported by expo-font)
  const fontFamily = Platform.OS === 'web' ? 'Satoshi' : '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif';

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      
      {/* Background image - positioned absolutely like website */}
      <Image
        source={require('./assets/background.jpg')}
        style={styles.backgroundImage}
        resizeMode="cover"
      />

      {/* Header */}
      <Header showSocials={true} fontFamily={fontFamily} />

      {/* Controls */}
      <View style={styles.controls}>
        <View style={styles.controlsGrid}>
          {/* Left Group */}
          <View style={styles.leftGroup}>
            {/* Tab selector */}
            <View style={styles.controlRow}>
              <TouchableOpacity 
                onPress={() => setActiveTab('streamdown')}
                style={[styles.tabButton, activeTab === 'streamdown' && styles.tabButtonActive]}
              >
                <Text style={[styles.tabButtonText, activeTab === 'streamdown' && styles.tabButtonTextActive]}>Streamdown</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={() => setActiveTab('galerie')}
                style={[styles.tabButton, activeTab === 'galerie' && styles.tabButtonActive]}
              >
                <Text style={[styles.tabButtonText, activeTab === 'galerie' && styles.tabButtonTextActive]}>Galerie</Text>
              </TouchableOpacity>
            </View>

            {/* Preset selector */}
            {activeTab === 'streamdown' && (
              <View style={styles.controlRow}>
                <Text style={[styles.controlLabel, { fontFamily }]}>Preset:</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.presetContainer}>
                  {Object.keys(PRESETS).map((preset) => (
                    <TouchableOpacity
                      key={preset}
                      style={[
                        styles.themeButton,
                        selectedPreset === preset && styles.themeButtonActive,
                      ]}
                      onPress={() => handlePresetChange(preset)}
                      activeOpacity={0.7}
                    >
                      <Text style={[
                        styles.themeButtonText,
                        { fontFamily },
                        selectedPreset === preset && styles.themeButtonTextActive,
                      ]}>
                        {preset}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}

            {/* Theme toggle */}
            <View style={styles.controlRow}>
              <Text style={[styles.controlLabel, { fontFamily }]}>Theme:</Text>
              <View style={styles.themeToggle}>
                <TouchableOpacity
                  style={[styles.themeButton, theme === 'dark' && styles.themeButtonActive]}
                  onPress={() => setTheme('dark')}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.themeButtonText, { fontFamily }, theme === 'dark' && styles.themeButtonTextActive]}>
                    Dark
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.themeButton, theme === 'light' && styles.themeButtonActive]}
                  onPress={() => setTheme('light')}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.themeButtonText, { fontFamily }, theme === 'light' && styles.themeButtonTextActive]}>
                    Light
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Right Group */}
          {activeTab === 'streamdown' && (
            <View style={styles.rightGroup}>
              {/* Speed control */}
              <View style={[styles.controlRow, styles.rightControlRow]}>
                <View style={styles.speedControl}>
                  <Text style={[styles.controlLabel, { fontFamily }]}>Delay:</Text>
                  <TextInput
                    style={[styles.speedInput, { fontFamily }]}
                    value={speedInputValue}
                    onChangeText={(text) => {
                      // Allow empty string for editing
                      setSpeedInputValue(text);
                      const num = parseInt(text, 10);
                      if (!isNaN(num) && num > 0) {
                        setStreamSpeed(num);
                      }
                    }}
                    onBlur={() => {
                      // Validate on blur - if empty or invalid, reset to current speed
                      const num = parseInt(speedInputValue, 10);
                      if (isNaN(num) || num <= 0) {
                        setSpeedInputValue(streamSpeed.toString());
                      }
                    }}
                    keyboardType="numeric"
                    placeholder="50"
                    placeholderTextColor={COLORS.accentLight}
                  />
                  <Text style={[styles.controlLabel, { fontFamily }]}>ms/char</Text>
                </View>
              </View>


              {/* Start, Reset, Debug buttons */}
              <View style={[styles.controlRow, styles.rightControlRow]}>
                <View style={styles.streamControls}>
                  {!isStreaming ? (
                    <TouchableOpacity
                      style={[styles.button, styles.buttonPill]}
                      onPress={startStreaming}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.buttonText, { fontFamily }]}>Start</Text>
                    </TouchableOpacity>
                  ) : isPaused ? (
                    <>
                      <TouchableOpacity
                        style={[styles.button, styles.buttonIcon]}
                        onPress={stepBackward}
                        activeOpacity={0.7}
                        disabled={streamingMarkdown.length === 0}
                      >
                        <Text style={[styles.buttonText, { fontFamily, opacity: streamingMarkdown.length === 0 ? 0.3 : 1 }]}>←</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.button, styles.buttonPill]}
                        onPress={resumeStreaming}
                        activeOpacity={0.7}
                      >
                        <Text style={[styles.buttonText, { fontFamily }]}>Resume</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.button, styles.buttonIcon]}
                        onPress={stepForward}
                        activeOpacity={0.7}
                        disabled={streamingMarkdown.length >= markdown.length}
                      >
                        <Text style={[styles.buttonText, { fontFamily, opacity: streamingMarkdown.length >= markdown.length ? 0.3 : 1 }]}>→</Text>
                      </TouchableOpacity>
                    </>
                  ) : (
                    <TouchableOpacity
                      style={[styles.button, styles.buttonPill]}
                      onPress={pauseStreaming}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.buttonText, { fontFamily }]}>Pause</Text>
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity
                    style={[styles.button, styles.buttonPill]}
                    onPress={reset}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.buttonText, { fontFamily }]}>Reset</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.button, styles.buttonPill, showDebugPanel && styles.buttonActive]}
                    onPress={() => setShowDebugPanel(!showDebugPanel)}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.buttonText, { fontFamily }]}>Debug</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.button, styles.buttonPill, showComponentLibrary && styles.buttonActive]}
                    onPress={() => setShowComponentLibrary(!showComponentLibrary)}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.buttonText, { fontFamily }]}>Components</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}
        </View>
      </View>

      {/* Content area - split view */}
      <View style={styles.contentArea}>
        {activeTab === 'streamdown' ? (
          <>
            {/* Input area */}
            <View style={styles.inputArea}>
              <Text style={[styles.sectionTitle, { fontFamily }]}>Input</Text>
              <TextInput
                style={[styles.textInput, { fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace' }]}
                multiline
                value={markdown}
                onChangeText={setMarkdown}
                placeholder="Enter markdown here..."
                placeholderTextColor={COLORS.accentLight}
                editable={!isStreaming}
              />
            </View>

            {/* Output area */}
            <View style={styles.outputArea}>
              <Text style={[styles.sectionTitle, { fontFamily }]}>Output</Text>
              <View style={[styles.outputContainer, { backgroundColor: theme === 'light' ? '#fafafa' : '#2a2a2a' }]}>
                <ScrollView style={styles.outputScroll} contentContainerStyle={styles.outputContent}>
                  <StreamdownRN
                    componentRegistry={componentRegistry}
                    theme={theme}
                    onComponentError={(error) => {
                      console.warn('Component error:', error);
                    }}
                    onStateUpdate={(state) => {
                      setDebugState(state);
                    }}
                    onComponentExtractionUpdate={(state) => {
                      setComponentExtractionState(state);
                    }}
                  >
                    {streamingMarkdown}
                  </StreamdownRN>
                </ScrollView>
              </View>
            </View>
          </>
        ) : (
          <View style={styles.outputArea}>
            <Text style={[styles.sectionTitle, { fontFamily }]}>Galerie Canvas Demo</Text>
            <View style={[styles.outputContainer, { backgroundColor: theme === 'light' ? '#fafafa' : '#2a2a2a' }]}>
              <Canvas width={1000} height={1000}>
                <CanvasComponent x={50} y={50} width={200} height={100}>
                  <View style={{ backgroundColor: 'lightblue', flex: 1, padding: 10, borderRadius: 8 }}>
                    <Text>Canvas Item 1</Text>
                  </View>
                </CanvasComponent>
                <CanvasComponent x={300} y={150} width={150} height={150}>
                  <View style={{ backgroundColor: 'lightgreen', flex: 1, padding: 10, borderRadius: 8 }}>
                    <Text>Canvas Item 2</Text>
                  </View>
                </CanvasComponent>
              </Canvas>
            </View>
          </View>
        )}
      </View>

      {/* Debug Panel */}
      {showDebugPanel && debugState && (
        <StateDebugPanel
          state={debugState}
          currentText={streamingMarkdown}
          componentState={componentExtractionState || undefined}
          onClose={() => setShowDebugPanel(false)}
        />
      )}

      {/* Component Library */}
      {showComponentLibrary && (
        <ComponentLibrary
          components={[
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
          ]}
          onClose={() => setShowComponentLibrary(false)}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    position: 'relative',
  },
  backgroundImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    zIndex: 1,
    opacity: 1,
  },
  controls: {
    padding: 16,
    paddingTop: Platform.OS === 'ios' ? 100 : 90,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: 'transparent',
    zIndex: 10,
    position: 'relative',
    ...(Platform.OS === 'web' && {
      paddingTop: 100,
    }),
  },
  controlsGrid: {
    flexDirection: 'row',
    width: '100%',
    ...(Platform.OS !== 'web' && {
      flexDirection: 'column',
    }),
  },
  leftGroup: {
    width: '50%',
    gap: 12,
    alignItems: 'flex-start',
    ...(Platform.OS !== 'web' && {
      width: '100%',
    }),
  },
  rightGroup: {
    width: '50%',
    gap: 12,
    alignItems: 'flex-end',
    ...(Platform.OS !== 'web' && {
      width: '100%',
      alignItems: 'flex-start',
    }),
  },
  controlRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    width: '100%',
  },
  rightControlRow: {
    justifyContent: 'flex-end',
  },
  controlLabel: {
    fontSize: 14,
    fontWeight: '400',
    color: COLORS.textPrimary,
  },
  presetContainer: {
    flex: 1,
    marginTop: 4,
  },
  presetButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: COLORS.buttonBorder,
    marginRight: 8,
  },
  presetButtonActive: {
    backgroundColor: COLORS.textPrimary,
    borderColor: COLORS.textPrimary,
  },
  presetButtonText: {
    fontSize: 14,
    fontWeight: '400',
    color: COLORS.textPrimary,
  },
  presetButtonTextActive: {
    color: COLORS.background,
  },
  streamControls: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  button: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.buttonBorder,
    backgroundColor: 'transparent',
    alignItems: 'center',
  },
  buttonPill: {
    paddingHorizontal: 16,
  },
  buttonIcon: {
    paddingHorizontal: 12,
    minWidth: 40,
  },
  buttonActive: {
    backgroundColor: COLORS.accent,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '400',
    color: COLORS.textPrimary,
    textAlign: 'center',
  },
  speedControl: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  speedInput: {
    width: 60,
    height: 32,
    backgroundColor: COLORS.inputBg,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
    borderRadius: 6,
    paddingHorizontal: 8,
    color: COLORS.textPrimary,
    fontSize: 14,
    fontWeight: '400',
  },
  themeToggle: {
    flexDirection: 'row',
    backgroundColor: 'transparent',
    borderRadius: 20,
    padding: 2,
    borderWidth: 1,
    borderColor: COLORS.buttonBorder,
  },
  themeButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 18,
  },
  themeButtonActive: {
    backgroundColor: COLORS.textPrimary,
  },
  themeButtonText: {
    fontSize: 14,
    fontWeight: '400',
    color: COLORS.textPrimary,
  },
  themeButtonTextActive: {
    color: COLORS.background,
  },
  contentArea: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'transparent',
    zIndex: 10,
    position: 'relative',
  },
  inputArea: {
    flex: 1,
    borderRightWidth: 1,
    borderRightColor: COLORS.border,
    padding: 16,
    backgroundColor: 'transparent',
  },
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
  tabButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabButtonActive: {
    borderBottomColor: COLORS.textPrimary,
  },
  tabButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.textSecondary,
  },
  tabButtonTextActive: {
    color: COLORS.textPrimary,
  },
});
