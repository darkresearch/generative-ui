import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Platform } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import SyntaxHighlighter from 'react-native-syntax-highlighter';
import { ThemeConfig } from '../core/types';

interface CodeBlockProps {
  code: string;
  language?: string;
  theme: ThemeConfig;
}

export const CodeBlock: React.FC<CodeBlockProps> = ({ code, language, theme }) => {
  const [copied, setCopied] = useState(false);

  // Don't render empty code blocks
  if (!code || code.trim().length === 0) {
    return null;
  }

  // Trim trailing newlines to avoid extra space at bottom
  const trimmedCode = code.replace(/\n+$/, '');

  const handleCopy = async () => {
    await Clipboard.setStringAsync(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Use theme colors for all UI elements
  const backgroundColor = theme.colors.codeBlockBackground || theme.colors.codeBackground;
  const borderColor = theme.colors.codeBlockBorder || theme.colors.border;
  const headerBg = theme.colors.codeBlockHeaderBg || theme.colors.codeBackground;
  const headerText = theme.colors.codeBlockHeaderText || theme.colors.text;
  const copyButtonBg = theme.colors.codeBlockCopyButtonBg || theme.colors.border;
  const copyButtonText = theme.colors.codeBlockCopyButtonText || theme.colors.text;

  // Syntax highlighting colors from theme
  const syntaxStyle = {
    'hljs': {
      color: theme.colors.syntaxDefault,
      background: 'transparent',
    },
    'hljs-keyword': { color: theme.colors.syntaxKeyword },
    'hljs-built_in': { color: theme.colors.syntaxOperator },
    'hljs-type': { color: theme.colors.syntaxOperator },
    'hljs-literal': { color: theme.colors.syntaxNumber },
    'hljs-number': { color: theme.colors.syntaxNumber },
    'hljs-operator': { color: theme.colors.syntaxOperator },
    'hljs-string': { color: theme.colors.syntaxString },
    'hljs-regexp': { color: theme.colors.syntaxString },
    'hljs-comment': { color: theme.colors.syntaxComment },
    'hljs-function': { color: theme.colors.syntaxFunction },
    'hljs-title': { color: theme.colors.syntaxFunction },
    'hljs-params': { color: theme.colors.syntaxDefault },
    'hljs-attr': { color: theme.colors.syntaxString },
    'hljs-variable': { color: theme.colors.syntaxClass },
    'hljs-class': { color: theme.colors.syntaxClass },
  };

  return (
    <View style={[styles.container, { 
      backgroundColor,
      borderColor,
      borderWidth: 1,
      borderRadius: 28,
      marginBottom: theme.spacing.paragraph, // One-way spacing: spacing after code blocks
    }]}>
      {/* Header with language and copy button */}
      <View style={[styles.header, { backgroundColor: headerBg }]}>
        <Text style={[styles.language, { color: headerText }]}>
          {language || 'code'}
        </Text>
        <TouchableOpacity
          onPress={handleCopy}
          style={[styles.copyButton, { backgroundColor: copyButtonBg }]}
        >
          <Text style={[styles.copyButtonText, { color: copyButtonText }]}>
            {copied ? '✓ Copied' : 'Copy'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Code content with syntax highlighting */}
      <View style={styles.codeContainer}>
        <ScrollView 
          nestedScrollEnabled={true}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <SyntaxHighlighter
            language={language || 'text'}
            style={syntaxStyle}
            highlighter="hljs"
            fontSize={14}
            fontFamily={Platform.select({
              ios: 'Menlo',
              android: 'monospace',
              web: 'monospace',
              default: 'monospace',
            })}
            customStyle={{
              backgroundColor: 'transparent',
              paddingTop: 8,
              paddingHorizontal: 16,
              paddingBottom: Platform.select({
                ios: 0,
                android: 0,
                web: 12,  // Small bottom padding on web for better visual spacing
                default: 0,
              }),
              margin: 0,
              width: '100%',
            }}
            PreTag={({ children, ...props }: any) => (
              <View {...props} style={[props.style, styles.preTag]}>
                {children}
              </View>
            )}
            CodeTag={({ children, ...props }: any) => (
              <Text {...props} style={[props.style, styles.codeTag]}>
                {children}
              </Text>
            )}
          >
            {trimmedCode}
          </SyntaxHighlighter>
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 0, // One-way spacing: spacing comes from element above's marginBottom
    marginBottom: 0, // Will be set dynamically from theme
    overflow: 'hidden',
    width: '100%',
    alignSelf: 'stretch',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  language: {
    fontSize: 12,
    fontWeight: '500',
    textTransform: 'lowercase',
  },
  copyButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  copyButtonText: {
    fontSize: 12,
    fontWeight: '500',
  },
  codeContainer: {
    maxHeight: 400, // Limit height, allow scrolling if needed
    width: '100%',
  },
  scrollContent: {
    flexGrow: 1,
  },
  preTag: {
    width: '100%',
    alignSelf: 'stretch',
  },
  codeTag: {
    // Text components wrap by default in React Native
  },
  codeWrapper: {
    padding: 16,
    paddingTop: 8,
    minWidth: '100%',
  },
  codeText: {
    fontFamily: 'Menlo, Monaco, Consolas, Liberation Mono, Courier New, monospace',
    fontSize: 13,
    lineHeight: 20,
  },
});
