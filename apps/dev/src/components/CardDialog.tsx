import React from 'react';
import { View, Platform, Text } from 'react-native';
import { 
  Card, 
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  StyleSheet,
  useStyles,
} from '@darkresearch/design-system';
import type { StyleProp, ViewStyle } from 'react-native';

const styles = StyleSheet.create(() => ({
  container: {
    position: 'absolute',
    bottom: 72, // Above the FAB (56px FAB + 16px gap)
    right: 0,
    zIndex: 1000,
    elevation: 1000, // Android
    ...Platform.select({
      web: {
        pointerEvents: 'auto',
      },
    }),
  },
  card: {
    width: 320,
  },
  header: {
    flexDirection: 'row',
  },
  headerContent: {
    flex: 1,
    gap: 6,
  },
}));

interface CardDialogProps {
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  title?: string;
  description?: string;
}

export function CardDialog({ 
  title,
  description,
  children, 
  style 
}: CardDialogProps) {
  const { styles: themeStyles } = useStyles();

  return (
    <View style={themeStyles.container}>
      <Card style={[themeStyles.card, style]}>
        <CardHeader style={themeStyles.header}>
          <View style={themeStyles.headerContent}>
            <CardTitle>{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </View>
        </CardHeader>
        <CardContent>
          {children || <Text>Empty card for now - just testing visibility</Text>}
        </CardContent>
      </Card>
    </View>
  );
}

