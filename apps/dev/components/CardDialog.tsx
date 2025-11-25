import React from 'react';
import { View, StyleSheet, Platform, Text } from 'react-native';
import { Card, CardContent } from '@darkresearch/design-system';

interface CardDialogProps {
  children?: React.ReactNode;
}

export function CardDialog({ children }: CardDialogProps) {
  // #region agent log
  React.useEffect(() => {
    fetch('http://127.0.0.1:7242/ingest/ba72c841-4600-456b-adad-25adf0868af7',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'CardDialog.tsx:CardDialog',message:'CardDialog component rendering',data:{platform:Platform.OS,hasChildren:!!children},timestamp:Date.now(),sessionId:'debug-session',runId:'card-dialog-shared',hypothesisId:'A'})}).catch(()=>{});
  }, [children]);
  // #endregion

  return (
    <View style={cardDialogStyles.container}>
      <Card style={{ width: 320 }}>
        <CardContent>
          {children || <Text>Empty card for now - just testing visibility</Text>}
        </CardContent>
      </Card>
    </View>
  );
}

const cardDialogStyles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 72, // Above the FAB (56px FAB + 16px gap)
    right: 0,
    zIndex: 1000,
    elevation: 1000, // Android
    ...(Platform.OS === 'web' && {
      // Ensure it's visible on web
      pointerEvents: 'auto',
    }),
  },
});

