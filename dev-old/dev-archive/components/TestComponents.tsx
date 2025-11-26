import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import type { ComponentDefinition, ComponentRegistry, ComponentRenderingMetadata, ThemeConfig } from 'streamdown-rn';
import { Progressive, darkTheme, lightTheme } from 'streamdown-rn';

// TokenCard component with progressive rendering
interface TokenCardProps {
  sym: string;
  name: string;
  price: number;
  change: number;
  _theme?: ThemeConfig; // Internal theme prop passed by StreamdownRN
}

const tokenCardMetadata: ComponentRenderingMetadata = {
  fieldOrder: ['sym', 'name', 'price', 'change'],
};

export const TokenCard = (props: Partial<TokenCardProps>) => {
  const theme = props._theme || darkTheme;
  return (
    <Progressive props={props} metadata={tokenCardMetadata} theme={theme}>
      <View style={styles.tokenCard}>
        <View style={styles.tokenHeader}>
          <Progressive.Field name="sym" skeleton={{ width: 60, height: 22 }}>
            {(val) => <Text style={styles.tokenSymbol}>{val}</Text>}
          </Progressive.Field>
          
          <Progressive.Field name="name" skeleton={{ width: 100, height: 18 }}>
            {(val) => <Text style={styles.tokenName}>{val}</Text>}
          </Progressive.Field>
        </View>
        
        <View style={styles.tokenPriceRow}>
          <Progressive.Field name="price" skeleton={{ width: 120, height: 28 }}>
            {(val) => (
              <Text style={styles.tokenPrice}>${val.toLocaleString()}</Text>
            )}
          </Progressive.Field>
          
          <Progressive.Field name="change" skeleton={{ width: 70, height: 20 }}>
            {(val) => {
              const isPositive = val >= 0;
              return (
                <Text style={[styles.priceChange, isPositive ? styles.positive : styles.negative]}>
                  {isPositive ? '+' : ''}{val.toFixed(2)}%
                </Text>
              );
            }}
          </Progressive.Field>
        </View>
      </View>
    </Progressive>
  );
};

// Button component with progressive rendering
interface ButtonProps {
  label: string;
  variant?: 'primary' | 'secondary';
  _theme?: ThemeConfig;
}

const buttonMetadata: ComponentRenderingMetadata = {
  fieldOrder: ['label', 'variant'],
};

export const Button = (props: Partial<ButtonProps>) => {
  const theme = props._theme || darkTheme;
  const variant = props.variant || 'primary';
  
  return (
    <Progressive props={props} metadata={buttonMetadata} theme={theme}>
      <TouchableOpacity
        style={[styles.button, variant === 'primary' ? styles.buttonPrimary : styles.buttonSecondary]}
        activeOpacity={0.7}
      >
        <Progressive.Field name="label" skeleton={{ width: 80, height: 18 }}>
          {(val) => (
            <Text style={[styles.buttonText, variant === 'primary' ? styles.buttonTextPrimary : styles.buttonTextSecondary]}>
              {val}
            </Text>
          )}
        </Progressive.Field>
      </TouchableOpacity>
    </Progressive>
  );
};

// Badge component with progressive rendering
interface BadgeProps {
  text: string;
  color?: string;
  _theme?: ThemeConfig;
}

const badgeMetadata: ComponentRenderingMetadata = {
  fieldOrder: ['text', 'color'],
};

export const Badge = (props: Partial<BadgeProps>) => {
  const theme = props._theme || darkTheme;
  const color = props.color || '#494C53';
  
  return (
    <Progressive props={props} metadata={badgeMetadata} theme={theme}>
      <View style={[styles.badge, { backgroundColor: color }]}>
        <Progressive.Field name="text" skeleton={{ width: 60, height: 16 }}>
          {(val) => <Text style={styles.badgeText}>{val}</Text>}
        </Progressive.Field>
      </View>
    </Progressive>
  );
};

const styles = StyleSheet.create({
  tokenCard: {
    backgroundColor: '#1A1A1A',
    borderRadius: 8,
    padding: 16,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: '#2A2A2A',
    minWidth: 280,
  },
  tokenHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  tokenSymbol: {
    fontSize: 18,
    fontWeight: '600',
    color: '#D7D7D7',
  },
  tokenName: {
    fontSize: 14,
    color: '#737373',
  },
  tokenPriceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  tokenPrice: {
    fontSize: 24,
    fontWeight: '600',
    color: '#D7D7D7',
  },
  priceChange: {
    fontSize: 14,
    fontWeight: '500',
  },
  positive: {
    color: '#4CAF50',
  },
  negative: {
    color: '#F44336',
  },
  button: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 6,
    marginVertical: 4,
    minWidth: 120,
    alignItems: 'center',
  },
  buttonPrimary: {
    backgroundColor: '#494C53',
  },
  buttonSecondary: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#494C53',
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  buttonTextPrimary: {
    color: '#D7D7D7',
  },
  buttonTextSecondary: {
    color: '#737373',
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginVertical: 4,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#D7D7D7',
  },
});

