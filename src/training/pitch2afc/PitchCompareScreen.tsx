import { useFocusEffect } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  BackHandler,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { ActionButton } from "@/components/ui/action-button";
import { Equalizer } from "@/components/ui/equalizer";
import { Icon } from "@/components/ui/icon";
import { Pill } from "@/components/ui/pill";
import {
  MaxContentWidth,
  Radius,
  Shadows,
  Spacing,
} from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import { confirmEndSession } from "@/training/confirmEndSession";
import { endReasonLabel } from "@/training/freq/freqSession";
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
import {
  DEFAULT_SESSION_MODE,
  maxTrialsFor,
  modeProgressCaption,
  targetReversalsFor,
  type SessionMode,
} from "@/training/sessionMode";
import { SessionModeToggle } from "@/training/SessionModeToggle";
import { SessionProgressBar } from "@/training/SessionProgressBar";
import { appendPitch2SessionSummary } from "@/training/sessionStore";
import { SummaryCard } from "@/training/SummaryCard";

/**
 * 세션 길이 — 귀풀기(한도 없음) / 연습(전환 6)을 토글로 고른다.
 * 종료 조건만 모드로 달라지고 스텝·엔진은 동일. pitch2afc `ASSESSMENT`는 쓰지 않는다.
 */

/** idle(연습 선택) 화면 텍스트만 균일하게 살짝 키우는 배율(사용자 요청). */
const TEXT_SCALE = 1.2;

type Phase = "idle" | "playing" | "choose" | "feedback" | "summary";

type EndReason = PitchCompareEndReason;

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
  targetReversals: number | null,
): string {
  return modeProgressCaption({
    idle: phase === "idle",
    trialNumber,
    reversalCount,
    targetReversals,
  });
}

function centsText(value: number | null): string {
  return value == null ? "—" : `약 ${Math.round(value)}`;
}

