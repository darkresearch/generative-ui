/**
 * Dark Theme Configuration
 * Matches the existing Scout app dark theme
 */

import { ThemeConfig } from '../core/types';

export const darkTheme: ThemeConfig = {
  colors: {
    text: '#DCE9FF',           // Main text color for better readability
    background: '#05080C',     // Background matching app
    border: '#1a1e24',         // Border color matching app
    link: '#4A9EFF',          // Link color matching app accent
    code: '#A7BEE6',          // Code text color
    codeBackground: '#101A29', // Code background matching chat input
    blockquote: '#4A9EFF',    // Blockquote accent color
    strong: '#FFFFFF',        // Bold text - slightly brighter
    emphasis: '#C7D2E8',      // Italic text - slightly dimmed
  },
  fonts: {
    body: 'Satoshi',          // Main font matching app
    code: 'Menlo, Monaco, Consolas, Liberation Mono, Courier New, monospace',  // Monospace font stack (similar to ChatGPT)
    heading: 'Satoshi',       // Heading font
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
    fontFamily: darkTheme.fonts.body,
    fontSize: 16,
    lineHeight: 22,
    flexWrap: 'wrap' as const,
    flexShrink: 1,
  },
  heading1: {
    color: darkTheme.colors.text,
    fontFamily: darkTheme.fonts.heading,
    fontSize: 24,
    fontWeight: 'bold' as const,
    marginTop: darkTheme.spacing.heading,
    marginBottom: darkTheme.spacing.paragraph,
  },
  heading2: {
    color: darkTheme.colors.text,
    fontFamily: darkTheme.fonts.heading,
    fontSize: 20,
    fontWeight: 'bold' as const,
    marginTop: darkTheme.spacing.heading,
    marginBottom: darkTheme.spacing.paragraph,
  },
  heading3: {
    color: darkTheme.colors.text,
    fontFamily: darkTheme.fonts.heading,
    fontSize: 18,
    fontWeight: 'bold' as const,
    marginTop: darkTheme.spacing.heading,
    marginBottom: darkTheme.spacing.paragraph,
  },
  heading4: {
    color: darkTheme.colors.text,
    fontFamily: darkTheme.fonts.heading,
    fontSize: 16,
    fontWeight: 'bold' as const,
    marginTop: darkTheme.spacing.heading,
    marginBottom: darkTheme.spacing.paragraph,
  },
  heading5: {
    color: darkTheme.colors.text,
    fontFamily: darkTheme.fonts.heading,
    fontSize: 14,
    fontWeight: 'bold' as const,
    marginTop: darkTheme.spacing.heading,
    marginBottom: darkTheme.spacing.paragraph,
  },
  heading6: {
    color: darkTheme.colors.text,
    fontFamily: darkTheme.fonts.heading,
    fontSize: 12,
    fontWeight: 'bold' as const,
    marginTop: darkTheme.spacing.heading,
    marginBottom: darkTheme.spacing.paragraph,
  },
  paragraph: {
    color: darkTheme.colors.text,
    fontFamily: darkTheme.fonts.body,
    fontSize: 16,
    lineHeight: 22,
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
    fontFamily: darkTheme.fonts.code,
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
    fontFamily: darkTheme.fonts.code,
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
    fontFamily: darkTheme.fonts.code,
    fontSize: 13,  // Slightly smaller like ChatGPT
    padding: 12,  // More consistent padding
    borderRadius: 28,  // Rounder corners like ChatGPT
    borderWidth: 1,
    borderColor: '#1a2433',  // Barely lighter than background for subtle border
    marginVertical: 0,  // No extra spacing - CodeBlock handles its own margins
    overflowX: 'auto' as const,
    maxWidth: '100%',
  },
  blockquote: {
    borderLeftColor: darkTheme.colors.blockquote,
    borderLeftWidth: 4,
    paddingLeft: 12,
    marginVertical: darkTheme.spacing.paragraph,
    fontStyle: 'italic' as const,
  },
  list_item: {
    color: darkTheme.colors.text,
    marginBottom: darkTheme.spacing.list,
    flexWrap: 'wrap' as const,
    flexShrink: 1,
  },
  bullet_list: {
    marginVertical: darkTheme.spacing.paragraph,
  },
  ordered_list: {
    marginVertical: darkTheme.spacing.paragraph,
  },
  hr: {
    backgroundColor: darkTheme.colors.border,
    height: 1,
    marginVertical: darkTheme.spacing.heading,
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