// Component source code for the library viewer
export const componentSourceCode = {
  TokenCard: `interface TokenCardProps {
  sym: string;
  name: string;
  price: number;
  change: number;
}

export const TokenCard = (props: Partial<TokenCardProps>) => {
  return (
    <Progressive props={props} metadata={tokenCardMetadata} theme={darkTheme}>
      <View style={styles.tokenCard}>
        <View style={styles.tokenHeader}>
          <Progressive.Field name="sym" skeleton={{ width: 60, height: 22 }}>
            {(val) => <Text style={styles.tokenSymbol}>{val}</Text>}
          </Progressive.Field>
          
          <Progressive.Field name="name" skeleton={{ width: 100, height: 18 }}>
            {(val) => <Text style={styles.tokenName}>{val}</Text>}
          </Progressive.Field>
        </View>
        
        <View style={styles.tokenPriceRow}>
          <Progressive.Field name="price" skeleton={{ width: 120, height: 28 }}>
            {(val) => (
              <Text style={styles.tokenPrice}>\${val.toLocaleString()}</Text>
            )}
          </Progressive.Field>
          
          <Progressive.Field name="change" skeleton={{ width: 70, height: 20 }}>
            {(val) => {
              const isPositive = val >= 0;
              return (
                <Text style={[styles.priceChange, isPositive ? styles.positive : styles.negative]}>
                  {isPositive ? '+' : ''}{val.toFixed(2)}%
                </Text>
              );
            }}
          </Progressive.Field>
        </View>
      </View>
    </Progressive>
  );
};`,

  Button: `interface ButtonProps {
  label: string;
  variant?: 'primary' | 'secondary';
}

export const Button = (props: Partial<ButtonProps>) => {
  const variant = props.variant || 'primary';
  
  return (
    <Progressive props={props} metadata={buttonMetadata} theme={darkTheme}>
      <TouchableOpacity
        style={[styles.button, variant === 'primary' ? styles.buttonPrimary : styles.buttonSecondary]}
        activeOpacity={0.7}
      >
        <Progressive.Field name="label" skeleton={{ width: 80, height: 18 }}>
          {(val) => (
            <Text style={[styles.buttonText, variant === 'primary' ? styles.buttonTextPrimary : styles.buttonTextSecondary]}>
              {val}
            </Text>
          )}
        </Progressive.Field>
      </TouchableOpacity>
    </Progressive>
  );
};`,

  Badge: `interface BadgeProps {
  text: string;
  color?: string;
}

export const Badge = (props: Partial<BadgeProps>) => {
  const color = props.color || '#494C53';
  
  return (
    <Progressive props={props} metadata={badgeMetadata} theme={darkTheme}>
      <View style={[styles.badge, { backgroundColor: color }]}>
        <Progressive.Field name="text" skeleton={{ width: 60, height: 16 }}>
          {(val) => <Text style={styles.badgeText}>{val}</Text>}
        </Progressive.Field>
      </View>
    </Progressive>
  );
};`,
};

// Create component registry with new compact prop names
export function createTestComponentRegistry(): ComponentRegistry {
  const components: ComponentDefinition[] = [
    {
      name: 'TokenCard',
      component: TokenCard,
      category: 'dynamic',
      description: 'Displays token information with progressive rendering',
      propsSchema: {
        type: 'object',
        properties: {
          sym: { type: 'string', description: 'Token symbol (e.g., BTC, ETH)' },
          name: { type: 'string', description: 'Full token name (e.g., Bitcoin)' },
          price: { type: 'number', description: 'Current price in USD' },
          change: { type: 'number', description: '24h price change percentage' },
        },
        required: ['sym', 'name'],
      },
      renderingMetadata: tokenCardMetadata,
    },
    {
      name: 'Button',
      component: Button,
      category: 'dynamic',
      description: 'A simple button component with progressive rendering',
      propsSchema: {
        type: 'object',
        properties: {
          label: { type: 'string', description: 'Button label text' },
          variant: { 
            type: 'string', 
            description: 'Button style variant',
            enum: ['primary', 'secondary'] 
          },
        },
        required: ['label'],
      },
      renderingMetadata: buttonMetadata,
    },
    {
      name: 'Badge',
      component: Badge,
      category: 'dynamic',
      description: 'A badge component with progressive rendering',
      propsSchema: {
        type: 'object',
        properties: {
          text: { type: 'string', description: 'Badge text content' },
          color: { type: 'string', description: 'Background color (hex)' },
        },
        required: ['text'],
      },
      renderingMetadata: badgeMetadata,
    },
  ];

  const componentMap = new Map(components.map(c => [c.name, c]));

  return {
    get(name: string) {
      return componentMap.get(name);
    },
    has(name: string) {
      return componentMap.has(name);
    },
    validate(name: string, props: any) {
      const def = componentMap.get(name);
      if (!def) {
        return { valid: false, errors: [`Component '${name}' not found`] };
      }

      const schema = def.propsSchema;
      const errors: string[] = [];

      if (schema.required) {
        for (const field of schema.required) {
          if (!(field in props)) {
            errors.push(`Missing required field: ${field}`);
          }
        }
      }

      return {
        valid: errors.length === 0,
        errors,
      };
    },
  };
}
