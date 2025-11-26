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
  
  // Process only new characters
  const newChars = fullText.slice(state.previousTextLength);
  return processNewCharacters(state, fullText, newChars);
}

/**
 * Rebuild state from scratch (used when text changes non-incrementally)
 */
function rebuildTagState(fullText: string): IncompleteTagState {
  let state = INITIAL_INCOMPLETE_STATE;
  
  for (let i = 0; i < fullText.length; i++) {
    const char = fullText[i];
    const nextChar = fullText[i + 1];
    const nextChar2 = fullText[i + 2];
    
    state = processCharacter(state, fullText, i, char, nextChar, nextChar2);
  }
  
  return {
    ...state,
    previousTextLength: fullText.length,
  };
}

/**
 * Process new characters and update state
 */
function processNewCharacters(
  state: IncompleteTagState,
  fullText: string,
  newChars: string
): IncompleteTagState {
  let newState = { ...state };
  const startPos = state.previousTextLength;
  
  for (let i = 0; i < newChars.length; i++) {
    const position = startPos + i;
    const char = newChars[i];
    const nextChar = fullText[position + 1];
    const nextChar2 = fullText[position + 2];
    
    newState = processCharacter(newState, fullText, position, char, nextChar, nextChar2);
  }
  
  return {
    ...newState,
    previousTextLength: fullText.length,
  };
}

/**
 * Process a single character and update tag state
 */
function processCharacter(
  state: IncompleteTagState,
  fullText: string,
  position: number,
  char: string,
  nextChar: string | undefined,
  nextChar2: string | undefined
): IncompleteTagState {
  const stack = [...state.stack];
  const tagCounts = { ...state.tagCounts };
  let { inCodeBlock, inInlineCode, earliestPosition } = state;
  
  // Code blocks: ``` (check for 3 backticks)
  if (char === '`' && nextChar === '`' && nextChar2 === '`') {
    const codeBlockIndex = stack.findIndex(tag => tag.type === 'codeBlock');
    
    if (codeBlockIndex !== -1) {
      // Close code block
      stack.splice(codeBlockIndex, 1);
      tagCounts.codeBlock = (tagCounts.codeBlock || 1) - 1;
      inCodeBlock = false;
    } else {
      // Open code block
      stack.push({ type: 'codeBlock', position, marker: '```' });
      tagCounts.codeBlock = (tagCounts.codeBlock || 0) + 1;
      inCodeBlock = true;
      if (earliestPosition === 0 || position < earliestPosition) {
        earliestPosition = position;
      }
    }
    return { stack, tagCounts, previousTextLength: state.previousTextLength, earliestPosition, inCodeBlock, inInlineCode };
  }
  
  // Skip markdown processing inside code blocks (except code block closing)
  if (inCodeBlock) {
    return { stack, tagCounts, previousTextLength: state.previousTextLength, earliestPosition, inCodeBlock, inInlineCode };
  }
  
  // Inline code: `
  if (char === '`') {
    if (inInlineCode) {
      // Close inline code
      const codeIndex = stack.findIndex(tag => tag.type === 'code');
      if (codeIndex !== -1) {
        stack.splice(codeIndex, 1);
        tagCounts.code = (tagCounts.code || 1) - 1;
      }
      inInlineCode = false;
    } else {
      // Open inline code
      stack.push({ type: 'code', position, marker: '`' });
      tagCounts.code = (tagCounts.code || 0) + 1;
      inInlineCode = true;
      if (earliestPosition === 0 || position < earliestPosition) {
        earliestPosition = position;
      }
    }
    return { stack, tagCounts, previousTextLength: state.previousTextLength, earliestPosition, inCodeBlock, inInlineCode };
  }
  
  // Skip other markdown inside inline code
  if (inInlineCode) {
    return { stack, tagCounts, previousTextLength: state.previousTextLength, earliestPosition, inCodeBlock, inInlineCode };
  }
  
  // Bold: **
  if (char === '*' && nextChar === '*') {
    const boldIndex = stack.findIndex(tag => tag.type === 'bold');
    
    if (boldIndex !== -1) {
      // Close bold
      stack.splice(boldIndex, 1);
      tagCounts.bold = (tagCounts.bold || 1) - 1;
    } else {
      // Open bold
      stack.push({ type: 'bold', position, marker: '**' });
      tagCounts.bold = (tagCounts.bold || 0) + 1;
      if (earliestPosition === 0 || position < earliestPosition) {
        earliestPosition = position;
      }
    }
    return { stack, tagCounts, previousTextLength: state.previousTextLength, earliestPosition, inCodeBlock, inInlineCode };
  }
  
  // Italic: * (single, not double)
  if (char === '*' && nextChar !== '*') {
    const prevChar = position > 0 ? fullText[position - 1] : '';
    if (prevChar !== '*') {
      const italicIndex = stack.findIndex(tag => tag.type === 'italic');
      
      if (italicIndex !== -1) {
        // Close italic
        stack.splice(italicIndex, 1);
        tagCounts.italic = (tagCounts.italic || 1) - 1;
      } else {
        // Open italic
        stack.push({ type: 'italic', position, marker: '*' });
        tagCounts.italic = (tagCounts.italic || 0) + 1;
        if (earliestPosition === 0 || position < earliestPosition) {
          earliestPosition = position;
        }
      }
    }
  }
  
  return { stack, tagCounts, previousTextLength: state.previousTextLength, earliestPosition, inCodeBlock, inInlineCode };
}

// ============================================================================
// Markdown Fixing
// ============================================================================

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
  
  // Auto-close open tags in reverse order (innermost first)
  const reversedStack = [...state.stack].reverse();
  
  for (const tag of reversedStack) {
    switch (tag.type) {
      case 'bold':
        fixed = fixed + '**';
        break;
      case 'italic':
        fixed = fixed + '*';
        break;
      case 'code':
        fixed = fixed + '`';
        break;
      case 'codeBlock':
        // Add newline + closing fence if not already on new line
        if (!fixed.endsWith('\n')) {
          fixed = fixed + '\n```';
        } else {
          fixed = fixed + '```';
        }
        break;
      // Links and components handled separately
    }
  }
  
  // Hide incomplete markers at the very end
  fixed = hideIncompleteMarkers(fixed);
  
  return fixed;
}

/**
 * Hide incomplete markers that have no content yet.
 * E.g., trailing "**" or "`" with nothing after it.
 * 
 * This is called AFTER auto-closing, so we hide auto-closed empty tags.
 */
function hideIncompleteMarkers(text: string): string {
  let result = text;
  
  // Hide auto-closed empty bold: "****" → ""
  result = result.replace(/\*\*\*\*$/g, '');
  
  // Hide auto-closed empty italic: "**" → ""
  result = result.replace(/\*\*$/g, '');
  
  // Hide auto-closed empty inline code: "``" → ""
  result = result.replace(/``$/g, '');
  
  // Hide trailing code block fence without content
  result = result.replace(/\n```\s*$/g, '\n');
  result = result.replace(/^```\s*$/g, '');
  
  // Hide incomplete component markers
  if (result.match(/\[\{c:\s*"[^}]*$/)) {
    const match = result.match(/(\[\{c:\s*"[^}]*)$/);
    if (match) {
      result = result.slice(0, -match[1].length);
    }
  }
  
  return result;
}

// ============================================================================
// Exports for Testing
// ============================================================================

/**
 * Test-only: Process a single character (exported for unit tests)
 */
export const __test__ = {
  processCharacter,
  hideIncompleteMarkers,
  rebuildTagState,
};

