/**
 * StableBlock Renderer
 * 
 * Renders completed, immutable blocks using cached AST.
 * Memoized to prevent re-renders — once a block is stable, it never changes.
 */

import React from 'react';
import type { StableBlock as StableBlockType, ThemeConfig, ComponentRegistry } from '../core/types';
import { ASTRenderer, ComponentBlock } from './ASTRenderer';

interface StableBlockProps {
  block: StableBlockType;
  theme: ThemeConfig;
  componentRegistry?: ComponentRegistry;
}

/**
 * StableBlock component — renders finalized blocks from cached AST.
 * 
 * Uses React.memo with contentHash comparison for efficient updates.
 * The block prop is immutable — once finalized, content never changes.
 */
export const StableBlock: React.FC<StableBlockProps> = React.memo(
  ({ block, theme, componentRegistry }) => {
    // Component blocks don't have AST (custom syntax, not markdown)
    if (block.type === 'component') {
      return (
        <ComponentBlock
          block={block}
          theme={theme}
          componentRegistry={componentRegistry}
        />
      );
    }
    
    // Render from cached AST
    if (block.ast) {
      return (
        <ASTRenderer
          node={block.ast}
          theme={theme}
          componentRegistry={componentRegistry}
        />
      );
    }
    
    // Fallback if no AST (shouldn't happen for stable blocks)
    console.warn('StableBlock has no AST:', block.type, block.id);
    return null;
  },
  // Only re-render if the block's content hash changes (which shouldn't happen for stable blocks)
  (prev, next) => prev.block.contentHash === next.block.contentHash
);

StableBlock.displayName = 'StableBlock';
