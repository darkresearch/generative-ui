/**
 * Markdown Parser
 * 
 * Wrapper around remark + remark-gfm for robust markdown parsing.
 * Caches the processor instance for performance.
 * 
 * NOTE: We disable setext-style headings (Text\n---) and only support
 * ATX-style headings (# Heading) for predictable streaming behavior.
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
// Pre-processing: Disable Setext Headings
// ============================================================================

/** Valid list marker characters */
const LIST_MARKERS = new Set(['-', '*', '+']);

/** Pattern to match potential setext underlines (lines of only -/= with optional whitespace) */
const SETEXT_PATTERN = /^([ \t]*)([-=]+)([ \t]*)$/;

/**
 * Check if a line is a valid UNINDENTED list marker (single -, *, or + at start of line)
 * Indented single dashes could be setext underlines, so we only preserve unindented ones.
 */
function isUnindentedListMarker(indent: string, chars: string): boolean {
  return !indent && chars.length === 1 && LIST_MARKERS.has(chars);
}

/**
 * Check if a line is a horizontal rule (3+ unindented dashes after blank line)
 */
function isHorizontalRule(
  indent: string,
  chars: string,
  prevLine: string
): boolean {
  const isUnindented = !indent;
  const isThreePlusDashes = chars.length >= 3 && chars[0] === '-';
  const prevLineIsBlank = !prevLine.trim();
  return isUnindented && isThreePlusDashes && prevLineIsBlank;
}

/**
 * Escape potential setext underlines before parsing.
 * 
 * Setext headings use underlines (--- or ===) on the line after text:
 *   Heading
 *   -------
 * 
 * We only support ATX-style headings (# Heading) because:
 * 1. They're unambiguous during streaming
 * 2. They don't conflict with list markers or horizontal rules
 * 
 * This function adds a zero-width space to break the setext pattern.
 * The zero-width space is invisible in rendered output.
 * 
 * Preserves:
 * - Unindented single list markers (-, *, +) — these start new list items
 * - Horizontal rules (--- after blank line)
 * 
 * Escapes:
 * - Indented dashes/equals (could be setext underlines)
 * - Multiple dashes/equals (could be setext underlines)
 * 
 * @param markdown - Raw markdown string
 * @returns Markdown with setext underlines escaped
 */
export function escapeSetextUnderlines(markdown: string): string {
  const lines = markdown.split('\n');
  
  return lines.map((line, index) => {
    const match = line.match(SETEXT_PATTERN);
    if (!match) return line;
    
    const [, indent, chars, trailing] = match;
    const prevLine = index > 0 ? lines[index - 1] : '';
    
    // Preserve unindented single list markers (-, *, +)
    if (isUnindentedListMarker(indent, chars)) return line;
    
    // Preserve horizontal rules (3+ unindented dashes after blank line)
    if (isHorizontalRule(indent, chars, prevLine)) return line;
    
    // Escape everything else by inserting zero-width space after indent
    return `${indent}\u200B${chars}${trailing}`;
  }).join('\n');
}

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
    const escaped = escapeSetextUnderlines(markdown);
    return processor.parse(escaped);
  } catch (error) {
    console.warn('Remark parse error:', error);
    return { type: 'root', children: [] };
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
    const escaped = escapeSetextUnderlines(content);
    const ast = processor.parse(escaped);
    return ast.children[0] ?? null;
  } catch (error) {
    console.warn('Block parse error:', error);
    return {
      type: 'paragraph',
      children: [{ type: 'text', value: content }],
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
