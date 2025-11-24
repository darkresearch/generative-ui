import React, { useState, useCallback } from 'react';
import { View, useWindowDimensions } from 'react-native';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { colors } from '@darkresearch/design-system';
import { useAppFonts } from './useFonts';
import { ContentLayout } from './components/ContentLayout';

const DEFAULT_MARKDOWN = `# Hello World

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
`;

function AppContent() {
  const [markdown, setMarkdown] = useState(DEFAULT_MARKDOWN);
  const insets = useSafeAreaInsets();
  const { height: windowHeight, width: windowWidth } = useWindowDimensions();

  // Calculate safe viewport height (full height minus safe area insets)
  const safeViewportHeight = windowHeight - insets.top - insets.bottom;
  const safeViewportWidth = windowWidth - insets.left - insets.right;
  
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/ba72c841-4600-456b-adad-25adf0868af7',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'App.tsx:38',message:'AppContent render',data:{windowHeight,windowWidth,insetsTop:insets.top,insetsBottom:insets.bottom,safeViewportHeight,safeViewportWidth},timestamp:Date.now(),sessionId:'debug-session',runId:'web-debug',hypothesisId:'C'})}).catch(()=>{});
  // #endregion

  // Stable callback (performance.mdc - Rule 2)
  const handleMarkdownChange = useCallback((text: string) => {
    setMarkdown(text);
  }, []);

  return (
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
          onMarkdownChange={handleMarkdownChange}
          theme="light"
          safeViewportHeight={safeViewportHeight}
        />
      </View>
    </View>
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

