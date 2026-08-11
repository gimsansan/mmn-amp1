import { useCallback, useEffect, useRef, useState } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { ActionButton } from "@/components/ui/action-button";
import { Equalizer } from "@/components/ui/equalizer";
import { Icon } from "@/components/ui/icon";
import { Pill } from "@/components/ui/pill";
import {
  BottomTabInset,
  MaxContentWidth,
  Radius,
  Shadows,
  Spacing,
} from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import { AUDIO } from "@/training/pitch2afc/constants";
import {
  abortPitchPlayback,
  playPitchPair,
} from "@/training/pitch2afc/pitchCompareTrial";
import type {
  PitchCompareEndReason,
  PitchCompareSummary,
} from "@/training/pitch2afc/pitchSummary";
import {
  SessionManager,
  type SessionResult,
} from "@/training/pitch2afc/SessionManager";
import { appendPitch2SessionSummary } from "@/training/sessionStore";
import { SummaryCard } from "@/training/SummaryCard";

/**
 * 세션 길이 — freq 파일럿과 같은 값(전환 4 / 시행 40, 사용자 합의 2026-08-06).
 * pitch2afc `ASSESSMENT`(전환 8 / 시행 30)는 평가 모드용이라 쓰지 않는다.
 */
const TARGET_REVERSALS = 4;
const MAX_TRIALS = 40;

type Phase = "idle" | "playing" | "choose" | "feedback" | "summary";

type EndReason = PitchCompareEndReason;

function endReasonLabel(reason: EndReason): string {
  switch (reason) {
    case "reversals":
      return "오늘 연습량에 도달했어요";
    case "max_trials":
      return "연습 횟수 한도에 도달했어요";
    case "manual":
      return "직접 종료했어요";
  }
}

/** 요약 지표 계산 — 세션 결과에서 웰니스용 참고값만 뽑는다(역치·점수 아님). */
function summarize(
  result: SessionResult,
  endReason: EndReason,
): PitchCompareSummary {
  const reversals = result.reversals ?? [];
  const lastFour = reversals.slice(-4);
  const meanReversalCents =
    lastFour.length === 0
      ? null
      : lastFour.reduce((a, b) => a + b, 0) / lastFour.length;

  const deltas = result.trials.map((t) => t.centsDifference);
  const easiestCents = deltas.length === 0 ? null : Math.max(...deltas);
  const hardestCents = deltas.length === 0 ? null : Math.min(...deltas);

  return {
    trialCount: result.totalTrials,
    correctCount: result.correctCount,
    reversalCount: reversals.length,
    endReason,
    meanReversalCents,
    easiestCents,
    hardestCents,
  };
}

function phaseCaption(phase: Phase, correct: boolean | undefined): string {
  switch (phase) {
    case "playing":
      return "듣는 중… 소리가 끝난 뒤 고르세요";
    case "choose":
      return "두 번째 소리가 더 높았나요, 낮았나요?";
    case "feedback":
      return correct ? "맞았어요" : "아쉬워요";
    case "summary":
      return "오늘 연습이 끝났어요";
    default:
      return "시작을 누르면 난이도가 맞춰지는 연습이 이어집니다";
  }
}

function progressCaption(
  phase: Phase,
  trialNumber: number,
  reversalCount: number,
): string {
  if (phase === "idle") {
    return `난이도 전환 ${TARGET_REVERSALS}번 또는 연습 ${MAX_TRIALS}번까지`;
  }
  return `연습 ${trialNumber} · 전환 ${reversalCount}/${TARGET_REVERSALS}`;
}

function centsText(value: number | null): string {
  return value == null ? "—" : `약 ${Math.round(value)}`;
}

/** 2택 답 버튼 하나. pressed 강조 분기를 여기로 모아 화면 복잡도를 낮춘다. */
function ChoiceButton({
  label,
  a11yLabel,
  disabled,
  onPress,
}: Readonly<{
  label: string;
  a11yLabel: string;
  disabled: boolean;
  onPress: () => void;
}>) {
  const theme = useTheme();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={a11yLabel}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => {
        const active = pressed && !disabled;
        return [
          styles.choiceButton,
          {
            backgroundColor: active ? theme.accentTint : theme.surface,
            borderColor: active ? theme.accentBorder : theme.border,
          },
          Shadows.card,
          disabled && styles.disabled,
        ];
      }}
    >
      <ThemedText type="smallBold" style={styles.choiceLabel}>
        {label}
      </ThemedText>
    </Pressable>
  );
}

