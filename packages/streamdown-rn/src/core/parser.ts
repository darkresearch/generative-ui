/**
 * Markdown Parser
 * 
 * Wrapper around remark + remark-gfm for robust markdown parsing.
 * Caches the processor instance for performance.
 */

import { remark } from 'remark';
import remarkGfm from 'remark-gfm';
import type { Root, Content } from 'mdast';

// ============================================================================
// Cached Processor
// ============================================================================

/**
 * Remark processor instance (created once, reused)
 * Includes GitHub Flavored Markdown support
 */
const processor = remark().use(remarkGfm);

// ============================================================================
// Parsing Functions
// ============================================================================

/**
 * Parse complete markdown document into MDAST Root
 * 
 * @param markdown - Markdown content to parse
 * @returns MDAST root node
 */
export function parseMarkdown(markdown: string): Root {
  try {
    return processor.parse(markdown);
  } catch (error) {
    console.warn('Remark parse error:', error);
    // Return empty root on parse error
    return {
      type: 'root',
      children: [],
    };
  }
}

/**
 * Parse a single block of markdown and return the first block-level node.
 * Useful for parsing individual blocks in isolation.
 * 
 * @param content - Block content to parse
 * @returns First MDAST block node, or null if empty/invalid
 */
export function parseBlockContent(content: string): Content | null {
  if (!content || content.trim().length === 0) {
    return null;
  }
  
  try {
    const ast = processor.parse(content);
    // Return the first child (which should be a block-level element)
    return ast.children[0] ?? null;
  } catch (error) {
    console.warn('Block parse error:', error);
    // Return a plain text paragraph on error
    return {
      type: 'paragraph',
      children: [
        {
          type: 'text',
          value: content,
        },
      ],
    };
  }
}

/**
 * Parse markdown and return all block nodes (excluding root)
 * 
 * @param markdown - Markdown content to parse
 * @returns Array of MDAST block nodes
 */
export function parseBlocks(markdown: string): Content[] {
  const ast = parseMarkdown(markdown);
  return ast.children;
}

/**
 * Check if remark would parse this as valid formatting
 * Useful for testing/validation
 * 
 * @param markdown - Markdown to validate
 * @returns True if parses without errors
 */
export function isValidMarkdown(markdown: string): boolean {
  try {
    processor.parse(markdown);
    return true;
  } catch {
    return false;
  }
}

