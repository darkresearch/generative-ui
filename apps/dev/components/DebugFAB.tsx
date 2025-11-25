import React, { useState } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { FAB, Bug } from '@darkresearch/design-system';
import { CardDialog } from './CardDialog';

export function DebugFAB() {
  const [isOpen, setIsOpen] = useState(false);

  const handlePress = () => {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/ba72c841-4600-456b-adad-25adf0868af7',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'DebugFAB.tsx:handlePress',message:'FAB pressed',data:{wasOpen:isOpen,willBeOpen:!isOpen,platform:Platform.OS},timestamp:Date.now(),sessionId:'debug-session',runId:'simple-card-test',hypothesisId:'A'})}).catch(()=>{});
    // #endregion
    setIsOpen(!isOpen);
  };

  // #region agent log
  React.useEffect(() => {
    fetch('http://127.0.0.1:7242/ingest/ba72c841-4600-456b-adad-25adf0868af7',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'DebugFAB.tsx:useEffect',message:'Dialog state changed',data:{isOpen,platform:Platform.OS},timestamp:Date.now(),sessionId:'debug-session',runId:'simple-card-test',hypothesisId:'B'})}).catch(()=>{});
  }, [isOpen]);
  // #endregion

  return (
    <View style={styles.container}>
      <FAB
        icon={<Bug size={20} color="#EEEDED" strokeWidth={1.5} />}
        onPress={handlePress}
      />
      {isOpen && <CardDialog />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    ...(Platform.OS === 'web' && {
      overflow: 'visible',
    }),
  },
});

