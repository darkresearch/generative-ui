import { StyleSheet, type UnistylesTheme } from 'react-native-unistyles';
import { Platform, type ViewStyle, type TextStyle, type ImageStyle } from 'react-native';

/**
 * Utility functions for Unistyles
 * 
 * Replaces the cn() utility from NativeWind with Unistyles-compatible functions
 */

type Style = ViewStyle | TextStyle | ImageStyle;

/**
 * Merge multiple styles together (replacement for cn() utility)
 * Similar to StyleSheet.flatten but handles arrays and undefined/null values
 */
export function mergeStyles(...styles: (Style | Style[] | undefined | null | false)[]): Style[] {
  return styles.filter((style): style is Style | Style[] => {
    return style !== undefined && style !== null && style !== false;
  }) as Style[];
}

/**
 * Flatten and merge styles into a single style object
 */
export function flattenStyles(...styles: (Style | Style[] | undefined | null | false)[]): Style {
  const filtered = mergeStyles(...styles);
  return StyleSheet.flatten(filtered);
}

/**
 * Create opacity variant of foreground color
 */
export function opacityColor(opacity: number, theme: UnistylesTheme): string {
  const fg = theme.colors.fg;
  const r = parseInt(fg.slice(1, 3), 16);
  const g = parseInt(fg.slice(3, 5), 16);
  const b = parseInt(fg.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}

/**
 * Platform-specific style helper
 */
export function platformSelect<T>(styles: {
  ios?: T;
  android?: T;
  web?: T;
  default?: T;
}): T | undefined {
  return Platform.select(styles);
}

/**
 * Conditional style helper
 */
export function conditionalStyle(condition: boolean, style: Style | Style[]): Style | Style[] | null {
  return condition ? style : null;
}

/**
 * Combine multiple conditional styles
 */
export function combineConditionalStyles(...conditions: Array<[boolean, Style | Style[]]>): Style[] {
  return conditions
    .filter(([condition]) => condition)
    .map(([, style]) => style)
    .flat();
}

