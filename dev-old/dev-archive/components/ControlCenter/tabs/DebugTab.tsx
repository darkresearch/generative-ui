import React, { useState } from 'react';
import { ScrollView, View, StyleSheet } from 'react-native';
import { Text, Card, Chip, Button } from 'react-native-paper';
import { useDebugData } from '../../../contexts/DebugContext';

// Color mapping for tag types
const TAG_COLORS: Record<string, string> = {
  bold: '#FF6B6B',
  italic: '#4ECDC4',
  code: '#FFE66D',
  codeBlock: '#95E1D3',
  link: '#A8E6CF',
  component: '#C7CEEA',
};

export function DebugTab() {
  const { debugState: state, currentText, componentExtractionState } = useDebugData();
  const [showJSONCleanup, setShowJSONCleanup] = useState(false);

  if (!state) {
    return (
      <View style={styles.emptyContainer}>
        <Text variant="bodyLarge" style={styles.emptyText}>
          No debug data available
        </Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Component Extraction State */}
      {componentExtractionState && (
        <Card>
          <Card.Content>
            <Text variant="titleMedium" style={styles.cardTitle}>Component Extraction</Text>
            
            {/* Empty Components */}
            <View style={styles.extractionSection}>
              <Text variant="labelLarge">Empty Components: {componentExtractionState.emptyComponents.length}</Text>
              {componentExtractionState.emptyComponents.length > 0 && (
                <View style={styles.componentList}>
                  {componentExtractionState.emptyComponents.map((name, idx) => (
                    <View key={idx} style={[styles.componentItem, styles.emptyComponent]}>
                      <Text variant="bodyMedium" style={styles.componentName}>{name}</Text>
                      <Text variant="bodySmall" style={styles.componentFields}>No fields yet</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>

            {/* Partial Components */}
            <View style={styles.extractionSection}>
              <Text variant="labelLarge">Partial Components: {componentExtractionState.partialComponents.length}</Text>
              {componentExtractionState.partialComponents.length > 0 && (
                <View style={styles.componentList}>
                  {componentExtractionState.partialComponents.map((comp, idx) => (
                    <View key={idx} style={[styles.componentItem, styles.partialComponent]}>
                      <Text variant="bodyMedium" style={styles.componentName}>{comp.name}</Text>
                      <Text variant="bodySmall" style={styles.componentFields}>
                        Fields: {comp.fields.join(', ')}
                      </Text>
                    </View>
                  ))}
                </View>
              )}
            </View>

            {/* Complete Components */}
            <View style={styles.extractionSection}>
              <Text variant="labelLarge">Complete Components: {componentExtractionState.completeComponents.length}</Text>
              {componentExtractionState.completeComponents.length > 0 && (
                <View style={styles.componentList}>
                  {componentExtractionState.completeComponents.map((comp, idx) => (
                    <View key={idx} style={[styles.componentItem, styles.completeComponent]}>
                      <Text variant="bodyMedium" style={styles.componentName}>{comp.name}</Text>
                      <Text variant="bodySmall" style={styles.componentFields}>
                        Fields: {comp.fields.join(', ')}
                      </Text>
                    </View>
                  ))}
                </View>
              )}
            </View>

            {/* JSON Cleanup Details */}
            {componentExtractionState.lastJSONCleanup && (
              <View style={styles.extractionSection}>
                <Button
                  mode="outlined"
                  onPress={() => setShowJSONCleanup(!showJSONCleanup)}
                  compact
                  style={styles.toggleButton}
                >
                  {showJSONCleanup ? 'Hide' : 'Show'} JSON Cleanup Details
                </Button>
                
                {showJSONCleanup && (
                  <View style={styles.jsonCleanupSection}>
                    <View style={[
                      styles.jsonBox,
                      componentExtractionState.lastJSONCleanup.success ? styles.jsonSuccess : styles.jsonError
                    ]}>
                      <Text variant="labelSmall" style={styles.jsonLabel}>Original:</Text>
                      <Text variant="bodySmall" style={styles.jsonCode}>
                        {componentExtractionState.lastJSONCleanup.original}
                      </Text>
                    </View>

                    {componentExtractionState.lastJSONCleanup.steps.length > 0 && (
                      <View style={styles.cleanupSteps}>
                        {componentExtractionState.lastJSONCleanup.steps.map((step, idx) => (
                          <View key={idx} style={styles.cleanupStep}>
                            <View style={styles.stepNumber}>
                              <Text variant="labelSmall" style={styles.stepNumberText}>{idx + 1}</Text>
                            </View>
                            <View style={styles.stepContent}>
                              <Text variant="labelMedium">{step.step}</Text>
                              <Text variant="bodySmall" style={styles.stepBefore}>Before: {step.before}</Text>
                              <Text variant="bodySmall" style={styles.stepAfter}>After: {step.after}</Text>
                            </View>
                          </View>
                        ))}
                      </View>
                    )}

                    <View style={[
                      styles.jsonBox,
                      componentExtractionState.lastJSONCleanup.success ? styles.jsonSuccess : styles.jsonError
                    ]}>
                      <Text variant="labelSmall" style={styles.jsonLabel}>Final:</Text>
                      <Text variant="bodySmall" style={styles.jsonCode}>
                        {componentExtractionState.lastJSONCleanup.final}
                      </Text>
                      {componentExtractionState.lastJSONCleanup.success ? (
                        <Text variant="bodySmall" style={styles.jsonStatusSuccess}>✓ Parsed successfully</Text>
                      ) : (
                        <Text variant="bodySmall" style={styles.jsonStatusError}>
                          ✗ Parse failed: {componentExtractionState.lastJSONCleanup.error}
                        </Text>
                      )}
                    </View>
                  </View>
                )}
              </View>
            )}
          </Card.Content>
        </Card>
      )}

      {/* Stats Card */}
      <Card>
        <Card.Content>
          <Text variant="titleMedium" style={styles.cardTitle}>Markdown Tags</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text variant="bodySmall" style={styles.statLabel}>Text Length</Text>
              <Text variant="bodyLarge">{currentText.length}</Text>
            </View>
            <View style={styles.statItem}>
              <Text variant="bodySmall" style={styles.statLabel}>Stack Depth</Text>
              <Text variant="bodyLarge">{state.stack.length}</Text>
            </View>
            <View style={styles.statItem}>
              <Text variant="bodySmall" style={styles.statLabel}>Earliest Position</Text>
              <Text variant="bodyLarge">{state.earliestPosition}</Text>
            </View>
            <View style={styles.statItem}>
              <Text variant="bodySmall" style={styles.statLabel}>Processing Length</Text>
              <Text variant="bodyLarge">{currentText.length - state.earliestPosition}</Text>
            </View>
          </View>
        </Card.Content>
      </Card>

      {/* Tag Stack */}
      <Card>
        <Card.Content>
          <Text variant="titleMedium" style={styles.cardTitle}>
            Tag Stack ({state.stack.length})
          </Text>
          {state.stack.length === 0 ? (
            <Text variant="bodyMedium" style={styles.emptyText}>No incomplete tags</Text>
          ) : (
            <View style={styles.stackContainer}>
              {state.stack.map((tag, index) => (
                <Card key={index} mode="outlined" style={styles.stackItem}>
                  <Card.Content>
                    <View style={styles.stackItemHeader}>
                      <Chip 
                        mode="flat" 
                        style={{ backgroundColor: TAG_COLORS[tag.type] || '#ccc' }}
                        textStyle={styles.chipText}
                      >
                        {tag.type}
                      </Chip>
                      <Text variant="bodySmall">pos: {tag.position}</Text>
                    </View>
                    {tag.openingText && (
                      <Text variant="bodySmall" numberOfLines={1} style={styles.openingText}>
                        "{tag.openingText}"
                      </Text>
                    )}
                  </Card.Content>
                </Card>
              ))}
            </View>
          )}
        </Card.Content>
      </Card>

      {/* Tag Counts */}
      <Card>
        <Card.Content>
          <Text variant="titleMedium" style={styles.cardTitle}>Tag Counts</Text>
          <View style={styles.tagCountsGrid}>
            {Object.entries(state.tagCounts).map(([type, count]) => (
              <View key={type} style={styles.tagCountItem}>
                <Chip 
                  mode="flat" 
                  style={{ backgroundColor: TAG_COLORS[type] || '#ccc' }}
                  textStyle={styles.chipText}
                >
                  {type}
                </Chip>
                <Text variant="bodyLarge">{count}</Text>
              </View>
            ))}
          </View>
        </Card.Content>
      </Card>

      {/* Processing Boundary */}
      <Card>
        <Card.Content>
          <Text variant="titleMedium" style={styles.cardTitle}>Processing Boundary</Text>
          {state.earliestPosition > 0 ? (
            <View style={styles.boundaryVisualization}>
              <View style={styles.processedPortion}>
                <Text variant="labelSmall" style={styles.portionLabel}>SKIPPED (CACHED)</Text>
                <ScrollView horizontal style={styles.portionScroll}>
                  <Text variant="bodySmall" style={styles.portionText}>
                    {currentText.slice(0, state.earliestPosition)}
                  </Text>
                </ScrollView>
                <Text variant="bodySmall" style={styles.portionSize}>
                  {state.earliestPosition} chars
                </Text>
              </View>
              
              <View style={styles.boundarySeparator} />
              
              <View style={styles.processingPortion}>
                <Text variant="labelSmall" style={styles.portionLabel}>PROCESSING</Text>
                <ScrollView horizontal style={styles.portionScroll}>
                  <Text variant="bodySmall" style={styles.portionText}>
                    {currentText.slice(state.earliestPosition)}
                  </Text>
                </ScrollView>
                <Text variant="bodySmall" style={styles.portionSize}>
                  {currentText.length - state.earliestPosition} chars
                </Text>
              </View>
            </View>
          ) : state.earliestPosition === 0 && currentText.length > 0 ? (
            <Text variant="bodyMedium" style={styles.emptyText}>Processing entire text (no cached portion)</Text>
          ) : (
            <Text variant="bodyMedium" style={styles.emptyText}>No text</Text>
          )}
        </Card.Content>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    gap: 16,
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
  cardTitle: {
    marginBottom: 12,
  },
  extractionSection: {
    marginBottom: 16,
  },
  componentList: {
    marginTop: 8,
    gap: 6,
  },
  componentItem: {
    borderRadius: 6,
    padding: 10,
    borderLeftWidth: 3,
  },
  emptyComponent: {
    backgroundColor: '#FEF3C7',
    borderLeftColor: '#F59E0B',
  },
  partialComponent: {
    backgroundColor: '#DBEAFE',
    borderLeftColor: '#3B82F6',
  },
  completeComponent: {
    backgroundColor: '#D1FAE5',
    borderLeftColor: '#10B981',
  },
  componentName: {
    fontWeight: '600',
    marginBottom: 4,
  },
  componentFields: {
    fontFamily: 'monospace',
    opacity: 0.8,
  },
  toggleButton: {
    marginTop: 8,
  },
  jsonCleanupSection: {
    marginTop: 12,
    gap: 8,
  },
  jsonBox: {
    borderRadius: 6,
    padding: 10,
    borderWidth: 1,
  },
  jsonSuccess: {
    backgroundColor: '#F0FDF4',
    borderColor: '#BBF7D0',
  },
  jsonError: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
  },
  jsonLabel: {
    fontWeight: '600',
    opacity: 0.6,
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  jsonCode: {
    fontFamily: 'monospace',
    marginBottom: 6,
  },
  jsonStatusSuccess: {
    color: '#16A34A',
    fontWeight: '500',
  },
  jsonStatusError: {
    color: '#DC2626',
  },
  cleanupSteps: {
    gap: 6,
  },
  cleanupStep: {
    flexDirection: 'row',
    gap: 8,
    backgroundColor: '#F9FAFB',
    borderRadius: 4,
    padding: 8,
  },
  stepNumber: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#6B7280',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumberText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
  },
  stepContent: {
    flex: 1,
    gap: 2,
  },
  stepBefore: {
    fontFamily: 'monospace',
    color: '#DC2626',
  },
  stepAfter: {
    fontFamily: 'monospace',
    color: '#16A34A',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  statItem: {
    flex: 1,
    minWidth: '45%',
  },
  statLabel: {
    opacity: 0.6,
    marginBottom: 4,
  },
  stackContainer: {
    gap: 8,
  },
  stackItem: {
    marginBottom: 0,
  },
  stackItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  chipText: {
    fontSize: 12,
  },
  openingText: {
    fontFamily: 'monospace',
    opacity: 0.6,
    fontStyle: 'italic',
  },
  tagCountsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  tagCountItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  boundaryVisualization: {
    gap: 8,
  },
  processedPortion: {
    backgroundColor: '#F0F9FF',
    borderRadius: 8,
    padding: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#93C5FD',
  },
  boundarySeparator: {
    height: 2,
    backgroundColor: '#E5E5E5',
    marginVertical: 4,
  },
  processingPortion: {
    backgroundColor: '#FFF7ED',
    borderRadius: 8,
    padding: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#FDBA74',
  },
  portionLabel: {
    fontWeight: '600',
    opacity: 0.6,
    marginBottom: 6,
  },
  portionScroll: {
    maxHeight: 100,
    marginBottom: 6,
  },
  portionText: {
    fontFamily: 'monospace',
  },
  portionSize: {
    opacity: 0.6,
  },
});
