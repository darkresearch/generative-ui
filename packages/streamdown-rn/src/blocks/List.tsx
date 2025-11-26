/**
 * List - Unified List Renderer
 * 
 * Handles both StableBlock and raw data input.
 */

import React from 'react';
import { View, Text } from 'react-native';
import type { StableBlock, ThemeConfig, ComponentRegistry } from '../core/types';
import { getTextStyles, getBlockStyles } from '../themes';
import { renderInlineContent } from '../renderers/InlineRenderer';

export interface ListProps {
  theme: ThemeConfig;
  /** Component registry for inline components */
  componentRegistry?: ComponentRegistry;
  /** StableBlock input */
  block?: StableBlock;
  /** Direct items input (without markers) */
  items?: string[];
  /** Direct ordered flag */
  ordered?: boolean;
}

/**
 * Extract list items from raw content
 */
function extractListItems(content: string): { items: string[]; ordered: boolean } {
  const lines = content.split('\n').filter(line => line.trim());
  const isOrdered = /^\s*\d+\./.test(lines[0] || '');
  
  const items = lines.map(line => 
    line.replace(/^\s*(?:[-*+]|\d+\.)\s+/, '')
  );
  
  return { items, ordered: isOrdered };
}

export const List: React.FC<ListProps> = React.memo(
  ({ theme, componentRegistry, block, items: directItems, ordered: directOrdered }) => {
    const textStyles = getTextStyles(theme);
    const blockStyles = getBlockStyles(theme);
    
    // Determine items and ordered from either source
    let items: string[];
    let ordered: boolean;
    
    if (block) {
      const meta = block.meta as { type: 'list'; ordered: boolean; items: string[] };
      if (meta.items && meta.items.length > 0) {
        // Use pre-parsed items if available
        items = meta.items.map(item => 
          item.replace(/^\s*(?:[-*+]|\d+\.)\s+/, '')
        );
        ordered = meta.ordered;
      } else {
        // Fall back to extracting from content
        const extracted = extractListItems(block.content);
        items = extracted.items;
        ordered = extracted.ordered;
      }
    } else {
      items = directItems ?? [];
      ordered = directOrdered ?? false;
    }
    
    return (
      <View style={blockStyles.list}>
        {items.map((itemContent, index) => {
          const marker = ordered ? `${index + 1}.` : '•';
          
          return (
            <View key={index} style={[blockStyles.listItem, { flexDirection: 'row' }]}>
              <Text style={[textStyles.body, { width: 20 }]}>{marker}</Text>
              <Text style={[textStyles.body, { flex: 1 }]}>
                {renderInlineContent(itemContent, theme, componentRegistry)}
              </Text>
            </View>
          );
        })}
      </View>
    );
  },
  (prev, next) => {
    if (prev.block && next.block) {
      return prev.block.contentHash === next.block.contentHash;
    }
    if (!prev.block && !next.block) {
      return (
        prev.ordered === next.ordered &&
        prev.items?.length === next.items?.length &&
        (prev.items?.every((item, i) => item === next.items?.[i]) ?? true)
      );
    }
    return false;
  }
);

List.displayName = 'List';

