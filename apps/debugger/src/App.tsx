import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ScrollView,
  Text,
  TextInput,
  View,
  Pressable,
  Platform,
} from 'react-native';
import { StyleSheet, UnistylesRuntime } from 'react-native-unistyles';
import { StreamdownRN, type DebugSnapshot } from 'streamdown-rn';
import { debugComponentRegistry } from '@darkresearch/debug-components';
import { PRESETS } from './presets';

// Configure Unistyles
StyleSheet.configure({
  themes: {
    dark: {
      colors: {
        bg: '#050505',
      },
    },
  },
  settings: {
    initialTheme: 'dark',
  },
});

const WS_URL = 'ws://localhost:3001';

type Snapshot = DebugSnapshot | null;

export default function App() {
  const [fullContent, setFullContent] = useState<string>(PRESETS.kitchen_sink);
  const [position, setPosition] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(5);
  const [snapshot, setSnapshot] = useState<Snapshot>(null);
  const [expandedBlocks, setExpandedBlocks] = useState<Record<string, boolean>>(
    {}
  );
  const [serverConnected, setServerConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const trackWidthRef = useRef(0);

  const streamedContent = useMemo(
    () => fullContent.slice(0, position),
    [fullContent, position]
  );

  // WebSocket broadcast (web only)
  useEffect(() => {
    if (Platform.OS !== 'web') return;

    let reconnect: ReturnType<typeof setTimeout> | null = null;

    const connect = () => {
      const ws = new WebSocket(WS_URL);
      wsRef.current = ws;

      ws.onopen = () => setServerConnected(true);
      ws.onclose = () => {
        setServerConnected(false);
        reconnect = setTimeout(connect, 1000);
      };
      ws.onerror = () => setServerConnected(false);
    };

    connect();

    return () => {
      if (reconnect) clearTimeout(reconnect);
      wsRef.current?.close();
    };
  }, []);

  useEffect(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({ content: streamedContent, position })
      );
    }
  }, [streamedContent, position]);

  // Streaming engine
  useEffect(() => {
    if (!isPlaying || position >= fullContent.length) {
      if (position >= fullContent.length) setIsPlaying(false);
      return;
    }
    const interval = setInterval(() => {
      setPosition((prev) => {
        const next = Math.min(prev + speed, fullContent.length);
        if (next >= fullContent.length) setIsPlaying(false);
        return next;
      });
    }, 50);
    return () => clearInterval(interval);
  }, [isPlaying, position, speed, fullContent.length]);

  // Keyboard shortcuts on web
  useEffect(() => {
    if (Platform.OS !== 'web') return;

    const handler = (event: any) => {
      const tag = event?.target?.tagName;
      if (tag === 'TEXTAREA' || tag === 'INPUT') return;

      if (event.code === 'Space') {
        setIsPlaying((prev) => !prev);
        event.preventDefault();
      } else if (event.code === 'ArrowRight') {
        setPosition((prev) => Math.min(prev + 1, fullContent.length));
        event.preventDefault();
      } else if (event.code === 'ArrowLeft') {
        setPosition((prev) => Math.max(prev - 1, 0));
        event.preventDefault();
      } else if (event.code === 'KeyR') {
        setPosition(0);
        setIsPlaying(false);
        event.preventDefault();
      } else if (event.key >= '1' && event.key <= '9') {
        setSpeed(parseInt(event.key, 10));
        event.preventDefault();
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [fullContent.length]);

  const handleSeek = (ratio: number) => {
    const next = Math.round(ratio * fullContent.length);
    setPosition(Math.max(0, Math.min(fullContent.length, next)));
  };

  const handlePresetSelect = (value: string) => {
    setFullContent(value);
    setPosition(0);
    setIsPlaying(false);
    setExpandedBlocks({});
  };
  const toggleBlock = (id: string) => {
    setExpandedBlocks((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const progress =
    fullContent.length > 0 ? position / fullContent.length : 0;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Streamdown Debugger</Text>
          <Text style={styles.subtitle}>
            Streaming control panel (web)
          </Text>
        </View>
        <View style={styles.statusBadge}>
          <View
            style={[
              styles.statusDot,
              serverConnected ? styles.connected : styles.disconnected,
            ]}
          />
          <Text style={styles.statusLabel}>
            {serverConnected ? 'Sync server connected' : 'Sync server offline'}
          </Text>
        </View>
      </View>

      <View style={styles.body}>
        <View style={styles.leftPane}>
          <View style={styles.card}>
            <View style={styles.controlRow}>
              <ControlButton
                label={isPlaying ? 'Pause' : 'Play'}
                onPress={() => setIsPlaying((prev) => !prev)}
                variant="primary"
              />
              <ControlButton
                label="Stop"
                onPress={() => {
                  setIsPlaying(false);
                  setPosition(0);
                }}
              />
              <ControlButton
                label="◀"
                onPress={() => setPosition((prev) => Math.max(prev - 1, 0))}
              />
              <ControlButton
                label="▶"
                onPress={() =>
                  setPosition((prev) => Math.min(prev + 1, fullContent.length))
                }
              />
            </View>

            <View
              style={styles.progressTrack}
              onLayout={(e) => {
                trackWidthRef.current = e.nativeEvent.layout.width;
              }}
              onStartShouldSetResponder={() => true}
              onResponderRelease={(e) => {
                const ratio =
                  trackWidthRef.current === 0
                    ? 0
                    : e.nativeEvent.locationX / trackWidthRef.current;
                handleSeek(ratio);
              }}
            >
              <View
                style={[styles.progressFill, { flex: progress }]}
              />
              <View style={{ flex: 1 - progress }} />
            </View>
            <View style={styles.progressLabels}>
              <Text style={styles.progressText}>
                {position} / {fullContent.length}
              </Text>
              <Text style={styles.progressText}>
                {(progress * 100).toFixed(1)}%
              </Text>
            </View>

            <View style={styles.speedRow}>
              <Text style={styles.speedLabel}>
                Speed: {speed} chars/tick
              </Text>
              <View style={styles.speedButtons}>
                <ControlButton
                  label="-"
                  onPress={() => setSpeed((prev) => Math.max(1, prev - 1))}
                />
                <ControlButton
                  label="+"
                  onPress={() => setSpeed((prev) => Math.min(9, prev + 1))}
                />
              </View>
            </View>
          </View>

          <View style={styles.card}>
            <Text style={styles.sectionLabel}>Markdown Input</Text>
            <TextInput
              multiline
              value={fullContent}
              onChangeText={handlePresetSelect}
              style={styles.textArea}
              placeholder="Enter markdown..."
              placeholderTextColor="#666"
            />
            <PresetSelector onSelect={handlePresetSelect} />
          </View>
        </View>

        <ScrollView
          style={styles.debugPane}
          contentContainerStyle={styles.debugContent}
        >
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Output Preview</Text>
            <ScrollView
              style={styles.previewScroll}
              contentContainerStyle={styles.previewContent}
              nestedScrollEnabled
            >
              <StreamdownRN
                componentRegistry={debugComponentRegistry}
                onDebug={setSnapshot}
                isComplete={position >= fullContent.length}
              >
                {streamedContent}
              </StreamdownRN>
            </ScrollView>
          </View>

          <DebugSection
            title="Position"
            rows={[
              { label: 'Chars streamed', value: `${position}` },
              { label: 'Total length', value: `${fullContent.length}` },
              { label: 'Progress', value: `${(progress * 100).toFixed(2)}%` },
            ]}
          />

          {snapshot ? (
            <>
              <DebugSection
                title="Update"
                rows={[
                  { label: 'New chars', value: `${snapshot.newCharsCount}` },
                  {
                    label: 'Latency',
                    value: `${snapshot.deltaMs.toFixed(1)}ms`,
                  },
                ]}
              />

              <View style={styles.debugSection}>
                <Text style={styles.sectionTitle}>
                  Stable Blocks ({snapshot.registry.stableBlockCount})
                </Text>
                {snapshot.registry.stableBlocks.length === 0 ? (
                  <Text style={styles.listItem}>No stable blocks yet</Text>
                ) : (
                  snapshot.registry.stableBlocks.map((block) => {
                    const expanded = !!expandedBlocks[block.id];
                    return (
                      <Pressable
                        key={block.id}
                        onPress={() => toggleBlock(block.id)}
                        style={styles.blockRow}
                      >
                        <View style={styles.blockSummary}>
                          <Text style={styles.listItem}>
                            {block.id} • {block.type} • {block.contentLength}{' '}
                            chars
                          </Text>
                          <Text style={styles.blockToggle}>
                            {expanded ? 'Hide' : 'Show'}
                          </Text>
                        </View>
                        {expanded && (
                          <Text style={styles.blockContent}>
                            {block.content?.length
                              ? block.content
                              : '(empty block)'}
                          </Text>
                        )}
                      </Pressable>
                    );
                  })
                )}
              </View>

              <DebugSection
                title="Active Block"
                rows={[
                  {
                    label: 'Type',
                    value: snapshot.registry.activeBlock?.type ?? '—',
                  },
                  {
                    label: 'Length',
                    value: `${snapshot.registry.activeBlock?.contentLength ?? 0}`,
                  },
                ]}
                body={
                  snapshot.registry.activeBlock
                    ? snapshot.registry.activeBlock.content.slice(0, 120)
                    : 'No active block'
                }
                treeData={snapshot.registry.activeBlock}
              />

              <DebugSection
                title="Tag State"
                rows={[
                  {
                    label: 'Stack',
                    value:
                      snapshot.registry.tagState.stack.length > 0
                        ? JSON.stringify(snapshot.registry.tagState.stack)
                        : '[]',
                  },
                  {
                    label: 'In code block',
                    value: snapshot.registry.tagState.inCodeBlock ? 'Yes' : 'No',
                  },
                  {
                    label: 'In inline code',
                    value: snapshot.registry.tagState.inInlineCode
                      ? 'Yes'
                      : 'No',
                  },
                ]}
              />

              {snapshot.fixedContent ? (
                <DebugSection
                  title="Fixed Content"
                  body={snapshot.fixedContent.slice(0, 200)}
                />
              ) : null}
            </>
          ) : (
            <DebugSection
              title="Waiting for debug data"
              body="Start streaming to see block snapshots."
            />
          )}
        </ScrollView>
      </View>
    </View>
  );
}

interface ControlButtonProps {
  label: string;
  onPress: () => void;
  variant?: 'default' | 'primary';
}

const ControlButton = ({
  label,
  onPress,
  variant = 'default',
}: ControlButtonProps) => (
  <Pressable
    onPress={onPress}
    style={[
      styles.button,
      variant === 'primary' && styles.buttonPrimary,
    ]}
  >
    <Text
      style={[
        styles.buttonLabel,
        variant === 'primary' && styles.buttonPrimaryLabel,
      ]}
    >
      {label}
    </Text>
  </Pressable>
);

interface DebugSectionProps {
  title: string;
  rows?: Array<{ label: string; value: string }>;
  list?: string[];
  body?: string;
  treeData?: unknown;
}

const DebugSection = ({ title, rows, list, body, treeData }: DebugSectionProps) => (
  <View style={styles.debugSection}>
    <Text style={styles.sectionTitle}>{title}</Text>
    {rows?.map((row) => (
      <View style={styles.infoRow} key={`${row.label}-${row.value}`}>
        <Text style={styles.infoLabel}>{row.label}</Text>
        <Text style={styles.infoValue}>{row.value}</Text>
      </View>
    ))}
    {list?.map((item) => (
      <Text key={item} style={styles.listItem}>
        {item}
      </Text>
    ))}
    {body ? <Text style={styles.infoBody}>{body}</Text> : null}
    {treeData !== undefined ? (
      <Text style={styles.jsonDump}>
        {JSON.stringify(treeData, null, 2)}
      </Text>
    ) : null}
  </View>
);

const PresetSelector = ({
  onSelect,
}: {
  onSelect: (value: string) => void;
}) => (
  <ScrollView
    horizontal
    showsHorizontalScrollIndicator={false}
    contentContainerStyle={styles.presetRow}
  >
    {Object.entries(PRESETS).map(([key, value]) => (
      <Pressable
        key={key}
        onPress={() => onSelect(value)}
        style={styles.presetChip}
      >
        <Text style={styles.presetChipLabel}>{key}</Text>
      </Pressable>
    ))}
  </ScrollView>
);

const styles = StyleSheet.create((theme) => ({
  container: {
    flex: 1,
    backgroundColor: theme.colors.bg,
    paddingTop: Platform.OS !== 'web' ? UnistylesRuntime.insets.top : 0,
    paddingBottom: Platform.OS !== 'web' ? UnistylesRuntime.insets.bottom : 0,
  },
  header: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1f1f1f',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    color: '#f6f6f6',
    fontSize: 20,
    fontWeight: '600',
  },
  subtitle: {
    color: '#8a8a8a',
    marginTop: 4,
    fontSize: 13,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1f1f1f',
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  connected: {
    backgroundColor: '#10b981',
  },
  disconnected: {
    backgroundColor: '#ef4444',
  },
  statusLabel: {
    color: '#e5e5e5',
    fontSize: 12,
  },
  body: {
    flex: 1,
    flexDirection: Platform.OS === 'web' ? 'row' : 'column',
  },
  leftPane: {
    flex: 1,
    padding: 16,
    gap: 16,
  },
  card: {
    backgroundColor: '#0f0f0f',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#1b1b1b',
    gap: 12,
  },
  previewScroll: {
    maxHeight: 400,
  },
  previewContent: {
    paddingBottom: 16,
  },
  controlRow: {
    flexDirection: 'row',
    gap: 12,
    flexWrap: 'wrap',
  },
  button: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#2a2a2a',
    backgroundColor: '#111',
  },
  buttonPrimary: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },
  buttonLabel: {
    color: '#e5e5e5',
    fontWeight: '500',
  },
  buttonPrimaryLabel: {
    color: '#fff',
  },
  progressTrack: {
    height: 12,
    borderRadius: 6,
    backgroundColor: '#1b1b1b',
    overflow: 'hidden',
    flexDirection: 'row',
  },
  progressFill: {
    backgroundColor: '#2563eb',
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressText: {
    color: '#9ca3af',
    fontSize: 12,
  },
  speedRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  speedLabel: {
    color: '#e5e5e5',
    fontSize: 13,
  },
  speedButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  textArea: {
    minHeight: 280,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1f1f1f',
    padding: 12,
    color: '#f1f5f9',
    fontSize: 13,
    backgroundColor: '#090909',
  },
  sectionLabel: {
    color: '#9ca3af',
    fontSize: 12,
    textTransform: 'uppercase',
  },
  presetRow: {
    flexDirection: 'row',
    gap: 8,
  },
  presetChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: '#111',
    borderWidth: 1,
    borderColor: '#1f1f1f',
  },
  presetChipLabel: {
    color: '#d4d4d8',
    fontSize: 12,
  },
  debugPane: {
    width: Platform.OS === 'web' ? 360 : '100%',
    backgroundColor: '#080808',
    borderLeftWidth: Platform.OS === 'web' ? 1 : 0,
    borderTopWidth: Platform.OS === 'web' ? 0 : 1,
    borderColor: '#111',
  },
  debugContent: {
    padding: 16,
    gap: 12,
  },
  debugSection: {
    backgroundColor: '#0f0f0f',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#1b1b1b',
    gap: 8,
  },
  sectionTitle: {
    color: '#f5f5f4',
    fontWeight: '600',
    fontSize: 13,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  infoLabel: {
    color: '#a1a1aa',
    fontSize: 12,
  },
  infoValue: {
    color: '#e4e4e7',
    fontSize: 12,
  },
  infoBody: {
    color: '#d4d4d8',
    fontSize: 12,
    lineHeight: 18,
  },
  listItem: {
    color: '#cbd5f5',
    fontSize: 12,
  },
  blockRow: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#1f1f1f',
  },
  blockSummary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  blockToggle: {
    color: '#60a5fa',
    fontSize: 11,
  },
  blockContent: {
    color: '#d4d4d8',
    fontSize: 12,
    lineHeight: 18,
    marginTop: 6,
    backgroundColor: '#090909',
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#1f1f1f',
  },
  jsonDump: {
    marginTop: 12,
    color: '#94a3b8',
    fontSize: 11,
    backgroundColor: '#0b0b0b',
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#1f1f1f',
    fontFamily: Platform.OS === 'web' ? 'monospace' : 'Courier',
  },
}));
