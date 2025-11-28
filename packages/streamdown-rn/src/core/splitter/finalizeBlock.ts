import type {
  BlockMeta,
  BlockType,
  HeadingLevel,
  StableBlock,
} from '../types';
import { generateBlockId, hashContent } from '../types';
import { parseBlockContent } from '../parser';

export function finalizeBlock(
  content: string,
  type: BlockType,
  counter: number,
  startPos: number
): StableBlock {
  const meta = extractBlockMeta(content, type);
  const ast =
    type === 'component'
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
        items: lines.filter((l) => l.trim()),
      };
    }
    case 'table': {
      const lines = content.split('\n').filter((l) => l.trim());
      const headers =
        lines[0]?.split('|').map((h) => h.trim()).filter(Boolean) || [];
      const rows = lines
        .slice(2)
        .map((row) => row.split('|').map((cell) => cell.trim()).filter(Boolean));
      return { type: 'table', headers, rows };
    }
    case 'component': {
      try {
        const match = content.match(
          /\[\{c:\s*"([^"]+)"\s*,\s*p:\s*(\{[\s\S]*\})\s*\}\]/
        );
        if (match) {
          return {
            type: 'component',
            name: match[1],
            props: JSON.parse(match[2]),
          };
        }
      } catch {
        // ignore parse failures
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

