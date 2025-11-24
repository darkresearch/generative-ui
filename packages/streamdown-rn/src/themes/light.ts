/**
 * GitHub Light Theme Configuration
 * Based on GitHub's light theme color palette
 */

import { Platform } from 'react-native';
import { ThemeConfig } from '../core/types';

export const lightTheme: ThemeConfig = {
  colors: {
    text: '#24292e',          // Dark text on light background
    background: '#ffffff',     // White background
    border: '#e1e4e8',         // Light border
    link: '#0366d6',          // Blue links
    code: '#24292e',          // Code text color
    codeBackground: '#f6f8fa', // Light code background
    blockquote: '#6a737d',    // Blockquote accent
    strong: '#24292e',        // Bold text
    emphasis: '#24292e',      // Italic text
    // Syntax highlighting colors (GitHub Light)
    syntaxKeyword: '#cf222e',  // Red for keywords
    syntaxString: '#0a3069',   // Dark blue for strings
    syntaxNumber: '#0550ae',   // Blue for numbers
    syntaxComment: '#6e7781',  // Gray for comments
    syntaxFunction: '#8250df', // Purple for functions
    syntaxClass: '#953800',    // Orange for classes
    syntaxOperator: '#cf222e', // Red for operators
    syntaxDefault: '#24292f',  // Default text color
    // Code block UI colors
    codeBlockBackground: '#f6f8fa',
    codeBlockBorder: '#e1e4e8',
    codeBlockHeaderBg: '#f6f8fa',
    codeBlockHeaderText: '#6e7781',
    codeBlockCopyButtonBg: '#e1e4e8',
    codeBlockCopyButtonText: '#24292e',
    // Skeleton colors
    skeletonBase: '#f6f8fa',
    skeletonHighlight: '#ffffff',
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
 * Light theme styles for react-native-markdown-display
 */
export const lightMarkdownStyles = {
  body: {
    color: lightTheme.colors.text,
    ...(lightTheme.fonts.body && { fontFamily: lightTheme.fonts.body }),
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
    color: lightTheme.colors.text,
    ...(lightTheme.fonts.heading && { fontFamily: lightTheme.fonts.heading }),
    fontSize: 24,
    lineHeight: 30, // 1.25x - GitHub standard, prevents clipping on mobile
    fontWeight: 'bold' as const,
    marginTop: 0, // No top margin - first element should start at top
    marginBottom: lightTheme.spacing.paragraph,
  },
  heading2: {
    color: lightTheme.colors.text,
    ...(lightTheme.fonts.heading && { fontFamily: lightTheme.fonts.heading }),
    fontSize: 20,
    lineHeight: 26, // 1.3x - GitHub standard
    fontWeight: 'bold' as const,
    marginTop: 0, // One-way spacing: spacing comes from element above's marginBottom
    marginBottom: lightTheme.spacing.paragraph,
  },
  heading3: {
    color: lightTheme.colors.text,
    ...(lightTheme.fonts.heading && { fontFamily: lightTheme.fonts.heading }),
    fontSize: 18,
    lineHeight: 24, // 1.33x - GitHub standard
    fontWeight: 'bold' as const,
    marginTop: 0, // One-way spacing: spacing comes from element above's marginBottom
    marginBottom: lightTheme.spacing.paragraph,
  },
  heading4: {
    color: lightTheme.colors.text,
    ...(lightTheme.fonts.heading && { fontFamily: lightTheme.fonts.heading }),
    fontSize: 16,
    lineHeight: 21, // 1.31x - GitHub standard
    fontWeight: 'bold' as const,
    marginTop: 0, // One-way spacing: spacing comes from element above's marginBottom
    marginBottom: lightTheme.spacing.paragraph,
  },
  heading5: {
    color: lightTheme.colors.text,
    ...(lightTheme.fonts.heading && { fontFamily: lightTheme.fonts.heading }),
    fontSize: 14,
    lineHeight: 19, // 1.36x - GitHub standard
    fontWeight: 'bold' as const,
    marginTop: 0, // One-way spacing: spacing comes from element above's marginBottom
    marginBottom: lightTheme.spacing.paragraph,
  },
  heading6: {
    color: lightTheme.colors.text,
    ...(lightTheme.fonts.heading && { fontFamily: lightTheme.fonts.heading }),
    fontSize: 12,
    lineHeight: 16, // 1.33x - GitHub standard
    fontWeight: 'bold' as const,
    marginTop: 0, // One-way spacing: spacing comes from element above's marginBottom
    marginBottom: lightTheme.spacing.paragraph,
  },
  paragraph: {
    color: lightTheme.colors.text,
    ...(lightTheme.fonts.body && { fontFamily: lightTheme.fonts.body }),
    fontSize: 16,
    lineHeight: 22,
    marginTop: 0, // No top margin - spacing comes from element above's marginBottom
    marginBottom: lightTheme.spacing.paragraph,
    flexWrap: 'wrap' as const,
    flexShrink: 1,
  },
  strong: {
    color: lightTheme.colors.strong,
    fontWeight: 'bold' as const,
    flexWrap: 'wrap' as const,
    flexShrink: 1,
  },
  em: {
    color: lightTheme.colors.emphasis,
    fontStyle: 'italic' as const,
    flexWrap: 'wrap' as const,
    flexShrink: 1,
  },
  link: {
    color: lightTheme.colors.link,
    textDecorationLine: 'underline' as const,
    flexWrap: 'wrap' as const,
    flexShrink: 1,
  },
  code_inline: {
    color: lightTheme.colors.text,  // Same as regular text
    backgroundColor: 'transparent',  // No background, blend into chat
    fontFamily: Platform.select({
      ios: 'Menlo',
      android: 'monospace',
      web: 'monospace',
      default: 'monospace',
    }),
    fontSize: 16,  // Match body text size
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
    color: lightTheme.colors.code,
    backgroundColor: lightTheme.colors.codeBackground,
    ...(lightTheme.fonts.code && { fontFamily: lightTheme.fonts.code }),
    fontSize: 13,  // Slightly smaller like ChatGPT
    padding: 12,  // More consistent padding
    borderRadius: 6,  // Slightly tighter radius
    marginVertical: 8,  // Tighter spacing
    overflowX: 'auto' as const,
    maxWidth: '100%',
  },
  fence: {
    color: lightTheme.colors.code,
    backgroundColor: lightTheme.colors.codeBackground,
    ...(lightTheme.fonts.code && { fontFamily: lightTheme.fonts.code }),
    fontSize: 13,  // Slightly smaller like ChatGPT
    padding: 12,  // More consistent padding
    borderRadius: 28,  // Rounder corners like ChatGPT
    borderWidth: 1,
    borderColor: lightTheme.colors.codeBlockBorder || lightTheme.colors.border,
    marginTop: 0, // One-way spacing: spacing comes from element above's marginBottom
    marginBottom: lightTheme.spacing.paragraph, // Spacing after code blocks
    overflowX: 'auto' as const,
    maxWidth: '100%',
  },
  blockquote: {
    borderLeftColor: lightTheme.colors.blockquote,
    borderLeftWidth: 4,
    paddingLeft: 12,
    paddingVertical: 0,  // No vertical padding - let content handle spacing
    marginTop: 0, // One-way spacing: spacing comes from element above's marginBottom
    marginBottom: lightTheme.spacing.paragraph,
    fontStyle: 'italic' as const,
    flexDirection: 'column' as const,
    justifyContent: 'center' as const,
    alignItems: 'flex-start' as const,
    minHeight: 22,  // Ensure minimum height for lineHeight
  },
  list_item: {
    color: lightTheme.colors.text,
    ...(lightTheme.fonts.body && { fontFamily: lightTheme.fonts.body }),
    fontSize: 16,
    lineHeight: 22,
    marginBottom: lightTheme.spacing.list,
    flexWrap: 'wrap' as const,
    flexShrink: 1,
    paddingLeft: 16, // GitHub standard: 16px indentation for list items
  },
  bullet_list: {
    marginTop: 0, // One-way spacing: spacing comes from element above's marginBottom
    marginBottom: lightTheme.spacing.paragraph,
    paddingLeft: 0,
    width: '100%', // Ensure list fills container width to prevent layout shifts
  },
  ordered_list: {
    marginTop: 0, // One-way spacing: spacing comes from element above's marginBottom
    marginBottom: lightTheme.spacing.paragraph,
    paddingLeft: 0,
    width: '100%', // Ensure list fills container width to prevent layout shifts
  },
  hr: {
    backgroundColor: lightTheme.colors.border,
    height: 1,
    width: '100%', // Ensure horizontal rule spans full width
    alignSelf: 'stretch', // Ensure it stretches to fill container
    marginTop: 0, // One-way spacing: spacing comes from element above's marginBottom
    marginBottom: lightTheme.spacing.heading,
  },
  table: {
    borderColor: 'transparent',
    borderWidth: 0,
    borderRadius: 0,
    marginVertical: lightTheme.spacing.paragraph,
    overflowX: 'auto' as const,
    maxWidth: '100%',
    display: 'block' as const,
    width: '100%',
    borderCollapse: 'collapse' as any,
  },
  th: {
    backgroundColor: 'transparent',
    color: lightTheme.colors.text,
    fontWeight: '600' as any,
    fontSize: 14,  // Slightly larger for better readability
    padding: 8,
    paddingBottom: 10,
    borderColor: lightTheme.colors.border,
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
    color: lightTheme.colors.text,
    fontSize: 14,  // Slightly larger for better readability
    padding: 8,
    paddingVertical: 10,
    borderColor: lightTheme.colors.border,
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
