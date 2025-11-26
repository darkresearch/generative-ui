/**
 * Component Extraction Tests
 * 
 * Tests for [{c:...}] component syntax parsing (pure logic only, no React).
 */

import { describe, it, expect } from 'bun:test';

// Test the extraction logic directly
function extractComponentDataTest(content: string): { name: string; props: Record<string, unknown> } {
  const nameMatch = content.match(/\[\{c:\s*"([^"]+)"/);
  if (!nameMatch) {
    return { name: '', props: {} };
  }
  
  const name = nameMatch[1];
  const propsMatch = content.match(/\[\{c:\s*"[^"]+"\s*,\s*p:\s*(\{[\s\S]*\})\s*\}\]/);
  let props: Record<string, unknown> = {};
  
  if (propsMatch) {
    try {
      props = JSON.parse(propsMatch[1]);
    } catch {
      // Try to auto-close for streaming
      try {
        let propsJson = propsMatch[1];
        let depth = 0;
        for (const char of propsJson) {
          if (char === '{') depth++;
          if (char === '}') depth--;
        }
        while (depth > 0) {
          propsJson += '}';
          depth--;
        }
        props = JSON.parse(propsJson);
      } catch {
        // Can't parse
      }
    }
  } else {
    const partialMatch = content.match(/\[\{c:\s*"[^"]+"\s*,\s*p:\s*(\{[\s\S]*)/);
    if (partialMatch) {
      try {
        let propsJson = partialMatch[1];
        let depth = 0;
        for (const char of propsJson) {
          if (char === '{') depth++;
          if (char === '}') depth--;
        }
        while (depth > 0) {
          propsJson += '}';
          depth--;
        }
        props = JSON.parse(propsJson);
      } catch {
        // Can't parse yet
      }
    }
  }
  
  return { name, props };
}

describe('Component Extraction', () => {
  describe('Complete component syntax', () => {
    it('should extract component name and props', () => {
      const result = extractComponentDataTest('[{c:"Card",p:{"title":"Hello"}}]');
      expect(result.name).toBe('Card');
      expect(result.props).toEqual({ title: 'Hello' });
    });
    
    it('should handle nested JSON props', () => {
      const result = extractComponentDataTest('[{c:"Widget",p:{"data":{"x":1,"y":2}}}]');
      expect(result.name).toBe('Widget');
      expect(result.props).toEqual({ data: { x: 1, y: 2 } });
    });
  });
  
  describe('Incomplete component syntax (streaming)', () => {
    it('should extract name when props are incomplete', () => {
      const result = extractComponentDataTest('[{c:"Card",p:{"title":"Hel');
      expect(result.name).toBe('Card');
    });
    
    it('should handle incomplete JSON gracefully', () => {
      const result = extractComponentDataTest('[{c:"Card",p:{');
      expect(result.name).toBe('Card');
      expect(result.props).toEqual({});
    });
  });
});
