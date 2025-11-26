import { useState, useEffect, useRef, useCallback } from 'react';

interface UseStreamingOptions {
  markdown: string;
  streamSpeed: number;
}

interface UseStreamingReturn {
  streamingMarkdown: string;
  isStreaming: boolean;
  isPaused: boolean;
  startStreaming: () => void;
  pauseStreaming: () => void;
  resumeStreaming: () => void;
  stopStreaming: () => void;
  reset: () => void;
  stepBackward: () => void;
  stepForward: () => void;
}

export function useStreaming({ markdown, streamSpeed }: UseStreamingOptions): UseStreamingReturn {
  const [streamingMarkdown, setStreamingMarkdown] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const streamingRef = useRef<NodeJS.Timeout | null>(null);
  const currentIndexRef = useRef<number>(0);

  // Streaming simulation (typewriter effect)
  useEffect(() => {
    if (isStreaming && !isPaused && markdown.length > 0) {
      // Reset index if starting fresh (not resuming from pause)
      if (currentIndexRef.current === 0) {
        setStreamingMarkdown('');
      }

      const stream = () => {
        // Check if paused or stopped before continuing
        if (isPaused || !isStreaming) {
          return;
        }

        if (currentIndexRef.current < markdown.length) {
          setStreamingMarkdown(markdown.substring(0, currentIndexRef.current + 1));
          currentIndexRef.current++;
          streamingRef.current = setTimeout(stream, streamSpeed);
        } else {
          // Streaming complete
          setIsStreaming(false);
          setIsPaused(false);
          currentIndexRef.current = 0;
        }
      };

      stream();

      return () => {
        if (streamingRef.current) {
          clearTimeout(streamingRef.current);
          streamingRef.current = null;
        }
      };
    } else if (!isStreaming && !isPaused) {
      // Only reset if not paused (allows paused state to persist)
      currentIndexRef.current = 0;
      setStreamingMarkdown(markdown);
    }
  }, [isStreaming, isPaused, markdown, streamSpeed]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (streamingRef.current) {
        clearTimeout(streamingRef.current);
      }
    };
  }, []);

  const startStreaming = useCallback(() => {
    // Reset if starting fresh (not resuming)
    if (currentIndexRef.current === 0) {
      setStreamingMarkdown('');
    }
    setIsPaused(false);
    setIsStreaming(true);
  }, []);

  const pauseStreaming = useCallback(() => {
    setIsPaused(true);
    if (streamingRef.current) {
      clearTimeout(streamingRef.current);
      streamingRef.current = null;
    }
  }, []);

  const resumeStreaming = useCallback(() => {
    setIsPaused(false);
    setIsStreaming(true);
  }, []);

  const stopStreaming = useCallback(() => {
    setIsStreaming(false);
    setIsPaused(false);
    currentIndexRef.current = 0;
    if (streamingRef.current) {
      clearTimeout(streamingRef.current);
    }
    setStreamingMarkdown(markdown);
  }, [markdown]);

  const reset = useCallback(() => {
    setIsStreaming(false);
    setIsPaused(false);
    currentIndexRef.current = 0;
    if (streamingRef.current) {
      clearTimeout(streamingRef.current);
    }
    setStreamingMarkdown(markdown);
  }, [markdown]);

  const stepBackward = useCallback(() => {
    if (currentIndexRef.current > 0) {
      currentIndexRef.current--;
      setStreamingMarkdown(markdown.substring(0, currentIndexRef.current));
    }
  }, [markdown]);

  const stepForward = useCallback(() => {
    if (currentIndexRef.current < markdown.length) {
      currentIndexRef.current++;
      setStreamingMarkdown(markdown.substring(0, currentIndexRef.current));
    }
  }, [markdown]);

  return {
    streamingMarkdown,
    isStreaming,
    isPaused,
    startStreaming,
    pauseStreaming,
    resumeStreaming,
    stopStreaming,
    reset,
    stepBackward,
    stepForward,
  };
}

