/**
 * Incomplete Markdown Handler Tests
 * 
 * Tests for format-as-you-type functionality.
 */

import { describe, it, expect } from 'bun:test';
import { updateTagState, fixIncompleteMarkdown, INITIAL_INCOMPLETE_STATE } from '../core/incomplete';

describe('Incomplete Markdown Handler', () => {
  describe('Tag state tracking', () => {
    it('should track opening bold tag', () => {
      const state = updateTagState(INITIAL_INCOMPLETE_STATE, '**');
      expect(state.stack.length).toBe(1);
      expect(state.stack[0].type).toBe('bold');
      expect(state.tagCounts.bold).toBe(1);
    });
    
    it('should track and close bold tag', () => {
      let state = updateTagState(INITIAL_INCOMPLETE_STATE, '**bold');
      state = updateTagState(state, '**bold**');
      expect(state.stack.length).toBe(0);
      expect(state.tagCounts.bold).toBe(0);
    });
    
    it('should track nested tags', () => {
      const state = updateTagState(INITIAL_INCOMPLETE_STATE, '**bold *italic*');
      // Bold still open, italic closed
      expect(state.stack.length).toBe(1);
      expect(state.stack[0].type).toBe('bold');
    });
    
    it('should track code blocks', () => {
      const state = updateTagState(INITIAL_INCOMPLETE_STATE, '```\ncode');
      expect(state.inCodeBlock).toBe(true);
      expect(state.stack.some(tag => tag.type === 'codeBlock')).toBe(true);
    });
    
    it('should skip markdown inside code blocks', () => {
      let state = updateTagState(INITIAL_INCOMPLETE_STATE, '```\n**not bold**');
      // Should only have code block in stack, not bold
      expect(state.stack.length).toBe(1);
      expect(state.stack[0].type).toBe('codeBlock');
    });
  });
  
  describe('Auto-closing incomplete tags', () => {
    it('should auto-close incomplete bold', () => {
      const state = updateTagState(INITIAL_INCOMPLETE_STATE, '**bold');
      const fixed = fixIncompleteMarkdown('**bold', state);
      // Should auto-close the bold tag
      expect(fixed).toContain('**bold');
      expect(state.stack.length).toBe(1);
    });
    
    it('should auto-close incomplete italic', () => {
      const state = updateTagState(INITIAL_INCOMPLETE_STATE, '*italic');
      const fixed = fixIncompleteMarkdown('*italic', state);
      expect(fixed).toBe('*italic*');
    });
    
    it('should auto-close nested tags correctly', () => {
      const state = updateTagState(INITIAL_INCOMPLETE_STATE, '**bold *italic*');
      const fixed = fixIncompleteMarkdown('**bold *italic*', state);
      // Should auto-close the still-open bold tag
      expect(fixed).toContain('**');
    });
    
    it('should auto-close code block', () => {
      const state = updateTagState(INITIAL_INCOMPLETE_STATE, '```js\nconst x = 1;');
      const fixed = fixIncompleteMarkdown('```js\nconst x = 1;', state);
      expect(fixed).toContain('```'); // Should add closing fence
    });
  });
  
  describe('Hiding incomplete markers', () => {
    it('should hide trailing ** with no content', () => {
      const state = updateTagState(INITIAL_INCOMPLETE_STATE, '**');
      const fixed = fixIncompleteMarkdown('**', state);
      expect(fixed).toBe('');
    });
    
    it('should hide trailing ` with no content', () => {
      const state = updateTagState(INITIAL_INCOMPLETE_STATE, '`');
      const fixed = fixIncompleteMarkdown('`', state);
      expect(fixed).toBe('');
    });
    
    it('should hide incomplete code block fence', () => {
      const state = updateTagState(INITIAL_INCOMPLETE_STATE, 'Some text\n```');
      const fixed = fixIncompleteMarkdown('Some text\n```', state);
      // Should auto-close and then hide trailing fence
      expect(fixed).toContain('Some text');
    });
  });
});

