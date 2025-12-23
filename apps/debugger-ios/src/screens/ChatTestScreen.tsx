import { useState, useCallback, useMemo } from 'react';
import { View, Text, Pressable, TextInput, Image, ScrollView } from 'react-native';
import { StyleSheet, UnistylesRuntime } from 'react-native-unistyles';
import { FlashList } from '@shopify/flash-list';
import { LegendList } from '@legendapp/list';
import {
  StreamdownRN,
  type CodeBlockRendererProps,
  type ImageRendererProps,
  type LinkRendererProps,
  type BlockquoteRendererProps,
  type TableRendererProps,
  type HeadingRendererProps,
} from 'streamdown-rn';
import Markdown from 'react-native-markdown-display';
import { debugComponentRegistry } from '@darkresearch/debug-components';
import * as Clipboard from 'expo-clipboard';

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
  STREAMING_CODE_RESPONSE,
  STREAMING_ALL_ELEMENTS_RESPONSE,
  createUserMessage,
  createAssistantMessage,
} from '../data/testMessages';

type RenderMode = 'streamdown' | 'markdown' | 'custom-codeblock' | 'custom-all';

/**
 * Custom Code Block Renderer with Copy Button
 *
 * Demonstrates custom code block rendering with:
 * - Language label
 * - Copy button
 * - Horizontal scroll for long lines
 */
function CustomCodeBlockWithCopyButton({ code, language, theme }: CodeBlockRendererProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await Clipboard.setStringAsync(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <View style={customCodeStyles.container}>
      <View style={customCodeStyles.header}>
        <Text style={customCodeStyles.language}>{language}</Text>
        <Pressable onPress={handleCopy} style={customCodeStyles.copyButton}>
          <Text style={customCodeStyles.copyText}>
            {copied ? 'Copied!' : 'Copy'}
          </Text>
        </Pressable>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={customCodeStyles.codeScroll}>
        <Text style={customCodeStyles.code}>{code}</Text>
      </ScrollView>
    </View>
  );
}

// Styles for custom code block
const customCodeStyles = StyleSheet.create((theme) => ({
  container: {
    backgroundColor: '#1e1e1e',
    borderRadius: 8,
    marginVertical: 8,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#2d2d2d',
    borderBottomWidth: 1,
    borderBottomColor: '#3d3d3d',
  },
  language: {
    color: '#888',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  copyButton: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
    backgroundColor: '#4ade80',
  },
  copyText: {
    color: '#000',
    fontSize: 11,
    fontWeight: '600',
  },
  codeScroll: {
    padding: 12,
  },
  code: {
    fontFamily: 'monospace',
    fontSize: 13,
    color: '#d4d4d4',
    lineHeight: 20,
  },
}));

type ChatTestScreenProps = {
  listType: ListType;
  onBack: () => void;
};

/**
 * Custom Image Renderer
 * Demonstrates custom image rendering with a border and label
 */
function CustomImage({ src, alt, theme }: ImageRendererProps) {
  return (
    <View style={allRenderersStyles.imageContainer}>
      <Text style={allRenderersStyles.customLabel}>CUSTOM IMAGE</Text>
      <Image
        source={{ uri: src }}
        style={allRenderersStyles.image}
        resizeMode="cover"
        accessibilityLabel={alt || 'Image'}
      />
      {alt && <Text style={allRenderersStyles.imageAlt}>{alt}</Text>}
    </View>
  );
}

/**
 * Custom Link Renderer
 * Demonstrates custom link styling
 */
function CustomLink({ href, children, theme }: LinkRendererProps) {
  return (
    <Text style={allRenderersStyles.link}>
      🔗 {children}
    </Text>
  );
}

/**
 * Custom Blockquote Renderer
 * Demonstrates custom blockquote with a colored bar
 */
function CustomBlockquote({ children, theme }: BlockquoteRendererProps) {
  return (
    <View style={allRenderersStyles.blockquote}>
      <Text style={allRenderersStyles.customLabel}>CUSTOM BLOCKQUOTE</Text>
      <View style={allRenderersStyles.blockquoteInner}>
        <View style={allRenderersStyles.blockquoteBar} />
        <View style={allRenderersStyles.blockquoteContent}>
          {children}
        </View>
      </View>
    </View>
  );
}

/**
 * Custom Table Renderer
 * Demonstrates custom table styling
 */
function CustomTable({ headers, rows, alignments, theme }: TableRendererProps) {
  return (
    <View style={allRenderersStyles.table}>
      <Text style={allRenderersStyles.customLabel}>CUSTOM TABLE</Text>
      <View style={allRenderersStyles.tableInner}>
        <View style={allRenderersStyles.tableHeader}>
          {headers.map((header, i) => (
            <View key={i} style={allRenderersStyles.tableCell}>
              <Text style={allRenderersStyles.tableHeaderText}>{header}</Text>
            </View>
          ))}
        </View>
        {rows.map((row, rowIndex) => (
          <View key={rowIndex} style={allRenderersStyles.tableRow}>
            {row.map((cell, cellIndex) => (
              <View key={cellIndex} style={allRenderersStyles.tableCell}>
                <Text style={allRenderersStyles.tableCellText}>{cell}</Text>
              </View>
            ))}
          </View>
        ))}
      </View>
    </View>
  );
}

/**
 * Custom Heading Renderer
 * Demonstrates custom heading with level indicator
 */
