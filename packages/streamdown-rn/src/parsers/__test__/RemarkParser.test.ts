/**
 * Validation test for RemarkParser
 * 
 * Verifies that remark creates inlineCode nodes for component markers
 * This is critical for component injection to work
 */

import { parseMarkdown } from '../RemarkParser';

describe('RemarkParser - Component Marker Validation', () => {
  it('should create inlineCode node for component marker', () => {
    const markdown = 'Text with `__COMPONENT__test-id__TestName__` component';
    const ast = parseMarkdown(markdown);
    
    // Find inlineCode node
    const inlineCodeNode = findInlineCodeNode(ast);
    
    expect(inlineCodeNode).toBeDefined();
    expect(inlineCodeNode?.type).toBe('inlineCode');
    expect(inlineCodeNode?.value).toContain('__COMPONENT__');
  });
  
  it('should create inlineCode node for partial component marker', () => {
    const markdown = 'Text with `__PARTIAL_COMPONENT__test-id__TestName__` component';
    const ast = parseMarkdown(markdown);
    
    const inlineCodeNode = findInlineCodeNode(ast);
    
    expect(inlineCodeNode).toBeDefined();
    expect(inlineCodeNode?.type).toBe('inlineCode');
    expect(inlineCodeNode?.value).toContain('__PARTIAL_COMPONENT__');
  });
  
  it('should create inlineCode node for empty component marker', () => {
    const markdown = 'Text with `__EMPTY_COMPONENT__TestName__` component';
    const ast = parseMarkdown(markdown);
    
    const inlineCodeNode = findInlineCodeNode(ast);
    
    expect(inlineCodeNode).toBeDefined();
    expect(inlineCodeNode?.type).toBe('inlineCode');
    expect(inlineCodeNode?.value).toContain('__EMPTY_COMPONENT__');
  });
  
  function findInlineCodeNode(ast: any): any {
    function traverse(node: any): any {
      if (node.type === 'inlineCode') {
        return node;
      }
      if (node.children) {
        for (const child of node.children) {
          const result = traverse(child);
          if (result) return result;
        }
      }
      return null;
    }
    return traverse(ast);
  }
});

