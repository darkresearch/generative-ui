import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withRepeat, 
  withTiming, 
  withSpring 
} from 'react-native-reanimated';

// Initialize Unistyles - import config to register themes
import '@darkresearch/design-system/src/lib/unistyles';

// const styles = StyleSheet.create((theme) => ({
//   container: {
//     flex: 1,
//     backgroundColor: theme.colors.bg,
//   },
//   content: {
//     flex: 1,
//     paddingHorizontal: 24,
//     paddingVertical: 16,
//   },
// }));

// function AppContent() {
//   const [markdown, setMarkdown] = useState(DEFAULT_MARKDOWN);
//   const [streamSpeed, setStreamSpeed] = useState(50);
//   const [selectedPreset, setSelectedPreset] = useState<PresetKey>('Basic');
//   const [debugState, setDebugState] = useState<IncompleteTagState | null>(null);
//   const [componentExtractionState, setComponentExtractionState] = useState<ComponentExtractionState | null>(null);
  
//   const insets = useSafeAreaInsets();
//   const { height: windowHeight, width: windowWidth } = useWindowDimensions();

//   // Calculate safe viewport height (full height minus safe area insets)
//   const safeViewportHeight = windowHeight - insets.top - insets.bottom;
//   const safeViewportWidth = windowWidth - insets.left - insets.right;
  
//   // Streaming hooks
//   const {
//     streamingMarkdown,
//     isStreaming,
//     isPaused,
//     startStreaming,
//     pauseStreaming,
//     resumeStreaming,
//     stopStreaming,
//     reset,
//     stepBackward,
//     stepForward,
//   } = useStreaming({ markdown, streamSpeed });

//   useKeyboardNavigation({
//     isPaused,
//     markdown,
//     onStepBackward: stepBackward,
//     onStepForward: stepForward,
//   });

//   // Stable callbacks (performance.mdc - Rule 2)
//   const handleMarkdownChange = useCallback((text: string) => {
//     setMarkdown(text);
//   }, []);

//   const handlePresetChange = useCallback((preset: string) => {
//     setSelectedPreset(preset as PresetKey);
//     setMarkdown(PRESETS[preset as PresetKey] || '');
//     stopStreaming();
//   }, [stopStreaming]);

//   const handleStateUpdate = useCallback((state: IncompleteTagState) => {
//     // #region agent log
//     fetch('http://127.0.0.1:7242/ingest/ba72c841-4600-456b-adad-25adf0868af7',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'App.tsx:handleStateUpdate',message:'Debug state updated',data:{stackDepth:state.stack.length,earliestPosition:state.earliestPosition,tagCounts:Object.keys(state.tagCounts).length},timestamp:Date.now(),sessionId:'debug-session',runId:'streaming-test',hypothesisId:'I'})}).catch(()=>{});
//     // #endregion
//     // Schedule state update for next tick to avoid updating during render
//     setTimeout(() => setDebugState(state), 0);
//   }, []);

//   const handleComponentExtractionUpdate = useCallback((state: ComponentExtractionState) => {
//     // Schedule state update for next tick to avoid updating during render
//     setTimeout(() => setComponentExtractionState(state), 0);
//   }, []);

//   const handlePlayPause = useCallback(() => {
//     if (isStreaming && !isPaused) {
//       pauseStreaming();
//     } else if (isPaused) {
//       resumeStreaming();
//     } else {
//       startStreaming();
//     }
//   }, [isStreaming, isPaused, pauseStreaming, resumeStreaming, startStreaming]);

//   const { styles: themeStyles } = useStyles();

//   return (
//     <DebugProvider
//       value={{
//         debugState,
//         currentText: streamingMarkdown,
//         componentExtractionState,
//         components: [],
//       }}
//     >
//     <View 
//       style={[
//         themeStyles.container,
//         { 
//           paddingTop: insets.top,
//           paddingBottom: insets.bottom,
//           paddingLeft: insets.left,
//           paddingRight: insets.right,
//         },
//       ]}
//     >
//       <View
//         style={[
//           themeStyles.content,
//           Platform.select({
//             ios: { marginBottom: 32 },
//             android: { marginBottom: 32 },
//             default: {},
//           }),
//         ]}
//       >
//         <ContentLayout
//           markdown={markdown}
//             streamingMarkdown={streamingMarkdown}
//           onMarkdownChange={handleMarkdownChange}
//           theme="light"
//           safeViewportHeight={safeViewportHeight}
//             onStateUpdate={handleStateUpdate}
//             onComponentExtractionUpdate={handleComponentExtractionUpdate}
//           />
//         </View>
        
//         {/* Debug Controls */}
//         <RightSideFABs
//           isStreaming={isStreaming}
//           isPaused={isPaused}
//           selectedPreset={selectedPreset}
//           streamSpeed={streamSpeed}
//           onPresetChange={handlePresetChange}
//           onSpeedChange={setStreamSpeed}
//           onStart={startStreaming}
//           onReset={reset}
//         />
        
//         <BottomMenubar
//           isStreaming={isStreaming}
//           isPaused={isPaused}
//           streamingLength={isPaused ? streamingMarkdown.length : 0}
//           markdownLength={markdown.length}
//           onStepBackward={stepBackward}
//           onPlayPause={handlePlayPause}
//           onStepForward={stepForward}
//         />
//       </View>
//     </DebugProvider>
//   );
// }

export default function App() {
  // Test Reanimated with a simple bouncing/rotating animation
  const translateY = useSharedValue(0);
  const rotation = useSharedValue(0);
  const scale = useSharedValue(1);

  useEffect(() => {
    // Bounce animation
    translateY.value = withRepeat(
      withSpring(-100, { damping: 2, stiffness: 100 }),
      -1,
      true
    );

    // Rotation animation
    rotation.value = withRepeat(
      withTiming(360, { duration: 2000 }),
      -1,
      false
    );
    
    // Scale pulse animation
    scale.value = withRepeat(
      withTiming(1.2, { duration: 1000 }),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateY: translateY.value },
        { rotate: `${rotation.value}deg` },
        { scale: scale.value },
      ],
    };
  });

  return (
    <SafeAreaProvider>
      <View style={styles.container}>
        <Animated.View style={[styles.box, animatedStyle]} />
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#EEEDED',
  },
  box: {
    width: 100,
    height: 100,
    backgroundColor: '#262626',
    borderRadius: 12,
  },
});

