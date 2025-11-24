/**
 * GitHub Dark Theme Configuration
 * Based on GitHub's dark theme color palette
 */

import { Platform } from 'react-native';
import { ThemeConfig } from '../core/types';

export const darkTheme: ThemeConfig = {
  colors: {
    text: '#c9d1d9',           // Main text color
    background: '#0d1117',     // Background
    border: '#30363d',         // Border color
    link: '#58a6ff',          // Link color
    code: '#c9d1d9',          // Code text color
    codeBackground: '#161b22', // Code background
    blockquote: '#8b949e',    // Blockquote accent color
    strong: '#c9d1d9',        // Bold text
    emphasis: '#c9d1d9',      // Italic text
    // Syntax highlighting colors (GitHub Dark)
    syntaxKeyword: '#ff7b72',  // Red for keywords
    syntaxString: '#a5d6ff',   // Light blue for strings
    syntaxNumber: '#79c0ff',   // Blue for numbers
    syntaxComment: '#8b949e',  // Gray for comments
    syntaxFunction: '#d2a8ff', // Purple for functions
    syntaxClass: '#ffa657',    // Orange for classes
    syntaxOperator: '#ff7b72', // Red for operators
    syntaxDefault: '#c9d1d9',  // Default text color
    // Code block UI colors
    codeBlockBackground: '#161b22',
    codeBlockBorder: '#30363d',
    codeBlockHeaderBg: '#0d1117',
    codeBlockHeaderText: '#8b949e',
    codeBlockCopyButtonBg: '#21262d',
    codeBlockCopyButtonText: '#c9d1d9',
    // Skeleton colors
    skeletonBase: '#161b22',
    skeletonHighlight: '#21262d',
  },
  fonts: {
    body: Platform.select({   // Satoshi font for body text
      ios: 'Satoshi-Regular',
      android: 'Satoshi-Regular',
      web: 'Satoshi-Regular',
      default: 'Satoshi-Regular',
    }),
    code: Platform.select({   // Platform-specific monospace font
      ios: 'Menlo',
      android: 'monospace',
      web: 'monospace',
      default: 'monospace',
    }),
    heading: Platform.select({   // Satoshi font for headings
      ios: 'Satoshi-Bold',
      android: 'Satoshi-Bold',
      web: 'Satoshi-Bold',
      default: 'Satoshi-Bold',
    }),
  },
  spacing: {
    paragraph: 12,            // Space between paragraphs
    heading: 16,              // Space around headings
    list: 8,                  // Space between list items
    code: 12,                 // Space around code blocks
  },
};

/**
 * Dark theme styles for react-native-markdown-display
 */
