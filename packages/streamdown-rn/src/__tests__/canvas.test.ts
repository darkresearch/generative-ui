/**
 * Canvas Layout Tests
 * 
 * Tests for CSS Grid-like parsing utilities.
 */

import { describe, it, expect } from 'bun:test';
import { 
  parseGridTemplateColumns, 
  parseSpan, 
  calculateColumnWidths 
} from '../core/gridParser';

describe('Canvas Grid Parser', () => {
  describe('parseGridTemplateColumns', () => {
    it('should parse simple fr units', () => {
      const result = parseGridTemplateColumns('1fr 1fr');
      expect(result).toEqual([
        { type: 'fr', value: 1 },
        { type: 'fr', value: 1 },
      ]);
    });
    
    it('should parse mixed fr units', () => {
      const result = parseGridTemplateColumns('2fr 1fr 3fr');
      expect(result).toEqual([
        { type: 'fr', value: 2 },
        { type: 'fr', value: 1 },
        { type: 'fr', value: 3 },
      ]);
    });
    
    it('should parse repeat() syntax', () => {
      const result = parseGridTemplateColumns('repeat(3, 1fr)');
      expect(result).toEqual([
        { type: 'fr', value: 1 },
        { type: 'fr', value: 1 },
        { type: 'fr', value: 1 },
      ]);
    });
    
    it('should parse pixel values', () => {
      const result = parseGridTemplateColumns('200px 1fr');
      expect(result).toEqual([
        { type: 'px', value: 200 },
        { type: 'fr', value: 1 },
      ]);
    });
    
    it('should parse plain numbers as pixels', () => {
      const result = parseGridTemplateColumns('200 1fr');
      expect(result).toEqual([
        { type: 'px', value: 200 },
        { type: 'fr', value: 1 },
      ]);
    });
    
    it('should parse auto', () => {
      const result = parseGridTemplateColumns('auto 1fr auto');
      expect(result).toEqual([
        { type: 'auto', value: 0 },
        { type: 'fr', value: 1 },
        { type: 'auto', value: 0 },
      ]);
    });
    
    it('should default to single column if undefined', () => {
      const result = parseGridTemplateColumns(undefined);
      expect(result).toEqual([{ type: 'fr', value: 1 }]);
    });
  });
  
  describe('parseSpan', () => {
    it('should parse "span N" syntax', () => {
      expect(parseSpan('span 2', 4)).toBe(2);
      expect(parseSpan('span 3', 4)).toBe(3);
    });
    
    it('should parse "start / end" syntax', () => {
      expect(parseSpan('1 / 3', 4)).toBe(2);
      expect(parseSpan('1 / 4', 4)).toBe(3);
    });
    
    it('should handle negative end indices', () => {
      expect(parseSpan('1 / -1', 4)).toBe(4); // 1 to last column
    });
    
    it('should clamp span to total columns', () => {
      expect(parseSpan('span 10', 4)).toBe(4);
    });
    
    it('should default to 1 if undefined', () => {
      expect(parseSpan(undefined, 4)).toBe(1);
    });
  });
  
  describe('calculateColumnWidths', () => {
    it('should calculate equal fr widths', () => {
      const columns = [
        { type: 'fr' as const, value: 1 },
        { type: 'fr' as const, value: 1 },
      ];
      const widths = calculateColumnWidths(columns);
      expect(widths).toEqual(['50%', '50%']);
    });
    
    it('should calculate proportional fr widths', () => {
      const columns = [
        { type: 'fr' as const, value: 2 },
        { type: 'fr' as const, value: 1 },
      ];
      const widths = calculateColumnWidths(columns);
      // 2fr = 66.67%, 1fr = 33.33%
      expect(parseFloat(widths[0])).toBeCloseTo(66.67, 1);
      expect(parseFloat(widths[1])).toBeCloseTo(33.33, 1);
    });
    
    it('should handle px values', () => {
      const columns = [
        { type: 'px' as const, value: 200 },
        { type: 'fr' as const, value: 1 },
      ];
      const widths = calculateColumnWidths(columns);
      expect(widths[0]).toBe('200');
      expect(widths[1]).toBe('100%');
    });
  });
});

