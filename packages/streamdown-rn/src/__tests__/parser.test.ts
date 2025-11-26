/**
 * Parser Tests
 * 
 * Tests for remark/GFM parsing functionality.
 */

import { describe, it, expect } from 'bun:test';
import { parseMarkdown, parseBlockContent, isValidMarkdown } from '../core/parser';

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
      // Should have 'delete' node inside
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
      // Remark should properly nest these
    });
    
    it('should handle complex nesting', () => {
      const ast = parseMarkdown('**bold *italic* back to bold**');
      expect(ast.children[0].type).toBe('paragraph');
    });
  });
});