/** 화면 상단 — idle은 히어로, 진행/요약은 제목 + 진행 배지(또는 종료 사유). */
function SessionHeader({
  phase,
  trialNumber,
  reversalCount,
  correct,
  endReason,
}: Readonly<{
  phase: Phase;
  trialNumber: number;
  reversalCount: number;
  correct: boolean | undefined;
  endReason: EndReason | null;
}>) {
  const theme = useTheme();

  if (phase === "idle") {
    return (
      <View style={styles.hero}>
        <View style={[styles.heroMark, { backgroundColor: theme.accentTint }]}>
          <View style={[styles.heroRing, { borderColor: theme.accentBorder }]} />
          <Icon name="wave" size={40} color={theme.accent} />
        </View>
        <ThemedText type="heading">높낮이 비교</ThemedText>
        <ThemedText themeColor="textSecondary" type="small" style={styles.caption}>
          웰니스 연습 · 병원 검사·진단을 대신하지 않아요
        </ThemedText>
        <Pill mono label={progressCaption(phase, trialNumber, reversalCount)} />
        <ThemedText type="smallBold" style={styles.heroPrompt}>
          {phaseCaption(phase, correct)}
        </ThemedText>
      </View>
    );
  }

  const showEndReason = phase === "summary" && endReason != null;
  return (
    <View style={styles.header}>
      <ThemedText type="screenTitle" style={styles.caption}>
        높낮이 비교
      </ThemedText>
      <ThemedText themeColor="textMuted" type="small" style={styles.disclaimer}>
        웰니스 연습 · 병원 검사·진단을 대신하지 않아요
      </ThemedText>
      {showEndReason ? (
        <ThemedText themeColor="textSecondary" type="small" style={styles.caption}>
          {endReasonLabel(endReason)}
        </ThemedText>
      ) : (
        <Pill mono label={progressCaption(phase, trialNumber, reversalCount)} />
      )}
    </View>
  );
}

/** 하단 버튼 묶음 — 단계별로 다른 버튼을 낸다. */
function SessionActions({
  phase,
  canGoBack,
  onStart,
  onBack,
  onNext,
  onEndManual,
}: Readonly<{
  phase: Phase;
  canGoBack: boolean;
  onStart: () => void;
  onBack: () => void;
  onNext: () => void;
  onEndManual: () => void;
}>) {
  const atRest = phase === "idle" || phase === "summary";
  const playingOrChoosing = phase === "playing" || phase === "choose";

  return (
    <View style={styles.actions}>
      {atRest ? (
        <>
          <ActionButton
            variant="primary"
            label={phase === "summary" ? "다시 연습" : "연습 시작"}
            onPress={onStart}
          />
          {canGoBack ? (
            <ActionButton label="연습 목록" onPress={onBack} />
          ) : null}
        </>
      ) : null}

      {phase === "feedback" ? (
        <>
          <ActionButton variant="primary" label="다음" onPress={onNext} />
          <ActionButton label="끝내기" onPress={onEndManual} />
        </>
      ) : null}

      {playingOrChoosing ? (
        <ActionButton icon="stop" label="중지" onPress={onEndManual} />
      ) : null}
    </View>
  );
}

type PitchCompareScreenProps = {
  /** 연습 목록으로 돌아가기(idle·요약에서만 노출). */
  onBack?: () => void;
};

/**
 * 「높낮이 비교」 — 기준음 A → 목표음 B 를 듣고 B가 더 높은지/낮은지 고르는 훈련(2택).
 *
 * 훈련 모드 전용(평가 모드 아님). 요약은 진단 역치가 아니라 최근 난이도 참고값이며,
 * cent 격차를 색·게이지에 연동하지 않는다(시각 누수 금지).
 * 세션 종료 시 요약을 `sessionStore`(track 'pitch2')에 1건 저장한다.
 */
