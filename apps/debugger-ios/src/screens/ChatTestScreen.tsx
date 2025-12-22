import { useState, useCallback, useMemo } from 'react';
import { View, Text, Pressable, TextInput, Image } from 'react-native';
import { StyleSheet, UnistylesRuntime } from 'react-native-unistyles';
import { FlashList } from '@shopify/flash-list';
import { LegendList } from '@legendapp/list';
import { StreamdownRN } from 'streamdown-rn';
import Markdown from 'react-native-markdown-display';
import { debugComponentRegistry } from '@darkresearch/debug-components';

// Custom rules to fix "key prop being spread" warning in react-native-markdown-display
const markdownRules = {
  image: (node: any, children: any, parent: any, styles: any) => {
    // Extract key separately to avoid spreading it into Image props
    const { key, ...imageProps } = node.attributes || {};
    return (
      <Image
        key={node.key}
        source={{ uri: node.attributes?.src }}
        style={{ width: '100%', minHeight: 200 }}
        resizeMode="contain"
        accessibilityLabel={node.attributes?.alt || 'Image'}
      />
    );
  },
};

import type { ListType } from './ListPickerScreen';
import {
  Message,
  INITIAL_MESSAGES,
  STREAMING_RESPONSE,
  createUserMessage,
  createAssistantMessage,
} from '../data/testMessages';

type RenderMode = 'streamdown' | 'markdown';

type ChatTestScreenProps = {
  listType: ListType;
  onBack: () => void;
};

