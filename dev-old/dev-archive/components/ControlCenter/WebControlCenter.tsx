import React, { useState } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { TabView, SceneMap, TabBar } from 'react-native-tab-view';
import { ControlsTab } from './tabs/ControlsTab';
import { DebugTab } from './tabs/DebugTab';
import { ComponentsTab } from './tabs/ComponentsTab';

interface WebControlCenterProps {
  // Controls Tab Props
  selectedPreset: string;
  onPresetChange: (preset: string) => void;
  theme: 'dark' | 'light';
  onThemeChange: (theme: 'dark' | 'light') => void;
  streamSpeed: number;
  onSpeedChange: (speed: number) => void;
  isStreaming: boolean;
  isPaused: boolean;
  streamingLength: number;
  markdownLength: number;
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onReset: () => void;
  onStepBackward: () => void;
  onStepForward: () => void;
  // Panel width callback
  onPanelWidthChange?: (width: number) => void;
}

export function WebControlCenter(props: WebControlCenterProps) {
  const [panelWidth, setPanelWidth] = useState(280);
  const [isDragging, setIsDragging] = useState(false);
  
  const [tabIndex, setTabIndex] = useState(0);
  const [routes] = useState([
    { key: 'controls', title: 'Controls' },
    { key: 'debug', title: 'Debug' },
    { key: 'components', title: 'Comps' },
  ]);

  const handleMouseDown = (e: any) => {
    if (Platform.OS === 'web') {
      setIsDragging(true);
      e.preventDefault();
    }
  };

  const handleMouseMove = (e: any) => {
    if (isDragging && Platform.OS === 'web') {
      const newWidth = window.innerWidth - e.clientX;
      if (newWidth >= 200 && newWidth <= 600) {
        setPanelWidth(newWidth);
        if (props.onPanelWidthChange) {
          props.onPanelWidthChange(newWidth);
        }
      }
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  React.useEffect(() => {
    if (Platform.OS === 'web') {
      if (isDragging) {
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
        return () => {
          window.removeEventListener('mousemove', handleMouseMove);
          window.removeEventListener('mouseup', handleMouseUp);
        };
      }
    }
  }, [isDragging]);

  const renderScene = SceneMap({
    controls: () => (
      <ControlsTab
        selectedPreset={props.selectedPreset}
        onPresetChange={props.onPresetChange}
        theme={props.theme}
        onThemeChange={props.onThemeChange}
        streamSpeed={props.streamSpeed}
        onSpeedChange={props.onSpeedChange}
        isStreaming={props.isStreaming}
        isPaused={props.isPaused}
        streamingLength={props.streamingLength}
        markdownLength={props.markdownLength}
        onStart={props.onStart}
        onPause={props.onPause}
        onResume={props.onResume}
        onReset={props.onReset}
        onStepBackward={props.onStepBackward}
        onStepForward={props.onStepForward}
      />
    ),
    debug: () => <DebugTab />,
    components: () => <ComponentsTab />,
  });

  const renderTabBar = (tabBarProps: any) => (
    <TabBar
      {...tabBarProps}
      indicatorStyle={styles.tabIndicator}
      style={styles.tabBar}
      labelStyle={styles.tabLabel}
      activeColor="#494C53"
      inactiveColor="#737373"
    />
  );

  return (
    <View style={[styles.container, { width: panelWidth }]}>
      {/* Draggable resize handle */}
      <View 
        style={[styles.resizeHandle, isDragging && styles.resizeHandleActive]}
        onMouseDown={handleMouseDown}
      >
        <View style={styles.resizeIndicator} />
      </View>

      {/* Tab content */}
      <TabView
        navigationState={{ index: tabIndex, routes }}
        renderScene={renderScene}
        onIndexChange={setTabIndex}
        renderTabBar={renderTabBar}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0, // Start from top now that header is gone
    right: 0,
    bottom: 0,
    backgroundColor: '#FFFFFF',
    borderLeftWidth: 1,
    borderLeftColor: '#E5E5E5',
    zIndex: 1000,
  },
  resizeHandle: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 8,
    cursor: 'col-resize',
    zIndex: 10,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
  resizeHandleActive: {
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
  resizeIndicator: {
    width: 2,
    height: 40,
    backgroundColor: '#E5E5E5',
    borderRadius: 1,
  },
  tabBar: {
    backgroundColor: '#FFFFFF',
  },
  tabIndicator: {
    backgroundColor: '#494C53',
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: '500',
    textTransform: 'none',
  },
});
