import { useCallback, useEffect, useState } from 'react';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { endReasonLabel } from '@/training/freqSession';
import {
  listSavedSessions,
  type SavedSessionRecord,
} from '@/training/sessionStore';

type SessionHistoryScreenProps = {
  onBack?: () => void;
};

type HistoryCardContent = {
  trackTitle: string;
  savedAt: string;
  trialCount: number;
  correctCount: number;
  reversalCount: number;
  meanLabel: string;
  meanValue: string;
  easiestValue: string;
  hardestValue: string;
  reason: string | null;
};

function formatSavedAt(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) {
    return iso;
  }
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  return `${y}-${m}-${day} ${hh}:${mm}`;
}

function toCardContent(record: SavedSessionRecord): HistoryCardContent {
  if (record.track === 'freq') {
    const { summary } = record;
    return {
      trackTitle: '다른 음 찾기',
      savedAt: formatSavedAt(record.savedAt),
      trialCount: summary.trialCount,
      correctCount: summary.correctCount,
      reversalCount: summary.reversalCount,
      meanLabel: '음높이 차이',
      meanValue:
        summary.meanReversalDeltaCents == null
          ? '—'
          : `약 ${Math.round(summary.meanReversalDeltaCents)}`,
      easiestValue:
        summary.easiestDeltaCents == null
          ? '—'
          : `약 ${Math.round(summary.easiestDeltaCents)}`,
      hardestValue:
        summary.hardestDeltaCents == null
          ? '—'
          : `약 ${Math.round(summary.hardestDeltaCents)}`,
      reason: endReasonLabel(summary.endReason) || null,
    };
  }

  const { summary } = record;
  return {
    trackTitle: '떨림 찾기',
    savedAt: formatSavedAt(record.savedAt),
    trialCount: summary.trialCount,
    correctCount: summary.correctCount,
    reversalCount: summary.reversalCount,
    meanLabel: '떨림 정도',
    meanValue:
      summary.meanReversalDepthDb == null
        ? '—'
        : `약 ${summary.meanReversalDepthDb.toFixed(1)}`,
    easiestValue:
      summary.easiestDepthDb == null
        ? '—'
        : `약 ${summary.easiestDepthDb.toFixed(1)}`,
    hardestValue:
      summary.hardestDepthDb == null
        ? '—'
        : `약 ${summary.hardestDepthDb.toFixed(1)}`,
    reason: endReasonLabel(summary.endReason) || null,
  };
}

function MetricRow({
  label,
  value,
}: Readonly<{ label: string; value: string }>) {
  return (
    <View style={styles.metricRow}>
      <ThemedText type="small" themeColor="textSecondary" style={styles.metricLabel}>
        {label}
      </ThemedText>
      <ThemedText type="default" style={styles.metricValue}>
        {value}
      </ThemedText>
    </View>
  );
}

function HistoryCard({ record }: Readonly<{ record: SavedSessionRecord }>) {
  const content = toCardContent(record);

  return (
    <ThemedView type="backgroundElement" style={styles.card}>
      <View style={styles.cardHeader}>
        <ThemedText type="default" style={styles.cardTitle}>
          {content.trackTitle}
        </ThemedText>
        <ThemedText type="small" themeColor="textSecondary" style={styles.cardDate}>
          {content.savedAt}
        </ThemedText>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statCell}>
          <ThemedText type="small" themeColor="textSecondary">
            연습
          </ThemedText>
          <ThemedText type="default" style={styles.statValue}>
            {content.trialCount}
          </ThemedText>
        </View>
        <View style={styles.statCell}>
          <ThemedText type="small" themeColor="textSecondary">
            정답
          </ThemedText>
          <ThemedText type="default" style={styles.statValue}>
            {content.correctCount}
          </ThemedText>
        </View>
        <View style={styles.statCell}>
          <ThemedText type="small" themeColor="textSecondary">
            전환
          </ThemedText>
          <ThemedText type="default" style={styles.statValue}>
            {content.reversalCount}
          </ThemedText>
        </View>
      </View>

      <View style={styles.section}>
        <ThemedText type="smallBold" themeColor="textSecondary" style={styles.sectionTitle}>
          최근 난이도 참고
        </ThemedText>
        <MetricRow label={content.meanLabel} value={content.meanValue} />
        <MetricRow label="가장 쉬움" value={content.easiestValue} />
        <MetricRow label="가장 어려움" value={content.hardestValue} />
      </View>

      {content.reason ? (
        <ThemedText type="small" themeColor="textSecondary" style={styles.reason}>
          {content.reason}
        </ThemedText>
      ) : null}
    </ThemedView>
  );
}

