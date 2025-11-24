import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { FAB, Plus } from '@darkresearch/design-system';
import { useAppFonts } from './useFonts';

function AppContent() {
  const [count, setCount] = useState(0);
  const insets = useSafeAreaInsets();

  // Stable callback (performance.mdc - Rule 2)
  const handleIncrement = useCallback(() => {
    setCount(prev => prev + 1);
  }, []);

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <StatusBar style="dark" />
      
      <View style={styles.content}>
        <Text style={styles.title}>app starter</Text>
        <Text style={styles.subtitle}>
          built with @darkresearch/generative-ui
        </Text>
        
        <Text style={styles.count}>count: {count}</Text>
        
        <FAB
          icon={
            <Plus
              size={30}
              color="#EEEDED"
              strokeWidth={1.5}
            />
          }
          onPress={handleIncrement}
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EEEDED',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: '600',
    fontFamily: 'Satoshi-Medium',
    color: '#262626',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Satoshi-Regular',
    color: 'rgba(38, 38, 38, 0.6)',
    marginBottom: 40,
  },
  count: {
    fontSize: 48,
    fontWeight: '700',
    fontFamily: 'Satoshi-Bold',
    color: '#262626',
    marginBottom: 40,
  },
});

