import { useFocusEffect } from "expo-router";
import { useCallback, useEffect, useState, type ReactNode } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { ActionButton } from "@/components/ui/action-button";
import { Card, CardDivider } from "@/components/ui/card";
import { MaxContentWidth, Radius, Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import { TrendChart, type TrendPoint } from "@/training/TrendChart";
import {
  DEFAULT_START_DEPTH_DB,
  MAX_DEPTH_DB,
  MIN_DEPTH_DB,
} from "@/training/am/amStaircase";
import {
  DEFAULT_START_DELTA_CENTS,
  MAX_DELTA_CENTS,
  MIN_DELTA_CENTS,
} from "@/training/freq/freqStaircase";
import {
  deleteSavedSessionsByTrack,
  isCountedInStats,
  listSavedSessions,
  type SavedSessionRecord,
  type SessionTrack,
} from "@/training/sessionStore";

type SessionHistoryScreenProps = {
  onBack?: () => void;
  /** 이 탭에서 볼·지울 트랙. 그래프·평균도 이 kind만. 없으면 지우기 숨김·표시는 전체. */
  clearTracks?: readonly SessionTrack[];
};

/** 트랙 제목(집계 줄·지우기에서 재사용). */
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

      {trackLine.includes(" · ") ? (
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
// 데이터는 `sessionStore`에 이미 저장됨. y값 = 대표값(meanReversal…).
// 대표값이 없는(짧은) 세션은 제외하고, **2회 이상**일 때만 그린다.
// 출발선(200 / 0)은 기준선만. 세션 점으로 넣지 않음.

/** 짧은 세션 등으로 대표값이 부족할 때의 안내. */
const EMPTY_TREND_COPY = "숫자가 나온 연습이 2회 이상이면 선을 그려 드려요";

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

/** `clearTracks`가 있으면 그 kind만. 없으면 필터 없음(호환). */
function visibleTrackSet(
  clearTracks: readonly SessionTrack[],
): ReadonlySet<SessionTrack> | null {
  return clearTracks.length > 0 ? new Set(clearTracks) : null;
}

function filterRowsByTracks(
  rows: readonly SavedSessionRecord[],
  visible: ReadonlySet<SessionTrack> | null,
): SavedSessionRecord[] {
  if (visible == null) {
    return [...rows];
  }
  return rows.filter((row) => visible.has(row.track));
}

function pitchGraphKeys(
  visible: ReadonlySet<SessionTrack> | null,
): GraphATrack[] {
  return GRAPH_A_TRACKS.map((track) => track.key).filter(
    (key) => visible == null || visible.has(key),
  );
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
  allowed,
}: Readonly<{
  value: GraphATrack;
  onChange: (next: GraphATrack) => void;
  allowed: readonly GraphATrack[];
}>) {
  const theme = useTheme();
  return (
    <View style={styles.chipRow}>
      {GRAPH_A_TRACKS.filter((track) => allowed.includes(track.key)).map(
        (track) => {
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
        },
      )}
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
  howToRead,
  startGuide,
  referenceValue,
  referenceLabel,
  chips,
}: Readonly<{
  title: string;
  points: readonly TrendPoint[];
  /** 큰 값·델타 표기(단위어 없음). */
  formatPlain: (v: number) => string;
  /** 큰 값 옆 단위 문구. 예: '음높이 차이 · 최근' / 'dB · 최근'. */
  unitLabel: string;
  /** 숫자 바로 아래. 낮을수록 읽는 법. */
  howToRead: string;
  /** 출발·범위. 가짜 점 아님. */
  startGuide: string;
  referenceValue: number;
  referenceLabel: string;
  chips?: ReactNode;
}>) {
  const hasEnough = points.length >= 2;
  const recent = points.at(-1)?.value ?? null;

  return (
    <Card size="large" style={styles.graphCard}>
      <View style={styles.graphHeader}>
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
        <ScoreFraming points={points} formatPlain={formatPlain} />
        {hasEnough ? (
          <>
            <ThemedText type="smallBold" style={styles.howToRead}>
              {howToRead}
            </ThemedText>
            <ThemedText
              type="small"
              themeColor="textMuted"
              style={styles.startGuide}
            >
              {startGuide}
            </ThemedText>
          </>
        ) : null}
      </View>

      {chips}

      {hasEnough ? (
        <TrendChart
          points={points}
          referenceValue={referenceValue}
          referenceLabel={referenceLabel}
        />
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

/**
 * 로컬 연습 기록 통계(정적). AsyncStorage 요약만. 진단·점수 UI 아님.
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

  const visible = visibleTrackSet(clearTracks);
  const visibleRows = filterRowsByTracks(rows, visible);

  // 통계·추세는 연습(measure)만. 귀풀기는 저장하지 않음. 남은 구기록은 집계에서 제외.
  // mode가 없는 구버전 레코드는 측정으로 간주(집계 포함).
  const statRows = visibleRows.filter(isCountedInStats);
  const hasStatRows = statRows.length > 0;

  const pitchKeys = pitchGraphKeys(visible);
  const graphPick: GraphATrack = pitchKeys.includes(graphTrackA)
    ? graphTrackA
    : (pitchKeys[0] ?? "pitch2");
  const showPitchTrend = pitchKeys.length > 0;
  const showAmTrend = visible == null || visible.has("am");
  const showPitchChips = pitchKeys.length >= 2;

  const graphAPoints = collectPoints(
    statRows,
    graphPick === "pitch2" ? pickPitchCents : pickFreqCents,
  );
  const amPoints = collectPoints(statRows, pickAmDepthDb);

  const statsBody = hasStatRows ? (
    <View style={styles.headerStack}>
      <AggregateCard data={computeAggregate(statRows)} />
      {showPitchTrend ? (
        <TrendGraphCard
          title="음높이 차이 변화"
          chips={
            showPitchChips ? (
              <TrackChips
                value={graphPick}
                onChange={setGraphTrackA}
                allowed={pitchKeys}
              />
            ) : undefined
          }
          points={graphAPoints}
          formatPlain={centPlain}
          unitLabel="음높이 차이 · 최근"
          howToRead="작을수록 더 비슷한 소리"
          startGuide={`매 연습은 ${DEFAULT_START_DELTA_CENTS}에서 시작 · 대략 ${MIN_DELTA_CENTS}~${MAX_DELTA_CENTS}`}
          referenceValue={DEFAULT_START_DELTA_CENTS}
          referenceLabel={`시작 ${DEFAULT_START_DELTA_CENTS}`}
        />
      ) : null}
      {showAmTrend ? (
        <TrendGraphCard
          title="떨림 변화"
          points={amPoints}
          formatPlain={dbPlain}
          unitLabel="dB · 최근"
          howToRead="작을수록 더 얕은 떨림"
          startGuide={`매 연습은 ${DEFAULT_START_DEPTH_DB}에서 시작 · 대략 ${MAX_DEPTH_DB}~${MIN_DEPTH_DB}`}
          referenceValue={DEFAULT_START_DEPTH_DB}
          referenceLabel={`시작 ${DEFAULT_START_DEPTH_DB}`}
        />
      ) : null}
    </View>
  ) : null;

  return (
    <ThemedView style={styles.fill}>
      <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
        <View style={styles.screenHeader}>
          <ThemedText type="screenTitle">연습 기록</ThemedText>
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

        {!loading && !error && !hasStatRows ? (
          <ThemedText themeColor="textMuted" type="small" style={styles.notice}>
            아직 기록된 연습이 없어요
          </ThemedText>
        ) : null}

        {statsBody ? (
          <ScrollView
            style={styles.list}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          >
            {statsBody}
          </ScrollView>
        ) : (
          <View style={styles.list} />
        )}

        {onBack || clearTracks.length > 0 ? (
          <View style={styles.footer}>
            {onBack ? (
              <ActionButton
                fill={false}
                variant="primary"
                label="뒤로 가기"
                onPress={onBack}
              />
            ) : (
              <View />
            )}
            {clearTracks.length > 0 ? (
              <View style={styles.dangerZone}>
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
    fontSize: 12.5,
    lineHeight: 18,
  },
  howToRead: {
    fontSize: 13,
    lineHeight: 18,
  },
  startGuide: {
    fontSize: 12,
    lineHeight: 17,
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
  footer: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: Spacing.two,
  },
  dangerZone: {
    flexShrink: 1,
    alignItems: "flex-end",
    gap: Spacing.one,
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
