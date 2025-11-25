import React, { useState } from 'react';
import { View, Platform, Text } from 'react-native';
import { FAB, Bug, StyleSheet, useStyles } from '@darkresearch/design-system';
import { CardDialog } from './CardDialog';

const styles = StyleSheet.create(() => ({
  container: {
    position: 'relative',
    ...Platform.select({
      web: {
        overflow: 'visible',
      },
    }),
  },
}));

function DebugFABDialog() {
  return (
    <CardDialog 
      title="Controls"
      description="Manage playback configuration"
    >
      <Text>Test</Text>
    </CardDialog>
  );
}

export function DebugFAB() {
  const [isOpen, setIsOpen] = useState(false);
  const { styles: themeStyles } = useStyles();

  const handlePress = () => {
    setIsOpen(!isOpen);
  };

  return (
    <View style={themeStyles.container}>
      <FAB
        icon={<Bug size={20} color="#EEEDED" strokeWidth={1.5} />}
        onPress={handlePress}
      />
      {isOpen && <DebugFABDialog />}
    </View>
  );
}

