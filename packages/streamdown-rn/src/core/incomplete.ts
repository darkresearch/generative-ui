/**
 * Incomplete Markdown Handler
 * 
 * Provides "format-as-you-type" UX by:
 * 1. Tracking open markdown tags in a state stack
 * 2. Auto-closing incomplete tags for rendering
 * 3. Hiding markers that have no content yet
 * 
 * Optimized for incremental updates during streaming.
 */

import type { IncompleteTagState } from './types';

// ============================================================================
// Constants
// ============================================================================

export const INITIAL_INCOMPLETE_STATE: IncompleteTagState = {
  stack: [],
  tagCounts: {},
  previousTextLength: 0,
  earliestPosition: 0,
  inCodeBlock: false,
  inInlineCode: false,
};

// ============================================================================
// Helper Functions (DRY)
// ============================================================================

/**
 * Find and remove a tag from the stack
 */
function removeTagFromStack(
  stack: IncompleteTagState['stack'],
  tagCounts: Record<string, number>,
  type: string
): boolean {
  const idx = stack.findIndex(t => t.type === type);
  if (idx !== -1) {
    stack.splice(idx, 1);
    tagCounts[type] = Math.max(0, (tagCounts[type] || 0) - 1);
    return true;
  }
  return false;
}

/**
 * Add a tag to the stack
 */
function addTagToStack(
  stack: IncompleteTagState['stack'],
  tagCounts: Record<string, number>,
  type: string,
  position: number,
  marker: string,
  earliestPosition: number
): number {
  stack.push({ type, position, marker });
  tagCounts[type] = (tagCounts[type] || 0) + 1;
  return earliestPosition === 0 ? position : earliestPosition;
}

/**
 * Check if text ends with a pattern (for detecting partial closers)
 */
function endsWithPartialMarker(text: string, partial: string, full: string): boolean {
  return text.endsWith(partial) && !text.endsWith(full);
}

// ============================================================================
// State Management
// ============================================================================

/**
 * Update tag state based on new text.
 * Only processes new characters since last update.
 * 
 * @param state - Current state
 * @param fullText - Complete text (all tokens so far)
 * @returns Updated state
 */
export function updateTagState(
  state: IncompleteTagState,
  fullText: string
): IncompleteTagState {
  // Handle text shrinking (unlikely in AI responses, but handle it)
  if (fullText.length < state.previousTextLength) {
    return rebuildTagState(fullText);
  }
  
  // No new content
  if (fullText.length === state.previousTextLength) {
    return state;
  }
  
  // For simplicity and correctness, rebuild from scratch
  // This is fast enough for typical streaming (< 1ms for ~10KB)
  return rebuildTagState(fullText);
}

/**
 * Rebuild state from scratch using token-based scanning
 * This properly handles multi-character markers like ** and ```
 */
