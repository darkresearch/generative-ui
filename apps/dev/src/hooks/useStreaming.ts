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
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/ba72c841-4600-456b-adad-25adf0868af7',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'useStreaming.ts:78',message:'startStreaming called',data:{currentIndex:currentIndexRef.current,markdownLength:markdown.length},timestamp:Date.now(),sessionId:'debug-session',runId:'streaming-test',hypothesisId:'A'})}).catch(()=>{});
    // #endregion
    // Reset if starting fresh (not resuming)
    if (currentIndexRef.current === 0) {
      setStreamingMarkdown('');
    }
    setIsPaused(false);
    setIsStreaming(true);
  }, [markdown.length]);

  const pauseStreaming = useCallback(() => {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/ba72c841-4600-456b-adad-25adf0868af7',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'useStreaming.ts:87',message:'pauseStreaming called',data:{currentIndex:currentIndexRef.current,streamingLength:streamingMarkdown.length},timestamp:Date.now(),sessionId:'debug-session',runId:'streaming-test',hypothesisId:'B'})}).catch(()=>{});
    // #endregion
    setIsPaused(true);
    if (streamingRef.current) {
      clearTimeout(streamingRef.current);
      streamingRef.current = null;
    }
  }, [streamingMarkdown.length]);

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
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/ba72c841-4600-456b-adad-25adf0868af7',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'useStreaming.ts:120',message:'stepBackward called',data:{currentIndex:currentIndexRef.current,canStepBack:currentIndexRef.current>0},timestamp:Date.now(),sessionId:'debug-session',runId:'streaming-test',hypothesisId:'C'})}).catch(()=>{});
    // #endregion
    if (currentIndexRef.current > 0) {
      currentIndexRef.current--;
      setStreamingMarkdown(markdown.substring(0, currentIndexRef.current));
    }
  }, [markdown]);

  const stepForward = useCallback(() => {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/ba72c841-4600-456b-adad-25adf0868af7',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'useStreaming.ts:127',message:'stepForward called',data:{currentIndex:currentIndexRef.current,canStepForward:currentIndexRef.current<markdown.length,markdownLength:markdown.length},timestamp:Date.now(),sessionId:'debug-session',runId:'streaming-test',hypothesisId:'D'})}).catch(()=>{});
    // #endregion
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

