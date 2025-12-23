/**
 * Custom Renderers Tests
 *
 * Tests for the custom code block renderer data flow.
 *
 * These tests verify the data layer: that code blocks are correctly
 * detected, parsed, and would receive correct props when rendered.
 *
 * Note: Actual rendering tests require React Native environment
 * and are performed via manual testing in debugger-ios.
 */

import { describe, it, expect } from 'bun:test';
import { processNewContent } from '../core/splitter';
import { parseBlockContent } from '../core/parser';
import {
  fixIncompleteMarkdown,
  updateTagState,
  INITIAL_INCOMPLETE_STATE,
} from '../core/incomplete';
import { INITIAL_REGISTRY } from '../core/types';
import type { Content, Code } from 'mdast';

// Helper to extract code node from AST
function findCodeNode(ast: Content): Code | null {
  if (ast.type === 'code') {
    return ast as Code;
  }
  if ('children' in ast && Array.isArray(ast.children)) {
    for (const child of ast.children) {
      const found = findCodeNode(child as Content);
      if (found) return found;
    }
  }
  return null;
}

// ============================================================================
// Unit Tests - Code Block Detection & Parsing
// ============================================================================

describe('Custom Code Block Renderer - Code Block Detection', () => {
  describe('Basic code block parsing', () => {
    it('should parse code block with language identifier', () => {
      const ast = parseBlockContent('```typescript\nconst x = 1;\n```');
      expect(ast).toBeDefined();

      const codeNode = findCodeNode(ast!);
      expect(codeNode).not.toBeNull();
      expect(codeNode!.lang).toBe('typescript');
      expect(codeNode!.value).toBe('const x = 1;');
    });

    it('should parse code block without language identifier', () => {
      const ast = parseBlockContent('```\nsome code\n```');
      expect(ast).toBeDefined();

      const codeNode = findCodeNode(ast!);
      expect(codeNode).not.toBeNull();
      expect(codeNode!.lang).toBeNull();
      expect(codeNode!.value).toBe('some code');
    });

    it('should parse various language identifiers correctly', () => {
      const languages = ['javascript', 'python', 'rust', 'go', 'jsx', 'tsx'];

      for (const lang of languages) {
        const ast = parseBlockContent(`\`\`\`${lang}\ncode\n\`\`\``);
        const codeNode = findCodeNode(ast!);
        expect(codeNode!.lang).toBe(lang);
      }
    });

    it('should handle empty code block', () => {
      const ast = parseBlockContent('```\n```');
      expect(ast).toBeDefined();

      const codeNode = findCodeNode(ast!);
      expect(codeNode).not.toBeNull();
      expect(codeNode!.value).toBe('');
    });

    it('should handle multiline code correctly', () => {
      const ast = parseBlockContent(
        '```typescript\nfunction hello() {\n  console.log("hi");\n}\n```'
      );
      const codeNode = findCodeNode(ast!);
      expect(codeNode!.value).toBe('function hello() {\n  console.log("hi");\n}');
    });
  });
});

// ============================================================================
// Streaming Behavior Tests
// ============================================================================

describe('Custom Code Block Renderer - Streaming', () => {
  it('should auto-close incomplete code block for streaming preview', () => {
    const incompleteContent = '```ts\nconst x';
    const tagState = updateTagState(INITIAL_INCOMPLETE_STATE, incompleteContent);
    const fixedContent = fixIncompleteMarkdown(incompleteContent, tagState);

    // Should auto-close the code block
    expect(fixedContent).toContain('```ts');
    expect(fixedContent).toMatch(/```\s*$/);

    // Parse the fixed content
    const ast = parseBlockContent(fixedContent);
    const codeNode = findCodeNode(ast!);
    expect(codeNode).not.toBeNull();
    expect(codeNode!.lang).toBe('ts');
    expect(codeNode!.value.trim()).toBe('const x');
  });

  it('should correctly parse partial code at various streaming stages', () => {
    const stages = [
      { input: '```ts\ncon', expectedCode: 'con' },
      { input: '```ts\nconst', expectedCode: 'const' },
      { input: '```ts\nconst x = ', expectedCode: 'const x =' },
      { input: '```ts\nconst x = 1;', expectedCode: 'const x = 1;' },
    ];

    for (const stage of stages) {
      const tagState = updateTagState(INITIAL_INCOMPLETE_STATE, stage.input);
      const fixedContent = fixIncompleteMarkdown(stage.input, tagState);
      const ast = parseBlockContent(fixedContent);

      const codeNode = findCodeNode(ast!);
      expect(codeNode).not.toBeNull();
      expect(codeNode!.value.trim()).toBe(stage.expectedCode.trim());
    }
  });

  it('should track code evolution during streaming', () => {
    const codeHistory: string[] = [];
    const streamChunks = [
      '```python\nprint',
      '```python\nprint("Hello',
      '```python\nprint("Hello, World!")',
      '```python\nprint("Hello, World!")\n```',
    ];

    for (const chunk of streamChunks) {
      const tagState = updateTagState(INITIAL_INCOMPLETE_STATE, chunk);
      const fixedContent = fixIncompleteMarkdown(chunk, tagState);
      const ast = parseBlockContent(fixedContent);

      const codeNode = findCodeNode(ast!);
      if (codeNode) {
        codeHistory.push(codeNode.value);
      }
    }

    // Verify code values evolved correctly
    expect(codeHistory[0]).toContain('print');
    expect(codeHistory[codeHistory.length - 1]).toBe('print("Hello, World!")');
  });

  it('should maintain language throughout streaming', () => {
    const languageHistory: (string | null)[] = [];
    const streamChunks = [
      '```typescript\nconst',
      '```typescript\nconst x',
      '```typescript\nconst x = 1;\n```',
    ];

    for (const chunk of streamChunks) {
      const tagState = updateTagState(INITIAL_INCOMPLETE_STATE, chunk);
      const fixedContent = fixIncompleteMarkdown(chunk, tagState);
      const ast = parseBlockContent(fixedContent);

      const codeNode = findCodeNode(ast!);
      if (codeNode) {
        languageHistory.push(codeNode.lang);
      }
    }

    // Language should be consistent
    expect(languageHistory.every((l) => l === 'typescript')).toBe(true);
  });
});

