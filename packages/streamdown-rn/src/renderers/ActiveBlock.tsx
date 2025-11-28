/**
 * ActiveBlock Renderer
 * 
 * Renders the currently streaming block with format-as-you-type UX.
 * 
 * Flow:
 * 1. Fix incomplete markdown tags (auto-close for preview)
 * 2. Parse with remark to get AST
 * 3. Render AST with ASTRenderer
 */

import React from 'react';
import type { ActiveBlock as ActiveBlockType, ThemeConfig, ComponentRegistry, IncompleteTagState } from '../core/types';
import { fixIncompleteMarkdown } from '../core/incomplete';
import { parseBlockContent } from '../core/parser';
import { ASTRenderer, ComponentBlock, extractComponentData } from './ASTRenderer';

interface ActiveBlockProps {
  block: ActiveBlockType | null;
  tagState: IncompleteTagState;
  theme: ThemeConfig;
  componentRegistry?: ComponentRegistry;
}

/**
 * ActiveBlock component — renders the currently streaming block.
 * 
 * This component INTENTIONALLY re-renders on each token.
 * It applies "format-as-you-type" by auto-closing incomplete tags.
 */
export const ActiveBlock: React.FC<ActiveBlockProps> = ({
  block,
  tagState,
  theme,
  componentRegistry,
}) => {
  // No active block — nothing to render
  if (!block || !block.content.trim()) {
    return null;
  }
  
  // Special handling for component blocks (don't use remark)
  if (block.type === 'component') {
    const { name, props } = extractComponentData(block.content);
    return (
      <ComponentBlock
        componentName={name}
        props={props}
        isStreaming={true}
        theme={theme}
        componentRegistry={componentRegistry}
      />
    );
  }
  
  // Fix incomplete markdown for format-as-you-type UX
  const fixedContent = fixIncompleteMarkdown(block.content, tagState);
  
  // Parse with remark
  const ast = parseBlockContent(fixedContent);
  
  // Render from AST
  if (ast) {
    return (
      <ASTRenderer
        node={ast}
        theme={theme}
        componentRegistry={componentRegistry}
        isStreaming={true}
      />
    );
  }
  
  // Fallback if parsing fails (shouldn't happen)
  return null;
};

ActiveBlock.displayName = 'ActiveBlock';
