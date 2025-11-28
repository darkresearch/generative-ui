/**
 * Helpers to detect when special blocks are closed.
 */

export function isCodeBlockClosed(content: string): boolean {
  const lines = content.split('\n');
  if (lines.length < 2) return false;

  const firstLine = lines[0];
  const lastLine = lines[lines.length - 1];

  const openMatch = firstLine.match(/^(`{3,}|~{3,})/);
  if (!openMatch) return false;

  const fence = openMatch[1];
  const fenceChar = fence[0];
  const fenceLen = fence.length;
  const closePattern = new RegExp(`^${fenceChar}{${fenceLen},}\\s*$`);
  return closePattern.test(lastLine);
}

export function isComponentClosed(content: string): boolean {
  if (!content.startsWith('[{')) return false;

  let braceDepth = 1;
  let bracketDepth = 1;
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

    if (
      braceDepth === 0 &&
      bracketDepth === 0 &&
      i >= 1 &&
      content[i - 1] === '}' &&
      char === ']'
    ) {
      return true;
    }
  }

  return false;
}

