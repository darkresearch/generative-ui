/**
 * BlockSplitter - Incremental block boundary detection
 * 
 * Processes streaming markdown text and splits it into discrete blocks.
 * Optimized for append-only streams (AI responses).
 * 
 * Key insight: We only need to look at the new content since the last cursor position.
 * Completed blocks never change — we just append new ones.
 */

import {
  BlockType,
  BlockMeta,
  StableBlock,
  BlockRegistry,
  INITIAL_REGISTRY,
  hashContent,
  generateBlockId,
  HeadingLevel,
  IncompleteTagState,
} from './types';
import { parseBlockContent } from './parser';
import { updateTagState, INITIAL_INCOMPLETE_STATE } from './incomplete';

// ============================================================================
// Block Detection Patterns
// ============================================================================

/**
 * Patterns for detecting block starts (at beginning of line)
 */
const BLOCK_PATTERNS = {
  // Headings: # to ######
  heading: /^(#{1,6})\s+(.*)$/,
  // Code blocks: ``` or ~~~
  codeBlockStart: /^(`{3,}|~{3,})(\w*)?$/,
  // Unordered list: *, -, +
  unorderedList: /^(\s*)([-*+])\s+(.*)$/,
  // Ordered list: 1., 2., etc.
  orderedList: /^(\s*)(\d+)\.\s+(.*)$/,
  // Blockquote: >
  blockquote: /^>\s?(.*)$/,
  // Horizontal rule: ---, ***, ___
  horizontalRule: /^([-*_])\1{2,}\s*$/,
  // Table separator (detecting table context)
  tableSeparator: /^\|?[\s-:|]+\|[\s-:|]*\|?$/,
  // Image on its own line
  blockImage: /^!\[([^\]]*)\]\(([^)]+)\)\s*$/,
  // Footnote definition
  footnoteDef: /^\[\^([^\]]+)\]:\s*(.*)$/,
  // Component syntax: [{c:"Name",p:{...}}]
  component: /^\[\{c:\s*"([^"]+)"/,
} as const;


// ============================================================================
// Block Boundary Detection
// ============================================================================

/**
 * Detect what type of block a line starts
 */
function detectBlockType(line: string): { type: BlockType; meta: Partial<BlockMeta> } | null {
  // Heading
  const headingMatch = line.match(BLOCK_PATTERNS.heading);
  if (headingMatch) {
    return {
      type: 'heading',
      meta: { type: 'heading', level: headingMatch[1].length as HeadingLevel },
    };
  }

  // Code block
  if (BLOCK_PATTERNS.codeBlockStart.test(line)) {
    const match = line.match(BLOCK_PATTERNS.codeBlockStart);
    return {
      type: 'codeBlock',
      meta: { type: 'codeBlock', language: match?.[2] || '' },
    };
  }

  // Horizontal rule (must check before list since --- could look like list)
  if (BLOCK_PATTERNS.horizontalRule.test(line)) {
    return { type: 'horizontalRule', meta: { type: 'horizontalRule' } };
  }

  // Unordered list
  if (BLOCK_PATTERNS.unorderedList.test(line)) {
    return {
      type: 'list',
      meta: { type: 'list', ordered: false, items: [] },
    };
  }

  // Ordered list
  if (BLOCK_PATTERNS.orderedList.test(line)) {
    return {
      type: 'list',
      meta: { type: 'list', ordered: true, items: [] },
    };
  }

  // Blockquote
  if (BLOCK_PATTERNS.blockquote.test(line)) {
    return { type: 'blockquote', meta: { type: 'blockquote' } };
  }

  // Block image
  if (BLOCK_PATTERNS.blockImage.test(line)) {
    return { type: 'image', meta: { type: 'image' } };
  }

  // Footnote definition
  if (BLOCK_PATTERNS.footnoteDef.test(line)) {
    return { type: 'footnote', meta: { type: 'footnote' } };
  }

  // Component
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
 * Check if current content ends a code block
 */
function isCodeBlockClosed(content: string): boolean {
  const lines = content.split('\n');
  if (lines.length < 2) return false;
  
  const firstLine = lines[0];
  const lastLine = lines[lines.length - 1];
  
  // Get the fence from first line
  const openMatch = firstLine.match(/^(`{3,}|~{3,})/);
  if (!openMatch) return false;
  
  const fence = openMatch[1];
  const fenceChar = fence[0];
  const fenceLen = fence.length;
  
  // Check if last line is a matching closing fence
  const closePattern = new RegExp(`^${fenceChar}{${fenceLen},}\\s*$`);
  return closePattern.test(lastLine);
}

