import { useCallback, useEffect, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { ActionButton } from '@/components/ui/action-button';
import { Card, CardDivider } from '@/components/ui/card';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { SummaryCard, SummaryCardHeader } from '@/training/SummaryCard';
import { endReasonLabel } from '@/training/freqSession';
import {
  listSavedSessions,
  type SavedSessionRecord,
  type SessionTrack,
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

/** cent 격차 표시(정수 반올림). 값 없음은 '—'. 점수·역치 아님. */
function centsText(value: number | null): string {
  return value == null ? '—' : `약 ${Math.round(value)}`;
}

/** 변조 깊이(dB) 표시(소수 1자리). 값 없음은 '—'. */
function depthText(value: number | null): string {
  return value == null ? '—' : `약 ${value.toFixed(1)}`;
}

/** 트랙별로 다른 부분만 담는다. 공통 필드는 `toCardContent`에서 채운다. */
type TrackView = {
  trackTitle: string;
  meanLabel: string;
  meanValue: string;
  easiestValue: string;
  hardestValue: string;
};

function trackView(record: SavedSessionRecord): TrackView {
  if (record.track === 'freq') {
    const { summary } = record;
    return {
      trackTitle: '다른 음 찾기',
      meanLabel: '음높이 차이',
      meanValue: centsText(summary.meanReversalDeltaCents),
      easiestValue: centsText(summary.easiestDeltaCents),
      hardestValue: centsText(summary.hardestDeltaCents),
    };
  }
  if (record.track === 'am') {
    const { summary } = record;
    return {
      trackTitle: '떨림 찾기',
      meanLabel: '떨림 정도',
      meanValue: depthText(summary.meanReversalDepthDb),
      easiestValue: depthText(summary.easiestDepthDb),
      hardestValue: depthText(summary.hardestDepthDb),
    };
  }
  const { summary } = record;
  return {
    trackTitle: '높낮이 비교',
    meanLabel: '음높이 차이',
    meanValue: centsText(summary.meanReversalCents),
    easiestValue: centsText(summary.easiestCents),
    hardestValue: centsText(summary.hardestCents),
  };
}

function toCardContent(record: SavedSessionRecord): HistoryCardContent {
  const { summary } = record;
  const view = trackView(record);
  return {
    ...view,
    savedAt: formatSavedAt(record.savedAt),
    trialCount: summary.trialCount,
    correctCount: summary.correctCount,
    reversalCount: summary.reversalCount,
    reason: endReasonLabel(summary.endReason) || null,
  };
}

/** 트랙 카드 제목(집계 줄에서 재사용). */
const TRACK_LABEL: Record<SessionTrack, string> = {
  pitch2: '높낮이 비교',
  freq: '다른 음 찾기',
  am: '떨림 찾기',
};

type Aggregate = {
  totalSessions: number;
  totalTrials: number;
  totalCorrect: number;
  /** 0~100. 문항이 없으면 null. 점수·역치 아님(참고용). */
  accuracyPct: number | null;
  perTrack: Record<SessionTrack, number>;
};

/** 저장된 요약들을 합쳐 참고용 누적 수치를 만든다. 진단·역치 아님. */
function computeAggregate(rows: readonly SavedSessionRecord[]): Aggregate {
  const perTrack: Record<SessionTrack, number> = { pitch2: 0, freq: 0, am: 0 };
  let totalTrials = 0;
  let totalCorrect = 0;

  for (const row of rows) {
    perTrack[row.track] += 1;
    totalTrials += row.summary.trialCount;
    totalCorrect += row.summary.correctCount;
  }

  return {
    totalSessions: rows.length,
    totalTrials,
    totalCorrect,
    accuracyPct: totalTrials > 0 ? Math.round((totalCorrect / totalTrials) * 100) : null,
    perTrack,
  };
}

/** 화면 상단 누적 요약. 세션이 있을 때만 렌더. */
function AggregateCard({ data }: Readonly<{ data: Aggregate }>) {
  const trackLine = (['pitch2', 'freq', 'am'] as const)
    .filter((track) => data.perTrack[track] > 0)
    .map((track) => `${TRACK_LABEL[track]} ${data.perTrack[track]}`)
    .join(' · ');

  return (
    <Card size="large" style={styles.aggregate}>
      <View style={styles.metricRow}>
        <View style={styles.metric}>
          <ThemedText type="metric">{data.totalSessions}</ThemedText>
          <ThemedText themeColor="textMuted" type="small" style={styles.metricLabel}>
            연습 횟수
          </ThemedText>
        </View>
        <View style={styles.metric}>
          <ThemedText type="metric">{data.totalTrials}</ThemedText>
          <ThemedText themeColor="textMuted" type="small" style={styles.metricLabel}>
            푼 문항
          </ThemedText>
        </View>
        <View style={styles.metric}>
          <ThemedText type="metric">
            {data.accuracyPct == null ? '—' : `${data.accuracyPct}%`}
          </ThemedText>
          <ThemedText themeColor="textMuted" type="small" style={styles.metricLabel}>
            평균 정답률
          </ThemedText>
        </View>
      </View>

      {trackLine ? (
        <>
          <CardDivider />
          <ThemedText themeColor="textSecondary" type="small" style={styles.trackLine}>
            {trackLine}
          </ThemedText>
        </>
      ) : null}

      <ThemedText themeColor="textMuted" type="small" style={styles.aggregateNote}>
        정답률은 참고용이에요 · 점수·청력 검사·진단 결과 아님
      </ThemedText>
    </Card>
  );
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

  const hasRows = rows.length > 0;

  return (
    <ThemedView style={styles.fill}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.screenHeader}>
          <ThemedText type="screenTitle">연습 통계</ThemedText>
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

        {!loading && !error && !hasRows ? (
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
          ListHeaderComponent={
            hasRows ? <AggregateCard data={computeAggregate(rows)} /> : null
          }
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
  aggregate: {
    gap: Spacing.three - 4,
  },
  metricRow: {
    flexDirection: 'row',
  },
  metric: {
    flex: 1,
    alignItems: 'center',
    gap: Spacing.half,
  },
  metricLabel: {
    fontSize: 11.5,
    lineHeight: 16,
    textAlign: 'center',
  },
  trackLine: {
    fontSize: 12.5,
    lineHeight: 18,
    textAlign: 'center',
  },
  aggregateNote: {
    fontSize: 11,
    lineHeight: 16,
    textAlign: 'center',
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.three - 4,
  },
});
