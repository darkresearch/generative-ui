import type { BlockRegistry } from '../types';
import { INITIAL_REGISTRY } from '../types';
import { updateTagState, INITIAL_INCOMPLETE_STATE } from '../incomplete';
import { logDebug, logStateSnapshot } from './logger';
import { processLines } from './processLines';
import { finalizeBlock } from './finalizeBlock';

const SPLITTER_VERSION = 'heading-finalize-v1';

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

  const newContent = fullText.slice(registry.cursor);
  const activeContent = registry.activeBlock
    ? registry.activeBlock.content + newContent
    : newContent;
  const newTagState = updateTagState(registry.activeTagState, activeContent);
  const lines = activeContent.split('\n');

  const result = processLines({
    registry,
    fullText,
    lines,
    activeContent,
    tagState: newTagState,
    activeStartPos: registry.activeBlock?.startPos ?? registry.cursor,
  });

  logStateSnapshot('state.after', result);
  return result;
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

