import React from 'react';
import { ScrollView, View, Text } from 'react-native';
import { Card, CardHeader, CardTitle, CardContent, StyleSheet, useStyles } from '@darkresearch/design-system';
import { useDebugData } from '../contexts/DebugContext';

const styles = StyleSheet.create((theme) => ({
  scrollContent: {
    gap: 16,
  },
  emptyState: {
    padding: 16,
  },
  emptyText: {
    textAlign: 'center',
    opacity: 0.6,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: theme.typography.fontWeight.medium,
    marginBottom: 8,
  },
  componentList: {
    gap: 4,
  },
  emptyComponent: {
    backgroundColor: '#FEF3C7', // yellow-100
    padding: 8,
    borderRadius: 4,
  },
  partialComponent: {
    backgroundColor: '#DBEAFE', // blue-100
    padding: 8,
    borderRadius: 4,
  },
  completeComponent: {
    backgroundColor: '#D1FAE5', // green-100
    padding: 8,
    borderRadius: 4,
  },
  componentName: {
    fontSize: 14,
    fontWeight: theme.typography.fontWeight.medium,
  },
  componentFields: {
    fontSize: 12,
    opacity: 0.6,
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  statItem: {
    gap: 4,
  },
  statLabel: {
    fontSize: 12,
    opacity: 0.6,
  },
  statValue: {
    fontSize: 18,
  },
  tagStack: {
    gap: 8,
  },
  tagItem: {
    borderWidth: 1,
    borderColor: theme.colors.slate[200],
    padding: 8,
    borderRadius: 4,
  },
  tagHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  tagType: {
    fontSize: 14,
    fontWeight: theme.typography.fontWeight.medium,
  },
  tagPosition: {
    fontSize: 12,
    opacity: 0.6,
  },
  tagText: {
    fontSize: 12,
    opacity: 0.6,
    fontFamily: theme.typography.fontFamily.mono,
  },
  tagCountsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tagCountItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: theme.colors.slate[100],
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  tagCountLabel: {
    fontSize: 12,
    fontWeight: theme.typography.fontWeight.medium,
  },
  tagCountValue: {
    fontSize: 14,
  },
  noTagsText: {
    opacity: 0.6,
  },
}));

export function DebugPopover() {
  const { debugState, currentText, componentExtractionState } = useDebugData();
  const { styles: themeStyles } = useStyles();

  if (!debugState) {
    return (
      <View style={themeStyles.emptyState}>
        <Text style={themeStyles.emptyText}>No debug data available</Text>
      </View>
    );
  }

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={themeStyles.scrollContent}>
      {/* Component Extraction State */}
      {componentExtractionState && (
        <Card>
          <CardHeader>
            <CardTitle>Component Extraction</CardTitle>
          </CardHeader>
          <CardContent style={themeStyles.section}>
            <View style={themeStyles.section}>
              <Text style={themeStyles.sectionTitle}>
                Empty: {componentExtractionState.emptyComponents.length}
              </Text>
              {componentExtractionState.emptyComponents.length > 0 && (
                <View style={themeStyles.componentList}>
                  {componentExtractionState.emptyComponents.map((name, idx) => (
                    <View key={idx} style={themeStyles.emptyComponent}>
                      <Text style={themeStyles.componentName}>{name}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>

            <View style={themeStyles.section}>
              <Text style={themeStyles.sectionTitle}>
                Partial: {componentExtractionState.partialComponents.length}
              </Text>
              {componentExtractionState.partialComponents.length > 0 && (
                <View style={themeStyles.componentList}>
                  {componentExtractionState.partialComponents.map((comp, idx) => (
                    <View key={idx} style={themeStyles.partialComponent}>
                      <Text style={themeStyles.componentName}>{comp.name}</Text>
                      <Text style={themeStyles.componentFields}>Fields: {comp.fields.join(', ')}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>

            <View style={themeStyles.section}>
              <Text style={themeStyles.sectionTitle}>
                Complete: {componentExtractionState.completeComponents.length}
              </Text>
              {componentExtractionState.completeComponents.length > 0 && (
                <View style={themeStyles.componentList}>
                  {componentExtractionState.completeComponents.map((comp, idx) => (
                    <View key={idx} style={themeStyles.completeComponent}>
                      <Text style={themeStyles.componentName}>{comp.name}</Text>
                      <Text style={themeStyles.componentFields}>Fields: {comp.fields.join(', ')}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          </CardContent>
        </Card>
      )}

      {/* Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Stats</CardTitle>
        </CardHeader>
        <CardContent>
          <View style={themeStyles.statsContainer}>
            <View style={themeStyles.statItem}>
              <Text style={themeStyles.statLabel}>Text Length</Text>
              <Text style={themeStyles.statValue}>{currentText.length}</Text>
            </View>
            <View style={themeStyles.statItem}>
              <Text style={themeStyles.statLabel}>Stack Depth</Text>
              <Text style={themeStyles.statValue}>{debugState.stack.length}</Text>
            </View>
            <View style={themeStyles.statItem}>
              <Text style={themeStyles.statLabel}>Earliest Position</Text>
              <Text style={themeStyles.statValue}>{debugState.earliestPosition}</Text>
            </View>
          </View>
        </CardContent>
      </Card>

      {/* Tag Stack */}
      <Card>
        <CardHeader>
          <CardTitle>Tag Stack ({debugState.stack.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {debugState.stack.length === 0 ? (
            <Text style={themeStyles.noTagsText}>No incomplete tags</Text>
          ) : (
            <View style={themeStyles.tagStack}>
              {debugState.stack.map((tag, index) => (
                <View key={index} style={themeStyles.tagItem}>
                  <View style={themeStyles.tagHeader}>
                    <Text style={themeStyles.tagType}>{tag.type}</Text>
                    <Text style={themeStyles.tagPosition}>pos: {tag.position}</Text>
                  </View>
                  {tag.openingText && (
                    <Text style={themeStyles.tagText}>"{tag.openingText}"</Text>
                  )}
                </View>
              ))}
            </View>
          )}
        </CardContent>
      </Card>

      {/* Tag Counts */}
      <Card>
        <CardHeader>
          <CardTitle>Tag Counts</CardTitle>
        </CardHeader>
        <CardContent>
          <View style={themeStyles.tagCountsContainer}>
            {Object.entries(debugState.tagCounts).map(([type, count]) => (
              <View key={type} style={themeStyles.tagCountItem}>
                <Text style={themeStyles.tagCountLabel}>{type}</Text>
                <Text style={themeStyles.tagCountValue}>{count}</Text>
              </View>
            ))}
          </View>
        </CardContent>
      </Card>
    </ScrollView>
  );
}
