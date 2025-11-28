import type { BlockMeta, BlockType, HeadingLevel } from '../types';

/**
 * Patterns for detecting COMPLETE block starts (at beginning of line)
 * These require the full marker + space/content to match
 */
export const BLOCK_PATTERNS = {
  heading: /^(#{1,6})\s+(.*)$/,
  codeBlockStart: /^(`{3,}|~{3,})(\w*)?$/,
  unorderedList: /^(\s*)([-*+])\s+(.*)$/,
  orderedList: /^(\s*)(\d+)\.\s+(.*)$/,
  blockquote: /^>\s?(.*)$/,
  horizontalRule: /^([-*_])\1{2,}\s*$/,
  tableSeparator: /^\|?[\s-:|]+\|[\s-:|]*\|?$/,
  blockImage: /^!\[([^\]]*)\]\(([^)]+)\)\s*$/,
  footnoteDef: /^\[\^([^\]]+)\]:\s*(.*)$/,
  component: /^\[\{c:\s*"([^"]+)"/,
} as const;

/**
 * Patterns for detecting PARTIAL/INCOMPLETE block starts
 * These match as soon as the marker begins (before space/content)
 */
export const PARTIAL_BLOCK_PATTERNS = {
  // Heading: # at start (1-6 hashes)
  heading: /^#{1,6}$/,
  // Heading with space (confirmed heading, content may follow)
  headingWithSpace: /^#{1,6}\s/,
  // Code block: ``` or ~~~ (3+ chars)
  codeBlockStart: /^(`{3,}|~{3,})/,
  // Blockquote: > at start
  blockquote: /^>/,
  // Unordered list: - or * or + at start (need to distinguish from hr)
  unorderedList: /^[-*+]$/,
  // Ordered list: digit(s) followed by .
  orderedList: /^\d+\.?$/,
  // Horizontal rule: --- or *** or ___ (3+ chars)
  horizontalRule: /^([-*_])\1{2,}$/,
  // Component: [{c:
  component: /^\[\{c:/,
  // Image: ![
  image: /^!\[/,
} as const;

/**
 * Detect block type from a COMPLETE line (requires full marker + content)
 * Used for finalization decisions
 */
export function detectBlockType(
  line: string
): { type: BlockType; meta: Partial<BlockMeta> } | null {
  const headingMatch = line.match(BLOCK_PATTERNS.heading);
  if (headingMatch) {
    return {
      type: 'heading',
      meta: { type: 'heading', level: headingMatch[1].length as HeadingLevel },
    };
  }

  if (BLOCK_PATTERNS.codeBlockStart.test(line)) {
    const match = line.match(BLOCK_PATTERNS.codeBlockStart);
    return {
      type: 'codeBlock',
      meta: { type: 'codeBlock', language: match?.[2] || '' },
    };
  }

  if (BLOCK_PATTERNS.horizontalRule.test(line)) {
    return { type: 'horizontalRule', meta: { type: 'horizontalRule' } };
  }

  if (BLOCK_PATTERNS.unorderedList.test(line)) {
    return {
      type: 'list',
      meta: { type: 'list', ordered: false, items: [] },
    };
  }

  if (BLOCK_PATTERNS.orderedList.test(line)) {
    return {
      type: 'list',
      meta: { type: 'list', ordered: true, items: [] },
    };
  }

  if (BLOCK_PATTERNS.blockquote.test(line)) {
    return { type: 'blockquote', meta: { type: 'blockquote' } };
  }

  if (BLOCK_PATTERNS.blockImage.test(line)) {
    return { type: 'image', meta: { type: 'image' } };
  }

  if (BLOCK_PATTERNS.footnoteDef.test(line)) {
    return { type: 'footnote', meta: { type: 'footnote' } };
  }

  if (BLOCK_PATTERNS.component.test(line)) {
    const match = line.match(BLOCK_PATTERNS.component);
    return {
      type: 'component',
      meta: { type: 'component', name: match?.[1] || '', props: {} },
    };
  }

  return null;
}

/**
 * Detect block type from PARTIAL/INCOMPLETE content (character-level detection)
 * Used for real-time type updates during streaming
 * 
 * This allows us to show "heading" as soon as user types "#" or "## "
 */
export function detectPartialBlockType(
  content: string
): { type: BlockType; meta: Partial<BlockMeta>; confidence: 'definite' | 'likely' | 'possible' } | null {
  // Get first line only (block type is determined by first line)
  const firstLine = content.split('\n')[0];
  if (!firstLine) return null;
  
  // First, check if we have a COMPLETE match (highest confidence)
  const complete = detectBlockType(firstLine);
  if (complete) {
    return { ...complete, confidence: 'definite' };
  }
  
  // Heading: "# " or "## " etc. (space confirms it's a heading)
  const headingWithSpaceMatch = firstLine.match(PARTIAL_BLOCK_PATTERNS.headingWithSpace);
  if (headingWithSpaceMatch) {
    const level = (firstLine.match(/^#+/) || ['#'])[0].length as HeadingLevel;
    return {
      type: 'heading',
      meta: { type: 'heading', level },
      confidence: 'definite',
    };
  }
  
  // Heading: just "#" or "##" etc. (likely heading, waiting for space)
  if (PARTIAL_BLOCK_PATTERNS.heading.test(firstLine)) {
    const level = firstLine.length as HeadingLevel;
    return {
      type: 'heading',
      meta: { type: 'heading', level: Math.min(level, 6) as HeadingLevel },
      confidence: 'likely',
    };
  }
  
  // Code block: ``` or ~~~
  if (PARTIAL_BLOCK_PATTERNS.codeBlockStart.test(firstLine)) {
    const match = firstLine.match(/^(`{3,}|~{3,})(\w*)/);
    return {
      type: 'codeBlock',
      meta: { type: 'codeBlock', language: match?.[2] || '' },
      confidence: 'definite',
    };
  }
  
  // Blockquote: >
  if (PARTIAL_BLOCK_PATTERNS.blockquote.test(firstLine)) {
    return {
      type: 'blockquote',
      meta: { type: 'blockquote' },
      confidence: firstLine.length > 1 ? 'definite' : 'likely',
    };
  }
  
  // Component: [{c:
  if (PARTIAL_BLOCK_PATTERNS.component.test(firstLine)) {
    return {
      type: 'component',
      meta: { type: 'component', name: '', props: {} },
      confidence: 'definite',
    };
  }
  
  // Image: ![
  if (PARTIAL_BLOCK_PATTERNS.image.test(firstLine)) {
    return {
      type: 'image',
      meta: { type: 'image' },
      confidence: 'likely',
    };
  }
  
  // Horizontal rule: --- or *** or ___
  if (PARTIAL_BLOCK_PATTERNS.horizontalRule.test(firstLine)) {
    return {
      type: 'horizontalRule',
      meta: { type: 'horizontalRule' },
      confidence: 'likely',
    };
  }
  
  // Ordered list: 1. or 1 (waiting for .)
  if (/^\d+\.\s/.test(firstLine)) {
    return {
      type: 'list',
      meta: { type: 'list', ordered: true, items: [] },
      confidence: 'definite',
    };
  }
  if (PARTIAL_BLOCK_PATTERNS.orderedList.test(firstLine)) {
    return {
      type: 'list',
      meta: { type: 'list', ordered: true, items: [] },
      confidence: 'possible',
    };
  }
  
  // Unordered list: - or * or + followed by space
  // Be careful: - alone could be start of horizontal rule
  if (/^[-*+]\s/.test(firstLine)) {
    return {
      type: 'list',
      meta: { type: 'list', ordered: false, items: [] },
      confidence: 'definite',
    };
  }
  
  return null;
}