export function ChatTestScreen({ listType, onBack }: ChatTestScreenProps) {
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [inputText, setInputText] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [renderMode, setRenderMode] = useState<RenderMode>('streamdown');

  const addUserMessage = useCallback(() => {
    if (!inputText.trim() || isStreaming) return;

    const userMessage = createUserMessage(inputText.trim(), messages.length);
    setMessages((prev) => [...prev, userMessage]);
    setInputText('');

    // Simulate assistant response with streaming
    setTimeout(() => {
      simulateStreaming();
    }, 500);
  }, [inputText, isStreaming, messages.length]);

  const simulateStreaming = useCallback(() => {
    const assistantMessage = createAssistantMessage(messages.length + 1);
    let currentIndex = 0;

    setIsStreaming(true);
    setMessages((prev) => [...prev, assistantMessage]);

    // Stream characters
    const interval = setInterval(() => {
      currentIndex++;
      const msgNum = messages.length + 2;
      const streamContent = STREAMING_RESPONSE.replace('[MSG #NEW]', `[MSG #${msgNum}]`);
      const currentContent = streamContent.slice(0, currentIndex);

      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantMessage.id
            ? {
                ...m,
                content: currentContent,
                isStreaming: currentIndex < streamContent.length,
              }
            : m
        )
      );

      if (currentIndex >= streamContent.length) {
        clearInterval(interval);
        setIsStreaming(false);
      }
    }, 15);
  }, [messages.length]);

  const renderMessage = useCallback(
    ({ item, index }: { item: Message; index: number }) => {
      const isUser = item.role === 'user';

      return (
        <View
          style={[
            styles.messageContainer,
            isUser ? styles.userMessage : styles.assistantMessage,
          ]}
        >
          <View style={styles.messageHeader}>
            <Text style={styles.messageDebug}>
              pos:{index + 1} / msg:{item.messageNumber}
            </Text>
            <Text style={styles.roleLabel}>
              {isUser ? 'User' : 'Assistant'}
            </Text>
            {item.isStreaming && (
              <Text style={styles.streamingDot}>●</Text>
            )}
          </View>
          {isUser ? (
            <Text style={styles.userText}>{item.content}</Text>
          ) : renderMode === 'streamdown' ? (
            <StreamdownRN componentRegistry={debugComponentRegistry}>
              {item.content}
            </StreamdownRN>
          ) : (
            <Markdown rules={markdownRules}>{item.content}</Markdown>
          )}
        </View>
      );
    },
    [renderMode]
  );

  const listTitle = listType === 'flashlist' ? 'FlashList' : 'LegendList';

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={onBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </Pressable>
        <Text style={styles.headerTitle}>{listTitle} Test</Text>
        <Text style={styles.messageCount}>{messages.length} msgs</Text>
      </View>

      {/* Mode Toggle */}
      <View style={styles.toggleContainer}>
        <Pressable
          onPress={() => setRenderMode('streamdown')}
          style={[
            styles.toggleButton,
            renderMode === 'streamdown' && styles.toggleButtonActive,
          ]}
        >
          <Text
            style={[
              styles.toggleText,
              renderMode === 'streamdown' && styles.toggleTextActive,
            ]}
          >
            StreamdownRN
          </Text>
        </Pressable>
        <Pressable
          onPress={() => setRenderMode('markdown')}
          style={[
            styles.toggleButton,
            renderMode === 'markdown' && styles.toggleButtonActive,
          ]}
        >
          <Text
            style={[
              styles.toggleText,
              renderMode === 'markdown' && styles.toggleTextActive,
            ]}
          >
            Markdown
          </Text>
        </Pressable>
      </View>

      {/* Instructions */}
      <View style={styles.instructions}>
        <Text style={styles.instructionText}>
          Scroll down, then UP to test recycling. Check pos/msg match.
        </Text>
      </View>

      {/* List - conditionally render FlashList or LegendList */}
      {listType === 'flashlist' ? (
        <FlashList
          data={messages}
          keyExtractor={(item) => item.id}
          estimatedItemSize={150}
          maintainVisibleContentPosition={{ startRenderingFromBottom: true }}
          renderItem={renderMessage}
          contentContainerStyle={styles.listContent}
        />
      ) : (
        <LegendList
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderMessage}
          alignItemsAtEnd
          maintainScrollAtEnd
          maintainVisibleContentPosition
          recycleItems={false}
          contentContainerStyle={styles.listContent}
          style={styles.list}
        />
      )}

      {/* Input Area */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Type a message..."
          placeholderTextColor="#666"
          value={inputText}
          onChangeText={setInputText}
          onSubmitEditing={addUserMessage}
          editable={!isStreaming}
        />
        <Pressable
          onPress={addUserMessage}
          style={[styles.sendButton, isStreaming && styles.sendButtonDisabled]}
          disabled={isStreaming}
        >
          <Text style={styles.sendButtonText}>
            {isStreaming ? '...' : 'Send'}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  container: {
    flex: 1,
    backgroundColor: theme.colors.bg,
    paddingTop: UnistylesRuntime.insets.top,
    paddingBottom: UnistylesRuntime.insets.bottom,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    backgroundColor: theme.colors.statusBg,
  },
  backButton: {
    paddingRight: 12,
  },
  backButtonText: {
    color: '#4ade80',
    fontSize: 16,
  },
  headerTitle: {
    flex: 1,
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  messageCount: {
    color: theme.colors.text,
    fontSize: 12,
  },
  toggleContainer: {
    flexDirection: 'row',
    padding: 8,
    gap: 8,
    backgroundColor: theme.colors.statusBg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  toggleButton: {
    flex: 1,
    padding: 10,
    borderRadius: 8,
    backgroundColor: '#2a2a2a',
    alignItems: 'center',
  },
  toggleButtonActive: {
    backgroundColor: '#4ade80',
  },
  toggleText: {
    color: '#888',
    fontSize: 14,
    fontWeight: '600',
  },
  toggleTextActive: {
    color: '#000',
  },
  instructions: {
    padding: 8,
    backgroundColor: '#1a1a2e',
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  instructionText: {
    color: '#fbbf24',
    fontSize: 12,
    textAlign: 'center',
  },
  list: {
    flex: 1,
  },
  listContent: {
    padding: 12,
  },
  messageContainer: {
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
    width: '90%',
  },
  userMessage: {
    backgroundColor: '#1e3a5f',
    alignSelf: 'flex-end',
    marginLeft: '10%',
  },
  assistantMessage: {
    backgroundColor: '#2a2a2a',
    alignSelf: 'flex-start',
    marginRight: '10%',
  },
  messageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  messageDebug: {
    color: '#4ade80',
    fontSize: 12,
    fontWeight: '700',
    fontFamily: 'monospace',
  },
  roleLabel: {
    color: '#888',
    fontSize: 11,
  },
  streamingDot: {
    color: '#4ade80',
    fontSize: 10,
  },
  userText: {
    color: '#fff',
    fontSize: 15,
    lineHeight: 22,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 12,
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    backgroundColor: theme.colors.statusBg,
  },
  input: {
    flex: 1,
    backgroundColor: '#2a2a2a',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    color: '#fff',
    fontSize: 15,
  },
  sendButton: {
    backgroundColor: '#4ade80',
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 10,
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#333',
  },
  sendButtonText: {
    color: '#000',
    fontWeight: '600',
    fontSize: 15,
  },
}));
