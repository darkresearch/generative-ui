import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Modal, Portal } from 'react-native-paper';
import { TabView, SceneMap, TabBar } from 'react-native-tab-view';
import { FAB } from '@darkresearch/design-system';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { 
  Settings01Icon,
  PauseIcon,
  PlayIcon,
  Backward02Icon,
  Forward02Icon,
} from '@hugeicons/core-free-icons';
import { ControlsTab } from './tabs/ControlsTab';
import { DebugTab } from './tabs/DebugTab';
import { ComponentsTab } from './tabs/ComponentsTab';

interface MobileControlCenterProps {
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
}

export function MobileControlCenter(props: MobileControlCenterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [tabIndex, setTabIndex] = useState(0);
  const [routes] = useState([
    { key: 'controls', title: 'Controls' },
    { key: 'debug', title: 'Debug' },
    { key: 'components', title: 'Components' },
  ]);

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

  const showPlaybackControls = props.isStreaming || props.isPaused;

  return (
    <Portal>
      {/* Bottom Control Bar */}
      {!isOpen && (
        <View style={[
          styles.bottomControls,
          showPlaybackControls ? styles.bottomControlsExpanded : styles.bottomControlsCompact
        ]}>
          {showPlaybackControls && (
            <>
              <FAB
                icon={
                  <HugeiconsIcon
                    icon={Backward02Icon}
                    size={20}
                    color="#EEEDED"
                    strokeWidth={1.5}
                  />
                }
                onPress={props.onStepBackward}
                disabled={props.streamingLength === 0}
              />
              <FAB
                icon={
                  <HugeiconsIcon
                    icon={props.isPaused ? PlayIcon : PauseIcon}
                    size={20}
                    color="#EEEDED"
                    strokeWidth={1.5}
                  />
                }
                onPress={props.isPaused ? props.onResume : props.onPause}
              />
              <FAB
                icon={
                  <HugeiconsIcon
                    icon={Forward02Icon}
                    size={20}
                    color="#EEEDED"
                    strokeWidth={1.5}
                  />
                }
                onPress={props.onStepForward}
                disabled={props.streamingLength >= props.markdownLength}
              />
            </>
          )}
          <FAB
            icon={
              <HugeiconsIcon
                icon={Settings01Icon}
                size={20}
                color="#EEEDED"
                strokeWidth={1.5}
              />
            }
            onPress={() => setIsOpen(true)}
          />
        </View>
      )}

      {/* Modal */}
      <Modal
        visible={isOpen}
        onDismiss={() => setIsOpen(false)}
        contentContainerStyle={styles.modalContent}
      >
        <TabView
          navigationState={{ index: tabIndex, routes }}
          renderScene={renderScene}
          onIndexChange={setTabIndex}
          renderTabBar={renderTabBar}
        />
      </Modal>
    </Portal>
  );
}

const styles = StyleSheet.create({
  bottomControls: {
    position: 'absolute',
    bottom: 20,
    left: '7.5%',
    right: '7.5%',
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 10000,
    gap: 12,
  },
  bottomControlsCompact: {
    justifyContent: 'flex-end',
  },
  bottomControlsExpanded: {
    justifyContent: 'space-between',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginTop: '20%',
    marginBottom: '10%',
    borderRadius: 12,
    height: '70%',
    padding: 0,
  },
  tabBar: {
    backgroundColor: '#FFFFFF',
    elevation: 0,
  },
  tabIndicator: {
    backgroundColor: '#494C53',
  },
  tabLabel: {
    fontSize: 14,
    fontWeight: '500',
    textTransform: 'none',
  },
});
