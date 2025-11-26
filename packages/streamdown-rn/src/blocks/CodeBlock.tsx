/**
 * CodeBlock - Unified Code Block Renderer
 * 
 * Handles both StableBlock and raw data input.
 */

import React from 'react';
import { View, Text, ScrollView, Platform } from 'react-native';
import SyntaxHighlighter from 'react-native-syntax-highlighter';
import type { StableBlock, ThemeConfig } from '../core/types';
import { getBlockStyles } from '../themes';
import { normalizeLanguage, createSyntaxStyle } from './syntax-utils';

export interface CodeBlockProps {
  theme: ThemeConfig;
  /** StableBlock input (extracts code/language from it) */
  block?: StableBlock;
  /** Direct code input (when not using block) */
  code?: string;
  /** Direct language input (when not using block) */
  language?: string;
}

/**
 * Extract code content from raw markdown (removes fences)
 */
function extractCode(content: string): string {
  const lines = content.split('\n');
  // Remove first line (opening fence) and last line if it's a closing fence
  const codeLines = lines.slice(1);
  const lastLine = codeLines[codeLines.length - 1];
  const hasClosingFence = lastLine && /^(`{3,}|~{3,})\s*$/.test(lastLine);
  
  return hasClosingFence
    ? codeLines.slice(0, -1).join('\n')
    : codeLines.join('\n');
}

/**
 * Extract language from raw markdown or metadata
 */
function extractLanguage(content: string, meta?: { language?: string }): string {
  if (meta?.language) return meta.language;
  
  const firstLine = content.split('\n')[0];
  const match = firstLine.match(/^(`{3,}|~{3,})(\w*)?/);
  return match?.[2] || '';
}

export const CodeBlock: React.FC<CodeBlockProps> = React.memo(
  ({ theme, block, code: directCode, language: directLanguage }) => {
    const blockStyles = getBlockStyles(theme);
    
    // Determine code and language from either source
    let code: string;
    let language: string;
    
    if (block) {
      const meta = block.meta as { type: 'codeBlock'; language: string };
      code = extractCode(block.content);
      language = meta.language || extractLanguage(block.content);
    } else {
      code = directCode ?? '';
      language = directLanguage ?? '';
    }
    
    // Trim trailing newlines
    code = code.replace(/\n+$/, '');
    
    const normalizedLanguage = normalizeLanguage(language || 'text');
    const syntaxStyle = createSyntaxStyle(theme);
    
    return (
      <View style={blockStyles.codeBlock}>
        {language && (
          <Text style={{
            color: theme.colors.muted,
            fontSize: 12,
            marginBottom: 8,
            fontFamily: theme.fonts.mono,
          }}>
            {language}
          </Text>
        )}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ flexGrow: 1 }}
        >
          <SyntaxHighlighter
            language={normalizedLanguage}
            style={syntaxStyle}
            highlighter="prism"
            customStyle={{
              backgroundColor: 'transparent',
              padding: 0,
              margin: 0,
            }}
            fontSize={14}
            fontFamily={Platform.select({
              ios: 'Menlo',
              android: 'monospace',
              web: 'monospace',
              default: 'monospace',
            })}
          >
            {code}
          </SyntaxHighlighter>
        </ScrollView>
      </View>
    );
  },
  // Only re-render if block hash changes (for stable blocks) or code changes
  (prev, next) => {
    if (prev.block && next.block) {
      return prev.block.contentHash === next.block.contentHash;
    }
    return prev.code === next.code && prev.language === next.language;
  }
);

CodeBlock.displayName = 'CodeBlock';

