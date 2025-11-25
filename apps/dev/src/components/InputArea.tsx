import React from 'react';
import { View, Platform } from 'react-native';
import { Textarea, StyleSheet, useStyles } from '@darkresearch/design-system';
import { SectionLabel } from './SectionLabel';
import { StyledContainer } from './StyledContainer';
import { ContentPadding } from './ContentPadding';

const styles = StyleSheet.create((theme) => ({
  container: {
    flex: 1,
    backgroundColor: theme.colors.bg,
  },
  textarea: {
    backgroundColor: 'transparent',
    borderWidth: 0,
    padding: 0,
    borderRadius: 0,
    flex: 1,
    minHeight: 0,
    fontFamily: theme.typography.fontFamily.mono,
  },
  textareaWeb: {
    ...Platform.select({
      web: {
        outlineStyle: 'none' as any,
        outlineWidth: 0,
      },
    }),
  },
}));

interface InputAreaProps {
  markdown: string;
  onMarkdownChange: (text: string) => void;
  editable?: boolean;
  theme?: 'dark' | 'light';
}

export function InputArea({ markdown, onMarkdownChange, editable = true, theme = 'light' }: InputAreaProps) {
  const { styles: themeStyles } = useStyles();
  
  return (
    <View style={themeStyles.container}>
      <SectionLabel>Input</SectionLabel>
      <StyledContainer theme={theme}>
        <ContentPadding>
          <Textarea
            value={markdown}
            onChangeText={onMarkdownChange}
            placeholder="Enter markdown here..."
            editable={editable}
            style={[
              themeStyles.textarea,
              Platform.OS === 'web' && themeStyles.textareaWeb,
            ]}
            numberOfLines={Platform.select({ web: 10, native: 20 })}
          />
        </ContentPadding>
      </StyledContainer>
    </View>
  );
}

