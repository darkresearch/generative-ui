import React, { useState } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Text, SegmentedButtons, Card } from 'react-native-paper';
import { useDebugData } from '../../../contexts/DebugContext';

export function ComponentsTab() {
  const { components } = useDebugData();
  const [selectedComponent, setSelectedComponent] = useState<string>(
    components.length > 0 ? components[0].name : ''
  );

  const selectedComponentData = components.find(c => c.name === selectedComponent);

  if (components.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text variant="bodyLarge" style={styles.emptyText}>
          No components available
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Component Selector */}
      <View style={styles.selectorContainer}>
        <Text variant="labelLarge" style={styles.selectorLabel}>Select Component</Text>
        <SegmentedButtons
          value={selectedComponent}
          onValueChange={setSelectedComponent}
          buttons={components.map(comp => ({
            value: comp.name,
            label: comp.name,
          }))}
          style={styles.segmentedButtons}
        />
      </View>

      {/* Component Details */}
      {selectedComponentData && (
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
          {selectedComponentData.description && (
            <Card>
              <Card.Content>
                <Text variant="titleMedium" style={styles.cardTitle}>Description</Text>
                <Text variant="bodyMedium">{selectedComponentData.description}</Text>
              </Card.Content>
            </Card>
          )}

          <Card>
            <Card.Content>
              <Text variant="titleMedium" style={styles.cardTitle}>Source Code</Text>
              <ScrollView horizontal>
                <Text variant="bodySmall" style={styles.codeText}>
                  {selectedComponentData.code}
                </Text>
              </ScrollView>
            </Card.Content>
          </Card>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    opacity: 0.6,
    textAlign: 'center',
  },
  selectorContainer: {
    padding: 16,
    gap: 8,
  },
  selectorLabel: {
    marginBottom: 4,
  },
  segmentedButtons: {
    marginBottom: 0,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingTop: 0,
    gap: 16,
  },
  cardTitle: {
    marginBottom: 8,
  },
  codeText: {
    fontFamily: 'monospace',
    fontSize: 12,
    lineHeight: 18,
  },
});

