/**
 * 음고·떨림 한 종목의 누적 요약 + 추이 그래프.
 * `SessionHistoryScreen`에 있던 카드들을 그대로 옮겨 온 것 — 통합 통계 화면이
 * 칩으로 종목을 고르므로, 트랙 선택 칩(pitch2 ↔ freq)은 여기서 빠졌다.
 *
 * 데이터는 `sessionStore`에 이미 저장됨. y값 = 대표값(meanReversal…).
 * 대표값이 없는(짧은) 세션은 제외하고, **2회 이상**일 때만 그린다.
 * 출발선(200 / 0)은 기준선만. 세션 점으로 넣지 않음.
 */

import { StyleSheet, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { Card, CardDivider } from "@/components/ui/card";
import { Spacing } from "@/constants/theme";
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
import type { SavedSessionRecord, SessionTrack } from "@/training/sessionStore";

/** 짧은 세션 등으로 대표값이 부족할 때의 안내. */
const EMPTY_TREND_COPY = "숫자가 나온 연습이 2회 이상이면 선을 그려 드려요";

/** 추이 비교 한 줄의 기준: **최신 1회를 뺀 직전 N회 평균**. */
const SCORE_BASELINE_WINDOW = 3;

/** cent(음 높이 차이) 큰 값 표기. 단위어는 카드가 따로 붙인다. 점수·역치 아님. */
function centPlain(v: number): string {
  return `${Math.round(v)}`;
}

/** 떨림 정도(dB) 큰 값 표기. dB 라벨은 카드가 붙인다. */
function dbPlain(v: number): string {
  return `${v.toFixed(1)}`;
}

function pickRepresentative(record: SavedSessionRecord): number | null {
  switch (record.track) {
    case "pitch2":
      return record.summary.meanReversalCents;
    case "freq":
      return record.summary.meanReversalDeltaCents;
    case "am":
      return record.summary.meanReversalDepthDb;
  }
}

/** 최신이 앞인 목록을 **시간순(오래→최근)** 대표값 점들로 바꾼다(값 없음 제외). */
function collectPoints(rows: readonly SavedSessionRecord[]): TrendPoint[] {
  const points: TrendPoint[] = [];
  for (let i = rows.length - 1; i >= 0; i -= 1) {
    const value = pickRepresentative(rows[i]);
    if (value != null) {
      points.push({ value, savedAt: rows[i].savedAt });
    }
  }
  return points;
}

type TrackFace = {
  title: string;
  formatPlain: (v: number) => string;
  /** 큰 값 옆 단위 문구. */
  unitLabel: string;
  /** 숫자 바로 아래. 낮을수록 읽는 법. */
  howToRead: string;
  /** 출발·범위. 가짜 점 아님. */
  startGuide: string;
  referenceValue: number;
  referenceLabel: string;
};

/** 음고 두 과제(pitch2 · freq)는 단위·범위가 같아 같은 얼굴을 쓴다. */
const CENT_FACE: Omit<TrackFace, "title"> = {
  formatPlain: centPlain,
  unitLabel: "음높이 차이 · 최근",
  howToRead: "작을수록 더 비슷한 소리",
  startGuide: `매 연습은 ${DEFAULT_START_DELTA_CENTS}에서 시작 · 대략 ${MIN_DELTA_CENTS}~${MAX_DELTA_CENTS}`,
  referenceValue: DEFAULT_START_DELTA_CENTS,
  referenceLabel: `시작 ${DEFAULT_START_DELTA_CENTS}`,
};

const TRACK_FACE: Record<SessionTrack, TrackFace> = {
  pitch2: { title: "음높이 차이 변화", ...CENT_FACE },
  freq: { title: "음높이 차이 변화", ...CENT_FACE },
  am: {
    title: "떨림 변화",
    formatPlain: dbPlain,
    unitLabel: "dB · 최근",
    howToRead: "작을수록 더 얕은 떨림",
    startGuide: `매 연습은 ${DEFAULT_START_DEPTH_DB}에서 시작 · 대략 ${MAX_DEPTH_DB}~${MIN_DEPTH_DB}`,
    referenceValue: DEFAULT_START_DEPTH_DB,
    referenceLabel: `시작 ${DEFAULT_START_DEPTH_DB}`,
  },
};

type Aggregate = {
  totalSessions: number;
  totalTrials: number;
  totalCorrect: number;
  /** 0~100. 문항이 없으면 null. 점수·역치 아님(참고용). */
  accuracyPct: number | null;
};

/** 저장된 요약들을 합쳐 참고용 누적 수치를 만든다. 진단·역치 아님. */
function computeAggregate(rows: readonly SavedSessionRecord[]): Aggregate {
  let totalTrials = 0;
  let totalCorrect = 0;

  for (const row of rows) {
    totalTrials += row.summary.trialCount;
    totalCorrect += row.summary.correctCount;
  }

  return {
    totalSessions: rows.length,
    totalTrials,
    totalCorrect,
    accuracyPct:
      totalTrials > 0 ? Math.round((totalCorrect / totalTrials) * 100) : null,
  };
}

/** 화면 상단 누적 요약. 세션이 있을 때만 렌더. */
function AggregateCard({ data }: Readonly<{ data: Aggregate }>) {
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

      <CardDivider />

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

/**
 * 추이 비교 한 줄. 배지·「개선/유지」 문구 없음.
 * 평균용 점이 N개 미만이면 처음↔최근.
 */
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
  face,
  points,
}: Readonly<{ face: TrackFace; points: readonly TrendPoint[] }>) {
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
          {face.title}
        </ThemedText>
        {hasEnough && recent != null ? (
          <View style={styles.recentRow}>
            <ThemedText type="metric" style={styles.recentValue}>
              {face.formatPlain(recent)}
            </ThemedText>
            <ThemedText
              themeColor="textMuted"
              type="small"
              style={styles.recentUnit}
            >
              {face.unitLabel}
            </ThemedText>
          </View>
        ) : null}
        <ScoreFraming points={points} formatPlain={face.formatPlain} />
        {hasEnough ? (
          <>
            <ThemedText type="smallBold" style={styles.howToRead}>
              {face.howToRead}
            </ThemedText>
            <ThemedText
              type="small"
              themeColor="textMuted"
              style={styles.startGuide}
            >
              {face.startGuide}
            </ThemedText>
          </>
        ) : null}
      </View>

      {hasEnough ? (
        <TrendChart
          points={points}
          referenceValue={face.referenceValue}
          referenceLabel={face.referenceLabel}
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
 * 한 트랙(음고 두 과제 중 하나 · 떨림)의 통계 본문.
 * `rows`는 이미 그 트랙만 걸러진, 최신이 앞인 목록이다.
 */
export function SessionTrendPanel({
  rows,
  track,
}: Readonly<{ rows: readonly SavedSessionRecord[]; track: SessionTrack }>) {
  if (rows.length === 0) {
    return null;
  }

  return (
    <View style={styles.stack}>
      <AggregateCard data={computeAggregate(rows)} />
      <TrendGraphCard face={TRACK_FACE[track]} points={collectPoints(rows)} />
    </View>
  );
}

const styles = StyleSheet.create({
  stack: {
    gap: Spacing.three,
  },
  aggregate: {
    gap: Spacing.three - 4,
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
  aggregateNote: {
    fontSize: 11,
    lineHeight: 16,
    textAlign: "center",
  },
});