// ============================================================================
// Edge Cases
// ============================================================================

describe('Custom Code Block Renderer - Edge Cases', () => {
  it('should handle code block with trailing newlines', () => {
    const ast = parseBlockContent('```js\ncode\n\n\n```');
    const codeNode = findCodeNode(ast!);
    // Note: mdast preserves trailing newlines in value, trimming happens at render
    expect(codeNode!.value).toBe('code\n\n');
  });

  it('should detect multiple code blocks in content', () => {
    const content =
      '```js\ncode1\n```\n\nText paragraph\n\n```python\ncode2\n```';
    let registry = processNewContent(INITIAL_REGISTRY, content);

    const codeBlocks = registry.blocks.filter((b) => b.type === 'codeBlock');
    expect(codeBlocks.length).toBe(2);

    // Parse each and verify language
    const languages: (string | null)[] = [];
    for (const block of codeBlocks) {
      if (block.ast) {
        const codeNode = findCodeNode(block.ast);
        if (codeNode) {
          languages.push(codeNode.lang);
        }
      }
    }

    expect(languages).toContain('js');
    expect(languages).toContain('python');
  });

  it('should handle code block mixed with other content', () => {
    const content =
      '# Heading\n\nSome text\n\n```rust\nfn main() {}\n```\n\nMore text';
    let registry = processNewContent(INITIAL_REGISTRY, content);

    // Find code block
    const codeBlock = registry.blocks.find((b) => b.type === 'codeBlock');
    expect(codeBlock).toBeDefined();

    if (codeBlock?.ast) {
      const codeNode = findCodeNode(codeBlock.ast);
      expect(codeNode!.value).toBe('fn main() {}');
      expect(codeNode!.lang).toBe('rust');
    }
  });

  it('should correctly identify code block type in registry', () => {
    const content = '```typescript\nconst x = 1;\n```';
    let registry = processNewContent(INITIAL_REGISTRY, content);

    expect(registry.blocks.length).toBeGreaterThan(0);
    const codeBlock = registry.blocks.find((b) => b.type === 'codeBlock');
    expect(codeBlock).toBeDefined();
    expect(codeBlock!.type).toBe('codeBlock');
  });
});

// ============================================================================
// Helper to simulate streaming
// ============================================================================

function simulateStreaming(
  fullContent: string,
  chunkSize: number = 5
): string[] {
  const chunks: string[] = [];
  for (let i = chunkSize; i <= fullContent.length; i += chunkSize) {
    chunks.push(fullContent.slice(0, i));
  }
  if (chunks[chunks.length - 1] !== fullContent) {
    chunks.push(fullContent);
  }
  return chunks;
}

describe('Custom Code Block Renderer - Streaming Helper', () => {
  it('should simulate streaming correctly with helper', () => {
    const fullContent = '```js\nconst x = 1;\n```';
    const chunks = simulateStreaming(fullContent, 5);

    const codeHistory: string[] = [];

    for (const chunk of chunks) {
      const tagState = updateTagState(INITIAL_INCOMPLETE_STATE, chunk);
      const fixedContent = fixIncompleteMarkdown(chunk, tagState);
      const ast = parseBlockContent(fixedContent);
      const codeNode = findCodeNode(ast!);
      if (codeNode) {
        codeHistory.push(codeNode.value);
      }
    }

    // Should have multiple parses as content progresses
    expect(codeHistory.length).toBeGreaterThan(1);
    // Final parse should have complete code
    expect(codeHistory[codeHistory.length - 1]).toBe('const x = 1;');
  });
});

// ============================================================================
// Props Extraction Tests (simulating what renderer would receive)
// ============================================================================

describe('Custom Code Block Renderer - Props Extraction', () => {
  it('should extract props that would be passed to custom renderer', () => {
    const ast = parseBlockContent('```typescript\nconst x = 1;\n```');
    const codeNode = findCodeNode(ast!);

    // These are the props that would be passed to CodeBlockRendererProps
    const extractedProps = {
      code: codeNode!.value,
      language: codeNode!.lang || 'text',
    };

    expect(extractedProps.code).toBe('const x = 1;');
    expect(extractedProps.language).toBe('typescript');
  });

  it('should default language to "text" when not specified', () => {
    const ast = parseBlockContent('```\nsome code\n```');
    const codeNode = findCodeNode(ast!);

    const language = codeNode!.lang || 'text';
    expect(language).toBe('text');
  });

  it('should handle special characters in code correctly', () => {
    const codeWithSpecialChars = '```js\nconst str = "<div class=\\"foo\\">"\n```';
    const ast = parseBlockContent(codeWithSpecialChars);
    const codeNode = findCodeNode(ast!);

    expect(codeNode!.value).toContain('<div');
    expect(codeNode!.value).toContain('class=');
  });
});
