import React from 'react';
import { ScrollView, View } from 'react-native';
import { Card, CardHeader, CardTitle, CardContent, Text } from '@darkresearch/design-system';
import { useDebugData } from '../contexts/DebugContext';

export function DebugPopover() {
  const { debugState, currentText, componentExtractionState } = useDebugData();

  if (!debugState) {
    return (
      <View className="p-4">
        <Text className="text-center opacity-60">No debug data available</Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1" contentContainerStyle={{ gap: 16 }}>
      {/* Component Extraction State */}
      {componentExtractionState && (
        <Card>
          <CardHeader>
            <CardTitle>Component Extraction</CardTitle>
          </CardHeader>
          <CardContent className="gap-4">
            <View>
              <Text className="text-sm font-medium mb-2">
                Empty: {componentExtractionState.emptyComponents.length}
              </Text>
              {componentExtractionState.emptyComponents.length > 0 && (
                <View className="gap-1">
                  {componentExtractionState.emptyComponents.map((name, idx) => (
                    <View key={idx} className="bg-yellow-100 dark:bg-yellow-900/20 p-2 rounded">
                      <Text className="text-sm">{name}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>

            <View>
              <Text className="text-sm font-medium mb-2">
                Partial: {componentExtractionState.partialComponents.length}
              </Text>
              {componentExtractionState.partialComponents.length > 0 && (
                <View className="gap-1">
                  {componentExtractionState.partialComponents.map((comp, idx) => (
                    <View key={idx} className="bg-blue-100 dark:bg-blue-900/20 p-2 rounded">
                      <Text className="text-sm font-medium">{comp.name}</Text>
                      <Text className="text-xs opacity-60">Fields: {comp.fields.join(', ')}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>

            <View>
              <Text className="text-sm font-medium mb-2">
                Complete: {componentExtractionState.completeComponents.length}
              </Text>
              {componentExtractionState.completeComponents.length > 0 && (
                <View className="gap-1">
                  {componentExtractionState.completeComponents.map((comp, idx) => (
                    <View key={idx} className="bg-green-100 dark:bg-green-900/20 p-2 rounded">
                      <Text className="text-sm font-medium">{comp.name}</Text>
                      <Text className="text-xs opacity-60">Fields: {comp.fields.join(', ')}</Text>
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
          <View className="flex-row flex-wrap gap-4">
            <View>
              <Text className="text-xs opacity-60">Text Length</Text>
              <Text className="text-lg">{currentText.length}</Text>
            </View>
            <View>
              <Text className="text-xs opacity-60">Stack Depth</Text>
              <Text className="text-lg">{debugState.stack.length}</Text>
            </View>
            <View>
              <Text className="text-xs opacity-60">Earliest Position</Text>
              <Text className="text-lg">{debugState.earliestPosition}</Text>
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
            <Text className="opacity-60">No incomplete tags</Text>
          ) : (
            <View className="gap-2">
              {debugState.stack.map((tag, index) => (
                <View key={index} className="border border-slate-200 dark:border-slate-800 p-2 rounded">
                  <View className="flex-row justify-between items-center mb-1">
                    <Text className="text-sm font-medium">{tag.type}</Text>
                    <Text className="text-xs opacity-60">pos: {tag.position}</Text>
                  </View>
                  {tag.openingText && (
                    <Text className="text-xs opacity-60 font-mono">"{tag.openingText}"</Text>
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
          <View className="flex-row flex-wrap gap-2">
            {Object.entries(debugState.tagCounts).map(([type, count]) => (
              <View key={type} className="flex-row items-center gap-2 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
                <Text className="text-xs font-medium">{type}</Text>
                <Text className="text-sm">{count}</Text>
              </View>
            ))}
          </View>
        </CardContent>
      </Card>
    </ScrollView>
  );
}