function CustomHeading({ level, children, theme }: HeadingRendererProps) {
  const sizes = [26, 22, 18, 16, 14, 12];
  return (
    <View style={allRenderersStyles.headingContainer}>
      <Text style={allRenderersStyles.headingLevel}>H{level}</Text>
      <Text style={[allRenderersStyles.headingText, { fontSize: sizes[level - 1] }]}>
        {children}
      </Text>
    </View>
  );
}

// Styles for all custom renderers
const allRenderersStyles = StyleSheet.create((theme) => ({
  // Common label for all custom renderers
  customLabel: {
    backgroundColor: '#4ade80',
    color: '#000',
    fontSize: 10,
    fontWeight: 'bold',
    paddingHorizontal: 8,
    paddingVertical: 3,
    alignSelf: 'flex-start',
    borderRadius: 4,
    marginBottom: 6,
    letterSpacing: 1,
  },
  // Image
  imageContainer: {
    marginVertical: 8,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#4ade80',
    padding: 8,
    backgroundColor: 'rgba(74, 222, 128, 0.1)',
  },
  image: {
    width: '100%',
    aspectRatio: 16 / 9,
    borderRadius: 4,
  },
  imageAlt: {
    color: '#888',
    fontSize: 12,
    marginTop: 6,
    fontStyle: 'italic',
  },
  // Link
  link: {
    color: '#4ade80',
    fontWeight: '600',
  },
  // Blockquote
  blockquote: {
    marginVertical: 8,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#4ade80',
    padding: 8,
    backgroundColor: 'rgba(74, 222, 128, 0.1)',
  },
  blockquoteInner: {
    flexDirection: 'row',
  },
  blockquoteBar: {
    width: 4,
    backgroundColor: '#4ade80',
    borderRadius: 2,
    marginRight: 12,
  },
  blockquoteContent: {
    flex: 1,
  },
  // Table
  table: {
    marginVertical: 8,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#4ade80',
    padding: 8,
    backgroundColor: 'rgba(74, 222, 128, 0.1)',
  },
  tableInner: {
    borderRadius: 4,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#4ade80',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: 'rgba(74, 222, 128, 0.3)',
  },
  tableRow: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#4ade80',
  },
  tableCell: {
    flex: 1,
    padding: 8,
  },
  tableHeaderText: {
    color: '#4ade80',
    fontWeight: 'bold',
    fontSize: 12,
  },
  tableCellText: {
    color: '#fff',
    fontSize: 12,
  },
  // Heading
  headingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 6,
    gap: 8,
    backgroundColor: 'rgba(74, 222, 128, 0.1)',
    padding: 8,
    borderRadius: 6,
    borderLeftWidth: 4,
    borderLeftColor: '#4ade80',
  },
  headingLevel: {
    backgroundColor: '#4ade80',
    color: '#000',
    fontSize: 10,
    fontWeight: 'bold',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  headingText: {
    color: '#fff',
    fontWeight: 'bold',
    flex: 1,
  },
}));

// Memoize renderers object to avoid recreating on every render
const customCodeRenderers = { codeBlock: CustomCodeBlockWithCopyButton };

// All custom renderers for testing all element types
const customAllRenderers = {
  codeBlock: CustomCodeBlockWithCopyButton,
  image: CustomImage,
  link: CustomLink,
  blockquote: CustomBlockquote,
  table: CustomTable,
  heading: CustomHeading,
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

    // Use appropriate response based on render mode
    const baseResponse =
      renderMode === 'custom-all'
        ? STREAMING_ALL_ELEMENTS_RESPONSE
        : renderMode === 'custom-codeblock'
          ? STREAMING_CODE_RESPONSE
          : STREAMING_RESPONSE;

    // Stream characters
    const interval = setInterval(() => {
      currentIndex++;
      const msgNum = messages.length + 2;
      const streamContent = baseResponse.replace('[MSG #NEW]', `[MSG #${msgNum}]`);
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
  }, [messages.length, renderMode]);

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
          ) : renderMode === 'custom-all' ? (
            <StreamdownRN
              componentRegistry={debugComponentRegistry}
              renderers={customAllRenderers}
            >
              {item.content}
            </StreamdownRN>
          ) : renderMode === 'custom-codeblock' ? (
            <StreamdownRN
              componentRegistry={debugComponentRegistry}
              renderers={customCodeRenderers}
            >
              {item.content}
            </StreamdownRN>
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
            Streamdown
          </Text>
        </Pressable>
        <Pressable
          onPress={() => setRenderMode('custom-codeblock')}
          style={[
            styles.toggleButton,
            renderMode === 'custom-codeblock' && styles.toggleButtonActive,
          ]}
        >
          <Text
            style={[
              styles.toggleText,
              renderMode === 'custom-codeblock' && styles.toggleTextActive,
            ]}
          >
            Code
          </Text>
        </Pressable>
        <Pressable
          onPress={() => setRenderMode('custom-all')}
          style={[
            styles.toggleButton,
            renderMode === 'custom-all' && styles.toggleButtonActive,
          ]}
        >
          <Text
            style={[
              styles.toggleText,
              renderMode === 'custom-all' && styles.toggleTextActive,
            ]}
          >
            All
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
          extraData={renderMode}
          renderItem={renderMessage}
          contentContainerStyle={styles.listContent}
        />
      ) : (
        <LegendList
          data={messages}
          keyExtractor={(item) => item.id}
          extraData={renderMode}
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
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 6,
    backgroundColor: theme.colors.statusBg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  toggleButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#444',
  },
  toggleButtonActive: {
    backgroundColor: '#4ade80',
    borderColor: '#4ade80',
  },
  toggleText: {
    color: '#888',
    fontSize: 13,
    fontWeight: '500',
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