/**
 * Check if current content ends a component
 * New syntax: [{c:"Name",p:{...}}]
 */
function isComponentClosed(content: string): boolean {
  // Must start with [{ and end with }]
  if (!content.startsWith('[{')) return false;
  
  // Track brace depth (starting after the opening [{)
  let braceDepth = 1; // We're inside the outer {
  let bracketDepth = 1; // We're inside the outer [
  let inString = false;
  let escape = false;
  
  for (let i = 2; i < content.length; i++) {
    const char = content[i];
    
    if (escape) {
      escape = false;
      continue;
    }
    
    if (char === '\\') {
      escape = true;
      continue;
    }
    
    if (char === '"') {
      inString = !inString;
      continue;
    }
    
    if (inString) continue;
    
    if (char === '{') braceDepth++;
    if (char === '}') braceDepth--;
    if (char === '[') bracketDepth++;
    if (char === ']') bracketDepth--;
    
    // Component closes when we see }] and depths are zero
    if (braceDepth === 0 && bracketDepth === 0 && 
        i >= 1 && content[i - 1] === '}' && char === ']') {
      return true;
    }
  }
  
  return false;
}

// ============================================================================
// Main Block Processing
// ============================================================================

/**
 * Process new content and update the block registry.
 * This is the main entry point — called on each new token.
 * 
 * @param registry - Current block registry state
 * @param fullText - Complete text (all tokens so far)
 * @returns Updated registry with any new completed blocks
 */
export function processNewContent(
  registry: BlockRegistry,
  fullText: string
): BlockRegistry {
  // Early return if no new content
  if (fullText.length <= registry.cursor) {
    return registry;
  }

  // Work with the new content only
  const newContent = fullText.slice(registry.cursor);
  
  // Get the active content (what we're currently building)
  const activeContent = registry.activeBlock
    ? registry.activeBlock.content + newContent
    : newContent;

  // Update tag state for active block
  const newTagState = updateTagState(registry.activeTagState, activeContent);

  // Split into lines for analysis
  const lines = activeContent.split('\n');
  
  // Process and potentially finalize blocks
  return processLines(registry, fullText, lines, activeContent, newTagState);
}

/**
 * Process lines and determine block boundaries
 */
function processLines(
  registry: BlockRegistry,
  fullText: string,
  lines: string[],
  activeContent: string,
  tagState: IncompleteTagState
): BlockRegistry {
  let newRegistry = { ...registry };
  let currentBlocks = [...registry.blocks];
  let blockCounter = registry.blockCounter;
  
  // Determine current block type
  const currentType = registry.activeBlock?.type;
  
  // Handle special block types that have explicit end markers
  if (currentType === 'codeBlock') {
    if (isCodeBlockClosed(activeContent)) {
      // Finalize code block
      const block = finalizeBlock(
        activeContent,
        'codeBlock',
        blockCounter,
        registry.activeBlock!.startPos
      );
      currentBlocks = [...currentBlocks, block];
      blockCounter++;
      
      return {
        blocks: currentBlocks,
        activeBlock: null,
        activeTagState: INITIAL_INCOMPLETE_STATE,
        cursor: fullText.length,
        blockCounter,
      };
    }
    // Code block still open, update active content
    return {
      ...newRegistry,
      activeBlock: {
        ...registry.activeBlock!,
        content: activeContent,
      },
      activeTagState: tagState,
      cursor: fullText.length,
    };
  }
  
  if (currentType === 'component') {
    if (isComponentClosed(activeContent)) {
      // Finalize component block
      const block = finalizeBlock(
        activeContent,
        'component',
        blockCounter,
        registry.activeBlock!.startPos
      );
      currentBlocks = [...currentBlocks, block];
      blockCounter++;
      
      return {
        blocks: currentBlocks,
        activeBlock: null,
        activeTagState: INITIAL_INCOMPLETE_STATE,
        cursor: fullText.length,
        blockCounter,
      };
    }
    // Component still open
    return {
      ...newRegistry,
      activeBlock: {
        ...registry.activeBlock!,
        content: activeContent,
      },
      activeTagState: tagState,
      cursor: fullText.length,
    };
  }
  
  // For other block types, check for double newline (paragraph boundary)
  const hasDoubleNewline = activeContent.includes('\n\n');
  
  if (hasDoubleNewline) {
    // Split at double newlines
    const segments = activeContent.split(/\n\n+/);
    
    // All segments except the last are complete blocks
    for (let i = 0; i < segments.length - 1; i++) {
      const segment = segments[i].trim();
      if (!segment) continue;
      
      const detected = detectBlockType(segment.split('\n')[0]);
      const type = detected?.type || 'paragraph';
      
      const block = finalizeBlock(
        segment,
        type,
        blockCounter,
        registry.activeBlock?.startPos ?? registry.cursor
      );
      currentBlocks = [...currentBlocks, block];
      blockCounter++;
    }
    
    // Last segment becomes the new active block
    const lastSegment = segments[segments.length - 1];
    const detected = detectBlockType(lastSegment.split('\n')[0]);
    
    return {
      blocks: currentBlocks,
      activeBlock: lastSegment ? {
        type: detected?.type || 'paragraph',
        content: lastSegment,
        startPos: fullText.length - lastSegment.length,
      } : null,
      activeTagState: lastSegment ? tagState : INITIAL_INCOMPLETE_STATE,
      cursor: fullText.length,
      blockCounter,
    };
  }
  
  // No double newline — update active block
  if (!registry.activeBlock) {
    // Starting a new block
    const detected = detectBlockType(lines[0]);
    return {
      ...newRegistry,
      activeBlock: {
        type: detected?.type || 'paragraph',
        content: activeContent,
        startPos: registry.cursor,
      },
      activeTagState: tagState,
      cursor: fullText.length,
    };
  }
  
  // Continue existing active block
  return {
    ...newRegistry,
    activeBlock: {
      ...registry.activeBlock,
      content: activeContent,
    },
    activeTagState: tagState,
    cursor: fullText.length,
  };
}

