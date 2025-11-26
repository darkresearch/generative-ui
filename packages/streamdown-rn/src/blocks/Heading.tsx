/**
 * Heading - Unified Heading Renderer
 * 
 * Handles both StableBlock and raw data input.
 */

import React from 'react';
import { Text } from 'react-native';
import type { StableBlock, ThemeConfig, HeadingLevel, ComponentRegistry } from '../core/types';
import { getTextStyles } from '../themes';
import { renderInlineContent } from '../renderers/InlineRenderer';

export interface HeadingProps {
  theme: ThemeConfig;
  /** Component registry for inline components */
  componentRegistry?: ComponentRegistry;
  /** StableBlock input */
  block?: StableBlock;
  /** Direct text input (without # markers) */
  text?: string;
  /** Direct level input (1-6) */
  level?: HeadingLevel;
}

/**
 * Extract heading text and level from raw content
 */
function extractHeading(content: string): { text: string; level: HeadingLevel } {
  const match = content.match(/^(#{1,6})\s*(.*)/);
  if (!match) {
    return { text: content, level: 1 };
  }
  return {
    text: match[2],
    level: match[1].length as HeadingLevel,
  };
}

export const Heading: React.FC<HeadingProps> = React.memo(
  ({ theme, componentRegistry, block, text: directText, level: directLevel }) => {
    const styles = getTextStyles(theme);
    
    // Determine text and level from either source
    let text: string;
    let level: HeadingLevel;
    
    if (block) {
      const meta = block.meta as { type: 'heading'; level: HeadingLevel };
      const extracted = extractHeading(block.content);
      text = extracted.text;
      level = meta.level || extracted.level;
    } else {
      text = directText ?? '';
      level = directLevel ?? 1;
    }
    
    const headingStyle = styles[`heading${level}` as keyof typeof styles];
    
    return (
      <Text style={headingStyle}>
        {renderInlineContent(text, theme, componentRegistry)}
      </Text>
    );
  },
  (prev, next) => {
    if (prev.block && next.block) {
      return prev.block.contentHash === next.block.contentHash;
    }
    return prev.text === next.text && prev.level === next.level;
  }
);

Heading.displayName = 'Heading';

