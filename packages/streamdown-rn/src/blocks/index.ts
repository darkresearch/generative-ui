/**
 * Block Components
 * 
 * Unified block renderers that handle both StableBlock and raw data input.
 */

export { CodeBlock, type CodeBlockProps } from './CodeBlock';
export { Heading, type HeadingProps } from './Heading';
export { Paragraph, type ParagraphProps } from './Paragraph';
export { List, type ListProps } from './List';
export { Blockquote, type BlockquoteProps } from './Blockquote';
export { ComponentBlock, type ComponentBlockProps, extractComponentData } from './Component';
export { HorizontalRule, type HorizontalRuleProps } from './HorizontalRule';
export { ImageBlock, type ImageBlockProps } from './Image';
export { Table, type TableProps } from './Table';

// Utilities
export { normalizeLanguage, createSyntaxStyle } from './syntax-utils';