export function PitchCompareScreen({
  onBack,
}: Readonly<PitchCompareScreenProps>) {
  const theme = useTheme();
  const abortRef = useRef(false);
  const managerRef = useRef<SessionManager | null>(null);
  /** 이번 세션 요약을 이미 저장했는지. 중복 저장 방지(세션 시작 시 리셋). */
  const savedRef = useRef(false);
  const [phase, setPhase] = useState<Phase>("idle");
  const [trialNumber, setTrialNumber] = useState(0);
  const [reversalCount, setReversalCount] = useState(0);
  const [correct, setCorrect] = useState<boolean | undefined>(undefined);
  const [summary, setSummary] = useState<PitchCompareSummary | null>(null);
  const [lastError, setLastError] = useState<string | null>(null);
  const [saveNote, setSaveNote] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      abortRef.current = true;
      abortPitchPlayback();
    };
  }, []);

  const runRound = useCallback(async () => {
    const manager = managerRef.current;
    if (!manager) {
      return;
    }

    setLastError(null);
    setCorrect(undefined);
    abortRef.current = false;

    const state = manager.prepareRound();
    setTrialNumber(state.totalTrials + 1);
    setPhase("playing");

    try {
      await playPitchPair(state.baseFreq, state.targetFreq, {
        shouldAbort: () => abortRef.current,
      });
      if (abortRef.current) {
        return;
      }
      manager.openResponseWindow();
      setPhase("choose");
    } catch (e) {
      if (e instanceof Error && e.message === "ABORTED") {
        return;
      }
      setLastError(e instanceof Error ? e.message : String(e));
      setPhase("idle");
      managerRef.current = null;
    }
  }, []);

  const finish = useCallback((reason: EndReason) => {
    const manager = managerRef.current;
    abortRef.current = true;
    abortPitchPlayback();
    if (!manager) {
      setPhase("idle");
      return;
    }
    const result = manager.endSession();
    const nextSummary = summarize(result, reason);
    setSummary(nextSummary);
    setReversalCount(result.reversals?.length ?? 0);
    setPhase("summary");

    if (savedRef.current) {
      return;
    }
    savedRef.current = true;
    setSaveNote(null);
    void appendPitch2SessionSummary(nextSummary)
      .then(() => setSaveNote("기기에 기록했어요"))
      .catch(() => setSaveNote("기록 저장에 실패했어요"));
  }, []);

  const onStart = useCallback(() => {
    const manager = new SessionManager({
      mode: "training",
      baseFreq: AUDIO.BASE_FREQ,
      soundMode: "wave",
    });
    manager.startSession();
    managerRef.current = manager;
    savedRef.current = false;
    setSummary(null);
    setSaveNote(null);
    setReversalCount(0);
    setCorrect(undefined);
    void runRound();
  }, [runRound]);

  const onAnswer = useCallback(
    (userThinksHigher: boolean) => {
      const manager = managerRef.current;
      if (!manager || phase !== "choose") {
        return;
      }
      const result = manager.submitAnswer(userThinksHigher);
      const state = manager.getStaircaseState();
      setCorrect(result.isCorrect);
      setReversalCount(state.reversalCount);

      if (state.reversalCount >= TARGET_REVERSALS) {
        finish("reversals");
        return;
      }
      if (state.totalTrials >= MAX_TRIALS) {
        finish("max_trials");
        return;
      }
      setPhase("feedback");
    },
    [finish, phase],
  );

  const onNext = useCallback(() => {
    if (!managerRef.current) {
      return;
    }
    void runRound();
  }, [runRound]);

  const onEndManual = useCallback(() => {
    finish("manual");
  }, [finish]);

  const leaveToList = useCallback(() => {
    abortRef.current = true;
    abortPitchPlayback();
    managerRef.current = null;
    onBack?.();
  }, [onBack]);

  const choiceDisabled = phase !== "choose";
  const running =
    phase === "playing" || phase === "choose" || phase === "feedback";

  return (
    <ThemedView style={styles.fill}>
      <SafeAreaView style={styles.safeArea}>
        <SessionHeader
          phase={phase}
          trialNumber={trialNumber}
          reversalCount={reversalCount}
          correct={correct}
          endReason={summary?.endReason ?? null}
        />

        {phase === "summary" ? (
          <ScrollView
            style={styles.summaryScroll}
            contentContainerStyle={styles.summaryScrollContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.headline}>
              <Icon name="check" size={18} color={theme.accent} strokeWidth={2.2} />
              <ThemedText type="smallBold" style={styles.headlineText}>
                {phaseCaption(phase, correct)}
              </ThemedText>
            </View>

            {summary ? (
              <SummaryCard
                trialCount={summary.trialCount}
                correctCount={summary.correctCount}
                reversalCount={summary.reversalCount}
                meanLabel="음높이 차이"
                meanValue={centsText(summary.meanReversalCents)}
                easiestValue={centsText(summary.easiestCents)}
                hardestValue={centsText(summary.hardestCents)}
                footnote="작을수록 더 세밀한 구분 · 점수·청력 검사·진단 결과 아님"
              />
            ) : null}

            {saveNote ? (
              <ThemedText
                themeColor="textSecondary"
                type="small"
                style={styles.caption}
              >
                {saveNote}
              </ThemedText>
            ) : null}
          </ScrollView>
        ) : null}

        {running ? (
          <View style={styles.statusRow}>
            {phase === "playing" ? <Equalizer color={theme.accent} /> : null}
            <ThemedText
              type="smallBold"
              themeColor="textSecondary"
              style={styles.statusText}
            >
              {phaseCaption(phase, correct)}
            </ThemedText>
          </View>
        ) : null}

        {running ? (
          <View style={styles.choices}>
            <ChoiceButton
              label="더 낮아요"
              a11yLabel="두 번째 소리가 더 낮아요"
              disabled={choiceDisabled}
              onPress={() => onAnswer(false)}
            />
            <ChoiceButton
              label="더 높아요"
              a11yLabel="두 번째 소리가 더 높아요"
              disabled={choiceDisabled}
              onPress={() => onAnswer(true)}
            />
          </View>
        ) : null}

        {lastError ? (
          <ThemedText
            themeColor="textSecondary"
            type="small"
            style={styles.caption}
          >
            {lastError}
          </ThemedText>
        ) : null}

        <SessionActions
          phase={phase}
          canGoBack={onBack != null}
          onStart={onStart}
          onBack={leaveToList}
          onNext={onNext}
          onEndManual={onEndManual}
        />
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
    gap: Spacing.two + 2,
  },
  hero: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.two + 2,
  },
  heroMark: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.three - 2,
  },
  heroRing: {
    position: "absolute",
    top: -8,
    left: -8,
    right: -8,
    bottom: -8,
    borderRadius: 52,
    borderWidth: 1,
  },
  heroPrompt: {
    textAlign: "center",
    maxWidth: 240,
    fontSize: 12.5,
    lineHeight: 19,
  },
  header: {
    alignItems: "center",
    gap: Spacing.one + 2,
  },
  caption: {
    textAlign: "center",
  },
  disclaimer: {
    fontSize: 11.5,
    lineHeight: 17,
    textAlign: "center",
  },
  headline: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.two - 1,
    marginTop: Spacing.one,
  },
  headlineText: {
    fontSize: 15,
    lineHeight: 22,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.two,
    marginVertical: Spacing.three - 2,
    minHeight: 20,
  },
  statusText: {
    fontSize: 13,
    lineHeight: 20,
    textAlign: "center",
  },
  choices: {
    flexDirection: "row",
    gap: Spacing.three - 4,
  },
  choiceButton: {
    flex: 1,
    minHeight: 96,
    borderWidth: 1.5,
    borderRadius: Radius.large,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: Spacing.two,
  },
  choiceLabel: {
    fontSize: 17,
    lineHeight: 24,
  },
  summaryScroll: {
    flex: 1,
    alignSelf: "stretch",
  },
  summaryScrollContent: {
    gap: Spacing.two + 2,
    paddingBottom: Spacing.two,
  },
  actions: {
    flexDirection: "row",
    gap: Spacing.three - 4,
    marginTop: Spacing.two,
  },
  disabled: {
    opacity: 0.4,
  },
});
