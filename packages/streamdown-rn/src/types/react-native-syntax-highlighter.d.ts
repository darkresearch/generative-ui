/**
 * Type declarations for react-native-syntax-highlighter
 */

declare module 'react-native-syntax-highlighter' {
  import { ComponentType, ReactNode } from 'react';
  import { TextStyle, ViewStyle } from 'react-native';
  
  interface SyntaxHighlighterProps {
    children: string;
    language?: string;
    style?: Record<string, TextStyle | { color?: string; background?: string }>;
    customStyle?: ViewStyle & { backgroundColor?: string; padding?: number; margin?: number };
    fontSize?: number;
    fontFamily?: string;
    highlighter?: 'prism' | 'hljs';
    PreTag?: ComponentType<{ children: ReactNode; style?: ViewStyle }>;
    CodeTag?: ComponentType<{ children: ReactNode; style?: TextStyle }>;
  }
  
  const SyntaxHighlighter: ComponentType<SyntaxHighlighterProps>;
  export default SyntaxHighlighter;
}
