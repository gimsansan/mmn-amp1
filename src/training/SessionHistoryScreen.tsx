import { useFocusEffect } from "expo-router";
import { useCallback, useEffect, useState, type ReactNode } from "react";
import { Alert, FlatList, Pressable, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { ActionButton } from "@/components/ui/action-button";
import { Card, CardDivider } from "@/components/ui/card";
import { MaxContentWidth, Radius, Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import { SummaryCard, SummaryCardHeader } from "@/training/SummaryCard";
import { TrendChart, type TrendPoint } from "@/training/TrendChart";
import { endReasonLabel } from "@/training/freq/freqSession";
import { sessionModeLabel } from "@/training/sessionMode";
import {
  deleteSavedSession,
  deleteSavedSessionsByTrack,
  isCountedInStats,
  listSavedSessions,
  type SavedSessionRecord,
  type SessionTrack,
} from "@/training/sessionStore";

type SessionHistoryScreenProps = {
  onBack?: () => void;
  /** 하단에서 지울 트랙. 목록·그래프는 전부 보여 준다. 없으면 지우기 영역 숨김. */
  clearTracks?: readonly SessionTrack[];
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
            측정 횟수
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
        정답률은 참고용이에요
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
 * 추이 비교 한 줄. 배지·「개선/유지」 문구 없음.
 * 기준: **최신 1회를 뺀 직전 N회 평균**. 평균용 점이 N개 미만이면 처음↔최근.
 */
const SCORE_BASELINE_WINDOW = 3;

function ScoreFraming({
  points,
  formatPlain,
}: Readonly<{
  points: readonly TrendPoint[];
  formatPlain: (v: number) => string;
}>) {
  if (points.length < 2) {
    return null;
  }
  const last = points.at(-1)!.value;
  const prior = points.slice(0, -1); // 최신 제외
  const useAverage = prior.length >= SCORE_BASELINE_WINDOW;

  let subText: string;
  if (useAverage) {
    const window = prior.slice(-SCORE_BASELINE_WINDOW);
    const baseline =
      window.reduce((sum, p) => sum + p.value, 0) / window.length;
    subText = `최근 ${SCORE_BASELINE_WINDOW}회 평균 ${formatPlain(
      baseline,
    )} → 최근 ${formatPlain(last)}`;
  } else {
    subText = `처음 ${formatPlain(points[0].value)} → 최근 ${formatPlain(last)}`;
  }

  return (
    <ThemedText themeColor="textMuted" type="small" style={styles.framingSub}>
      {subText}
    </ThemedText>
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

function HistoryCard({
  record,
  onDelete,
}: Readonly<{
  record: SavedSessionRecord;
  onDelete: (id: string) => void;
}>) {
  const content = toCardContent(record);
  // 연습/측정 구분을 목록에서 보이게. mode 없는 구버전은 배지 없음.
  const badge = record.mode ? sessionModeLabel(record.mode) : null;

  return (
    <View>
      <SummaryCard
        header={
          <SummaryCardHeader
            title={content.trackTitle}
            savedAt={content.savedAt}
            badge={badge}
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
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="이 기록 삭제"
        onPress={() => onDelete(record.id)}
        style={styles.rowDelete}
      >
        <ThemedText
          themeColor="textMuted"
          type="small"
          style={styles.rowDeleteLabel}
        >
          삭제
        </ThemedText>
      </Pressable>
    </View>
  );
}

/**
 * 로컬 연습 기록 목록(정적). AsyncStorage 요약만. 진단·점수 UI 아님.
 */
export function SessionHistoryScreen({
  onBack,
  clearTracks = [],
}: Readonly<SessionHistoryScreenProps>) {
  const [rows, setRows] = useState<SavedSessionRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [graphTrackA, setGraphTrackA] = useState<GraphATrack>("pitch2");
  const [clearingTrack, setClearingTrack] = useState<SessionTrack | null>(null);

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

  // 탭이 살아있는 채로 포커스가 돌아올 때도 갱신한다(탭 전환 후 복귀 등).
  useFocusEffect(
    useCallback(() => {
      reload();
    }, [reload]),
  );

  const doClearTrack = useCallback(
    (track: SessionTrack) => {
      setClearingTrack(track);
      void deleteSavedSessionsByTrack(track)
        .then(() => {
          Alert.alert("완료", `${TRACK_LABEL[track]} 기록을 지웠어요.`);
          reload();
        })
        .catch(() => {
          Alert.alert("오류", "기록을 지우지 못했어요.");
        })
        .finally(() => {
          setClearingTrack(null);
        });
    },
    [reload],
  );

  const confirmClearTrack = useCallback(
    (track: SessionTrack) => {
      const title = TRACK_LABEL[track];
      Alert.alert(
        "기록 삭제",
        `${title} 기록을 모두 지울까요? 다른 연습 기록은 그대로예요. 되돌릴 수 없어요.`,
        [
          { text: "취소", style: "cancel" },
          {
            text: "삭제",
            style: "destructive",
            onPress: () => {
              doClearTrack(track);
            },
          },
        ],
      );
    },
    [doClearTrack],
  );

  const doDeleteOne = useCallback(
    (id: string) => {
      void deleteSavedSession(id)
        .then(() => {
          reload();
        })
        .catch(() => {
          Alert.alert("오류", "기록을 지우지 못했어요.");
        });
    },
    [reload],
  );

  const confirmDeleteOne = useCallback(
    (id: string) => {
      Alert.alert("기록 삭제", "이 기록을 지울까요? 되돌릴 수 없어요.", [
        { text: "취소", style: "cancel" },
        {
          text: "삭제",
          style: "destructive",
          onPress: () => {
            doDeleteOne(id);
          },
        },
      ]);
    },
    [doDeleteOne],
  );

  const hasRows = rows.length > 0;

  // 통계·추세는 측정(measure) 세션만 집계한다. 연습(practice)은 목록에만 남긴다.
  // mode가 없는 구버전 레코드는 측정으로 간주(집계 포함).
  const statRows = rows.filter(isCountedInStats);
  const hasStatRows = statRows.length > 0;

  const graphAPoints = collectPoints(
    statRows,
    graphTrackA === "pitch2" ? pickPitchCents : pickFreqCents,
  );
  const amPoints = collectPoints(statRows, pickAmDepthDb);

  const listHeader = hasStatRows ? (
    <View style={styles.headerStack}>
      <AggregateCard data={computeAggregate(statRows)} />
      <TrendGraphCard
        title="들을 수 있는 최소 차이 변화"
        chips={<TrackChips value={graphTrackA} onChange={setGraphTrackA} />}
        points={graphAPoints}
        formatPlain={centPlain}
        unitLabel="음높이 차이 · 최근"
        caption="들을 수 있는 가장 작은 음높이 차이예요. 낮을수록 더 작은 차이까지 들려요."
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
      <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
        <View style={styles.screenHeader}>
          <ThemedText type="screenTitle">훈련 기록</ThemedText>
          <ThemedText
            themeColor="textSecondary"
            type="small"
            style={styles.caption}
            numberOfLines={1}
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
          renderItem={({ item }) => (
            <HistoryCard record={item} onDelete={confirmDeleteOne} />
          )}
        />

        <View style={styles.actions}>
          <ActionButton outlineMatchLabel label="새로고침" onPress={reload} />
          {onBack ? (
            <ActionButton variant="primary" label="돌아가기" onPress={onBack} />
          ) : null}
        </View>

        {clearTracks.length > 0 ? (
          <View style={styles.dangerZone}>
            <CardDivider />
            {clearTracks.length > 1 ? (
              <ThemedText
                themeColor="textMuted"
                type="small"
                style={styles.clearHint}
              >
                연습별로 기록을 지워요
              </ThemedText>
            ) : null}
            {clearTracks.map((track) => {
              const hasTrack = rows.some((row) => row.track === track);
              const busy = clearingTrack != null;
              const disabled = busy || !hasTrack;
              return (
                <Pressable
                  key={track}
                  accessibilityRole="button"
                  accessibilityLabel={`${TRACK_LABEL[track]} 기록 지우기`}
                  accessibilityState={{ disabled }}
                  disabled={disabled}
                  onPress={() => confirmClearTrack(track)}
                  style={({ pressed }) => [
                    styles.clearTrack,
                    disabled && styles.clearTrackDisabled,
                    pressed && !disabled && styles.clearTrackPressed,
                  ]}
                >
                  <ThemedText
                    themeColor="danger"
                    type="small"
                    style={styles.clearTrackLabel}
                  >
                    {clearingTrack === track
                      ? "지우는 중…"
                      : `${TRACK_LABEL[track]} 지우기`}
                  </ThemedText>
                </Pressable>
              );
            })}
          </View>
        ) : null}
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
    paddingBottom: Spacing.three,
    alignItems: "stretch",
    gap: Spacing.three - 2,
  },
  screenHeader: {
    gap: Spacing.one + 2,
  },
  caption: {
    fontSize: 11.5,
    lineHeight: 17,
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
  framingSub: {
    fontSize: 11.5,
    lineHeight: 16,
    flexShrink: 1,
    textAlign: "right",
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
  rowDelete: {
    alignSelf: "flex-end",
    minHeight: 48,
    justifyContent: "center",
    paddingHorizontal: Spacing.two,
  },
  rowDeleteLabel: {
    fontSize: 12.5,
    lineHeight: 18,
  },
  actions: {
    flexDirection: "row",
    gap: Spacing.three - 4,
  },
  dangerZone: {
    gap: Spacing.one,
  },
  clearHint: {
    fontSize: 12,
    lineHeight: 16,
    alignSelf: "flex-end",
  },
  clearTrack: {
    alignSelf: "flex-end",
    minHeight: 44,
    justifyContent: "center",
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.one,
  },
  clearTrackLabel: {
    fontSize: 12.5,
    lineHeight: 18,
  },
  clearTrackPressed: {
    opacity: 0.7,
  },
  clearTrackDisabled: {
    opacity: 0.4,
  },
});
