/**
 * Custom Renderers Tests
 *
 * Tests for all custom renderer data flows:
 * - Code blocks
 * - Images
 * - Links
 * - Blockquotes
 * - Tables
 * - Headings
 *
 * These tests verify the data layer: that elements are correctly
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
import type { Content, Code, Image, Link, Blockquote, Table, Heading } from 'mdast';

// ============================================================================
// Helper Functions to Extract Nodes from AST
// ============================================================================

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

// Helper to extract image node from AST
function findImageNode(ast: Content): Image | null {
  if (ast.type === 'image') {
    return ast as Image;
  }
  if ('children' in ast && Array.isArray(ast.children)) {
    for (const child of ast.children) {
      const found = findImageNode(child as Content);
      if (found) return found;
    }
  }
  return null;
}

// Helper to extract all image nodes from AST
function findAllImageNodes(ast: Content): Image[] {
  const images: Image[] = [];
  if (ast.type === 'image') {
    images.push(ast as Image);
  }
  if ('children' in ast && Array.isArray(ast.children)) {
    for (const child of ast.children) {
      images.push(...findAllImageNodes(child as Content));
    }
  }
  return images;
}

// Helper to extract link node from AST
function findLinkNode(ast: Content): Link | null {
  if (ast.type === 'link') {
    return ast as Link;
  }
  if ('children' in ast && Array.isArray(ast.children)) {
    for (const child of ast.children) {
      const found = findLinkNode(child as Content);
      if (found) return found;
    }
  }
  return null;
}

// Helper to extract all link nodes from AST
function findAllLinkNodes(ast: Content): Link[] {
  const links: Link[] = [];
  if (ast.type === 'link') {
    links.push(ast as Link);
  }
  if ('children' in ast && Array.isArray(ast.children)) {
    for (const child of ast.children) {
      links.push(...findAllLinkNodes(child as Content));
    }
  }
  return links;
}

// Helper to extract blockquote node from AST
function findBlockquoteNode(ast: Content): Blockquote | null {
  if (ast.type === 'blockquote') {
    return ast as Blockquote;
  }
  if ('children' in ast && Array.isArray(ast.children)) {
    for (const child of ast.children) {
      const found = findBlockquoteNode(child as Content);
      if (found) return found;
    }
  }
  return null;
}

// Helper to extract table node from AST
function findTableNode(ast: Content): Table | null {
  if (ast.type === 'table') {
    return ast as Table;
  }
  if ('children' in ast && Array.isArray(ast.children)) {
    for (const child of ast.children) {
      const found = findTableNode(child as Content);
      if (found) return found;
    }
  }
  return null;
}

// Helper to extract heading node from AST
function findHeadingNode(ast: Content): Heading | null {
  if (ast.type === 'heading') {
    return ast as Heading;
  }
  if ('children' in ast && Array.isArray(ast.children)) {
    for (const child of ast.children) {
      const found = findHeadingNode(child as Content);
      if (found) return found;
    }
  }
  return null;
}

// Helper to extract all heading nodes from AST
function findAllHeadingNodes(ast: Content): Heading[] {
  const headings: Heading[] = [];
  if (ast.type === 'heading') {
    headings.push(ast as Heading);
  }
  if ('children' in ast && Array.isArray(ast.children)) {
    for (const child of ast.children) {
      headings.push(...findAllHeadingNodes(child as Content));
    }
  }
  return headings;
}

// Helper to extract text content from AST node
function getTextContent(node: Content): string {
  if (node.type === 'text') {
    return (node as { type: 'text'; value: string }).value;
  }
  if ('children' in node && Array.isArray(node.children)) {
    return node.children.map((child) => getTextContent(child as Content)).join('');
  }
  return '';
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

// ============================================================================
// IMAGE RENDERER TESTS
// ============================================================================

describe('Custom Image Renderer - Image Detection', () => {
  describe('Basic image parsing', () => {
    it('should parse image with alt text and URL', () => {
      const ast = parseBlockContent('![Alt text](https://example.com/image.png)');
      expect(ast).toBeDefined();

      const imageNode = findImageNode(ast!);
      expect(imageNode).not.toBeNull();
      expect(imageNode!.url).toBe('https://example.com/image.png');
      expect(imageNode!.alt).toBe('Alt text');
    });

    it('should parse image with title attribute', () => {
      const ast = parseBlockContent('![Alt](https://example.com/img.jpg "Image title")');
      const imageNode = findImageNode(ast!);

      expect(imageNode!.url).toBe('https://example.com/img.jpg');
      expect(imageNode!.alt).toBe('Alt');
      expect(imageNode!.title).toBe('Image title');
    });

    it('should parse image without alt text', () => {
      const ast = parseBlockContent('![](https://example.com/image.png)');
      const imageNode = findImageNode(ast!);

      expect(imageNode!.url).toBe('https://example.com/image.png');
      expect(imageNode!.alt).toBe('');
    });

    it('should handle various URL formats', () => {
      const urls = [
        'https://example.com/image.png',
        'http://example.com/image.jpg',
        '/relative/path/image.gif',
        './local/image.webp',
      ];

      for (const url of urls) {
        const ast = parseBlockContent(`![test](${url})`);
        const imageNode = findImageNode(ast!);
        expect(imageNode!.url).toBe(url);
      }
    });
  });
});

describe('Custom Image Renderer - Streaming', () => {
  it('should auto-close incomplete image during streaming', () => {
    const incompleteContent = '![Alt text](https://example.com/img';
    const tagState = updateTagState(INITIAL_INCOMPLETE_STATE, incompleteContent);
    const fixedContent = fixIncompleteMarkdown(incompleteContent, tagState);

    // Should auto-close the image syntax
    expect(fixedContent).toContain('![Alt text]');
    expect(fixedContent).toMatch(/\)$/);
  });

  it('should track image URL evolution during streaming', () => {
    const stages = [
      { input: '![alt](https:', hasImage: false },
      { input: '![alt](https://ex', hasImage: true },
      { input: '![alt](https://example.com/img.png)', hasImage: true },
    ];

    for (const stage of stages) {
      const tagState = updateTagState(INITIAL_INCOMPLETE_STATE, stage.input);
      const fixedContent = fixIncompleteMarkdown(stage.input, tagState);
      const ast = parseBlockContent(fixedContent);
      const imageNode = findImageNode(ast!);

      if (stage.hasImage) {
        expect(imageNode).not.toBeNull();
      }
    }
  });
});

describe('Custom Image Renderer - Edge Cases', () => {
  it('should handle multiple images in content', () => {
    // Add trailing content to finalize all blocks
    const content = `![First](https://example.com/1.png)

Some text

![Second](https://example.com/2.png)

End text`;
    // Use processNewContent to get multiple blocks
    let registry = processNewContent(INITIAL_REGISTRY, content);

    // Find all images across all blocks
    const images: Image[] = [];
    for (const block of registry.blocks) {
      if (block.ast) {
        images.push(...findAllImageNodes(block.ast));
      }
    }

    expect(images.length).toBe(2);
    expect(images[0].url).toBe('https://example.com/1.png');
    expect(images[1].url).toBe('https://example.com/2.png');
  });

  it('should handle image mixed with other content', () => {
    const content = `# Heading

![Image](https://example.com/img.png)

Some **bold** text`;
    let registry = processNewContent(INITIAL_REGISTRY, content);

    // Find blocks with images
    const blocksWithImages = registry.blocks.filter((b) => {
      if (b.ast) {
        const img = findImageNode(b.ast);
        return img !== null;
      }
      return false;
    });

    expect(blocksWithImages.length).toBeGreaterThan(0);
  });
});

describe('Custom Image Renderer - Props Extraction', () => {
  it('should extract props that would be passed to custom renderer', () => {
    const ast = parseBlockContent('![Alt text](https://example.com/img.png "Title")');
    const imageNode = findImageNode(ast!);

    // These are the props that would be passed to ImageRendererProps
    const extractedProps = {
      src: imageNode!.url,
      alt: imageNode!.alt || undefined,
      title: imageNode!.title || undefined,
    };

    expect(extractedProps.src).toBe('https://example.com/img.png');
    expect(extractedProps.alt).toBe('Alt text');
    expect(extractedProps.title).toBe('Title');
  });

  it('should handle missing optional props', () => {
    const ast = parseBlockContent('![](https://example.com/img.png)');
    const imageNode = findImageNode(ast!);

    // alt is empty string, title is null in mdast
    const alt = imageNode!.alt;
    const title = imageNode!.title;

    expect(alt).toBe('');
    expect(title).toBeNull();
  });
});

// ============================================================================
// LINK RENDERER TESTS
// ============================================================================

describe('Custom Link Renderer - Link Detection', () => {
  describe('Basic link parsing', () => {
    it('should parse link with text and URL', () => {
      const ast = parseBlockContent('[Click here](https://example.com)');
      expect(ast).toBeDefined();

      const linkNode = findLinkNode(ast!);
      expect(linkNode).not.toBeNull();
      expect(linkNode!.url).toBe('https://example.com');
    });

    it('should parse link with title attribute', () => {
      const ast = parseBlockContent('[Link](https://example.com "Link title")');
      const linkNode = findLinkNode(ast!);

      expect(linkNode!.url).toBe('https://example.com');
      expect(linkNode!.title).toBe('Link title');
    });

    it('should extract link text content', () => {
      const ast = parseBlockContent('[Click me](https://example.com)');
      const linkNode = findLinkNode(ast!);

      const textContent = getTextContent(linkNode!);
      expect(textContent).toBe('Click me');
    });

    it('should handle various URL formats', () => {
      const urls = [
        'https://example.com',
        'http://example.com/path',
        '/relative/path',
        '#anchor',
        'mailto:test@example.com',
      ];

      for (const url of urls) {
        const ast = parseBlockContent(`[link](${url})`);
        const linkNode = findLinkNode(ast!);
        expect(linkNode!.url).toBe(url);
      }
    });

    it('should handle link with nested formatting', () => {
      const ast = parseBlockContent('[**Bold link**](https://example.com)');
      const linkNode = findLinkNode(ast!);

      expect(linkNode).not.toBeNull();
      expect(linkNode!.url).toBe('https://example.com');
      // Link should have children for the bold formatting
      expect(linkNode!.children.length).toBeGreaterThan(0);
    });
  });
});

describe('Custom Link Renderer - Streaming', () => {
  it('should auto-close incomplete link during streaming', () => {
    const incompleteContent = '[Link text](https://example';
    const tagState = updateTagState(INITIAL_INCOMPLETE_STATE, incompleteContent);
    const fixedContent = fixIncompleteMarkdown(incompleteContent, tagState);

    // Should auto-close the link syntax
    expect(fixedContent).toContain('[Link text]');
    expect(fixedContent).toMatch(/\)$/);
  });

  it('should handle partial link text streaming', () => {
    const stages = [
      '[Lin',
      '[Link',
      '[Link text](',
      '[Link text](https://ex',
      '[Link text](https://example.com)',
    ];

    for (const input of stages) {
      const tagState = updateTagState(INITIAL_INCOMPLETE_STATE, input);
      const fixedContent = fixIncompleteMarkdown(input, tagState);
      // Should not throw during parsing
      const ast = parseBlockContent(fixedContent);
      expect(ast).toBeDefined();
    }
  });
});

describe('Custom Link Renderer - Edge Cases', () => {
  it('should handle multiple links in content', () => {
    const content = 'Visit [Google](https://google.com) or [GitHub](https://github.com)';
    const ast = parseBlockContent(content);
    const links = findAllLinkNodes(ast!);

    expect(links.length).toBe(2);
    expect(links[0].url).toBe('https://google.com');
    expect(links[1].url).toBe('https://github.com');
  });

  it('should handle autolinks (GFM)', () => {
    const ast = parseBlockContent('Check out https://example.com for more info');
    const linkNode = findLinkNode(ast!);

    expect(linkNode).not.toBeNull();
    expect(linkNode!.url).toBe('https://example.com');
  });
});

describe('Custom Link Renderer - Props Extraction', () => {
  it('should extract props that would be passed to custom renderer', () => {
    const ast = parseBlockContent('[Click here](https://example.com "Title")');
    const linkNode = findLinkNode(ast!);

    // These are the props that would be passed to LinkRendererProps
    const extractedProps = {
      href: linkNode!.url,
      title: linkNode!.title || undefined,
      // children would be rendered ReactNodes from linkNode.children
    };

    expect(extractedProps.href).toBe('https://example.com');
    expect(extractedProps.title).toBe('Title');
  });
});

// ============================================================================
// BLOCKQUOTE RENDERER TESTS
// ============================================================================

describe('Custom Blockquote Renderer - Blockquote Detection', () => {
  describe('Basic blockquote parsing', () => {
    it('should parse simple blockquote', () => {
      const ast = parseBlockContent('> This is a quote');
      expect(ast).toBeDefined();

      const blockquoteNode = findBlockquoteNode(ast!);
      expect(blockquoteNode).not.toBeNull();
    });

    it('should parse multiline blockquote', () => {
      const ast = parseBlockContent('> Line one\n> Line two\n> Line three');
      const blockquoteNode = findBlockquoteNode(ast!);

      expect(blockquoteNode).not.toBeNull();
      expect(blockquoteNode!.children.length).toBeGreaterThan(0);
    });

    it('should extract blockquote text content', () => {
      const ast = parseBlockContent('> Hello world');
      const blockquoteNode = findBlockquoteNode(ast!);

      const textContent = getTextContent(blockquoteNode!);
      expect(textContent).toContain('Hello world');
    });

    it('should handle blockquote with formatting', () => {
      const ast = parseBlockContent('> This is **bold** and *italic*');
      const blockquoteNode = findBlockquoteNode(ast!);

      expect(blockquoteNode).not.toBeNull();
      // Should have nested formatting nodes
      expect(blockquoteNode!.children.length).toBeGreaterThan(0);
    });

    it('should handle nested blockquotes', () => {
      const ast = parseBlockContent('> Outer quote\n>> Nested quote');
      const blockquoteNode = findBlockquoteNode(ast!);

      expect(blockquoteNode).not.toBeNull();
      // Should have nested blockquote
      const nestedBlockquote = findBlockquoteNode(blockquoteNode!.children[0] as Content);
      // Note: nested blockquotes may be rendered differently by remark
    });
  });
});

describe('Custom Blockquote Renderer - Streaming', () => {
  it('should handle partial blockquote streaming', () => {
    const stages = [
      '>',
      '> Hel',
      '> Hello',
      '> Hello world',
    ];

    for (const input of stages) {
      const tagState = updateTagState(INITIAL_INCOMPLETE_STATE, input);
      const fixedContent = fixIncompleteMarkdown(input, tagState);
      const ast = parseBlockContent(fixedContent);
      expect(ast).toBeDefined();
    }
  });

  it('should track blockquote content evolution', () => {
    const contentHistory: string[] = [];
    const streamChunks = [
      '> He',
      '> Hello',
      '> Hello, World!',
    ];

    for (const chunk of streamChunks) {
      const tagState = updateTagState(INITIAL_INCOMPLETE_STATE, chunk);
      const fixedContent = fixIncompleteMarkdown(chunk, tagState);
      const ast = parseBlockContent(fixedContent);

      const blockquoteNode = findBlockquoteNode(ast!);
      if (blockquoteNode) {
        contentHistory.push(getTextContent(blockquoteNode));
      }
    }

    expect(contentHistory.length).toBeGreaterThan(0);
    expect(contentHistory[contentHistory.length - 1]).toContain('Hello, World!');
  });
});

describe('Custom Blockquote Renderer - Edge Cases', () => {
  it('should handle blockquote mixed with other content', () => {
    const content = `# Heading

> This is a quote

Some regular text`;
    let registry = processNewContent(INITIAL_REGISTRY, content);

    const blockquoteBlocks = registry.blocks.filter((b) => b.type === 'blockquote');
    expect(blockquoteBlocks.length).toBeGreaterThan(0);
  });

  it('should correctly identify blockquote type in registry', () => {
    const content = '> Quote text\n\nFollowing paragraph';
    let registry = processNewContent(INITIAL_REGISTRY, content);

    // Blockquote is finalized as a block when followed by other content
    const blockquoteBlock = registry.blocks.find((b) => b.type === 'blockquote');
    expect(blockquoteBlock).toBeDefined();
    expect(blockquoteBlock!.type).toBe('blockquote');
  });
});

describe('Custom Blockquote Renderer - Props Extraction', () => {
  it('should extract children that would be passed to custom renderer', () => {
    const ast = parseBlockContent('> Quote with **bold**');
    const blockquoteNode = findBlockquoteNode(ast!);

    // Props: children would be the rendered ReactNodes
    expect(blockquoteNode!.children.length).toBeGreaterThan(0);
  });
});

// ============================================================================
// TABLE RENDERER TESTS
// ============================================================================

describe('Custom Table Renderer - Table Detection', () => {
  describe('Basic table parsing', () => {
    it('should parse simple table', () => {
      const ast = parseBlockContent(`| A | B |
| --- | --- |
| 1 | 2 |`);
      expect(ast).toBeDefined();

      const tableNode = findTableNode(ast!);
      expect(tableNode).not.toBeNull();
    });

    it('should extract table headers', () => {
      const ast = parseBlockContent(`| Header 1 | Header 2 |
| --- | --- |
| Cell 1 | Cell 2 |`);
      const tableNode = findTableNode(ast!);

      expect(tableNode!.children.length).toBeGreaterThan(0);
      const headerRow = tableNode!.children[0];
      expect(headerRow.children.length).toBe(2);
    });

    it('should extract table body rows', () => {
      const ast = parseBlockContent(`| A | B |
| --- | --- |
| 1 | 2 |
| 3 | 4 |`);
      const tableNode = findTableNode(ast!);

      // First row is header, rest are body
      expect(tableNode!.children.length).toBe(3);
    });

    it('should parse table with alignment', () => {
      const ast = parseBlockContent(`| Left | Center | Right |
| :--- | :---: | ---: |
| L | C | R |`);
      const tableNode = findTableNode(ast!);

      expect(tableNode!.align).toEqual(['left', 'center', 'right']);
    });

    it('should handle table without alignment specified', () => {
      const ast = parseBlockContent(`| A | B |
| --- | --- |
| 1 | 2 |`);
      const tableNode = findTableNode(ast!);

      expect(tableNode!.align).toEqual([null, null]);
    });
  });
});

describe('Custom Table Renderer - Streaming', () => {
  it('should handle partial table streaming', () => {
    const stages = [
      '| A |',
      '| A | B |',
      '| A | B |\n| --- |',
      '| A | B |\n| --- | --- |',
      '| A | B |\n| --- | --- |\n| 1 |',
      '| A | B |\n| --- | --- |\n| 1 | 2 |',
    ];

    for (const input of stages) {
      const tagState = updateTagState(INITIAL_INCOMPLETE_STATE, input);
      const fixedContent = fixIncompleteMarkdown(input, tagState);
      // Should not throw
      const ast = parseBlockContent(fixedContent);
      expect(ast).toBeDefined();
    }
  });
});

describe('Custom Table Renderer - Edge Cases', () => {
  it('should handle table with empty cells', () => {
    const ast = parseBlockContent(`| A | B |
| --- | --- |
| | 2 |`);
    const tableNode = findTableNode(ast!);

    expect(tableNode).not.toBeNull();
  });

  it('should handle table with formatting in cells', () => {
    const ast = parseBlockContent(`| **Bold** | *Italic* |
| --- | --- |
| \`code\` | [link](url) |`);
    const tableNode = findTableNode(ast!);

    expect(tableNode).not.toBeNull();
  });

  it('should correctly identify table in AST', () => {
    const content = `| A | B |
| --- | --- |
| 1 | 2 |

Following paragraph`;
    let registry = processNewContent(INITIAL_REGISTRY, content);

    // Table is parsed correctly in AST, even if block.type is 'paragraph'
    // (The splitter doesn't distinguish table blocks, but AST parsing does)
    const blockWithTable = registry.blocks.find((b) => {
      if (b.ast) {
        return findTableNode(b.ast) !== null;
      }
      return false;
    });
    expect(blockWithTable).toBeDefined();
    expect(findTableNode(blockWithTable!.ast!)).not.toBeNull();
  });
});

describe('Custom Table Renderer - Props Extraction', () => {
  it('should extract props that would be passed to custom renderer', () => {
    const ast = parseBlockContent(`| Header 1 | Header 2 |
| :--- | ---: |
| Cell 1 | Cell 2 |
| Cell 3 | Cell 4 |`);
    const tableNode = findTableNode(ast!);

    // Props extraction for TableRendererProps
    const headerRow = tableNode!.children[0];
    const bodyRows = tableNode!.children.slice(1);
    const alignments = tableNode!.align;

    // Headers
    expect(headerRow.children.length).toBe(2);

    // Body rows
    expect(bodyRows.length).toBe(2);

    // Alignments
    expect(alignments).toEqual(['left', 'right']);
  });

  it('should handle varying column counts correctly', () => {
    const ast = parseBlockContent(`| A | B | C | D |
| --- | --- | --- | --- |
| 1 | 2 | 3 | 4 |`);
    const tableNode = findTableNode(ast!);

    expect(tableNode!.children[0].children.length).toBe(4);
  });
});

// ============================================================================
// HEADING RENDERER TESTS
// ============================================================================

describe('Custom Heading Renderer - Heading Detection', () => {
  describe('Basic heading parsing', () => {
    it('should parse all heading levels', () => {
      const headings = [
        { input: '# H1', level: 1 },
        { input: '## H2', level: 2 },
        { input: '### H3', level: 3 },
        { input: '#### H4', level: 4 },
        { input: '##### H5', level: 5 },
        { input: '###### H6', level: 6 },
      ];

      for (const { input, level } of headings) {
        const ast = parseBlockContent(input);
        const headingNode = findHeadingNode(ast!);
        expect(headingNode).not.toBeNull();
        expect(headingNode!.depth).toBe(level);
      }
    });

    it('should extract heading text content', () => {
      const ast = parseBlockContent('# Hello World');
      const headingNode = findHeadingNode(ast!);

      const textContent = getTextContent(headingNode!);
      expect(textContent).toBe('Hello World');
    });

    it('should handle heading with formatting', () => {
      const ast = parseBlockContent('## This is **bold** heading');
      const headingNode = findHeadingNode(ast!);

      expect(headingNode).not.toBeNull();
      expect(headingNode!.children.length).toBeGreaterThan(0);
    });

    it('should handle heading with inline code', () => {
      const ast = parseBlockContent('### Code: `const x = 1`');
      const headingNode = findHeadingNode(ast!);

      expect(headingNode).not.toBeNull();
    });
  });
});

describe('Custom Heading Renderer - Streaming', () => {
  it('should handle partial heading streaming', () => {
    const stages = [
      '#',
      '# H',
      '# He',
      '# Hel',
      '# Hello',
    ];

    for (const input of stages) {
      const tagState = updateTagState(INITIAL_INCOMPLETE_STATE, input);
      const fixedContent = fixIncompleteMarkdown(input, tagState);
      const ast = parseBlockContent(fixedContent);
      expect(ast).toBeDefined();
    }
  });

  it('should track heading content evolution', () => {
    const contentHistory: string[] = [];
    const streamChunks = [
      '# He',
      '# Hello',
      '# Hello World',
    ];

    for (const chunk of streamChunks) {
      const tagState = updateTagState(INITIAL_INCOMPLETE_STATE, chunk);
      const fixedContent = fixIncompleteMarkdown(chunk, tagState);
      const ast = parseBlockContent(fixedContent);

      const headingNode = findHeadingNode(ast!);
      if (headingNode) {
        contentHistory.push(getTextContent(headingNode));
      }
    }

    expect(contentHistory.length).toBe(3);
    expect(contentHistory[2]).toBe('Hello World');
  });

  it('should maintain heading level throughout streaming', () => {
    const levelHistory: number[] = [];
    const streamChunks = [
      '## He',
      '## Hello',
      '## Hello World',
    ];

    for (const chunk of streamChunks) {
      const tagState = updateTagState(INITIAL_INCOMPLETE_STATE, chunk);
      const fixedContent = fixIncompleteMarkdown(chunk, tagState);
      const ast = parseBlockContent(fixedContent);

      const headingNode = findHeadingNode(ast!);
      if (headingNode) {
        levelHistory.push(headingNode.depth);
      }
    }

    // Level should remain consistent
    expect(levelHistory.every((l) => l === 2)).toBe(true);
  });
});

describe('Custom Heading Renderer - Edge Cases', () => {
  it('should handle multiple headings in content', () => {
    // Add trailing content to finalize all blocks
    const content = `# First

Some text

## Second

More text

### Third

End text`;
    // Use processNewContent to get multiple blocks
    let registry = processNewContent(INITIAL_REGISTRY, content);

    // Find all headings across all blocks
    const headings: Heading[] = [];
    for (const block of registry.blocks) {
      if (block.ast) {
        headings.push(...findAllHeadingNodes(block.ast));
      }
    }

    expect(headings.length).toBe(3);
    expect(headings[0].depth).toBe(1);
    expect(headings[1].depth).toBe(2);
    expect(headings[2].depth).toBe(3);
  });

  it('should correctly identify heading type in registry', () => {
    const content = '## Introduction\n\nFollowing paragraph';
    let registry = processNewContent(INITIAL_REGISTRY, content);

    // Heading is finalized as a block when followed by other content
    const headingBlock = registry.blocks.find((b) => b.type === 'heading');
    expect(headingBlock).toBeDefined();
    expect(headingBlock!.type).toBe('heading');
  });

  it('should not confuse hash symbols in other contexts', () => {
    // Hash in code should not be detected as heading
    const codeContent = '```\n# This is a comment\n```';
    let registry = processNewContent(INITIAL_REGISTRY, codeContent);

    const codeBlock = registry.blocks.find((b) => b.type === 'codeBlock');
    expect(codeBlock).toBeDefined();
  });
});

describe('Custom Heading Renderer - Props Extraction', () => {
  it('should extract props that would be passed to custom renderer', () => {
    const ast = parseBlockContent('### Heading Text');
    const headingNode = findHeadingNode(ast!);

    // Props for HeadingRendererProps
    const extractedProps = {
      level: headingNode!.depth as 1 | 2 | 3 | 4 | 5 | 6,
      // children would be the rendered ReactNodes from headingNode.children
    };

    expect(extractedProps.level).toBe(3);
    expect(headingNode!.children.length).toBeGreaterThan(0);
  });

  it('should correctly type heading levels', () => {
    for (let level = 1; level <= 6; level++) {
      const hashes = '#'.repeat(level);
      const ast = parseBlockContent(`${hashes} Heading`);
      const headingNode = findHeadingNode(ast!);

      expect(headingNode!.depth).toBe(level);
      // Level should be in valid range
      expect(headingNode!.depth).toBeGreaterThanOrEqual(1);
      expect(headingNode!.depth).toBeLessThanOrEqual(6);
    }
  });
});
