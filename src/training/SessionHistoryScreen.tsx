import { useCallback, useEffect, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { ActionButton } from '@/components/ui/action-button';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { SummaryCard, SummaryCardHeader } from '@/training/SummaryCard';
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

function HistoryCard({ record }: Readonly<{ record: SavedSessionRecord }>) {
  const content = toCardContent(record);

  return (
    <SummaryCard
      header={<SummaryCardHeader title={content.trackTitle} savedAt={content.savedAt} />}
      trialCount={content.trialCount}
      correctCount={content.correctCount}
      reversalCount={content.reversalCount}
      meanLabel={content.meanLabel}
      meanValue={content.meanValue}
      easiestValue={content.easiestValue}
      hardestValue={content.hardestValue}
      footnote={content.reason}
    />
  );
}

/**
 * 로컬 연습 기록 목록(정적). AsyncStorage 요약만. 진단·점수 UI 아님.
 */
export function SessionHistoryScreen({
  onBack,
}: Readonly<SessionHistoryScreenProps>) {
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
          <ThemedText type="screenTitle">연습 기록</ThemedText>
          <ThemedText themeColor="textSecondary" type="small" style={styles.caption}>
            이 기기에만 저장 · 점수·청력 검사·진단 결과 아님
          </ThemedText>
        </View>

        {loading ? (
          <ThemedText themeColor="textMuted" type="small" style={styles.notice}>
            불러오는 중…
          </ThemedText>
        ) : null}

        {error ? (
          <ThemedText themeColor="textSecondary" type="small" style={styles.notice}>
            {error}
          </ThemedText>
        ) : null}

        {!loading && !error && rows.length === 0 ? (
          <ThemedText themeColor="textMuted" type="small" style={styles.notice}>
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
          <ActionButton label="새로고침" onPress={reload} />
          {onBack ? <ActionButton label="연습 목록" onPress={onBack} /> : null}
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
    paddingTop: Spacing.three,
    paddingBottom: BottomTabInset + Spacing.three,
    alignItems: 'stretch',
    gap: Spacing.three - 2,
  },
  screenHeader: {
    gap: Spacing.one + 2,
  },
  caption: {
    fontSize: 11.5,
    lineHeight: 17,
    // 시안처럼 제목 아래 좁은 폭으로 둔다(오른쪽 여백 확보).
    maxWidth: 220,
  },
  notice: {
    textAlign: 'center',
  },
  list: {
    flex: 1,
  },
  listContent: {
    gap: Spacing.three,
    paddingBottom: Spacing.two,
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.three - 4,
  },
});
