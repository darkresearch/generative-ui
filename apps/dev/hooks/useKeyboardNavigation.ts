import { useEffect } from 'react';
import { Platform } from 'react-native';

interface UseKeyboardNavigationOptions {
  isPaused: boolean;
  markdown: string;
  onStepBackward: () => void;
  onStepForward: () => void;
}

export function useKeyboardNavigation({
  isPaused,
  markdown,
  onStepBackward,
  onStepForward,
}: UseKeyboardNavigationOptions) {
  useEffect(() => {
    if (Platform.OS !== 'web') return;

    const handleKeyDown = (event: globalThis.KeyboardEvent) => {
      // Only handle arrow keys when paused
      if (!isPaused) return;

      // Prevent default scrolling behavior
      if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
        event.preventDefault();
      }

      if (event.key === 'ArrowLeft') {
        onStepBackward();
      } else if (event.key === 'ArrowRight') {
        onStepForward();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isPaused, markdown, onStepBackward, onStepForward]);
}

