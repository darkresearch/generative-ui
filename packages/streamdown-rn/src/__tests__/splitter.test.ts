/**
 * Block Splitter Tests
 * 
 * Tests for incremental block boundary detection and finalization.
 */

import { describe, it, expect } from 'bun:test';
import { processNewContent, resetRegistry } from '../core/splitter';
import { INITIAL_REGISTRY } from '../core/types';

describe('Block Splitter', () => {
  describe('Heading detection', () => {
    it('should detect H1 heading', () => {
      const registry = processNewContent(INITIAL_REGISTRY, '# Hello\n\n');
      expect(registry.blocks.length).toBe(1);
      expect(registry.blocks[0].type).toBe('heading');
      expect(registry.blocks[0].meta).toEqual({ type: 'heading', level: 1 });
    });
    
    it('should detect H2-H6 headings', () => {
      const registry = processNewContent(INITIAL_REGISTRY, '## H2\n\n### H3\n\n');
      expect(registry.blocks.length).toBe(2);
      expect(registry.blocks[0].meta).toEqual({ type: 'heading', level: 2 });
      expect(registry.blocks[1].meta).toEqual({ type: 'heading', level: 3 });
    });
  });
  
  describe('Code block detection', () => {
    it('should detect code block with language', () => {
      const input = '```typescript\nconst x = 1;\n```\n\n'; // Need double newline to finalize
      const registry = processNewContent(INITIAL_REGISTRY, input);
      expect(registry.blocks.length).toBeGreaterThan(0);
      expect(registry.blocks[0]?.type).toBe('codeBlock');
      expect(registry.blocks[0]?.meta).toMatchObject({ type: 'codeBlock', language: 'typescript' });
    });
    
    it('should handle streaming code block', () => {
      let registry = INITIAL_REGISTRY;
      
      // Opening fence
      registry = processNewContent(registry, '```js\n');
      expect(registry.activeBlock?.type).toBe('codeBlock');
      expect(registry.blocks.length).toBe(0);
      
      // Add content
      registry = processNewContent(registry, '```js\nconst x = 1;\n');
      expect(registry.activeBlock?.type).toBe('codeBlock');
      
      // Close fence
      registry = processNewContent(registry, '```js\nconst x = 1;\n```');
      expect(registry.blocks.length).toBe(1);
      expect(registry.activeBlock).toBeNull();
    });
  });
  
  describe('Component detection', () => {
    it('should detect component with new [{...}] syntax', () => {
      const input = '[{c:"Card",p:{"title":"Hello"}}]\n\n';
      const registry = processNewContent(INITIAL_REGISTRY, input);
      expect(registry.blocks.length).toBe(1);
      expect(registry.blocks[0].type).toBe('component');
      expect(registry.blocks[0].meta).toMatchObject({
        type: 'component',
        name: 'Card',
        props: { title: 'Hello' },
      });
    });
  });
  
  describe('Paragraph detection', () => {
    it('should detect simple paragraph', () => {
      const registry = processNewContent(INITIAL_REGISTRY, 'Hello world\n\n');
      expect(registry.blocks.length).toBe(1);
      expect(registry.blocks[0].type).toBe('paragraph');
    });
    
    it('should split multiple paragraphs', () => {
      const input = 'First paragraph\n\nSecond paragraph\n\n';
      const registry = processNewContent(INITIAL_REGISTRY, input);
      expect(registry.blocks.length).toBe(2);
      expect(registry.blocks[0].type).toBe('paragraph');
      expect(registry.blocks[1].type).toBe('paragraph');
    });
  });
  
  describe('AST generation', () => {
    it('should generate AST for stable blocks', () => {
      const registry = processNewContent(INITIAL_REGISTRY, '# Hello\n\n');
      expect(registry.blocks[0].ast).toBeDefined();
      expect(registry.blocks[0].ast?.type).toBe('heading');
    });
    
    it('should not generate AST for component blocks', () => {
      const input = '[{c:"Card",p:{}}]\n\n';
      const registry = processNewContent(INITIAL_REGISTRY, input);
      expect(registry.blocks[0].ast).toBeUndefined();
    });
  });
});

