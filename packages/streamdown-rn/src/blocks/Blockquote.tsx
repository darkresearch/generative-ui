/**
 * Blockquote - Unified Blockquote Renderer
 * 
 * Handles both StableBlock and raw data input.
 */

import React from 'react';
import { View, Text } from 'react-native';
import type { StableBlock, ThemeConfig, ComponentRegistry } from '../core/types';
import { getTextStyles, getBlockStyles } from '../themes';
import { renderInlineContent } from '../renderers/InlineRenderer';

export interface BlockquoteProps {
  theme: ThemeConfig;
  /** Component registry for inline components */
  componentRegistry?: ComponentRegistry;
  /** StableBlock input */
  block?: StableBlock;
  /** Direct text input (without > markers) */
  text?: string;
}

/**
 * Extract blockquote text from raw content
 */
function extractBlockquoteText(content: string): string {
  return content
    .split('\n')
    .map(line => line.replace(/^>\s?/, ''))
    .join('\n')
    .trim();
}

export const Blockquote: React.FC<BlockquoteProps> = React.memo(
  ({ theme, componentRegistry, block, text: directText }) => {
    const textStyles = getTextStyles(theme);
    const blockStyles = getBlockStyles(theme);
    
    const text = block 
      ? extractBlockquoteText(block.content)
      : (directText ?? '');
    
    return (
      <View style={blockStyles.blockquote}>
        <Text style={[textStyles.paragraph, { fontStyle: 'italic', marginBottom: 0 }]}>
          {renderInlineContent(text, theme, componentRegistry)}
        </Text>
      </View>
    );
  },
  (prev, next) => {
    if (prev.block && next.block) {
      return prev.block.contentHash === next.block.contentHash;
    }
    return prev.text === next.text;
  }
);

Blockquote.displayName = 'Blockquote';