function rebuildTagState(fullText: string): IncompleteTagState {
  const stack: IncompleteTagState['stack'] = [];
  const tagCounts: Record<string, number> = {};
  let earliestPosition = 0;
  let inCodeBlock = false;
  let inInlineCode = false;
  
  let i = 0;
  while (i < fullText.length) {
    // === Code block: ``` (must check first, before inline code) ===
    if (fullText.slice(i, i + 3) === '```') {
      if (inCodeBlock) {
        // Close code block
        removeTagFromStack(stack, tagCounts, 'codeBlock');
        inCodeBlock = false;
      } else {
        // Open code block
        earliestPosition = addTagToStack(stack, tagCounts, 'codeBlock', i, '```', earliestPosition);
        inCodeBlock = true;
      }
      i += 3;
      continue;
    }
    
    // === Two backticks at end (pending) ===
    // This handles BOTH:
    // 1. Outside code block: `` is building toward opening ```
    // 2. Inside code block: `` is building toward closing ```
    if (fullText.slice(i, i + 2) === '``' && i + 2 === fullText.length) {
      // Track as pending - will be hidden by hideIncompleteMarkers
      earliestPosition = addTagToStack(stack, tagCounts, 'pendingCodeBlock', i, '``', earliestPosition);
      i += 2;
      continue;
    }
    
    // === Single backtick at end inside code block ===
    // Could be building toward closing ```, hide it
    if (inCodeBlock && fullText[i] === '`' && i + 1 === fullText.length) {
      // Track as pending single backtick inside code block
      earliestPosition = addTagToStack(stack, tagCounts, 'pendingBacktick', i, '`', earliestPosition);
      i++;
      continue;
    }
    
    // Skip everything else inside code blocks
    if (inCodeBlock) {
      i++;
      continue;
    }
    
    // === Inline code: ` (single backtick, not part of ```) ===
    if (fullText[i] === '`') {
      if (inInlineCode) {
        removeTagFromStack(stack, tagCounts, 'code');
        inInlineCode = false;
      } else {
        earliestPosition = addTagToStack(stack, tagCounts, 'code', i, '`', earliestPosition);
        inInlineCode = true;
      }
      i++;
      continue;
    }
    
    // Skip everything inside inline code
    if (inInlineCode) {
      i++;
      continue;
    }
    
    // === Bold: ** (must check before italic) ===
    if (fullText.slice(i, i + 2) === '**') {
      const boldIdx = stack.findIndex(t => t.type === 'bold');
      if (boldIdx !== -1) {
        removeTagFromStack(stack, tagCounts, 'bold');
      } else {
        earliestPosition = addTagToStack(stack, tagCounts, 'bold', i, '**', earliestPosition);
      }
      i += 2;
      continue;
    }
    
    // === Italic: * (single asterisk, not part of **) ===
    if (fullText[i] === '*') {
      const italicIdx = stack.findIndex(t => t.type === 'italic');
      const boldOpen = stack.some(t => t.type === 'bold');
      const isLastChar = i === fullText.length - 1;
      
      // SPECIAL CASE: If bold is open, italic is NOT open, and this is the last character,
      // this * is likely the start of the closing ** (user still typing)
      if (boldOpen && italicIdx === -1 && isLastChar) {
        i++;
        continue;
      }
      
      if (italicIdx !== -1) {
        removeTagFromStack(stack, tagCounts, 'italic');
      } else {
        earliestPosition = addTagToStack(stack, tagCounts, 'italic', i, '*', earliestPosition);
      }
      i++;
      continue;
    }
    
    // === Strikethrough: ~~ ===
    if (fullText.slice(i, i + 2) === '~~') {
      const strikeIdx = stack.findIndex(t => t.type === 'strikethrough');
      if (strikeIdx !== -1) {
        removeTagFromStack(stack, tagCounts, 'strikethrough');
      } else {
        earliestPosition = addTagToStack(stack, tagCounts, 'strikethrough', i, '~~', earliestPosition);
      }
      i += 2;
      continue;
    }
    
    // === Link: [text](url) - track opening [ ===
    if (fullText[i] === '[' && fullText[i + 1] !== '{') {
      earliestPosition = addTagToStack(stack, tagCounts, 'link', i, '[', earliestPosition);
      i++;
      continue;
    }
    
    // Close link on ]( followed by )
    if (fullText[i] === ']') {
      const linkIdx = stack.findIndex(t => t.type === 'link');
      if (linkIdx !== -1 && fullText[i + 1] === '(') {
        let parenDepth = 1;
        let j = i + 2;
        while (j < fullText.length && parenDepth > 0) {
          if (fullText[j] === '(') parenDepth++;
          if (fullText[j] === ')') parenDepth--;
          j++;
        }
        if (parenDepth === 0) {
          removeTagFromStack(stack, tagCounts, 'link');
          i = j;
          continue;
        }
      }
      i++;
      continue;
    }
    
    i++;
  }
  
  return {
    stack,
    tagCounts,
    previousTextLength: fullText.length,
    earliestPosition,
    inCodeBlock,
    inInlineCode,
  };
}

// ============================================================================
// Markdown Fixing
// ============================================================================

/**
 * Complete incomplete ordered list markers.
 * 
 * When streaming, we might have:
 *   "1. First item\n2" (incomplete - missing period)
 * 
 * This adds the period so remark parses it as a list marker:
 *   "1. First item\n2."
 * 
 * Only matches digits at the very END of the string after a newline,
 * so completed markers like "2." are not affected.
 */
function completeOrderedListMarkers(text: string): string {
  return text.replace(/\n(\d+)$/g, '\n$1.');
}

/**
 * Fix incomplete markdown by auto-closing open tags.
 * This allows formatting to appear immediately during streaming.
 * 
 * @param text - Raw markdown text
 * @param state - Current tag state
 * @returns Fixed markdown (ready for remark parsing)
 */
export function fixIncompleteMarkdown(
  text: string,
  state: IncompleteTagState
): string {
  if (!text || text.length === 0) {
    return text;
  }
  
  let fixed = text;
  const originalLength = text.length;
  
  // Auto-close open tags in reverse order (innermost first)
  const reversedStack = [...state.stack].reverse();
  
  for (const tag of reversedStack) {
    fixed = closeTag(fixed, tag.type, text, originalLength);
  }
  
  // Complete incomplete ordered list markers (e.g., "1. First\n2" → "1. First\n2.")
  fixed = completeOrderedListMarkers(fixed);
  
  // Hide incomplete markers at the very end
  fixed = hideIncompleteMarkers(fixed);
  
  return fixed;
}

