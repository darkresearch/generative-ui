/**
 * Custom Markdown Renderer for StreamdownRN
 * 
 * Converts remark MDAST nodes to React Native components.
 * Maintains same API as react-native-markdown-display for drop-in replacement.
 */

import React from 'react';
import { View, Text } from 'react-native';
import type { Content, PhrasingContent } from 'mdast';
import { parseMarkdown } from '../parsers/RemarkParser';

interface MarkdownRendererProps {
  children: string;
  theme?: 'dark' | 'light';
  style?: any; // markdownStyles object
  rules?: any; // customRules for component injection
  componentMap?: Map<string, any>; // Map of component instances by ID
}

/**
 * Render MDAST node to React Native component
 */
function renderNode(
  node: Content | PhrasingContent,
  styles: any,
  customRules: any,
  componentMap: Map<string, any>,
  key: string | number,
  parentOrdered?: boolean,
  itemNumber?: number,
  parentType?: string
): React.ReactNode {
  const nodeType = node.type;

  // Map MDAST node types to customRules keys
  // remark uses different names than react-native-markdown-display
  let ruleKey: string = nodeType;
  if (nodeType === 'inlineCode') {
    ruleKey = 'code_inline'; // Map to existing customRules key
  } else if (nodeType === 'code') {
    ruleKey = 'fence'; // Code blocks are called 'fence' in customRules
  } else if (nodeType === 'emphasis') {
    ruleKey = 'em'; // Map to existing key
  } else if (nodeType === 'heading') {
    // Map heading depth to heading1-6 rules
    const depth = (node as any).depth || 1;
    ruleKey = `heading${depth}`;
  }

  // Check for custom rule override first
  if (customRules && customRules[ruleKey]) {
    const customRule = customRules[ruleKey];
    
    // Render children first (customRules may need them)
    const children = 'children' in node && node.children
      ? node.children.map((child, idx) => renderNode(child as Content | PhrasingContent, styles, customRules, componentMap, idx, undefined, undefined, nodeType))
      : null;
    
    // Adapt MDAST node to match react-native-markdown-display structure
    const adaptedNode: any = {
      ...node,
      key: key.toString(),
    };
    
    // Map MDAST properties to react-native-markdown-display structure
    if (nodeType === 'inlineCode') {
      adaptedNode.content = (node as any).value || '';
    } else if (nodeType === 'code') {
      adaptedNode.content = (node as any).value || '';
      adaptedNode.sourceInfo = (node as any).lang || '';
    } else if (nodeType === 'paragraph') {
      // For paragraph, customRules might expect 'content' property
      // But MDAST paragraphs have 'children' - we'll pass children instead
      // The paragraph customRule will handle this
    } else if (nodeType === 'heading') {
      // Headings are handled by heading1-6 rules based on depth
      // No adaptation needed
    }
    
    return customRule(adaptedNode, children, null, styles);
  }

  switch (nodeType) {
    case 'heading': {
      // Handled by customRules.heading1-6 if present
      // Fallback to default rendering
      const heading = node as any;
      const depth = heading.depth || 1;
      const styleKey = `heading${depth}`;
      const headingStyle = styles[styleKey] || styles.heading1;
      const children = heading.children?.map((child: any, idx: number) =>
        renderNode(child, styles, customRules, componentMap, idx, undefined, undefined, 'heading')
      ) || [];
      
      return (
        <View key={key}>
          <Text style={headingStyle}>
            {children}
          </Text>
        </View>
      );
    }

    case 'paragraph': {
      const paragraph = node as any;
      const children = paragraph.children?.map((child: any, idx: number) =>
        renderNode(child, styles, customRules, componentMap, idx, undefined, undefined, parentType === 'listItem' ? 'listItem' : 'paragraph')
      ) || [];
      
      // If paragraph is inside a list item, render without View wrapper (Text can't contain View)
      if (parentType === 'listItem') {
        // Return just the Text component - list item will handle the container
        const paragraphStyle = styles.paragraph || {};
        const textStyle = {
          color: paragraphStyle.color,
          fontSize: paragraphStyle.fontSize,
          lineHeight: paragraphStyle.lineHeight,
          ...(paragraphStyle.fontFamily && { fontFamily: paragraphStyle.fontFamily }),
          flexWrap: paragraphStyle.flexWrap,
          flexShrink: paragraphStyle.flexShrink,
        };
        
        return (
          <Text key={key} style={textStyle}>
            {children}
          </Text>
        );
      }
      
      // Separate container styles from text styles (for standalone paragraphs)
      const paragraphStyle = styles.paragraph || {};
      const containerStyle: any = {
        minHeight: paragraphStyle.lineHeight || 22, // Ensure container accommodates lineHeight
        ...(parentType === 'blockquote' ? {
          width: '100%' as const,  // Paragraphs inside blockquotes should take full width
          alignSelf: 'stretch' as const,
        } : {
          alignSelf: 'flex-start' as const,
        }),
      };
      const textStyle = {
        color: paragraphStyle.color,
        fontSize: paragraphStyle.fontSize,
        lineHeight: paragraphStyle.lineHeight,
        ...(paragraphStyle.fontFamily && { fontFamily: paragraphStyle.fontFamily }),
        flexWrap: paragraphStyle.flexWrap,
        flexShrink: paragraphStyle.flexShrink,
        marginTop: paragraphStyle.marginTop,
        marginBottom: paragraphStyle.marginBottom,
        ...(parentType === 'blockquote' && {
          marginTop: 0,
          marginBottom: 0,  // Remove margins to allow proper centering
        }),
      };
      
      // #region agent log - paragraph rendering (inside blockquote)
      if (parentType === 'blockquote') {
        const paragraphText = children.map((child: any) => {
          if (typeof child === 'string') return child;
          if (child?.props?.children) return String(child.props.children);
          return String(child);
        }).join('');
        fetch('http://127.0.0.1:7242/ingest/ba72c841-4600-456b-adad-25adf0868af7',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'CustomMarkdownRenderer.tsx:131',message:'Paragraph rendering (inside blockquote)',data:{paragraphText,textStyle,containerStyle,parentType},timestamp:Date.now(),sessionId:'debug-session',runId:'blockquote-clipping-debug',hypothesisId:'C'})}).catch(()=>{});
      }
      // #endregion
      
      return (
        <View 
          key={key} 
          style={[
            containerStyle,
            parentType === 'blockquote' && {
              flexDirection: 'column' as const,
              justifyContent: 'center' as const,
              alignItems: 'flex-start' as const,
            },
          ]}
          onLayout={(event) => {
            if (parentType === 'blockquote') {
              const { x, y, width, height } = event.nativeEvent.layout;
              fetch('http://127.0.0.1:7242/ingest/ba72c841-4600-456b-adad-25adf0868af7',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'CustomMarkdownRenderer.tsx:148',message:'Paragraph View layout (inside blockquote)',data:{x,y,width,height,containerStyle,parentType},timestamp:Date.now(),sessionId:'debug-session',runId:'blockquote-clipping-debug',hypothesisId:'D'})}).catch(()=>{});
            }
          }}
        >
          <Text 
            style={[
              textStyle,
              parentType === 'blockquote' && {
                marginTop: 0,
                marginBottom: 0,  // Remove margins to allow proper centering
              },
            ]}
            onLayout={(event) => {
              if (parentType === 'blockquote') {
                const { x, y, width, height } = event.nativeEvent.layout;
                fetch('http://127.0.0.1:7242/ingest/ba72c841-4600-456b-adad-25adf0868af7',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'CustomMarkdownRenderer.tsx:155',message:'Paragraph Text layout (inside blockquote)',data:{x,y,width,height,textStyle,parentType},timestamp:Date.now(),sessionId:'debug-session',runId:'blockquote-clipping-debug',hypothesisId:'E'})}).catch(()=>{});
              }
            }}
          >
            {children}
          </Text>
        </View>
      );
    }

    case 'text': {
      const text = node as any;
      const textValue = text.value || '';
      
      // #region agent log - text node rendering (inside blockquote)
      if (parentType === 'blockquote' || parentType === 'paragraph') {
        fetch('http://127.0.0.1:7242/ingest/ba72c841-4600-456b-adad-25adf0868af7',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'CustomMarkdownRenderer.tsx:193',message:'Text node rendering',data:{textValue,textLength:textValue.length,parentType,isInsideBlockquote:parentType === 'blockquote' || parentType === 'paragraph'},timestamp:Date.now(),sessionId:'debug-session',runId:'blockquote-clipping-debug',hypothesisId:'F'})}).catch(()=>{});
      }
      // #endregion
      
      // If inside a heading, return plain string (Text components can't contain View components)
      if (parentType === 'heading') {
        return textValue;
      }
      return textValue;
    }

    case 'strong': {
      const strong = node as any;
      const children = strong.children?.map((child: any, idx: number) =>
        renderNode(child, styles, customRules, componentMap, idx, undefined, undefined, 'strong')
      ) || [];
      
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/ba72c841-4600-456b-adad-25adf0868af7',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'CustomMarkdownRenderer.tsx:strong',message:'Rendering strong node',data:{hasChildren:children.length>0,childrenCount:children.length,hasStrongStyle:!!styles.strong,strongStyleKeys:styles.strong?Object.keys(styles.strong):[],strongStyleValue:styles.strong},timestamp:Date.now(),sessionId:'debug-session',runId:'bold-italic-fix',hypothesisId:'A'})}).catch(()=>{});
      // #endregion
      
      // Fallback style if styles.strong is missing
      const strongStyle = styles.strong || { fontWeight: 'bold' as const };
      
      return (
        <Text key={key} style={strongStyle}>
          {children}
        </Text>
      );
    }

    case 'emphasis': {
      const emphasis = node as any;
      const children = emphasis.children?.map((child: any, idx: number) =>
        renderNode(child, styles, customRules, componentMap, idx, undefined, undefined, 'emphasis')
      ) || [];
      
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/ba72c841-4600-456b-adad-25adf0868af7',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'CustomMarkdownRenderer.tsx:emphasis',message:'Rendering emphasis node',data:{hasChildren:children.length>0,childrenCount:children.length,hasEmStyle:!!styles.em,emStyleKeys:styles.em?Object.keys(styles.em):[],emStyleValue:styles.em},timestamp:Date.now(),sessionId:'debug-session',runId:'bold-italic-fix',hypothesisId:'B'})}).catch(()=>{});
      // #endregion
      
      // Fallback style if styles.em is missing
      const emStyle = styles.em || { fontStyle: 'italic' as const };
      
      return (
        <Text key={key} style={emStyle}>
          {children}
        </Text>
      );
    }

    case 'inlineCode': {
      // This is handled by customRules.code_inline if present
      // Fallback to default rendering if no custom rule
      const inlineCode = node as any;
      const codeValue = inlineCode.value || '';
      
      return (
        <Text key={key} style={styles.code_inline}>
          {codeValue}
        </Text>
      );
    }

    case 'code': {
      // Handled by customRules.fence if present
      // Fallback to default rendering
      const code = node as any;
      const codeValue = code.value || '';
      
      return (
        <View key={key} style={styles.code_block}>
          <Text style={styles.code_block}>{codeValue}</Text>
        </View>
      );
    }

    case 'list': {
      const list = node as any;
      const ordered = list.ordered || false;
      const listStyle = ordered ? styles.ordered_list : styles.bullet_list;
      const children = list.children?.map((child: any, idx: number) =>
        renderNode(child, styles, customRules, componentMap, idx, ordered, idx + 1, 'list')
      ) || [];
      
      return (
        <View key={key} style={listStyle}>
          {children}
        </View>
      );
    }

    case 'listItem': {
      const listItem = node as any;
      const children = listItem.children?.map((child: any, idx: number) =>
        renderNode(child, styles, customRules, componentMap, idx, parentOrdered, itemNumber, 'listItem')
      ) || [];
      
      // Get parent list info from function parameters
      const isOrdered = parentOrdered || false;
      const itemNum = itemNumber || 0;
      
      // Render bullet or number
      const marker = isOrdered ? `${itemNum}. ` : '• ';
      
      // Separate container styles from text styles (inspired by react-native-remark approach)
      // Container (View) gets layout properties: paddingLeft, marginBottom
      // Text gets text properties: fontSize, lineHeight, color, fontFamily
      const listItemStyle = styles.list_item || {};
      const containerStyle = {
        paddingLeft: listItemStyle.paddingLeft || 16,
        marginBottom: listItemStyle.marginBottom || 8,
        minHeight: listItemStyle.lineHeight || 22, // Ensure container accommodates lineHeight
      };
      const textStyle = {
        color: listItemStyle.color,
        fontSize: listItemStyle.fontSize,
        lineHeight: listItemStyle.lineHeight,
        ...(listItemStyle.fontFamily && { fontFamily: listItemStyle.fontFamily }),
        flexWrap: listItemStyle.flexWrap,
        flexShrink: listItemStyle.flexShrink,
      };
      
      // Put marker and children in same Text component to keep them on same line
      // Flatten children array if needed
      return (
        <View key={key} style={containerStyle}>
          <Text style={textStyle}>
            {marker}
            {React.Children.toArray(children)}
          </Text>
        </View>
      );
    }

    case 'table': {
      const table = node as any;
      const children = table.children?.map((child: any, idx: number) =>
        renderNode(child, styles, customRules, componentMap, idx, undefined, undefined, 'table')
      ) || [];
      
      return (
        <View key={key} style={styles.table}>
          {children}
        </View>
      );
    }

    case 'tableRow': {
      const tableRow = node as any;
      const children = tableRow.children?.map((child: any, idx: number) =>
        renderNode(child, styles, customRules, componentMap, idx, undefined, undefined, 'tableRow')
      ) || [];
      
      return (
        <View key={key} style={{ flexDirection: 'row' }}>
          {children}
        </View>
      );
    }

    case 'tableCell': {
      const tableCell = node as any;
      const children = tableCell.children?.map((child: any, idx: number) =>
        renderNode(child, styles, customRules, componentMap, idx, undefined, undefined, 'tableCell')
      ) || [];
      
      return (
        <View key={key} style={styles.td}>
          {children}
        </View>
      );
    }

    case 'blockquote': {
      const blockquote = node as any;
      const children = blockquote.children?.map((child: any, idx: number) =>
        renderNode(child, styles, customRules, componentMap, idx, undefined, undefined, 'blockquote')
      ) || [];
      
      // #region agent log - blockquote rendering
      const childrenInfo = children.map((child: any) => {
        if (typeof child === 'string') return { type: 'string', value: child };
        if (child?.props) return { type: 'component', componentType: child.type?.displayName || child.type?.name || 'unknown', props: Object.keys(child.props) };
        return { type: 'unknown', value: String(child) };
      });
      fetch('http://127.0.0.1:7242/ingest/ba72c841-4600-456b-adad-25adf0868af7',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'CustomMarkdownRenderer.tsx:316',message:'Blockquote rendering',data:{childrenCount:children.length,childrenInfo,blockquoteStyle:styles.blockquote},timestamp:Date.now(),sessionId:'debug-session',runId:'blockquote-clipping-debug',hypothesisId:'A'})}).catch(()=>{});
      // #endregion
      
      // Blockquote container - ensure proper flex layout for vertical centering
      const blockquoteStyle = styles.blockquote || {};
      const containerStyle: any = {
        ...blockquoteStyle,
        flexDirection: 'column' as const,
        justifyContent: 'center' as const,
        alignItems: 'flex-start' as const,
        width: '100%' as const,  // Blockquote should take full available width
        alignSelf: 'stretch' as const,
      };
      
      return (
        <View 
          key={key} 
          style={containerStyle}
          onLayout={(event) => {
            const { x, y, width, height } = event.nativeEvent.layout;
            fetch('http://127.0.0.1:7242/ingest/ba72c841-4600-456b-adad-25adf0868af7',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'CustomMarkdownRenderer.tsx:330',message:'Blockquote View layout',data:{x,y,width,height,containerStyle},timestamp:Date.now(),sessionId:'debug-session',runId:'blockquote-clipping-debug',hypothesisId:'B'})}).catch(()=>{});
          }}
        >
          {children}
        </View>
      );
    }

    case 'thematicBreak': {
      return (
        <View key={key} style={styles.hr} />
      );
    }

    case 'link': {
      const link = node as any;
      const children = link.children?.map((child: any, idx: number) =>
        renderNode(child, styles, customRules, componentMap, idx, undefined, undefined, 'link')
      ) || [];
      
      return (
        <Text key={key} style={styles.link}>
          {children}
        </Text>
      );
    }

    case 'image': {
      const image = node as any;
      const alt = image.alt || '';
      
      // For now, render as text - can be enhanced later
      return (
        <Text key={key} style={styles.link}>
          [Image: {alt}]
        </Text>
      );
    }

    default:
      console.warn(`Unhandled MDAST node type: ${nodeType}`);
      return null;
  }
}

export const CustomMarkdownRenderer: React.FC<MarkdownRendererProps> = ({
  children,
  style,
  rules = {},
  componentMap = new Map(),
}) => {
  // Handle empty markdown
  if (!children || children.trim().length === 0) {
    return (
      <View style={style?.body}>
        {/* Empty state - render nothing */}
      </View>
    );
  }
  
  // Parse markdown to MDAST
  const ast = parseMarkdown(children);
  
  // Render root node children
  const rootChildren = ast.children?.map((child, idx) =>
    renderNode(child, style || {}, rules, componentMap, idx, undefined, undefined, 'root')
  ) || [];
  
  return (
    <View style={style?.body}>
      {rootChildren}
    </View>
  );
};

export default CustomMarkdownRenderer;

