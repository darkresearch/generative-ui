/**
 * Markdown Renderer for StreamdownRN
 * 
 * Wrapper around CustomMarkdownRenderer (uses remark parser)
 * Maintains same API as react-native-markdown-display for backward compatibility
 */

import React from 'react';
import { CustomMarkdownRenderer } from './CustomMarkdownRenderer';

interface MarkdownRendererProps {
  children: string;
  theme?: 'dark' | 'light';
  style?: any;
  rules?: any;
  componentMap?: Map<string, any>;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({
  children,
  style,
  rules = {},
  theme,
  componentMap,
}) => {
  return (
    <CustomMarkdownRenderer
      style={style}
      rules={rules}
      theme={theme}
      componentMap={componentMap}
    >
      {children}
    </CustomMarkdownRenderer>
  );
};

export default MarkdownRenderer;
