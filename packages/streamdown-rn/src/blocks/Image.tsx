/**
 * Image - Unified Image Renderer
 * 
 * Handles both StableBlock and raw data input.
 * Currently renders as a placeholder — can be enhanced with actual image loading.
 */

import React from 'react';
import { View, Text, Image as RNImage } from 'react-native';
import type { StableBlock, ThemeConfig } from '../core/types';
import { getTextStyles } from '../themes';

export interface ImageBlockProps {
  theme: ThemeConfig;
  /** StableBlock input */
  block?: StableBlock;
  /** Direct src URL */
  src?: string;
  /** Direct alt text */
  alt?: string;
  /** Direct title */
  title?: string;
}

/**
 * Extract image data from raw markdown
 */
function extractImageData(content: string): { src: string; alt: string; title: string } {
  const match = content.match(/!\[([^\]]*)\]\(([^)\s]+)(?:\s+"([^"]+)")?\)/);
  return {
    alt: match?.[1] ?? '',
    src: match?.[2] ?? '',
    title: match?.[3] ?? '',
  };
}

export const ImageBlock: React.FC<ImageBlockProps> = React.memo(
  ({ theme, block, src: directSrc, alt: directAlt, title: directTitle }) => {
    const styles = getTextStyles(theme);
    
    // Determine image data from either source
    let src: string;
    let alt: string;
    let title: string;
    
    if (block) {
      const extracted = extractImageData(block.content);
      src = extracted.src;
      alt = extracted.alt;
      title = extracted.title;
    } else {
      src = directSrc ?? '';
      alt = directAlt ?? '';
      title = directTitle ?? '';
    }
    
    // For now, render as a placeholder
    // TODO: Implement actual image loading with RNImage
    if (!src) {
      return (
        <Text style={[styles.paragraph, { color: theme.colors.muted }]}>
          [Image: {alt || 'No alt text'}]
        </Text>
      );
    }
    
    return (
      <View style={{ marginBottom: theme.spacing.block }}>
        <RNImage
          source={{ uri: src }}
          style={{
            width: '100%',
            height: 200,
            borderRadius: 8,
            backgroundColor: theme.colors.codeBackground,
          }}
          resizeMode="contain"
          accessibilityLabel={alt}
        />
        {(alt || title) && (
          <Text style={[styles.paragraph, { 
            color: theme.colors.muted, 
            fontSize: 14,
            textAlign: 'center',
            marginTop: 4,
            marginBottom: 0,
          }]}>
            {title || alt}
          </Text>
        )}
      </View>
    );
  },
  (prev, next) => {
    if (prev.block && next.block) {
      return prev.block.contentHash === next.block.contentHash;
    }
    return prev.src === next.src && prev.alt === next.alt;
  }
);

ImageBlock.displayName = 'ImageBlock';

