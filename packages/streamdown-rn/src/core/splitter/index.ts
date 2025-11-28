import type { BlockRegistry } from '../types';
import { INITIAL_REGISTRY } from '../types';
import { updateTagState } from '../incomplete';
import { logDebug, logStateSnapshot } from './logger';
import { processLines } from './processLines';

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

