/**
 * Inline Content Renderer
 * 
 * Parses and renders inline markdown formatting:
 * - **bold** / __bold__
 * - *italic* / _italic_
 * - ~~strikethrough~~
 * - `code`
 * - [links](url)
 * - ![images](url)
 * - [{c:"Name",p:{...}}] inline components
 */

import React, { ReactNode } from 'react';
import { Text } from 'react-native';
import type { ThemeConfig, ComponentRegistry } from '../core/types';
import { getTextStyles } from '../themes';

/**
 * Token types for inline parsing
 */
type InlineToken =
  | { type: 'text'; content: string }
  | { type: 'bold'; content: string }
  | { type: 'italic'; content: string }
  | { type: 'boldItalic'; content: string }
  | { type: 'strikethrough'; content: string }
  | { type: 'code'; content: string }
  | { type: 'link'; text: string; url: string }
  | { type: 'image'; alt: string; url: string }
  | { type: 'component'; name: string; props: Record<string, unknown>; raw: string };

/**
 * Parse inline markdown into tokens
 */
function parseInline(text: string): InlineToken[] {
  const tokens: InlineToken[] = [];
  let remaining = text;
  
  while (remaining.length > 0) {
    // Inline component: [{c:"Name",p:{...}}]
    // Must check before link to avoid conflict with [
    const componentMatch = remaining.match(/^\[\{c:\s*"([^"]+)"\s*,\s*p:\s*(\{[\s\S]*?\})\s*\}\]/);
    if (componentMatch) {
      const name = componentMatch[1];
      let props: Record<string, unknown> = {};
      try {
        props = JSON.parse(componentMatch[2]);
      } catch {
        // Invalid JSON — use empty props
      }
      tokens.push({ type: 'component', name, props, raw: componentMatch[0] });
      remaining = remaining.slice(componentMatch[0].length);
      continue;
    }
    
    // Bold+Italic: ***text*** or ___text___
    const boldItalicMatch = remaining.match(/^(\*\*\*|___)(.+?)\1/);
    if (boldItalicMatch) {
      tokens.push({ type: 'boldItalic', content: boldItalicMatch[2] });
      remaining = remaining.slice(boldItalicMatch[0].length);
      continue;
    }
    
    // Bold: **text** or __text__
    const boldMatch = remaining.match(/^(\*\*|__)(.+?)\1/);
    if (boldMatch) {
      tokens.push({ type: 'bold', content: boldMatch[2] });
      remaining = remaining.slice(boldMatch[0].length);
      continue;
    }
    
    // Italic: *text* or _text_
    const italicMatch = remaining.match(/^(\*|_)(.+?)\1/);
    if (italicMatch) {
      tokens.push({ type: 'italic', content: italicMatch[2] });
      remaining = remaining.slice(italicMatch[0].length);
      continue;
    }
    
    // Strikethrough: ~~text~~
    const strikeMatch = remaining.match(/^~~(.+?)~~/);
    if (strikeMatch) {
      tokens.push({ type: 'strikethrough', content: strikeMatch[1] });
      remaining = remaining.slice(strikeMatch[0].length);
      continue;
    }
    
    // Inline code: `code`
    const codeMatch = remaining.match(/^`([^`]+)`/);
    if (codeMatch) {
      tokens.push({ type: 'code', content: codeMatch[1] });
      remaining = remaining.slice(codeMatch[0].length);
      continue;
    }
    
    // Image: ![alt](url)
    const imageMatch = remaining.match(/^!\[([^\]]*)\]\(([^)]+)\)/);
    if (imageMatch) {
      tokens.push({ type: 'image', alt: imageMatch[1], url: imageMatch[2] });
      remaining = remaining.slice(imageMatch[0].length);
      continue;
    }
    
    // Link: [text](url)
    const linkMatch = remaining.match(/^\[([^\]]+)\]\(([^)]+)\)/);
    if (linkMatch) {
      tokens.push({ type: 'link', text: linkMatch[1], url: linkMatch[2] });
      remaining = remaining.slice(linkMatch[0].length);
      continue;
    }
    
    // Plain text: consume until next special character
    // Added [ to stop before potential component syntax
    const textMatch = remaining.match(/^[^*_`~\[!]+/);
    if (textMatch) {
      tokens.push({ type: 'text', content: textMatch[0] });
      remaining = remaining.slice(textMatch[0].length);
      continue;
    }
    
    // Single special character that didn't match a pattern
    tokens.push({ type: 'text', content: remaining[0] });
    remaining = remaining.slice(1);
  }
  
  return tokens;
}

/**
 * Render inline content with formatting
 */
export function renderInlineContent(
  text: string,
  theme: ThemeConfig,
  componentRegistry?: ComponentRegistry
): ReactNode {
  const tokens = parseInline(text);
  const styles = getTextStyles(theme);
  
  return tokens.map((token, index) => {
    switch (token.type) {
      case 'text':
        return token.content;
      
      case 'bold':
        return (
          <Text key={index} style={styles.bold}>
            {token.content}
          </Text>
        );
      
      case 'italic':
        return (
          <Text key={index} style={styles.italic}>
            {token.content}
          </Text>
        );
      
      case 'boldItalic':
        return (
          <Text key={index} style={[styles.bold, styles.italic]}>
            {token.content}
          </Text>
        );
      
      case 'strikethrough':
        return (
          <Text key={index} style={styles.strikethrough}>
            {token.content}
          </Text>
        );
      
      case 'code':
        return (
          <Text key={index} style={styles.code}>
            {token.content}
          </Text>
        );
      
      case 'link':
        return (
          <Text
            key={index}
            style={styles.link}
            accessibilityRole="link"
            // TODO: Add onPress handler for link navigation
          >
            {token.text}
          </Text>
        );
      
      case 'image':
        // Inline images rendered as link-style text
        return (
          <Text key={index} style={styles.link}>
            [Image: {token.alt || token.url}]
          </Text>
        );
      
      case 'component':
        // Render inline component
        if (!componentRegistry) {
          return (
            <Text key={index} style={{ color: theme.colors.muted }}>
              ⚠️ [{token.name}]
            </Text>
          );
        }
        
        const componentDef = componentRegistry.get(token.name);
        if (!componentDef) {
          return (
            <Text key={index} style={{ color: theme.colors.muted }}>
              ⚠️ [{token.name}]
            </Text>
          );
        }
        
        const Component = componentDef.component;
        // Inline components are rendered inline (no View wrapper with margin)
        return <Component key={index} {...token.props} _isInline={true} />;
      
      default:
        return null;
    }
  });
}
