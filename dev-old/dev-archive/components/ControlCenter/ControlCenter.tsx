import React, { useState } from 'react';
import { Platform, useWindowDimensions } from 'react-native';
import { MobileControlCenter } from './MobileControlCenter';
import { WebControlCenter } from './WebControlCenter';

interface ControlCenterProps {
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

export const ControlCenter = React.memo(function ControlCenter(props: ControlCenterProps) {
  const { width } = useWindowDimensions();
  const isMobile = width < 768; // Mobile breakpoint

  if (Platform.OS !== 'web' || isMobile) {
    return <MobileControlCenter {...props} />;
  }

  return <WebControlCenter {...props} />;
});