/**
 * Close a single tag by appending the appropriate closing marker
 */
function closeTag(fixed: string, tagType: string, originalText: string, originalLength: number): string {
  switch (tagType) {
    case 'bold':
      // SPECIAL CASE: If original text ends with single *, complete the ** closer
      if (endsWithPartialMarker(originalText, '*', '**') && fixed.length === originalLength) {
        return fixed + '*';
      }
      return fixed + '**';
      
    case 'italic':
      return fixed + '*';
      
    case 'code':
      return fixed + '`';
      
    case 'strikethrough':
      // SPECIAL CASE: If original text ends with single ~, complete the ~~ closer
      if (endsWithPartialMarker(originalText, '~', '~~') && fixed.length === originalLength) {
        return fixed + '~';
      }
      return fixed + '~~';
      
    case 'codeBlock':
      // Add closing fence
      return fixed.endsWith('\n') ? fixed + '```' : fixed + '\n```';
      
    case 'pendingCodeBlock':
    case 'pendingBacktick':
      // These are handled by hideIncompleteMarkers - don't add anything
      return fixed;
      
    case 'link':
      return fixed + '](#)';
      
    default:
      return fixed;
  }
}

/**
 * Hide incomplete markers that have no content yet.
 * 
 * This is called AFTER auto-closing, so we hide auto-closed EMPTY tags.
 */
function hideIncompleteMarkers(text: string): string {
  let result = text;
  
  // === Hide empty inline formatting ===
  
  // Empty bold: "****" at end preceded by whitespace/start
  result = result.replace(/(^|[\s\n])\*\*\*\*$/g, '$1');
  
  // Empty italic: "**" at end preceded by whitespace/start (not a bold closer)
  result = result.replace(/(^|[\s\n])\*\*$/g, '$1');
  
  // Empty strikethrough: "~~~~"
  result = result.replace(/~~~~$/g, '');
  
  // === Hide pending backticks (building toward ``` or closing ```) ===
  
  // Pending backticks inside code block content (building toward closing fence)
  // Pattern: content ending with ` or `` before the auto-added \n```
  // "```js\ncode\n`\n```" → "```js\ncode\n```"
  // "```js\ncode\n``\n```" → "```js\ncode\n```"
  // 
  // We need to detect code blocks that end with pending backticks.
  // The code block may have content before it (like headings), so we can't
  // anchor to ^ - instead we look for the pattern anywhere in the string.
  // 
  // Key: If the string ends with \n`\n``` or \n``\n```, strip the pending backticks.
  // But only if there's a code block (contains ```\w*\n somewhere before).
  const hasCodeBlock = /```\w*\n/.test(result);
  if (hasCodeBlock) {
    // Strip pending backticks on their own line before closing fence
    // Check for `` first (longer match), then `
    result = result.replace(/\n``\n```$/g, '\n```');
    result = result.replace(/\n`\n```$/g, '\n```');
    
    // Also handle trailing backticks on same line as content
    // "code``\n```" → "code\n```"
    // But NOT just "``\n```" at the start (that would be empty)
    // We check that there's actual content before the backticks
    if (/[^\n`]``\n```$/.test(result)) {
      result = result.replace(/``\n```$/g, '\n```');
    } else if (/[^\n`]`\n```$/.test(result)) {
      result = result.replace(/`\n```$/g, '\n```');
    }
  }
  
  // === Hide empty inline code ===
  
  // Empty inline code: "``" (but not if part of code block fence)
  if (!result.includes('```')) {
    result = result.replace(/``$/g, '');
  }
  
  // === Hide incomplete backtick sequences (outside code blocks) ===
  
  // Single backtick at end with no content
  result = result.replace(/(^|[\s\n])`$/g, '$1');
  
  // Two backticks at end (pending code block opening)
  result = result.replace(/(^|[\s\n])``$/g, '$1');
  
  // === Hide incomplete components and links ===
  
  // Incomplete component markers: [{c:"... without closing
  const componentMatch = result.match(/(\[\{c:\s*"[^}\]]*?)$/);
  if (componentMatch) {
    result = result.slice(0, -componentMatch[1].length);
  }
  
  // Incomplete links: [text](#) → just show [text]
  result = result.replace(/\[([^\]]*)\]\(#\)$/g, '[$1]');
  
  return result;
}

// ============================================================================
// Exports for Testing
// ============================================================================

/**
 * Test-only exports
 */
export const __test__ = {
  hideIncompleteMarkers,
  rebuildTagState,
};
