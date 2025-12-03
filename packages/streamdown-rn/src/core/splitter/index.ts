import type { BlockRegistry } from '../types';
import { INITIAL_REGISTRY } from '../types';
import { updateTagState, INITIAL_INCOMPLETE_STATE } from '../incomplete';
import { logDebug, logStateSnapshot } from './logger';
import { processLines } from './processLines';
import { finalizeBlock } from './finalizeBlock';

const SPLITTER_VERSION = 'char-level-v1';

/**
 * Process new content character-by-character.
 * 
 * This ensures consistent block boundary detection regardless of chunk size.
 * Whether content arrives 1 character at a time or 1000 characters at once,
 * block boundaries are detected at the exact character position.
 */
export function processNewContent(
  registry: BlockRegistry,
  fullText: string
): BlockRegistry {
  logDebug('processNewContent', {
    previousCursor: registry.cursor,
    incomingLength: fullText.length,
  });
  logStateSnapshot('state.before', registry);

  attachGlobalVersion();

  if (fullText.length <= registry.cursor) {
    return registry;
  }

  // Process each new character individually to ensure consistent
  // block boundary detection regardless of chunk size
  let currentRegistry = registry;
  
  for (let i = registry.cursor; i < fullText.length; i++) {
    // Process content up to position i+1 (one character at a time)
    currentRegistry = processSingleCharacter(currentRegistry, fullText, i + 1);
  }

  logStateSnapshot('state.after', currentRegistry);
  return currentRegistry;
}

/**
 * Process content up to a specific position (single character increment).
 * This is the core of character-level processing.
 */
function processSingleCharacter(
  registry: BlockRegistry,
  fullText: string,
  endPos: number
): BlockRegistry {
  // Only process if we have new content
  if (endPos <= registry.cursor) {
    return registry;
  }

  const newContent = fullText.slice(registry.cursor, endPos);
  const activeContent = registry.activeBlock
    ? registry.activeBlock.content + newContent
    : newContent;
  const newTagState = updateTagState(registry.activeTagState, activeContent);
  const lines = activeContent.split('\n');

  // Create a virtual "fullText" that only goes up to endPos
  // This ensures cursor is set correctly for this character
  const virtualFullText = fullText.slice(0, endPos);

  return processLines({
    registry,
    fullText: virtualFullText,
    lines,
    activeContent,
    tagState: newTagState,
    activeStartPos: registry.activeBlock?.startPos ?? registry.cursor,
  });
}

export function resetRegistry(): BlockRegistry {
  return INITIAL_REGISTRY;
}

/**
 * Finalize the active block into a stable block.
 * Call this when streaming is complete to ensure the last block is properly memoized.
 */
export function finalizeActiveBlock(registry: BlockRegistry): BlockRegistry {
  if (!registry.activeBlock || !registry.activeBlock.content.trim()) {
    return registry;
  }

  const { activeBlock } = registry;
  const type = activeBlock.type || 'paragraph';
  
  const stableBlock = finalizeBlock(
    activeBlock.content,
    type,
    registry.blockCounter,
    activeBlock.startPos
  );

  return {
    blocks: [...registry.blocks, stableBlock],
    activeBlock: null,
    activeTagState: INITIAL_INCOMPLETE_STATE,
    cursor: registry.cursor,
    blockCounter: registry.blockCounter + 1,
  };
}

function attachGlobalVersion() {
  const target =
    typeof globalThis !== 'undefined'
      ? (globalThis as any)
      : typeof global !== 'undefined'
      ? (global as any)
      : undefined;
  if (!target) return;

  target.__streamdown = {
    ...(target.__streamdown || {}),
    splitterVersion: SPLITTER_VERSION,
  };
}