/**
 * 로컬 연습 기록 목록(정적). AsyncStorage 요약만. 진단·점수 UI 아님.
 */
export function SessionHistoryScreen({
  onBack,
}: Readonly<SessionHistoryScreenProps>) {
  const theme = useTheme();
  const [rows, setRows] = useState<SavedSessionRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(() => {
    setLoading(true);
    setError(null);
    void listSavedSessions()
      .then((next) => {
        setRows(next);
      })
      .catch(() => {
        setError('기록을 불러오지 못했어요');
        setRows([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  return (
    <ThemedView style={styles.fill}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.screenHeader}>
          <ThemedText type="subtitle" style={styles.screenTitle}>
            연습 기록
          </ThemedText>
          <ThemedText themeColor="textSecondary" type="small" style={styles.caption}>
            이 기기에만 저장 · 점수·청력 검사·진단 결과 아님
          </ThemedText>
        </View>

        {loading ? (
          <ThemedText themeColor="textSecondary" type="small" style={styles.caption}>
            불러오는 중…
          </ThemedText>
        ) : null}

        {error ? (
          <ThemedText themeColor="textSecondary" type="small" style={styles.caption}>
            {error}
          </ThemedText>
        ) : null}

        {!loading && !error && rows.length === 0 ? (
          <ThemedText themeColor="textSecondary" type="small" style={styles.caption}>
            아직 기록된 연습이 없어요
          </ThemedText>
        ) : null}

        <FlatList
          data={rows}
          keyExtractor={(item) => item.id}
          style={styles.list}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => <HistoryCard record={item} />}
        />

        <View style={styles.actions}>
          <Pressable
            accessibilityRole="button"
            onPress={reload}
            style={({ pressed }) => [
              styles.actionButton,
              { backgroundColor: theme.backgroundElement },
              pressed && styles.pressed,
            ]}>
            <ThemedText type="smallBold">새로고침</ThemedText>
          </Pressable>
          {onBack ? (
            <Pressable
              accessibilityRole="button"
              onPress={onBack}
              style={({ pressed }) => [
                styles.actionButton,
                { backgroundColor: theme.backgroundElement },
                pressed && styles.pressed,
              ]}>
              <ThemedText type="smallBold">연습 목록</ThemedText>
            </Pressable>
          ) : null}
        </View>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  fill: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    width: '100%',
    paddingHorizontal: Spacing.four,
    paddingBottom: BottomTabInset + Spacing.three,
    alignItems: 'stretch',
    gap: Spacing.three,
  },
  screenHeader: {
    alignItems: 'center',
    gap: Spacing.one,
    paddingTop: Spacing.two,
  },
  screenTitle: {
    fontSize: 28,
    lineHeight: 36,
    textAlign: 'center',
  },
  caption: {
    textAlign: 'center',
  },
  list: {
    alignSelf: 'stretch',
    flex: 1,
  },
  listContent: {
    gap: Spacing.three,
    paddingBottom: Spacing.two,
  },
  card: {
    paddingVertical: Spacing.four,
    paddingHorizontal: Spacing.four,
    borderRadius: Spacing.three,
    gap: Spacing.three,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  cardTitle: {
    flexShrink: 1,
    fontWeight: '700',
  },
  cardDate: {
    flexShrink: 0,
  },
  statsRow: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  statCell: {
    flex: 1,
    alignItems: 'center',
    gap: Spacing.one,
    paddingVertical: Spacing.two,
  },
  statValue: {
    fontWeight: '700',
  },
  section: {
    gap: Spacing.two,
  },
  sectionTitle: {
    marginBottom: Spacing.half,
  },
  metricRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  metricLabel: {
    flexShrink: 1,
  },
  metricValue: {
    flexShrink: 0,
    fontWeight: '600',
    textAlign: 'right',
  },
  reason: {
    textAlign: 'center',
    marginTop: Spacing.one,
  },
  actions: {
    alignSelf: 'stretch',
    flexDirection: 'row',
    gap: Spacing.two,
  },
  actionButton: {
    flex: 1,
    minHeight: 48,
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.four,
    borderRadius: Spacing.three,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.7,
  },
});
