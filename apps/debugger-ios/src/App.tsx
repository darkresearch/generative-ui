import { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, SafeAreaView } from 'react-native';
import { StreamdownRN } from '@darkresearch/streamdown-rn';

const WS_URL = 'ws://localhost:3001';

export default function App() {
  const [content, setContent] = useState('');
  const [connected, setConnected] = useState(false);
  
  useEffect(() => {
    let ws: WebSocket | null = null;
    let reconnectTimeout: NodeJS.Timeout | null = null;
    
    const connect = () => {
      try {
        ws = new WebSocket(WS_URL);
        
        ws.onopen = () => {
          setConnected(true);
          console.log('✅ Connected to debugger');
        };
        
        ws.onclose = () => {
          setConnected(false);
          console.log('❌ Disconnected, reconnecting...');
          reconnectTimeout = setTimeout(connect, 1000);
        };
        
        ws.onerror = (error) => {
          console.error('WebSocket error:', error);
          setConnected(false);
        };
        
        ws.onmessage = (e) => {
          try {
            const data = JSON.parse(e.data);
            setContent(data.content || '');
          } catch (error) {
            console.error('Failed to parse message:', error);
          }
        };
      } catch (error) {
        console.error('Failed to connect:', error);
        setConnected(false);
        reconnectTimeout = setTimeout(connect, 1000);
      }
    };
    
    connect();
    
    return () => {
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
      ws?.close();
    };
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.statusBar}>
        <Text style={[styles.dot, connected && styles.dotConnected]}>●</Text>
        <Text style={styles.statusText}>
          {connected ? 'Connected to debugger' : 'Reconnecting...'}
        </Text>
      </View>
      <ScrollView 
        style={styles.content} 
        contentContainerStyle={styles.contentContainer}
      >
        {content ? (
          <StreamdownRN>{content}</StreamdownRN>
        ) : (
          <Text style={styles.placeholder}>
            Waiting for content from web debugger...
          </Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  statusBar: {
    flexDirection: 'row',
    padding: 12,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#333',
    backgroundColor: '#141414',
  },
  dot: {
    fontSize: 14,
    color: '#666',
    marginRight: 8,
  },
  dotConnected: {
    color: '#4ade80',
  },
  statusText: {
    color: '#888',
    fontSize: 14,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  placeholder: {
    color: '#666',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 40,
  },
});