export const darkMarkdownStyles = {
  body: {
    color: darkTheme.colors.text,
    ...(darkTheme.fonts.body && { fontFamily: darkTheme.fonts.body }),
    fontSize: 16,
    lineHeight: 22,
    flexWrap: 'wrap' as const,
    flexShrink: 1,
    marginTop: 0,
    marginBottom: 0,
    paddingTop: 0,
    paddingBottom: 0,
    paddingLeft: 0,
    paddingRight: 0,
  },
  heading1: {
    color: darkTheme.colors.text,
    ...(darkTheme.fonts.heading && { fontFamily: darkTheme.fonts.heading }),
    fontSize: 24,
    lineHeight: 30, // 1.25x - GitHub standard, prevents clipping on mobile
    fontWeight: 'bold' as const,
    marginTop: 0, // No top margin - first element should start at top
    marginBottom: darkTheme.spacing.paragraph,
  },
  heading2: {
    color: darkTheme.colors.text,
    ...(darkTheme.fonts.heading && { fontFamily: darkTheme.fonts.heading }),
    fontSize: 20,
    lineHeight: 26, // 1.3x - GitHub standard
    fontWeight: 'bold' as const,
    marginTop: 0, // One-way spacing: spacing comes from element above's marginBottom
    marginBottom: darkTheme.spacing.paragraph,
  },
  heading3: {
    color: darkTheme.colors.text,
    ...(darkTheme.fonts.heading && { fontFamily: darkTheme.fonts.heading }),
    fontSize: 18,
    lineHeight: 24, // 1.33x - GitHub standard
    fontWeight: 'bold' as const,
    marginTop: 0, // One-way spacing: spacing comes from element above's marginBottom
    marginBottom: darkTheme.spacing.paragraph,
  },
  heading4: {
    color: darkTheme.colors.text,
    ...(darkTheme.fonts.heading && { fontFamily: darkTheme.fonts.heading }),
    fontSize: 16,
    lineHeight: 21, // 1.31x - GitHub standard
    fontWeight: 'bold' as const,
    marginTop: 0, // One-way spacing: spacing comes from element above's marginBottom
    marginBottom: darkTheme.spacing.paragraph,
  },
  heading5: {
    color: darkTheme.colors.text,
    ...(darkTheme.fonts.heading && { fontFamily: darkTheme.fonts.heading }),
    fontSize: 14,
    lineHeight: 19, // 1.36x - GitHub standard
    fontWeight: 'bold' as const,
    marginTop: 0, // One-way spacing: spacing comes from element above's marginBottom
    marginBottom: darkTheme.spacing.paragraph,
  },
  heading6: {
    color: darkTheme.colors.text,
    ...(darkTheme.fonts.heading && { fontFamily: darkTheme.fonts.heading }),
    fontSize: 12,
    lineHeight: 16, // 1.33x - GitHub standard
    fontWeight: 'bold' as const,
    marginTop: 0, // One-way spacing: spacing comes from element above's marginBottom
    marginBottom: darkTheme.spacing.paragraph,
  },
  paragraph: {
    color: darkTheme.colors.text,
    ...(darkTheme.fonts.body && { fontFamily: darkTheme.fonts.body }),
    fontSize: 16,
    lineHeight: 22,
    marginTop: 0, // No top margin - spacing comes from element above's marginBottom
    marginBottom: darkTheme.spacing.paragraph,
    flexWrap: 'wrap' as const,
    flexShrink: 1,
  },
  strong: {
    color: darkTheme.colors.strong,
    fontWeight: 'bold' as const,
    flexWrap: 'wrap' as const,
    flexShrink: 1,
  },
  em: {
    color: darkTheme.colors.emphasis,
    fontStyle: 'italic' as const,
    flexWrap: 'wrap' as const,
    flexShrink: 1,
  },
  link: {
    color: darkTheme.colors.link,
    textDecorationLine: 'underline' as const,
    flexWrap: 'wrap' as const,
    flexShrink: 1,
  },
  code_inline: {
    color: darkTheme.colors.text,  // Same as regular text
    backgroundColor: 'transparent',  // No background, blend into chat
    fontFamily: Platform.select({
      ios: 'Menlo',
      android: 'monospace',
      web: 'monospace',
      default: 'monospace',
    }),
    fontSize: 14,  // Match body text size
    lineHeight: 22,  // Match body line height
    borderWidth: 0,  // No border
    paddingHorizontal: 0,
    paddingVertical: 0,
    borderRadius: 0,
    flexWrap: 'wrap' as const,
    flexShrink: 1,
    // Web-specific: force long strings (like Solana addresses) to wrap
    wordBreak: 'break-all' as any,
    overflowWrap: 'anywhere' as any,
  },
  code_block: {
    color: darkTheme.colors.code,
    backgroundColor: darkTheme.colors.codeBackground,
    ...(darkTheme.fonts.code && { fontFamily: darkTheme.fonts.code }),
    fontSize: 13,  // Slightly smaller like ChatGPT
    padding: 12,  // More consistent padding
    borderRadius: 6,  // Slightly tighter radius
    marginVertical: 8,  // Tighter spacing
    overflowX: 'auto' as const,
    maxWidth: '100%',
  },
  fence: {
    color: darkTheme.colors.code,
    backgroundColor: darkTheme.colors.codeBackground,
    ...(darkTheme.fonts.code && { fontFamily: darkTheme.fonts.code }),
    fontSize: 13,  // Slightly smaller like ChatGPT
    padding: 12,  // More consistent padding
    borderRadius: 28,  // Rounder corners like ChatGPT
    borderWidth: 1,
    borderColor: darkTheme.colors.codeBlockBorder || darkTheme.colors.border,
    marginTop: 0, // One-way spacing: spacing comes from element above's marginBottom
    marginBottom: darkTheme.spacing.paragraph, // Spacing after code blocks
    overflowX: 'auto' as const,
    maxWidth: '100%',
  },
  blockquote: {
    borderLeftColor: darkTheme.colors.blockquote,
    borderLeftWidth: 4,
    paddingLeft: 12,
    paddingVertical: 0,  // No vertical padding - let content handle spacing
    marginTop: 0, // One-way spacing: spacing comes from element above's marginBottom
    marginBottom: darkTheme.spacing.paragraph,
    fontStyle: 'italic' as const,
    flexDirection: 'column' as const,
    justifyContent: 'center' as const,
    alignItems: 'flex-start' as const,
    width: '100%' as const, // Blockquote should take full available width
  },
  list_item: {
    color: darkTheme.colors.text,
    ...(darkTheme.fonts.body && { fontFamily: darkTheme.fonts.body }),
    fontSize: 16,
    lineHeight: 22,
    marginBottom: darkTheme.spacing.list,
    flexWrap: 'wrap' as const,
    flexShrink: 1,
    paddingLeft: 16, // GitHub standard: 16px indentation for list items
  },
  bullet_list: {
    marginTop: 0, // One-way spacing: spacing comes from element above's marginBottom
    marginBottom: darkTheme.spacing.paragraph,
    paddingLeft: 0,
    width: '100%', // Ensure list fills container width to prevent layout shifts
  },
  ordered_list: {
    marginTop: 0, // One-way spacing: spacing comes from element above's marginBottom
    marginBottom: darkTheme.spacing.paragraph,
    paddingLeft: 0,
    width: '100%', // Ensure list fills container width to prevent layout shifts
  },
  hr: {
    backgroundColor: darkTheme.colors.border,
    height: 1,
    width: '100%', // Ensure horizontal rule spans full width
    alignSelf: 'stretch', // Ensure it stretches to fill container
    marginTop: 0, // One-way spacing: spacing comes from element above's marginBottom
    marginBottom: darkTheme.spacing.heading,
  },
  table: {
    borderColor: 'transparent',
    borderWidth: 0,
    borderRadius: 0,
    marginVertical: darkTheme.spacing.paragraph,
    overflowX: 'auto' as const,
    maxWidth: '100%',
    display: 'block' as const,
    width: '100%',
    borderCollapse: 'collapse' as any,
  },
  th: {
    backgroundColor: 'transparent',
    color: darkTheme.colors.text,
    fontWeight: '600' as any,
    fontSize: 14,  // Slightly larger for better readability
    padding: 8,
    paddingBottom: 10,
    borderColor: darkTheme.colors.border,
    borderBottomWidth: 1,
    borderLeftWidth: 0,
    borderRightWidth: 0,
    borderTopWidth: 0,
    textAlign: 'left' as any,
    whiteSpace: 'nowrap' as any,  // Never wrap within cells - table scrolls instead
    // Web: responsive sizing - scales down on mobile via CSS
    '@media (max-width: 640px)': {
      fontSize: 12,
      padding: 6,
      paddingBottom: 8,
    },
  } as any,
  td: {
    color: darkTheme.colors.text,
    fontSize: 14,  // Slightly larger for better readability
    padding: 8,
    paddingVertical: 10,
    borderColor: darkTheme.colors.border,
    borderBottomWidth: 1,
    borderLeftWidth: 0,
    borderRightWidth: 0,
    borderTopWidth: 0,
    textAlign: 'left' as any,
    whiteSpace: 'nowrap' as any,  // Never wrap within cells - table scrolls instead
    // Web: responsive sizing - scales down on mobile via CSS
    '@media (max-width: 640px)': {
      fontSize: 12,
      padding: 6,
      paddingVertical: 8,
    },
  } as any,
};
