/**
 * Remark Parser for StreamdownRN
 * 
 * Thin wrapper around remark that parses markdown into MDAST.
 * Receives pre-processed markdown from fixIncompleteMarkdown.
 */

import { remark } from 'remark';
import remarkGfm from 'remark-gfm';
import type { Root } from 'mdast';

/**
 * Parse markdown string into MDAST (Markdown Abstract Syntax Tree)
 * 
 * @param markdown - Pre-processed markdown (already fixed by fixIncompleteMarkdown)
 * @returns MDAST root node, or fallback structure that renders plain text on parse error
 */
export function parseMarkdown(markdown: string): Root {
  // Handle empty markdown - return empty root node
  if (!markdown || markdown.trim().length === 0) {
    return {
      type: 'root',
      children: [],
    } as Root;
  }
  
  try {
    const processor = remark().use(remarkGfm);
    const ast = processor.parse(markdown);
    return ast;
  } catch (error) {
    // On parse error, return fallback MDAST that renders plain text
    console.warn('Remark parse error, falling back to plain text:', error);
    
    // Return a simple paragraph node with the raw markdown as text
    // This ensures the renderer can still display content, just without formatting
    return {
      type: 'root',
      children: [
        {
          type: 'paragraph',
          children: [
            {
              type: 'text',
              value: markdown,
            },
          ],
        },
      ],
    } as Root;
  }
}

