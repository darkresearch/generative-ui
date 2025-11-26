import React from 'react';
import { Text, StyleSheet } from 'react-native';
// Import full highlight.js bundle (Metro bundler can't handle lib/core subpath imports)
import hljs from 'highlight.js';

interface SyntaxHighlighterProps {
  code: string;
  language?: string;
  theme: 'dark' | 'light';
}

// Color schemes for syntax highlighting
const darkColors = {
  keyword: '#C678DD',      // Purple
  string: '#98C379',       // Green
  number: '#D19A66',       // Orange
  comment: '#5C6370',      // Gray
  function: '#61AFEF',     // Blue
  class: '#E5C07B',        // Yellow
  operator: '#56B6C2',     // Cyan
  default: '#A7BEE6',      // Default text color
};

const lightColors = {
  keyword: '#A626A4',      // Purple
  string: '#50A14F',       // Green
  number: '#C18401',       // Orange
  comment: '#A0A1A7',      // Gray
  function: '#4078F2',     // Blue
  class: '#C18401',        // Yellow-orange
  operator: '#0184BC',     // Cyan
  default: '#666666',      // Default text color
};

export const SyntaxHighlighter: React.FC<SyntaxHighlighterProps> = ({
  code,
  language,
  theme,
}) => {
  // Debug: log what SyntaxHighlighter receives
  console.log('SyntaxHighlighter received:', {
    codeLength: code?.length,
    codePreview: code?.substring(0, 30),
    language,
    theme,
  });
  
  const colors = theme === 'dark' ? darkColors : lightColors;

  // Highlight the code
  let highlighted;
  try {
    // Debug: check if language is registered
    const langDef = language ? hljs.getLanguage(language) : null;
    console.log('Language check:', { language, hasLangDef: !!langDef });
    
    if (language && langDef) {
      // highlight.js v11 API: highlight(languageName, code, ignoreIllegals)
      console.log('About to highlight with:', { 
        codeLength: code.length, 
        languageParam: language 
      });
      // Correct API: language FIRST, then code
      highlighted = hljs.highlight(language, code, true);
    } else {
      console.log('Using auto-detect');
      highlighted = hljs.highlightAuto(code);
    }
    
    // Debug: log the highlighted HTML
    console.log('Highlighted HTML:', highlighted.value.substring(0, 200));
  } catch (error) {
    // If highlighting fails, return plain text
    console.error('Highlighting error:', error);
    return (
      <Text style={[styles.code, { color: colors.default }]}>
        {code}
      </Text>
    );
  }

  // Parse HTML output and convert to React Native components
  const parseHighlightedCode = (html: string): React.ReactNode[] => {
    const nodes: React.ReactNode[] = [];
    let key = 0;

    // Simple approach: split by tags and process each part
    let currentPos = 0;
    
    while (currentPos < html.length) {
      // Look for next opening tag
      const nextOpenTag = html.indexOf('<span', currentPos);
      
      if (nextOpenTag === -1) {
        // No more tags, add remaining text
        const remaining = html.substring(currentPos);
        if (remaining) {
          nodes.push(remaining);
        }
        break;
      }
      
      // Add text before the tag
      if (nextOpenTag > currentPos) {
        const textBefore = html.substring(currentPos, nextOpenTag);
        nodes.push(textBefore);
      }
      
      // Extract class name
      const classStart = html.indexOf('class="hljs-', nextOpenTag);
      if (classStart === -1) break;
      
      const classNameStart = classStart + 12; // length of 'class="hljs-'
      const classNameEnd = html.indexOf('"', classNameStart);
      if (classNameEnd === -1) break;
      
      const className = html.substring(classNameStart, classNameEnd);
      
      // Find content start (after >)
      const contentStart = html.indexOf('>', classNameEnd) + 1;
      if (contentStart === 0) break;
      
      // Find matching closing tag
      const closeTag = html.indexOf('</span>', contentStart);
      if (closeTag === -1) break;
      
      const content = html.substring(contentStart, closeTag);
      
      // Determine color
      let color = colors.default;
      if (className.includes('keyword')) {
        color = colors.keyword;
      } else if (className.includes('string')) {
        color = colors.string;
      } else if (className.includes('number')) {
        color = colors.number;
      } else if (className.includes('comment')) {
        color = colors.comment;
      } else if (className.includes('function') || className.includes('title')) {
        color = colors.function;
      } else if (className.includes('class')) {
        color = colors.class;
      } else if (className.includes('operator') || className.includes('built_in')) {
        color = colors.operator;
      }
      
      // Add colored text (recursively parse if it contains more spans)
      if (content.includes('<span')) {
        nodes.push(
          <Text key={key++} style={{ color }}>
            {parseHighlightedCode(content)}
          </Text>
        );
      } else {
        nodes.push(
          <Text key={key++} style={{ color }}>
            {content}
          </Text>
        );
      }
      
      currentPos = closeTag + 7; // length of '</span>'
    }

    return nodes.length > 0 ? nodes : [html];
  };

  return (
    <Text style={[styles.code, { color: colors.default }]}>
      {parseHighlightedCode(highlighted.value)}
    </Text>
  );
};

const styles = StyleSheet.create({
  code: {
    fontFamily: 'Menlo, Monaco, Consolas, Liberation Mono, Courier New, monospace',
    fontSize: 13,
    lineHeight: 20,
    padding: 16,
    paddingTop: 8,
  },
});