/**
 * Create a finalized stable block from content.
 * Parses with remark to generate cached AST.
 */
function finalizeBlock(
  content: string,
  type: BlockType,
  counter: number,
  startPos: number
): StableBlock {
  const meta = extractBlockMeta(content, type);
  
  // Parse with remark to get AST (except for component blocks)
  const ast = type === 'component' 
    ? undefined 
    : (parseBlockContent(content) ?? undefined);
  
  return {
    id: generateBlockId(type, counter),
    type,
    content,
    contentHash: hashContent(content),
    startPos,
    endPos: startPos + content.length,
    meta,
    ast,
  };
}

/**
 * Extract metadata from block content
 */
function extractBlockMeta(content: string, type: BlockType): BlockMeta {
  switch (type) {
    case 'heading': {
      const match = content.match(/^(#{1,6})/);
      return {
        type: 'heading',
        level: (match?.[1].length || 1) as HeadingLevel,
      };
    }
    
    case 'codeBlock': {
      const match = content.match(/^(?:`{3,}|~{3,})(\w*)/);
      return {
        type: 'codeBlock',
        language: match?.[1] || '',
      };
    }
    
    case 'list': {
      const lines = content.split('\n');
      const isOrdered = /^\s*\d+\./.test(lines[0]);
      return {
        type: 'list',
        ordered: isOrdered,
        items: lines.filter(l => l.trim()),
      };
    }
    
    case 'table': {
      const lines = content.split('\n').filter(l => l.trim());
      const headers = lines[0]?.split('|').map(h => h.trim()).filter(Boolean) || [];
      const rows = lines.slice(2).map(row =>
        row.split('|').map(cell => cell.trim()).filter(Boolean)
      );
      return { type: 'table', headers, rows };
    }
    
    case 'component': {
      // New syntax: [{c:"Name",p:{...}}]
      try {
        const match = content.match(/\[\{c:\s*"([^"]+)"\s*,\s*p:\s*(\{[\s\S]*\})\s*\}\]/);
        if (match) {
          return {
            type: 'component',
            name: match[1],
            props: JSON.parse(match[2]),
          };
        }
      } catch {
        // Parse error — return empty props
      }
      const nameMatch = content.match(/\[\{c:\s*"([^"]+)"/);
      return {
        type: 'component',
        name: nameMatch?.[1] || '',
        props: {},
      };
    }
    
    default:
      return { type } as BlockMeta;
  }
}

/**
 * Reset the registry (e.g., when content is cleared)
 */
export function resetRegistry(): BlockRegistry {
  return INITIAL_REGISTRY;
}

