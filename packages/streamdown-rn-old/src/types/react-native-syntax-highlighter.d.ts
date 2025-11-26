declare module 'react-native-syntax-highlighter' {
  import { ComponentType } from 'react';
  
  interface SyntaxHighlighterProps {
    children?: string;
    language?: string;
    highlighter?: 'hljs' | 'prism';
    style?: any;
    customStyle?: any;
    CodeTag?: ComponentType<any>;
    PreTag?: ComponentType<any>;
    [key: string]: any;
  }
  
  const SyntaxHighlighter: ComponentType<SyntaxHighlighterProps>;
  export default SyntaxHighlighter;
}

