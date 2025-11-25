import { StyleSheet, useStyles } from '../../lib/unistyles';
import { Platform, Pressable } from 'react-native';
import * as React from 'react';

type ButtonVariant = 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
type ButtonSize = 'default' | 'sm' | 'lg' | 'icon';

const styles = StyleSheet.create((theme) => ({
  base: {
    flexShrink: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: theme.borderRadius.md,
    ...Platform.select({
      web: {
        whiteSpace: 'nowrap',
        outlineStyle: 'none',
        cursor: 'pointer',
      },
    }),
  },
  variant: {
    default: {
      backgroundColor: theme.colors.slate[900],
      ...Platform.select({
        web: {
          boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        },
        default: {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.05,
          shadowRadius: 2,
          elevation: 1,
        },
      }),
    },
    destructive: {
      backgroundColor: theme.colors.red[500],
      ...Platform.select({
        web: {
          boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        },
        default: {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.05,
          shadowRadius: 2,
          elevation: 1,
        },
      }),
    },
    outline: {
      borderWidth: 1,
      borderColor: theme.colors.slate[200],
      backgroundColor: theme.colors.white,
      ...Platform.select({
        web: {
          boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        },
        default: {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.05,
          shadowRadius: 2,
          elevation: 1,
        },
      }),
    },
    secondary: {
      backgroundColor: theme.colors.slate[100],
      ...Platform.select({
        web: {
          boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        },
        default: {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.05,
          shadowRadius: 2,
          elevation: 1,
        },
      }),
    },
    ghost: {
      backgroundColor: 'transparent',
    },
    link: {
      backgroundColor: 'transparent',
    },
  },
  size: {
    default: {
      height: 40,
      paddingHorizontal: 16,
      paddingVertical: 8,
    },
    sm: {
      height: 36,
      gap: 6,
      borderRadius: theme.borderRadius.md,
      paddingHorizontal: 12,
    },
    lg: {
      height: 44,
      borderRadius: theme.borderRadius.md,
      paddingHorizontal: 24,
    },
    icon: {
      height: 40,
      width: 40,
    },
  },
  disabled: {
    opacity: 0.5,
    ...Platform.select({
      web: {
        pointerEvents: 'none',
      },
    }),
  },
}));

type ButtonProps = React.ComponentProps<typeof Pressable> &
  React.RefAttributes<typeof Pressable> & {
    variant?: ButtonVariant;
    size?: ButtonSize;
  };

function Button({ 
  style, 
  variant = 'default', 
  size = 'default',
  disabled,
  ...props 
}: ButtonProps) {
  const { styles: themeStyles } = useStyles();
  
  const variantStyle = themeStyles.variant[variant];
  const sizeStyle = themeStyles.size[size];
  const disabledStyle = disabled ? themeStyles.disabled : null;
  
  return (
      <Pressable
        style={[
          themeStyles.base,
          variantStyle,
          sizeStyle,
          disabledStyle,
          style,
        ]}
        role="button"
        disabled={disabled}
        {...props}
      />
  );
}

export { Button };
export type { ButtonProps };
