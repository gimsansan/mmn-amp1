import { useCallback, useEffect, useState, type ReactNode } from "react";
import { FlatList, Pressable, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { ActionButton } from "@/components/ui/action-button";
import { Card, CardDivider } from "@/components/ui/card";
import {
  BottomTabInset,
  MaxContentWidth,
  Radius,
  Spacing,
} from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import { SummaryCard, SummaryCardHeader } from "@/training/SummaryCard";
import { TrendChart, type TrendPoint } from "@/training/TrendChart";
import { endReasonLabel } from "@/training/freqSession";
import {
  listSavedSessions,
  type SavedSessionRecord,
  type SessionTrack,
} from "@/training/sessionStore";

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
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${y}-${m}-${day} ${hh}:${mm}`;
}

/** cent 격차 표시(정수 반올림). 값 없음은 '—'. 점수·역치 아님. */
function centsText(value: number | null): string {
  return value == null ? "—" : `약 ${Math.round(value)}`;
}

/** 변조 깊이(dB) 표시(소수 1자리). 값 없음은 '—'. */
function depthText(value: number | null): string {
  return value == null ? "—" : `약 ${value.toFixed(1)}`;
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
  if (record.track === "freq") {
    const { summary } = record;
    return {
      trackTitle: "다른 음 찾기",
      meanLabel: "음높이 차이",
      meanValue: centsText(summary.meanReversalDeltaCents),
      easiestValue: centsText(summary.easiestDeltaCents),
      hardestValue: centsText(summary.hardestDeltaCents),
    };
  }
  if (record.track === "am") {
    const { summary } = record;
    return {
      trackTitle: "떨림 찾기",
      meanLabel: "떨림 정도",
      meanValue: depthText(summary.meanReversalDepthDb),
      easiestValue: depthText(summary.easiestDepthDb),
      hardestValue: depthText(summary.hardestDepthDb),
    };
  }
  const { summary } = record;
  return {
    trackTitle: "높낮이 비교",
    meanLabel: "음높이 차이",
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
  pitch2: "높낮이 비교",
  freq: "다른 음 찾기",
  am: "떨림 찾기",
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
    accuracyPct:
      totalTrials > 0 ? Math.round((totalCorrect / totalTrials) * 100) : null,
    perTrack,
  };
}

/** 화면 상단 누적 요약. 세션이 있을 때만 렌더. */
function AggregateCard({ data }: Readonly<{ data: Aggregate }>) {
  const trackLine = (["pitch2", "freq", "am"] as const)
    .filter((track) => data.perTrack[track] > 0)
    .map((track) => `${TRACK_LABEL[track]} ${data.perTrack[track]}`)
    .join(" · ");

  return (
    <Card size="large" style={styles.aggregate}>
      <View style={styles.metricRow}>
        <View style={styles.metric}>
          <ThemedText type="metric">{data.totalSessions}</ThemedText>
          <ThemedText
            themeColor="textMuted"
            type="small"
            style={styles.metricLabel}
          >
            연습 횟수
          </ThemedText>
        </View>
        <View style={styles.metric}>
          <ThemedText type="metric">{data.totalTrials}</ThemedText>
          <ThemedText
            themeColor="textMuted"
            type="small"
            style={styles.metricLabel}
          >
            푼 문항
          </ThemedText>
        </View>
        <View style={styles.metric}>
          <ThemedText type="metric">
            {data.accuracyPct == null ? "—" : `${data.accuracyPct}%`}
          </ThemedText>
          <ThemedText
            themeColor="textMuted"
            type="small"
            style={styles.metricLabel}
          >
            평균 정답률
          </ThemedText>
        </View>
      </View>

      {trackLine ? (
        <>
          <CardDivider />
          <ThemedText
            themeColor="textSecondary"
            type="small"
            style={styles.trackLine}
          >
            {trackLine}
          </ThemedText>
        </>
      ) : null}

      <ThemedText
        themeColor="textMuted"
        type="small"
        style={styles.aggregateNote}
      >
        정답률은 참고용이에요 · 점수·청력 검사·진단 결과 아님
      </ThemedText>
    </Card>
  );
}

// ─── 추이 그래프 ────────────────────────────────────────────────────────
// 데이터는 `sessionStore`에 이미 저장됨. y값 = 대표값(meanReversal…, =「들을 수
// 있는 최소 차이」). 대표값이 없는(짧은) 세션은 제외하고, **2회 이상**일 때만 그린다.

/** 짧은 세션 등으로 대표값이 부족할 때의 안내(용어 순화). */
const EMPTY_TREND_COPY =
  "들을 수 있는 최소 차이가 나온 세션이 2회 이상이면 변화를 그려 드립니다";

/** cent(음 높이 차이) 큰 값 표기. 단위어는 카드가 따로 붙인다. 점수·역치 아님. */
function centPlain(v: number): string {
  return `${Math.round(v)}`;
}

/** 떨림 정도(dB) 큰 값 표기. dB 라벨은 카드가 붙인다. */
function dbPlain(v: number): string {
  return `${v.toFixed(1)}`;
}

function pickPitchCents(record: SavedSessionRecord): number | null {
  return record.track === "pitch2" ? record.summary.meanReversalCents : null;
}

function pickFreqCents(record: SavedSessionRecord): number | null {
  return record.track === "freq" ? record.summary.meanReversalDeltaCents : null;
}

function pickAmDepthDb(record: SavedSessionRecord): number | null {
  return record.track === "am" ? record.summary.meanReversalDepthDb : null;
}

/** 최신이 앞인 목록을 **시간순(오래→최근)** 대표값 점들로 바꾼다(값 없음 제외). */
function collectPoints(
  rows: readonly SavedSessionRecord[],
  pick: (record: SavedSessionRecord) => number | null,
): TrendPoint[] {
  const points: TrendPoint[] = [];
  for (let i = rows.length - 1; i >= 0; i -= 1) {
    const value = pick(rows[i]);
    if (value != null) {
      points.push({ value, savedAt: rows[i].savedAt });
    }
  }
  return points;
}

/** 그래프 A(cent) 트랙 선택 칩. pitch2 vs freq는 과제가 달라 겹치지 않고 하나씩 본다. */
const GRAPH_A_TRACKS = [
  { key: "pitch2", label: "높낮이 비교" },
  { key: "freq", label: "다른 음 찾기" },
] as const;

type GraphATrack = (typeof GRAPH_A_TRACKS)[number]["key"];

function TrackChips({
  value,
  onChange,
}: Readonly<{ value: GraphATrack; onChange: (next: GraphATrack) => void }>) {
  const theme = useTheme();
  return (
    <View style={styles.chipRow}>
      {GRAPH_A_TRACKS.map((track) => {
        const active = track.key === value;
        return (
          <Pressable
            key={track.key}
            onPress={() => onChange(track.key)}
            style={[
              styles.chip,
              {
                borderColor: active ? theme.accentBorder : theme.border,
                backgroundColor: active ? theme.accentTint : theme.surface,
              },
            ]}
          >
            <ThemedText
              type="small"
              style={{ color: active ? theme.accent : theme.textSecondary }}
            >
              {track.label}
            </ThemedText>
          </Pressable>
        );
      })}
    </View>
  );
}

/**
 * §2-1 예외: 「개선/점수」 프레이밍. 웰니스 방침상 원래 지양하나, 사용자 결정으로 유지한다.
 * 나중에 지우기 쉽게 **이 컴포넌트 한 곳**에만 둔다.
 * (`TrendGraphCard`의 `<ScoreFraming/>` 호출을 빼면 제거 완료.)
 *
 * 대표값은 작을수록 잘함 → 최근값이 처음보다 작으면 「개선」(하강 화살표).
 */
function ScoreFraming({
  points,
  formatPlain,
}: Readonly<{
  points: readonly TrendPoint[];
  formatPlain: (v: number) => string;
}>) {
  const theme = useTheme();
  if (points.length < 2) {
    return null;
  }
  const first = points[0].value;
  const last = points[points.length - 1].value;
  const improved = last < first;
  const delta = Math.abs(first - last);
  const deltaText = Number.isInteger(delta) ? `${delta}` : delta.toFixed(1);

  return (
    <View style={styles.framing}>
      <View
        style={[
          styles.badge,
          { backgroundColor: improved ? theme.positiveTint : theme.accentTint },
        ]}
      >
        <ThemedText
          type="smallBold"
          style={{ color: improved ? theme.positive : theme.accent }}
        >
          {improved ? `${deltaText} 개선` : "유지"}
        </ThemedText>
      </View>
      <ThemedText themeColor="textMuted" type="small" style={styles.framingSub}>
        {`처음 ${formatPlain(first)} → 최근 ${formatPlain(last)}`}
      </ThemedText>
    </View>
  );
}

function TrendGraphCard({
  title,
  points,
  formatPlain,
  unitLabel,
  caption,
  chips,
}: Readonly<{
  title: string;
  points: readonly TrendPoint[];
  /** 큰 값·델타 표기(단위어 없음). */
  formatPlain: (v: number) => string;
  /** 큰 값 옆 단위 문구. 예: '음 높이 차이 · 최근' / 'dB · 최근'. */
  unitLabel: string;
  /** 카드 하단 설명(순화). */
  caption: string;
  chips?: ReactNode;
}>) {
  const hasEnough = points.length >= 2;
  const recent = points.length > 0 ? points[points.length - 1].value : null;

  return (
    <Card size="large" style={styles.graphCard}>
      <View style={styles.graphHeader}>
        <View style={styles.graphHeaderLeft}>
          <ThemedText
            type="smallBold"
            themeColor="accent"
            style={styles.graphTitle}
          >
            {title}
          </ThemedText>
          {hasEnough && recent != null ? (
            <View style={styles.recentRow}>
              <ThemedText type="metric" style={styles.recentValue}>
                {formatPlain(recent)}
              </ThemedText>
              <ThemedText
                themeColor="textMuted"
                type="small"
                style={styles.recentUnit}
              >
                {unitLabel}
              </ThemedText>
            </View>
          ) : null}
        </View>
        <ScoreFraming points={points} formatPlain={formatPlain} />
      </View>

      {chips}

      {hasEnough ? (
        <>
          <TrendChart points={points} />
          <ThemedText
            themeColor="textSecondary"
            type="small"
            style={styles.graphCaption}
          >
            {caption}
          </ThemedText>
        </>
      ) : (
        <ThemedText
          themeColor="textMuted"
          type="small"
          style={styles.graphEmpty}
        >
          {EMPTY_TREND_COPY}
        </ThemedText>
      )}
    </Card>
  );
}

function HistoryCard({ record }: Readonly<{ record: SavedSessionRecord }>) {
  const content = toCardContent(record);

  return (
    <SummaryCard
      header={
        <SummaryCardHeader
          title={content.trackTitle}
          savedAt={content.savedAt}
        />
      }
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
  const [graphTrackA, setGraphTrackA] = useState<GraphATrack>("pitch2");

  const reload = useCallback(() => {
    setLoading(true);
    setError(null);
    void listSavedSessions()
      .then((next) => {
        setRows(next);
      })
      .catch(() => {
        setError("기록을 불러오지 못했어요");
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

  const graphAPoints = collectPoints(
    rows,
    graphTrackA === "pitch2" ? pickPitchCents : pickFreqCents,
  );
  const amPoints = collectPoints(rows, pickAmDepthDb);

  const listHeader = hasRows ? (
    <View style={styles.headerStack}>
      <AggregateCard data={computeAggregate(rows)} />
      <TrendGraphCard
        title="들을 수 있는 최소 차이 추이"
        chips={<TrackChips value={graphTrackA} onChange={setGraphTrackA} />}
        points={graphAPoints}
        formatPlain={centPlain}
        unitLabel="음 높이 차이 · 최근"
        caption="들을 수 있는 가장 작은 음 높이 차이예요. 낮을수록 더 작은 차이까지 들려요."
      />
      <TrendGraphCard
        title="떨림 추이"
        points={amPoints}
        formatPlain={dbPlain}
        unitLabel="dB · 최근"
        caption="느낄 수 있는 가장 얕은 떨림이에요. 낮을수록 더 얕은 떨림까지 느껴요."
      />
    </View>
  ) : null;

  return (
    <ThemedView style={styles.fill}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.screenHeader}>
          <ThemedText type="screenTitle">연습 통계</ThemedText>
          <ThemedText
            themeColor="textSecondary"
            type="small"
            style={styles.caption}
          >
            이 기기에만 저장 · 점수·청력 검사·진단 결과 아님
          </ThemedText>
        </View>

        {loading ? (
          <ThemedText themeColor="textMuted" type="small" style={styles.notice}>
            불러오는 중…
          </ThemedText>
        ) : null}

        {error ? (
          <ThemedText
            themeColor="textSecondary"
            type="small"
            style={styles.notice}
          >
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
          ListHeaderComponent={listHeader}
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
    alignSelf: "center",
    width: "100%",
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.three,
    paddingBottom: BottomTabInset + Spacing.three,
    alignItems: "stretch",
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
    textAlign: "center",
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
  headerStack: {
    gap: Spacing.three,
  },
  graphCard: {
    gap: Spacing.two,
  },
  graphHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: Spacing.two,
  },
  graphHeaderLeft: {
    flexShrink: 1,
    gap: Spacing.half,
  },
  graphTitle: {
    fontSize: 13.5,
  },
  recentRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: Spacing.one + 2,
  },
  recentValue: {
    fontSize: 34,
    lineHeight: 38,
  },
  recentUnit: {
    flexShrink: 1,
    fontSize: 12,
    lineHeight: 16,
  },
  framing: {
    alignItems: "flex-end",
    gap: Spacing.half,
  },
  framingSub: {
    fontSize: 11.5,
    lineHeight: 16,
  },
  badge: {
    borderRadius: Radius.pill,
    paddingHorizontal: Spacing.three - 6,
    paddingVertical: Spacing.one,
  },
  chipRow: {
    flexDirection: "row",
    gap: Spacing.two,
  },
  chip: {
    borderWidth: 1,
    borderRadius: Radius.pill,
    paddingHorizontal: Spacing.three - 4,
    paddingVertical: Spacing.one + 2,
  },
  graphCaption: {
    fontSize: 12.5,
    lineHeight: 18,
  },
  graphEmpty: {
    fontSize: 12.5,
    lineHeight: 18,
    textAlign: "center",
    paddingVertical: Spacing.three,
  },
  metricRow: {
    flexDirection: "row",
  },
  metric: {
    flex: 1,
    alignItems: "center",
    gap: Spacing.half,
  },
  metricLabel: {
    fontSize: 11.5,
    lineHeight: 16,
    textAlign: "center",
  },
  trackLine: {
    fontSize: 12.5,
    lineHeight: 18,
    textAlign: "center",
  },
  aggregateNote: {
    fontSize: 11,
    lineHeight: 16,
    textAlign: "center",
  },
  actions: {
    flexDirection: "row",
    gap: Spacing.three - 4,
  },
});
