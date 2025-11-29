/**
 * Component Extraction Tests
 * 
 * Tests for [{c:...}] component syntax parsing (pure logic only, no React).
 */

import { describe, it, expect } from 'bun:test';
import { extractComponentData } from '../core/componentParser';

describe('Component Extraction', () => {
  describe('Complete component syntax', () => {
    it('should extract component name and props', () => {
      const result = extractComponentData('[{c:"Card",p:{"title":"Hello"}}]');
      expect(result.name).toBe('Card');
      expect(result.props).toEqual({ title: 'Hello' });
    });
    
    it('should handle nested JSON props', () => {
      const result = extractComponentData('[{c:"Widget",p:{"data":{"x":1,"y":2}}}]');
      expect(result.name).toBe('Widget');
      expect(result.props).toEqual({ data: { x: 1, y: 2 } });
    });
  });
  
  describe('Incomplete component syntax (streaming)', () => {
    it('should extract name when props are incomplete', () => {
      const result = extractComponentData('[{c:"Card",p:{"title":"Hel');
      expect(result.name).toBe('Card');
    });
    
    it('should handle incomplete JSON gracefully', () => {
      const result = extractComponentData('[{c:"Card",p:{');
      expect(result.name).toBe('Card');
      expect(result.props).toEqual({});
    });
    
    it('should handle trailing comma after complete props', () => {
      // This happens when streaming: props are complete but we're starting next key
      const result = extractComponentData('[{c:"Canvas",p:{"style":{"gridTemplateColumns":"1fr 1fr","gap":12}},');
      expect(result.name).toBe('Canvas');
      expect(result.props).toEqual({ style: { gridTemplateColumns: '1fr 1fr', gap: 12 } });
    });
    
    it('should preserve style.gridTemplateColumns through various streaming states', () => {
      // State 1: Mid-value
      const r1 = extractComponentData('[{c:"Canvas",p:{"style":{"gridTemplateColumns":"1fr 1fr"');
      expect(r1.name).toBe('Canvas');
      expect((r1.props.style as any)?.gridTemplateColumns).toBe('1fr 1fr');
      
      // State 2: After comma inside style
      const r2 = extractComponentData('[{c:"Canvas",p:{"style":{"gridTemplateColumns":"1fr 1fr",');
      expect(r2.name).toBe('Canvas');
      expect((r2.props.style as any)?.gridTemplateColumns).toBe('1fr 1fr');
      
      // State 3: Complete style, trailing comma
      const r3 = extractComponentData('[{c:"Canvas",p:{"style":{"gridTemplateColumns":"1fr 1fr","gap":12}},');
      expect(r3.name).toBe('Canvas');
      expect((r3.props.style as any)?.gridTemplateColumns).toBe('1fr 1fr');
      expect((r3.props.style as any)?.gap).toBe(12);
      
      // State 4: Starting children
      const r4 = extractComponentData('[{c:"Canvas",p:{"style":{"gridTemplateColumns":"1fr 1fr","gap":12}},children:[');
      expect(r4.name).toBe('Canvas');
      expect((r4.props.style as any)?.gridTemplateColumns).toBe('1fr 1fr');
    });
    
    it('should preserve gridTemplateColumns when next key is streaming', () => {
      // Various states of the next key being typed
      const states = [
        '[{c:"Canvas",p:{"style":{"gridTemplateColumns":"1fr 1fr","',      // ,"
        '[{c:"Canvas",p:{"style":{"gridTemplateColumns":"1fr 1fr","g',     // ,"g
        '[{c:"Canvas",p:{"style":{"gridTemplateColumns":"1fr 1fr","gap"',  // ,"gap"
        '[{c:"Canvas",p:{"style":{"gridTemplateColumns":"1fr 1fr","gap":', // ,"gap":
        '[{c:"Canvas",p:{"style":{"gridTemplateColumns":"1fr 1fr","gap":1', // ,"gap":1
      ];
      
      for (const state of states) {
        const result = extractComponentData(state);
        expect(result.name).toBe('Canvas');
        expect((result.props.style as any)?.gridTemplateColumns).toBe('1fr 1fr');
      }
    });
  });
  
  describe('Nested children syntax', () => {
    it('should extract children array', () => {
      const result = extractComponentData('[{c:"Stack",p:{"gap":8},children:[{c:"Card",p:{"title":"A"}},{c:"Card",p:{"title":"B"}}]}]');
      expect(result.name).toBe('Stack');
      expect(result.props).toEqual({ gap: 8 });
      expect(result.children).toHaveLength(2);
      expect(result.children?.[0].name).toBe('Card');
      expect(result.children?.[0].props).toEqual({ title: 'A' });
      expect(result.children?.[1].name).toBe('Card');
      expect(result.children?.[1].props).toEqual({ title: 'B' });
    });
    
    it('should handle deeply nested children', () => {
      const result = extractComponentData('[{c:"Card",p:{},children:[{c:"Stack",p:{},children:[{c:"Text",p:{"content":"Hello"}}]}]}]');
      expect(result.name).toBe('Card');
      expect(result.children).toHaveLength(1);
      expect(result.children?.[0].name).toBe('Stack');
      expect(result.children?.[0].children).toHaveLength(1);
      expect(result.children?.[0].children?.[0].name).toBe('Text');
      expect(result.children?.[0].children?.[0].props).toEqual({ content: 'Hello' });
    });
    
    it('should handle empty children array', () => {
      const result = extractComponentData('[{c:"Card",p:{"title":"Empty"},children:[]}]');
      expect(result.name).toBe('Card');
      expect(result.props).toEqual({ title: 'Empty' });
      expect(result.children).toEqual([]);
    });
    
    it('should handle component without children', () => {
      const result = extractComponentData('[{c:"Button",p:{"label":"Click"}}]');
      expect(result.name).toBe('Button');
      expect(result.children).toBeUndefined();
    });
  });
  
  describe('Progressive prop streaming (character-by-character)', () => {
    it('should show partial string values as they stream', () => {
      // Title streaming character by character
      expect(extractComponentData('[{c:"StatusCard",p:{"title":"O').props).toEqual({ title: 'O' });
      expect(extractComponentData('[{c:"StatusCard",p:{"title":"On').props).toEqual({ title: 'On' });
      expect(extractComponentData('[{c:"StatusCard",p:{"title":"On-').props).toEqual({ title: 'On-' });
      expect(extractComponentData('[{c:"StatusCard",p:{"title":"On-c').props).toEqual({ title: 'On-c' });
      expect(extractComponentData('[{c:"StatusCard",p:{"title":"On-call').props).toEqual({ title: 'On-call' });
    });

    it('should preserve completed props while streaming new ones', () => {
      // Title complete, description starting
      const r1 = extractComponentData('[{c:"StatusCard",p:{"title":"On-call","description":"P');
      expect(r1.props).toEqual({ title: 'On-call', description: 'P' });
      
      // Title complete, description streaming
      const r2 = extractComponentData('[{c:"StatusCard",p:{"title":"On-call","description":"Pager rot');
      expect(r2.props).toEqual({ title: 'On-call', description: 'Pager rot' });
    });

    it('should handle incomplete keys (no value yet) by removing them', () => {
      // Complete title, but next key has no value yet
      const r1 = extractComponentData('[{c:"StatusCard",p:{"title":"On-call","d');
      expect(r1.props).toEqual({ title: 'On-call' }); // incomplete key removed
      
      const r2 = extractComponentData('[{c:"StatusCard",p:{"title":"On-call","description":');
      expect(r2.props).toEqual({ title: 'On-call' }); // key with no value removed
    });

    it('should handle number values correctly', () => {
      // Numbers are already valid JSON as-is
      const r1 = extractComponentData('[{c:"StatusCard",p:{"priority":1');
      expect(r1.props).toEqual({ priority: 1 });
      
      const r2 = extractComponentData('[{c:"StatusCard",p:{"title":"On-call","priority":1');
      expect(r2.props).toEqual({ title: 'On-call', priority: 1 });
    });

    it('should handle nested objects with partial strings', () => {
      const r = extractComponentData('[{c:"Canvas",p:{"style":{"gridTemplateColumns":"1fr 1');
      expect((r.props.style as any)?.gridTemplateColumns).toBe('1fr 1');
    });

    it('should stream the full StatusCard example progressively', () => {
      // Simulate the full example streaming
      const base = '[{c:"StatusCard",p:{';
      
      // Just opened props
      expect(extractComponentData(base).props).toEqual({});
      
      // Title streaming
      expect(extractComponentData(base + '"title":"O').props).toEqual({ title: 'O' });
      expect(extractComponentData(base + '"title":"On-call').props).toEqual({ title: 'On-call' });
      
      // Title complete, description streaming
      expect(extractComponentData(base + '"title":"On-call","description":"P').props).toEqual({ 
        title: 'On-call', 
        description: 'P' 
      });
      expect(extractComponentData(base + '"title":"On-call","description":"Pager rotation').props).toEqual({ 
        title: 'On-call', 
        description: 'Pager rotation' 
      });
      
      // All strings complete, numbers streaming
      expect(extractComponentData(base + '"title":"On-call","description":"Pager rotation for week 42","priority":1').props).toEqual({ 
        title: 'On-call', 
        description: 'Pager rotation for week 42',
        priority: 1
      });
      
      // Complete
      expect(extractComponentData(base + '"title":"On-call","description":"Pager rotation for week 42","priority":1,"tickets":7}}]').props).toEqual({ 
        title: 'On-call', 
        description: 'Pager rotation for week 42',
        priority: 1,
        tickets: 7
      });
    });
  });

  describe('Streaming children (progressive extraction)', () => {
    it('should extract child name as soon as it appears', () => {
      const result = extractComponentData('[{c:"Canvas",p:{"style":{}}},children:[\n  {c:"StatusCard",');
      expect(result.name).toBe('Canvas');
      expect(result.children).toHaveLength(1);
      expect(result.children?.[0].name).toBe('StatusCard');
      expect(result.children?.[0].props).toEqual({});
    });
    
    it('should extract child props as they stream', () => {
      // With progressive prop rendering, partial strings are now visible!
      const r1 = extractComponentData('[{c:"Canvas",p:{}},children:[{c:"Card",p:{"title":"He');
      expect(r1.children?.[0].name).toBe('Card');
      expect(r1.children?.[0].props).toEqual({ title: 'He' }); // partial title visible!
      
      const r2 = extractComponentData('[{c:"Canvas",p:{}},children:[{c:"Card",p:{"title":"Hello"}');
      expect(r2.children?.[0].props).toEqual({ title: 'Hello' });
    });
    
    it('should extract child layout style', () => {
      const result = extractComponentData('[{c:"Canvas",p:{}},children:[{c:"Card",p:{"title":"X"},style:{"gridColumn":"span 2"}},');
      expect(result.children?.[0].name).toBe('Card');
      expect(result.children?.[0].props).toEqual({ title: 'X' });
      expect(result.children?.[0].style).toEqual({ gridColumn: 'span 2' });
    });
    
    it('should extract multiple children progressively', () => {
      const r1 = extractComponentData('[{c:"Canvas",p:{}},children:[{c:"Card",p:{}},');
      expect(r1.children).toHaveLength(1);
      
      const r2 = extractComponentData('[{c:"Canvas",p:{}},children:[{c:"Card",p:{}},{c:"Button",');
      expect(r2.children).toHaveLength(2);
      expect(r2.children?.[0].name).toBe('Card');
      expect(r2.children?.[1].name).toBe('Button');
      
      const r3 = extractComponentData('[{c:"Canvas",p:{}},children:[{c:"Card",p:{}},{c:"Button",p:{}},{c:"Text",');
      expect(r3.children).toHaveLength(3);
    });
  });
});
