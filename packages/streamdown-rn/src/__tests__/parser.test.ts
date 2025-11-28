/**
 * Parser Tests
 * 
 * Tests for remark/GFM parsing functionality.
 * Includes comprehensive tests for setext heading prevention.
 */

import { describe, it, expect } from 'bun:test';
import { parseMarkdown, parseBlockContent, isValidMarkdown, escapeSetextUnderlines } from '../core/parser';
import type { Heading, List, ListItem, Paragraph, ThematicBreak } from 'mdast';

// ============================================================================
// Helper: Check if AST contains any heading nodes (recursive)
// ============================================================================

function containsHeading(node: unknown): boolean {
  if (!node || typeof node !== 'object') return false;
  
  if ('type' in node && node.type === 'heading') return true;
  
  if ('children' in node && Array.isArray((node as { children: unknown[] }).children)) {
    return (node as { children: unknown[] }).children.some(containsHeading);
  }
  
  return false;
}

function getHeadingCount(node: unknown): number {
  if (!node || typeof node !== 'object') return 0;
  
  let count = 0;
  if ('type' in node && node.type === 'heading') count++;
  
  if ('children' in node && Array.isArray((node as { children: unknown[] }).children)) {
    count += (node as { children: unknown[] }).children.reduce(
      (sum, child) => sum + getHeadingCount(child), 0
    );
  }
  
  return count;
}

// ============================================================================
// Basic Parser Tests
// ============================================================================

describe('Remark Parser', () => {
  describe('parseMarkdown', () => {
    it('should parse simple markdown', () => {
      const ast = parseMarkdown('# Hello');
      expect(ast.type).toBe('root');
      expect(ast.children.length).toBeGreaterThan(0);
    });
    
    it('should parse GFM features', () => {
      const ast = parseMarkdown('| col1 | col2 |\n|------|------|\n| a | b |');
      const table = ast.children.find(node => node.type === 'table');
      expect(table).toBeDefined();
    });
    
    it('should handle strikethrough (GFM)', () => {
      const ast = parseMarkdown('~~deleted~~');
      const paragraph = ast.children[0];
      expect(paragraph.type).toBe('paragraph');
    });
  });
  
  describe('parseBlockContent', () => {
    it('should parse heading block', () => {
      const node = parseBlockContent('# Hello');
      expect(node?.type).toBe('heading');
    });
    
    it('should parse paragraph block', () => {
      const node = parseBlockContent('Hello world');
      expect(node?.type).toBe('paragraph');
    });
    
    it('should return null for empty content', () => {
      const node = parseBlockContent('');
      expect(node).toBeNull();
    });
  });
  
  describe('isValidMarkdown', () => {
    it('should validate correct markdown', () => {
      expect(isValidMarkdown('# Hello')).toBe(true);
      expect(isValidMarkdown('**bold**')).toBe(true);
      expect(isValidMarkdown('- list item')).toBe(true);
    });
  });
  
  describe('Nested formatting', () => {
    it('should handle bold within italic', () => {
      const ast = parseMarkdown('*italic **bold** inside*');
      expect(ast.children[0].type).toBe('paragraph');
    });
    
    it('should handle complex nesting', () => {
      const ast = parseMarkdown('**bold *italic* back to bold**');
      expect(ast.children[0].type).toBe('paragraph');
    });
  });
});

// ============================================================================
// Setext Heading Prevention Tests
// ============================================================================

