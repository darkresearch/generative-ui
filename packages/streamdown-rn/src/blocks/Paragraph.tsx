/**
 * Paragraph - Unified Paragraph Renderer
 * 
 * Handles both StableBlock and raw data input.
 */

import React from 'react';
import { Text } from 'react-native';
import type { StableBlock, ThemeConfig, ComponentRegistry } from '../core/types';
import { getTextStyles } from '../themes';
import { renderInlineContent } from '../renderers/InlineRenderer';

export interface ParagraphProps {
  theme: ThemeConfig;
  /** Component registry for inline components */
  componentRegistry?: ComponentRegistry;
  /** StableBlock input */
  block?: StableBlock;
  /** Direct text input */
  text?: string;
}

export const Paragraph: React.FC<ParagraphProps> = React.memo(
  ({ theme, componentRegistry, block, text: directText }) => {
    const styles = getTextStyles(theme);
    const text = block ? block.content : (directText ?? '');
    
    return (
      <Text style={styles.paragraph}>
        {renderInlineContent(text, theme, componentRegistry)}
      </Text>
    );
  },
  (prev, next) => {
    if (prev.block && next.block) {
      return prev.block.contentHash === next.block.contentHash;
    }
    return prev.text === next.text;
  }
);

Paragraph.displayName = 'Paragraph';

