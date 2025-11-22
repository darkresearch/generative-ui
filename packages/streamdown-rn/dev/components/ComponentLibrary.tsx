import React, { useState } from 'react';
import { View, Text, TextInput, ScrollView, StyleSheet, TouchableOpacity, Platform } from 'react-native';

interface ComponentLibraryProps {
  components: Array<{
    name: string;
    code: string;
    description?: string;
  }>;
  onClose: () => void;
}

export const ComponentLibrary: React.FC<ComponentLibraryProps> = ({ components, onClose }) => {
  const [selectedComponent, setSelectedComponent] = useState<string | null>(
    components.length > 0 ? components[0].name : null
  );

  const selectedComponentData = components.find(c => c.name === selectedComponent);

  return (
    <View style={styles.overlay}>
      <View style={styles.panel}>
        <View style={styles.header}>
          <Text style={styles.title}>Component Library</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          {/* Component list sidebar */}
          <View style={styles.sidebar}>
            <Text style={styles.sidebarTitle}>Components</Text>
            <ScrollView style={styles.componentList}>
              {components.map((component) => (
                <TouchableOpacity
                  key={component.name}
                  style={[
                    styles.componentItem,
                    selectedComponent === component.name && styles.componentItemActive,
                  ]}
                  onPress={() => setSelectedComponent(component.name)}
                >
                  <Text
                    style={[
                      styles.componentItemText,
                      selectedComponent === component.name && styles.componentItemTextActive,
                    ]}
                  >
                    {component.name}
                  </Text>
                  {component.description && (
                    <Text style={styles.componentItemDescription}>
                      {component.description}
                    </Text>
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Code viewer */}
          <View style={styles.codeViewer}>
            {selectedComponentData ? (
              <>
                <View style={styles.codeHeader}>
                  <Text style={styles.componentName}>{selectedComponentData.name}</Text>
                  {selectedComponentData.description && (
                    <Text style={styles.componentDescription}>
                      {selectedComponentData.description}
                    </Text>
                  )}
                </View>
                <ScrollView style={styles.codeScroll} contentContainerStyle={styles.codeScrollContent}>
                  <Text style={styles.codeText}>
                    {selectedComponentData.code}
                  </Text>
                </ScrollView>
              </>
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>No component selected</Text>
              </View>
            )}
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 1000,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  panel: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    width: '90%',
    maxWidth: 1200,
    height: '80%',
    maxHeight: 800,
    overflow: 'hidden',
    ...Platform.select({
      web: {
        boxShadow: '0 10px 40px rgba(0, 0, 0, 0.2)',
      },
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.2,
        shadowRadius: 20,
        elevation: 10,
      },
    }),
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2A2A2A',
  },
  closeButton: {
    padding: 4,
  },
  closeButtonText: {
    fontSize: 24,
    color: '#737373',
  },
  content: {
    flex: 1,
    flexDirection: 'row',
  },
  sidebar: {
    width: 200,
    borderRightWidth: 1,
    borderRightColor: '#E5E5E5',
    backgroundColor: '#FAFAFA',
  },
  sidebarTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#737373',
    padding: 16,
    paddingBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  componentList: {
    flex: 1,
  },
  componentItem: {
    padding: 12,
    paddingLeft: 16,
    borderLeftWidth: 3,
    borderLeftColor: 'transparent',
  },
  componentItemActive: {
    backgroundColor: '#FFFFFF',
    borderLeftColor: '#494C53',
  },
  componentItemText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#2A2A2A',
    marginBottom: 2,
  },
  componentItemTextActive: {
    color: '#494C53',
  },
  componentItemDescription: {
    fontSize: 11,
    color: '#737373',
    lineHeight: 14,
  },
  codeViewer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    flexDirection: 'column',
  },
  codeHeader: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
    flexShrink: 0,
  },
  componentName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2A2A2A',
    marginBottom: 4,
  },
  componentDescription: {
    fontSize: 14,
    color: '#737373',
  },
  codeScroll: {
    flex: 1,
  },
  codeScrollContent: {
    flexGrow: 1,
  },
  codeText: {
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: 13,
    lineHeight: 20,
    color: '#2A2A2A',
    padding: 20,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 14,
    color: '#737373',
  },
});

