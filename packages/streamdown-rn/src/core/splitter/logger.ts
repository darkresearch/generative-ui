declare const __DEV__: boolean | undefined;

const LOG_PREFIX = '[streamdown-rn]';

export const logDebug = (...args: unknown[]) => {
  const inDev =
    typeof __DEV__ !== 'undefined'
      ? __DEV__
      : typeof process !== 'undefined'
      ? process.env.NODE_ENV !== 'production'
      : true;
  if (!inDev) return;
  if (typeof console !== 'undefined' && console.log) {
    console.log(LOG_PREFIX, ...args);
  }
};

export const logStateSnapshot = (
  label: string,
  registry: import('../types').BlockRegistry
) => {
  logDebug(label, {
    stableBlocks: registry.blocks.map((block) => ({
      id: block.id,
      type: block.type,
      length: block.content.length,
      preview: block.content.slice(0, 40),
    })),
    activeBlock: registry.activeBlock
      ? {
          type: registry.activeBlock.type,
          length: registry.activeBlock.content.length,
          preview: registry.activeBlock.content.slice(0, 60),
        }
      : null,
  });
};