/** 2택 답 버튼 하나. pressed 강조 분기를 여기로 모아 화면 복잡도를 낮춘다. */
function ChoiceButton({
  label,
  a11yLabel,
  icon,
  disabled,
  onPress,
}: Readonly<{
  label: string;
  a11yLabel: string;
  icon: "arrowUp" | "arrowDown";
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
      <Icon name={icon} size={30} color={theme.accent} strokeWidth={2.2} />
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
  targetReversals,
  mode,
  onModeChange,
}: Readonly<{
  phase: Phase;
  trialNumber: number;
  reversalCount: number;
  correct: boolean | undefined;
  endReason: EndReason | null;
  targetReversals: number | null;
  mode: SessionMode;
  onModeChange: (next: SessionMode) => void;
}>) {
  const theme = useTheme();

  if (phase === "idle") {
    return (
      /*
        idle도 스크롤한다. 시스템 글씨 크기 120%부터 안내문이 「연습 시작」
        버튼에 가려졌다(실기기 SC-01M 확인). 요약과 같은 처방이다.
      */
      <ScrollView
        style={styles.heroScroll}
        contentContainerStyle={styles.hero}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.heroMark, { backgroundColor: theme.accentTint }]}>
          <View
            style={[styles.heroRing, { borderColor: theme.accentBorder }]}
          />
          {/* 연습 선택 카드와 같은 아이콘을 키운 것 — 제목 전에 그림으로 알아보게. */}
          <Icon name="bars" size={40} color={theme.accent} />
        </View>
        <ThemedText type="heading" style={styles.heroHeading}>
          높낮이 비교
        </ThemedText>
        <ThemedText
          themeColor="textSecondary"
          type="small"
          style={[styles.caption, styles.heroCaption]}
        >
          웰니스 연습 · 병원 검사·진단을 대신하지 않아요
        </ThemedText>
        <SessionModeToggle
          value={mode}
          onChange={onModeChange}
          textScale={TEXT_SCALE}
          style={{ marginBottom: Spacing.six }}
        />
        <Pill
          mono
          textScale={TEXT_SCALE}
          label={progressCaption(
            phase,
            trialNumber,
            reversalCount,
            targetReversals,
          )}
        />
        <ThemedText
          type="smallBold"
          style={[styles.heroPrompt, styles.heroPromptScaled]}
        >
          {phaseCaption(phase, correct)}
        </ThemedText>
      </ScrollView>
    );
  }

  const showEndReason = phase === "summary" && endReason != null;
  return (
    <View style={styles.header}>
      <ThemedText type="screenTitle" style={styles.runningTitle}>
        높낮이 비교
      </ThemedText>
      <ThemedText themeColor="textMuted" type="small" style={styles.disclaimer}>
        웰니스 연습 · 병원 검사·진단을 대신하지 않아요
      </ThemedText>
      {showEndReason ? (
        <ThemedText
          themeColor="textSecondary"
          type="small"
          style={styles.caption}
        >
          {endReasonLabel(endReason)}
        </ThemedText>
      ) : (
        <Pill
          mono
          variant="surface"
          label={progressCaption(
            phase,
            trialNumber,
            reversalCount,
            targetReversals,
          )}
        />
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
  onStopPress,
}: Readonly<{
  phase: Phase;
  canGoBack: boolean;
  onStart: () => void;
  onBack: () => void;
  onNext: () => void;
  onEndManual: () => void;
  onStopPress: () => void;
}>) {
  const atRest = phase === "idle" || phase === "summary";
  const playingOrChoosing = phase === "playing" || phase === "choose";
  // idle 안내 화면에서만 버튼 글자를 키운다(summary·진행 중은 기본 크기).
  const idleTextScale = phase === "idle" ? TEXT_SCALE : 1;

  return (
    <View style={[styles.actions, playingOrChoosing && styles.stopActions]}>
      {atRest ? (
        <>
          <ActionButton
            variant="primary"
            label={phase === "summary" ? "다시 연습" : "연습 시작"}
            textScale={idleTextScale}
            onPress={onStart}
          />
          {canGoBack ? (
            <ActionButton
              label="뒤로 가기"
              textScale={idleTextScale}
              onPress={onBack}
            />
          ) : null}
        </>
      ) : null}

      {phase === "feedback" ? (
        <>
          <ActionButton variant="primary" label="다음" onPress={onNext} />
          <ActionButton
            label="끝내기"
            onPress={() => confirmEndSession(onEndManual)}
          />
        </>
      ) : null}

      {playingOrChoosing ? (
        <ActionButton icon="stop" label="중지" onPress={onStopPress} />
      ) : null}
    </View>
  );
}

type PitchCompareScreenProps = {
  /** 연습 목록으로 돌아가기(idle·요약에서만 노출). */
  onBack?: () => void;
  /** 듣기 준비를 막 통과했을 때 세션을 바로 시작. */
  autoStart?: boolean;
  onAutoStartConsumed?: () => void;
  /** 듣기 준비로 화면을 갈아끼워도 귀풀기/연습 선택을 유지. */
  initialMode?: SessionMode;
  onModeChange?: (next: SessionMode) => void;
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
  autoStart = false,
  onAutoStartConsumed,
  initialMode = DEFAULT_SESSION_MODE,
  onModeChange,
}: Readonly<PitchCompareScreenProps>) {
  const theme = useTheme();
  const abortRef = useRef(false);
  /** 라운드 실행 세대. 새 실행이 시작되면 이전 재생 루프는 스스로 빠진다. */
  const runSeqRef = useRef(0);
  const managerRef = useRef<SessionManager | null>(null);
  /** 이번 세션 요약을 이미 저장했는지. 중복 저장 방지(세션 시작 시 리셋). */
  const savedRef = useRef(false);
  /** 이번 세션의 모드(반전 4/8·저장 mode). 세션 시작 시 토글값으로 고정. */
  const runModeRef = useRef<SessionMode>(initialMode);
  const [phase, setPhase] = useState<Phase>("idle");
  /** idle에서 고른 모드. 진행 중엔 `runModeRef`가 실제 세션 값을 들고 있다. */
  const [mode, setMode] = useState<SessionMode>(initialMode);
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
    // 이 실행의 세대 번호. 「중지」를 취소해 라운드를 다시 틀 때, 끊긴
    // 이전 루프가 abortRef가 false로 돌아간 것을 보고 되살아나 소리가
    // 겹치는 것을 막는다. abortRef 하나로는 두 루프를 구분할 수 없다.
    const seq = ++runSeqRef.current;
    const aborted = () => abortRef.current || runSeqRef.current !== seq;
    abortRef.current = false;

    const state = manager.prepareRound();
    setTrialNumber(state.totalTrials + 1);
    setPhase("playing");

    try {
      await playPitchPair(state.baseFreq, state.targetFreq, {
        shouldAbort: aborted,
      });
      if (aborted()) {
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
    if (runModeRef.current === "practice") {
      return;
    }
    // 푼 문항이 없으면 기록하지 않는다. 저장하면 「연습 횟수」만 1 늘고
    // 내용은 0이라 기록이 오염된다. 단어 듣기가 쓰는 방식과 같다.
    if (nextSummary.trialCount <= 0) {
      setSaveNote("연습이 짧아서 기록에는 안 남겼어요");
      return;
    }
    setSaveNote(null);
    void appendPitch2SessionSummary(nextSummary, "measure")
      .then(() => setSaveNote("기기에 기록했어요"))
      .catch(() => setSaveNote("기록 저장에 실패했어요"));
  }, []);

  const onStart = useCallback(() => {
    runModeRef.current = mode;
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
  }, [mode, runRound]);

  const changeMode = useCallback(
    (next: SessionMode) => {
      setMode(next);
      onModeChange?.(next);
    },
    [onModeChange],
  );

  const autoStartOnceRef = useRef(false);
  useEffect(() => {
    if (!autoStart || autoStartOnceRef.current) {
      return;
    }
    autoStartOnceRef.current = true;
    onStart();
    onAutoStartConsumed?.();
  }, [autoStart, onAutoStartConsumed, onStart]);

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

      const target = targetReversalsFor(runModeRef.current);
      if (target != null && state.reversalCount >= target) {
        finish("reversals");
        return;
      }
      const maxTrials = maxTrialsFor(runModeRef.current);
      if (maxTrials != null && state.totalTrials >= maxTrials) {
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

  /**
   * 「중지」 — 소리를 **먼저** 끊고 확인을 묻는다.
   *
   * 확인을 먼저 띄우면 대화상자가 떠 있는 내내 라운드가 굴러가 소리가
   * 안 멈춘다. 취소하면 채점되지 않은 라운드를 같은 난이도로 다시 낸다
   * (`prepareRound`는 방향·목표음만 다시 뽑고 시행 수를 올리지 않는다).
   */
  const onStopPress = useCallback(() => {
    confirmEndSession(onEndManual, {
      onOpen: () => {
        abortRef.current = true;
        abortPitchPlayback();
      },
      onCancel: () => {
        if (!managerRef.current) {
          return;
        }
        void runRound();
      },
    });
  }, [onEndManual, runRound]);

  const leaveToList = useCallback(() => {
    abortRef.current = true;
    abortPitchPlayback();
    managerRef.current = null;
    onBack?.();
  }, [onBack]);

  /**
   * 시스템 뒤로가기.
   *
   * 이게 없던 동안 연습 중에 뒤로가기를 누르면 부모 탭(`PtaSessionScreen`)의
   * 핸들러가 **묻지 않고** 연습 목록으로 돌아갔다. 화면이 사라지면서 세션은
   * 저장되지 않으므로 **하던 기록이 통째로 사라졌다.**
   *
   * 연습 중이면 「중지」와 같게 다룬다 — 소리를 먼저 끊고 확인을 묻는다.
   * 요약에서는 목록으로 돌아간다(이미 저장된 뒤다).
   *
   * idle에서는 **등록하지 않는다.** 부모가 목록으로 보내는 게 맞고,
   * 부모보다 늦게 등록해야 이 화면이 먼저 문다(`BackHandler`는 등록 역순).
   */
  useFocusEffect(
    useCallback(() => {
      if (phase === "idle") {
        return;
      }
      const sub = BackHandler.addEventListener("hardwareBackPress", () => {
        if (phase === "summary") {
          leaveToList();
          return true;
        }
        // 되짚기 단계는 소리가 없고 채점도 끝났다. 「끝내기」 버튼과 **같은**
        // 물음을 쓴다 — `onStopPress`를 태우면 취소했을 때 다음 문제로
        // 넘어가 버려서, 이어서 보려던 되짚기가 사라진다.
        if (phase === "feedback") {
          confirmEndSession(onEndManual);
          return true;
        }
        onStopPress();
        return true;
      });
      return () => sub.remove();
    }, [leaveToList, onEndManual, onStopPress, phase]),
  );

  const choiceDisabled = phase !== "choose";
  const running =
    phase === "playing" || phase === "choose" || phase === "feedback";
  // 모드 토글은 `SessionHeader`가 idle에서만 그리므로, 진행 중에도
  // `mode` state가 곧 세션 모드다(`onStart`에서 `runModeRef`에 그대로 넣는다).
  // ref를 렌더에서 읽으면 바뀌어도 다시 그리지 않아 값이 밀린다.
  const targetReversals = targetReversalsFor(mode);

  return (
    <ThemedView style={styles.fill}>
      <SafeAreaView edges={["top", "left", "right"]} style={styles.safeArea}>
        <SessionHeader
          phase={phase}
          trialNumber={trialNumber}
          reversalCount={reversalCount}
          correct={correct}
          endReason={summary?.endReason ?? null}
          targetReversals={targetReversals}
          mode={mode}
          onModeChange={changeMode}
        />
        {running && targetReversals != null ? (
          <SessionProgressBar current={reversalCount} total={targetReversals} />
        ) : null}

        {phase === "summary" ? (
          <ScrollView
            style={styles.summaryScroll}
            contentContainerStyle={styles.summaryScrollContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.headline}>
              <Icon
                name="check"
                size={18}
                color={theme.accent}
                strokeWidth={2.2}
              />
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
          <ScrollView
            style={styles.runningScroll}
            contentContainerStyle={styles.runningContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.promptArea}>
              <Equalizer
                color={theme.accent}
                height={26}
                barWidth={4}
                bars={4}
                playing={phase === "playing"}
              />
              <ThemedText
                type="smallBold"
                themeColor="textSecondary"
                style={styles.statusText}
              >
                {phaseCaption(phase, correct)}
              </ThemedText>
            </View>

            <View style={styles.choices}>
              <ChoiceButton
                label="더 낮아요"
                a11yLabel="두 번째 소리가 더 낮아요"
                icon="arrowDown"
                disabled={choiceDisabled}
                onPress={() => onAnswer(false)}
              />
              <ChoiceButton
                label="더 높아요"
                a11yLabel="두 번째 소리가 더 높아요"
                icon="arrowUp"
                disabled={choiceDisabled}
                onPress={() => onAnswer(true)}
              />
            </View>
          </ScrollView>
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
          onStopPress={onStopPress}
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
    paddingHorizontal: 22,
    paddingTop: 20,
    paddingBottom: 26,
    alignItems: "stretch",
    gap: Spacing.two + 2,
  },
  /**
   * idle 히어로를 감싸는 스크롤 껍데기. `flex: 1`이라 버튼이 바닥에 남는다.
   *
   * `주의`: 음수 마진은 `safeArea`의 `gap`을 이 자식에서만 상쇄한다.
   * 스크롤을 넣기 전에는 히어로 내용이 그 간격으로 흘러넘쳐 있었고(기본 배율에서
   * 이미 상자보다 컸다), 스크롤이 생기면서 그만큼이 잘려 나갔다. 버튼과의 간격은
   * `actions`의 `marginTop`이 따로 준다.
   */
  heroScroll: {
    flex: 1,
    alignSelf: "stretch",
    marginBottom: -(Spacing.two + 2),
  },
  /** 스크롤의 contentContainer. 자리가 남으면 가운데, 모자라면 스크롤. */
  hero: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.two + 2,
  },
  /** heading(26/34) × TEXT_SCALE. idle 안내 텍스트만 키운다. */
  heroHeading: {
    fontSize: 26 * TEXT_SCALE,
    lineHeight: 34 * TEXT_SCALE,
  },
  /** small(14/20) × TEXT_SCALE. */
  heroCaption: {
    fontSize: 14 * TEXT_SCALE,
    lineHeight: 20 * TEXT_SCALE,
  },
  /** heroPrompt(12.5/19) × TEXT_SCALE. */
  heroPromptScaled: {
    fontSize: 12.5 * TEXT_SCALE,
    lineHeight: 19 * TEXT_SCALE,
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
    fontSize: 14,
    lineHeight: 20,
  },
  header: {
    alignItems: "center",
    gap: Spacing.two,
  },
  runningTitle: {
    fontSize: 22,
    lineHeight: 28,
    letterSpacing: -0.22,
    textAlign: "center",
  },
  caption: {
    textAlign: "center",
  },
  disclaimer: {
    fontSize: 14,
    lineHeight: 20,
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
  /**
   * 연습 중 내용은 스크롤, 버튼은 그 밖에 고정.
   * `flexShrink`가 아니라 `flex: 1` + `flexGrow: 1`인 이유는 `AmSessionScreen`과
   * 같다 — 아래 `promptArea`가 `flex: 1`로 남는 자리를 먹어 가운데 정렬을 만든다.
   * 보기 칸이 `minHeight: 132`라 7개 화면 중 세로로 제일 키가 크다.
   */
  runningScroll: {
    flex: 1,
  },
  runningContent: {
    flexGrow: 1,
    gap: Spacing.two + 2,
  },
  promptArea: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    paddingVertical: 26,
  },
  statusText: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: "600",
    textAlign: "center",
  },
  choices: {
    flexDirection: "row",
    gap: 12,
  },
  choiceButton: {
    flex: 1,
    minHeight: 132,
    borderWidth: 1.5,
    borderRadius: Radius.large,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingHorizontal: Spacing.two,
  },
  choiceLabel: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: "600",
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
    gap: 12,
    marginTop: Spacing.two,
  },
  stopActions: {
    marginTop: 16,
  },
  disabled: {
    opacity: 0.4,
  },
});