describe('Setext Heading Prevention', () => {
  describe('escapeSetextUnderlines', () => {
    it('should escape indented double dashes (potential setext)', () => {
      const input = '  --';
      const escaped = escapeSetextUnderlines(input);
      expect(escaped).toContain('\u200B'); // Zero-width space
      expect(escaped).not.toBe(input);
    });
    
    it('should escape indented equals', () => {
      const input = '  ===';
      const escaped = escapeSetextUnderlines(input);
      expect(escaped).toContain('\u200B');
    });
    
    it('should preserve unindented horizontal rules (---)', () => {
      const input = '---';
      const escaped = escapeSetextUnderlines(input);
      expect(escaped).toBe(input); // Should NOT be escaped
    });
    
    it('should preserve longer horizontal rules (-----)', () => {
      const input = '-----';
      const escaped = escapeSetextUnderlines(input);
      expect(escaped).toBe(input);
    });
    
    it('should escape unindented equals (not a valid HR)', () => {
      const input = '===';
      const escaped = escapeSetextUnderlines(input);
      expect(escaped).toContain('\u200B');
    });
    
    it('should escape double dash at start of line (potential setext)', () => {
      const input = '--';
      const escaped = escapeSetextUnderlines(input);
      expect(escaped).toContain('\u200B');
    });
    
    // List marker preservation tests
    it('should preserve single dash as list marker', () => {
      const input = '-';
      const escaped = escapeSetextUnderlines(input);
      expect(escaped).toBe(input); // Should NOT be escaped
    });
    
    it('should preserve single asterisk as list marker', () => {
      const input = '*';
      const escaped = escapeSetextUnderlines(input);
      expect(escaped).toBe(input);
    });
    
    it('should preserve single plus as list marker', () => {
      const input = '+';
      const escaped = escapeSetextUnderlines(input);
      expect(escaped).toBe(input);
    });
    
    it('should escape indented single dash (could be setext underline)', () => {
      // Indented single dash could be a setext underline, so we escape it
      // Nested list items need "  - " (with space after) to be recognized
      const input = '  -';
      const escaped = escapeSetextUnderlines(input);
      expect(escaped).toContain('\u200B');
    });
  });
  
  describe('ATX headings should still work', () => {
    it('should parse # as heading level 1', () => {
      const ast = parseMarkdown('# Heading 1');
      expect(ast.children[0].type).toBe('heading');
      expect((ast.children[0] as Heading).depth).toBe(1);
    });
    
    it('should parse ## as heading level 2', () => {
      const ast = parseMarkdown('## Heading 2');
      expect(ast.children[0].type).toBe('heading');
      expect((ast.children[0] as Heading).depth).toBe(2);
    });
    
    it('should parse ### as heading level 3', () => {
      const ast = parseMarkdown('### Heading 3');
      expect(ast.children[0].type).toBe('heading');
      expect((ast.children[0] as Heading).depth).toBe(3);
    });
    
    it('should parse all heading levels 1-6', () => {
      for (let level = 1; level <= 6; level++) {
        const hashes = '#'.repeat(level);
        const ast = parseMarkdown(`${hashes} Heading ${level}`);
        expect(ast.children[0].type).toBe('heading');
        expect((ast.children[0] as Heading).depth).toBe(level);
      }
    });
  });
  
  describe('Setext headings should NOT be created', () => {
    it('should NOT create heading from Text\\n---', () => {
      const ast = parseMarkdown('Some text\n---');
      // Should NOT contain a heading
      expect(containsHeading(ast)).toBe(false);
    });
    
    it('should NOT create heading from Text\\n===', () => {
      const ast = parseMarkdown('Some text\n===');
      expect(containsHeading(ast)).toBe(false);
    });
    
    it('should NOT create heading from Text\\n------', () => {
      const ast = parseMarkdown('Some text\n------');
      expect(containsHeading(ast)).toBe(false);
    });
    
    it('should NOT create heading from Text\\n======', () => {
      const ast = parseMarkdown('Some text\n======');
      expect(containsHeading(ast)).toBe(false);
    });
  });
  
  describe('List items should NOT become headings', () => {
    it('should NOT create heading in list with trailing dash', () => {
      // This is the streaming edge case: typing a nested list item
      const content = '- First item\n- Second item\n  -';
      const ast = parseMarkdown(content);
      
      // Should be a list, no headings
      expect(ast.children[0].type).toBe('list');
      expect(containsHeading(ast)).toBe(false);
    });
    
    it('should NOT create heading in list with double trailing dash', () => {
      const content = '- First item\n- Second item\n  --';
      const ast = parseMarkdown(content);
      
      expect(ast.children[0].type).toBe('list');
      expect(containsHeading(ast)).toBe(false);
    });
    
    it('should NOT create heading in list with trailing equals', () => {
      const content = '- First item\n- Second item\n  =';
      const ast = parseMarkdown(content);
      
      expect(containsHeading(ast)).toBe(false);
    });
    
    it('should handle nested list markers correctly', () => {
      const content = '- First item\n- Second item\n  - Nested item';
      const ast = parseMarkdown(content);
      
      expect(ast.children[0].type).toBe('list');
      expect(containsHeading(ast)).toBe(false);
      
      // Should have nested list structure
      const list = ast.children[0] as List;
      expect(list.children.length).toBeGreaterThanOrEqual(2);
    });
    
    it('should NOT create heading with partial nested list (streaming)', () => {
      // Simulate streaming character by character
      const stages = [
        '- First item\n-',
        '- First item\n- ',
        '- First item\n- S',
        '- First item\n- Second item',
        '- First item\n- Second item\n',
        '- First item\n- Second item\n ',
        '- First item\n- Second item\n  ',
        '- First item\n- Second item\n  -',
      ];
      
      for (const content of stages) {
        const ast = parseMarkdown(content);
        expect(containsHeading(ast)).toBe(false);
      }
    });
    
    it('should parse incomplete list item as list (not paragraph)', () => {
      // When streaming "- First item\n-", the second dash should be a list item
      const content = '- First item\n-';
      const ast = parseMarkdown(content);
      
      expect(ast.children[0].type).toBe('list');
      const list = ast.children[0] as List;
      expect(list.children.length).toBe(2); // Two list items
    });
    
    it('should parse all list marker types correctly when streaming', () => {
      // Test each list marker type
      const markers = ['-', '*', '+'];
      
      for (const marker of markers) {
        const content = `${marker} First item\n${marker}`;
        const ast = parseMarkdown(content);
        
        expect(ast.children[0].type).toBe('list');
        const list = ast.children[0] as List;
        expect(list.children.length).toBe(2);
      }
    });
  });
  
  describe('Horizontal rules should still work', () => {
    it('should parse --- as thematic break', () => {
      const ast = parseMarkdown('---');
      expect(ast.children[0].type).toBe('thematicBreak');
    });
    
    it('should parse ----- as thematic break', () => {
      const ast = parseMarkdown('-----');
      expect(ast.children[0].type).toBe('thematicBreak');
    });
    
    it('should parse --- between content as thematic break', () => {
      const ast = parseMarkdown('Above\n\n---\n\nBelow');
      const hr = ast.children.find(node => node.type === 'thematicBreak');
      expect(hr).toBeDefined();
    });
  });
  
  describe('Mixed content should work correctly', () => {
    it('should handle ATX heading followed by list', () => {
      const content = '# Title\n\n- Item 1\n- Item 2';
      const ast = parseMarkdown(content);
      
      expect(getHeadingCount(ast)).toBe(1); // Only the ATX heading
      expect(ast.children[0].type).toBe('heading');
      expect((ast.children[0] as Heading).depth).toBe(1);
    });
    
    it('should handle list followed by ATX heading', () => {
      const content = '- Item 1\n- Item 2\n\n## Section';
      const ast = parseMarkdown(content);
      
      expect(getHeadingCount(ast)).toBe(1);
      expect(ast.children[0].type).toBe('list');
      expect(ast.children[1].type).toBe('heading');
    });
    
    it('should handle complex document without setext headings', () => {
      const content = `# Main Title

Some intro text.

## Section 1

- List item 1
- List item 2
  - Nested item

### Subsection

More content here.

---

## Section 2

Final paragraph.`;
      
      const ast = parseMarkdown(content);
      
      // Count headings - should only be ATX style
      const headingCount = getHeadingCount(ast);
      expect(headingCount).toBe(4); // # Main, ## Section 1, ### Subsection, ## Section 2
      
      // Verify all headings are from ATX syntax
      const headings = ast.children.filter(n => n.type === 'heading') as Heading[];
      expect(headings.length).toBe(4);
      expect(headings[0].depth).toBe(1);
      expect(headings[1].depth).toBe(2);
      expect(headings[2].depth).toBe(3);
      expect(headings[3].depth).toBe(2);
    });
  });
});

