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
import { StatsEntryButton } from "@/components/ui/stats-entry-button";
import {
  MaxContentWidth,
  Radius,
  Shadows,
  Spacing,
} from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import {
  abortAmAfcPlayback,
  createAmAfcTrial,
  playAmAfcTrial,
  scoreAmAfcChoice,
  type AmAfcChoiceResult,
  type AmAfcTrial,
} from "@/training/am/amAfcTrial";
import {
  applyAmSessionResult,
  createAmSession,
  endAmSessionManual,
  endReasonLabel,
  summarizeAmSession,
  type AmSessionState,
  type AmSessionSummary,
} from "@/training/am/amSession";
import { confirmEndSession } from "@/training/confirmEndSession";
import { DEFAULT_AFC_N } from "@/training/freq/freqAfcTrial";
import {
  DEFAULT_SESSION_MODE,
  maxTrialsFor,
  modeProgressCaption,
  targetReversalsFor,
  type SessionMode,
} from "@/training/sessionMode";
import { SessionModeToggle } from "@/training/SessionModeToggle";
import { SessionProgressBar } from "@/training/SessionProgressBar";
import { appendAmSessionSummary } from "@/training/sessionStore";
import { SummaryCard } from "@/training/SummaryCard";

/** idle(연습 선택) 화면 텍스트만 균일하게 살짝 키우는 배율(사용자 요청). */
const TEXT_SCALE = 1.2;

type Phase = "idle" | "playing" | "choose" | "feedback" | "summary";

function phaseCaption(phase: Phase, correct: boolean | undefined): string {
  switch (phase) {
    case "playing":
      return "듣는 중… 소리가 끝난 뒤 고르세요";
    case "choose":
      return "떨리는 소리를 고르세요";
    case "feedback":
      return correct ? "맞았어요" : "아쉬워요";
    case "summary":
      return "오늘 연습이 끝났어요";
    default:
      return "시작을 누르면 난이도가 맞춰지는 연습이 이어집니다";
  }
}

/** 진행 배지 문구. 요약의 종료 사유는 `endReasonLabel`이 따로 그린다. */
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

type AmSessionScreenProps = {
  /** 이전 화면으로 돌아가기(idle·요약에서만 노출). 전용 탭에서는 안 넘김. */
  onBack?: () => void;
  /** idle·요약 헤더에서 통계 화면. 진행 중에는 숨김. */
  onOpenStats?: () => void;
  /**
   * 연습 시작 직전 게이트. false면 세션을 만들지 않음
   * (부모가 듣기 준비를 띄울 때).
   */
  onBeforeStart?: () => boolean;
  /** 듣기 준비를 막 통과했을 때 세션을 바로 시작. */
  autoStart?: boolean;
  onAutoStartConsumed?: () => void;
  /** 듣기 준비로 화면을 갈아끼워도 귀풀기/연습 선택을 유지. */
  initialMode?: SessionMode;
  onModeChange?: (next: SessionMode) => void;
};

/**
 * ① AM/포락선 — 훈련용 정적 UI.
 * 변조 깊이(m/dB)를 색·크기·게이지에 연동하지 않음. 요약은 진단 역치가 아님.
 */
export function AmSessionScreen({
  onBack,
  onOpenStats,
  onBeforeStart,
  autoStart = false,
  onAutoStartConsumed,
  initialMode = DEFAULT_SESSION_MODE,
  onModeChange,
}: Readonly<AmSessionScreenProps>) {
  const theme = useTheme();
  const abortRef = useRef(false);
  /** 시행 실행 세대. 새 실행이 시작되면 이전 재생 루프는 스스로 빠진다. */
  const runSeqRef = useRef(0);
  /** 이번 세션 요약을 이미 저장했는지. 중복 저장 방지(세션 시작 시 리셋). */
  const savedRef = useRef(false);
  /** 이번 세션의 모드(반전 4/8·저장 mode). 세션 시작 시 토글값으로 고정. */
  const runModeRef = useRef<SessionMode>(initialMode);
  const [phase, setPhase] = useState<Phase>("idle");
  /** idle에서 고른 모드. 진행 중엔 `runModeRef`가 실제 세션 값을 들고 있다. */
  const [mode, setMode] = useState<SessionMode>(initialMode);
  const [session, setSession] = useState<AmSessionState | null>(null);
  const [trial, setTrial] = useState<AmAfcTrial | null>(null);
  const [result, setResult] = useState<AmAfcChoiceResult | null>(null);
  const [summary, setSummary] = useState<AmSessionSummary | null>(null);
  const [lastError, setLastError] = useState<string | null>(null);
  const [saveNote, setSaveNote] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      abortRef.current = true;
      abortAmAfcPlayback();
    };
  }, []);

  const goSummary = useCallback((next: AmSessionState) => {
    // 진행 중인 시행이 있으면 재생 루프까지 멈춘다.
    // stopAmTone()은 대기 promise를 resolve만 하므로, 이 플래그가 없으면
    // 남은 구간이 계속 재생되고 runTrial이 phase를 'choose'로 되돌린다.
    abortRef.current = true;
    abortAmAfcPlayback();
    const nextSummary = summarizeAmSession(next);
    setSession(next);
    setSummary(nextSummary);
    setPhase("summary");
    setTrial(null);

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
    void appendAmSessionSummary(nextSummary, "measure")
      .then(() => {
        setSaveNote("기기에 기록했어요");
      })
      .catch(() => {
        setSaveNote("기록 저장에 실패했어요");
      });
  }, []);

  const resetToIdle = useCallback(() => {
    abortRef.current = true;
    savedRef.current = false;
    abortAmAfcPlayback();
    setPhase("idle");
    setSession(null);
    setTrial(null);
    setResult(null);
    setSummary(null);
    setSaveNote(null);
  }, []);

  const runTrial = useCallback(async (state: AmSessionState) => {
    if (state.status === "completed") {
      return;
    }

    setLastError(null);
    setResult(null);
    // 이 실행의 세대 번호. 「중지」를 취소해 시행을 다시 틀 때, 끊긴 이전
    // 루프가 abortRef가 false로 돌아간 것을 보고 되살아나 소리가 겹치는
    // 것을 막는다. abortRef 하나로는 두 루프를 구분할 수 없다.
    const seq = ++runSeqRef.current;
    const aborted = () => abortRef.current || runSeqRef.current !== seq;
    abortRef.current = false;

    const next = createAmAfcTrial({
      n: DEFAULT_AFC_N,
      depthDb: state.stair.depthDb,
    });
    setTrial(next);
    setPhase("playing");

    try {
      await playAmAfcTrial(next, {
        shouldAbort: aborted,
      });
      if (aborted()) {
        return;
      }
      setPhase("choose");
    } catch (e) {
      if (e instanceof Error && e.message === "ABORTED") {
        return;
      }
      setLastError(e instanceof Error ? e.message : String(e));
      setPhase("idle");
      setSession(null);
      setTrial(null);
    }
  }, []);

  const startSession = useCallback(() => {
    runModeRef.current = mode;
    const next = createAmSession({
      targetReversals: targetReversalsFor(mode),
      maxTrials: maxTrialsFor(mode),
    });
    savedRef.current = false;
    setSession(next);
    setSummary(null);
    setSaveNote(null);
    void runTrial(next);
  }, [mode, runTrial]);

  const onStart = useCallback(() => {
    if (onBeforeStart?.() === false) {
      return;
    }
    startSession();
  }, [onBeforeStart, startSession]);

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
    startSession();
    onAutoStartConsumed?.();
  }, [autoStart, onAutoStartConsumed, startSession]);

  const onChoose = useCallback(
    (index: number) => {
      // 완료된 세션은 다시 채점하지 않는다(중지 직후 잔여 UI 방어).
      if (
        !trial ||
        !session ||
        phase !== "choose" ||
        session.status !== "active"
      ) {
        return;
      }
      const scored = scoreAmAfcChoice(trial, index);
      const next = applyAmSessionResult(session, scored.correct);
      setResult(scored);
      setSession(next);

      if (next.status === "completed") {
        goSummary(next);
        return;
      }
      setPhase("feedback");
    },
    [goSummary, phase, session, trial],
  );

  const onNext = useCallback(() => {
    if (!session || session.status === "completed") {
      return;
    }
    void runTrial(session);
  }, [runTrial, session]);

  const onEndManual = useCallback(() => {
    if (!session) {
      resetToIdle();
      return;
    }
    goSummary(endAmSessionManual(session));
  }, [goSummary, resetToIdle, session]);

  /**
   * 「중지」 — 소리를 **먼저** 끊고 확인을 묻는다.
   *
   * 확인을 먼저 띄우면 대화상자가 떠 있는 내내 시행이 굴러가 소리가
   * 안 멈춘다. 취소하면 채점되지 않은 시행을 같은 난이도로 다시 낸다.
   */
  const onStopPress = useCallback(() => {
    confirmEndSession(onEndManual, {
      onOpen: () => {
        abortRef.current = true;
        abortAmAfcPlayback();
      },
      onCancel: () => {
        if (!session || session.status !== "active") {
          return;
        }
        void runTrial(session);
      },
    });
  }, [onEndManual, runTrial, session]);

  /**
   * 시스템 뒤로가기.
   *
   * 이게 없던 동안 떨림 탭은 **뒤로가기가 무반응**이었고, 요약 화면에도
   * idle로 가는 버튼이 없어서(`onBack`이 안 넘어온다) 한 번 시작하면
   * **「귀풀기/연습」 토글에 다시 닿을 수 없었다.** 앱을 껐다 켜기 전까지
   * 모드가 잠겼다.
   *
   * 연습 중이면 「중지」와 같게 다룬다 — 확인을 묻고 요약으로 보낸다.
   * 실수로 눌렀을 때 기록이 통째로 사라지지 않게 하기 위해서다.
   * 요약에서 한 번 더 누르면 idle로 돌아간다.
   *
   * 탭이 마운트된 채 남으므로 포커스가 없을 때는 걷어낸다 — 안 그러면
   * 다른 탭의 뒤로가기를 이 화면이 가로챈다.
   */
  useFocusEffect(
    useCallback(() => {
      if (phase === "idle") {
        return;
      }
      const sub = BackHandler.addEventListener("hardwareBackPress", () => {
        if (phase === "summary") {
          resetToIdle();
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
    }, [onEndManual, onStopPress, phase, resetToIdle]),
  );

  const choiceDisabled = phase !== "choose";
  const stair = session?.stair;
  let trialNumber = stair?.trialCount ?? 0;
  if (phase === "playing" || phase === "choose") {
    trialNumber += 1;
  }
  // idle은 고른 모드, 진행/요약은 실제 세션의 목표 반전 수를 쓴다.
  const targetReversals = session?.targetReversals ?? targetReversalsFor(mode);

  const meanText =
    summary?.meanReversalDepthDb == null
      ? "—"
      : `약 ${summary.meanReversalDepthDb.toFixed(1)}`;
  const easiestText =
    summary?.easiestDepthDb == null
      ? "—"
      : `약 ${summary.easiestDepthDb.toFixed(1)}`;
  const hardestText =
    summary?.hardestDepthDb == null
      ? "—"
      : `약 ${summary.hardestDepthDb.toFixed(1)}`;

  const running =
    phase === "playing" || phase === "choose" || phase === "feedback";
  // idle 안내 화면에서만 버튼 글자를 키운다(summary·진행 중은 기본 크기).
  const idleTextScale = phase === "idle" ? TEXT_SCALE : 1;

  return (
    <ThemedView style={styles.fill}>
      <SafeAreaView edges={["top", "left", "right"]} style={styles.safeArea}>
        {onOpenStats && (phase === "idle" || phase === "summary") ? (
          <View style={styles.statsRow}>
            <StatsEntryButton onPress={onOpenStats} />
          </View>
        ) : null}
        {phase === "idle" ? (
          /*
            idle도 스크롤한다. 시스템 글씨 크기 120%부터 안내문이 「연습 시작」
            버튼에 가려졌다(실기기 SC-01M 확인). 요약과 같은 처방이다.
          */
          <ScrollView
            style={styles.heroScroll}
            contentContainerStyle={styles.hero}
            showsVerticalScrollIndicator={false}
          >
            <View
              style={[styles.heroMark, { backgroundColor: theme.accentTint }]}
            >
              <View
                style={[styles.heroRing, { borderColor: theme.accentBorder }]}
              />
              {/* 하단 탭·듣기 준비와 같은 아이콘 — 제목 전에 그림으로 알아보게. */}
              <Icon name="vibrate" size={42} color={theme.accent} />
            </View>
            <ThemedText type="heading" style={styles.heroHeading}>
              떨림 찾기
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
              onChange={changeMode}
              textScale={TEXT_SCALE}
              style={{ marginBottom: Spacing.six }}
            />
            <Pill
              mono
              textScale={TEXT_SCALE}
              label={progressCaption(
                phase,
                trialNumber,
                stair?.reversalCount ?? 0,
                targetReversals,
              )}
            />
            <ThemedText
              type="smallBold"
              style={[styles.heroPrompt, styles.heroPromptScaled]}
            >
              {phaseCaption(phase, result?.correct)}
            </ThemedText>
          </ScrollView>
        ) : (
          <View style={styles.header}>
            <ThemedText type="screenTitle" style={styles.runningTitle}>
              떨림 찾기
            </ThemedText>
            <ThemedText
              themeColor="textMuted"
              type="small"
              style={styles.disclaimer}
            >
              웰니스 연습 · 병원 검사·진단을 대신하지 않아요
            </ThemedText>
            {phase === "summary" ? (
              <ThemedText
                themeColor="textSecondary"
                type="small"
                style={styles.caption}
              >
                {endReasonLabel(summary?.endReason ?? null)}
              </ThemedText>
            ) : (
              <Pill
                mono
                variant="surface"
                label={progressCaption(
                  phase,
                  trialNumber,
                  stair?.reversalCount ?? 0,
                  targetReversals,
                )}
              />
            )}
          </View>
        )}

        {running && targetReversals != null ? (
          <SessionProgressBar
            current={stair?.reversalCount ?? 0}
            total={targetReversals}
          />
        ) : null}

        {/*
          요약을 스크롤한다. 글자 크기를 키우면(시스템 설정 최대 200%) 카드가
          화면을 넘겨 버튼에 닿을 수 없게 되므로. 버튼은 스크롤 밖에 두어
          항상 보이게 한다.

          「진행 중 화면은 선택지가 고정돼야 해서 감싸지 않는다」고 적어 뒀던 것을
          철회한다(2026-08-22). 짧은 화면(568dp)에서는 기본 글씨에서도 선택지가
          넘쳐 버튼이 화면 밖으로 나갔다. 고정이 지킬 게 없다.
        */}
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
                {phaseCaption(phase, result?.correct)}
              </ThemedText>
            </View>

            {summary ? (
              <SummaryCard
                trialCount={summary.trialCount}
                correctCount={summary.correctCount}
                reversalCount={summary.reversalCount}
                meanLabel="떨림 정도"
                meanValue={meanText}
                easiestValue={easiestText}
                hardestValue={hardestText}
                footnote="숫자가 작을수록 더 얕은 떨림 · 점수·청력 검사·진단 결과 아님"
              />
            ) : null}

            {saveNote ? <Pill stretch icon="check" label={saveNote} /> : null}
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
                height={24}
                barWidth={4}
                bars={3}
                playing={phase === "playing"}
              />
              <ThemedText
                type="smallBold"
                themeColor="textSecondary"
                style={styles.statusText}
              >
                {phaseCaption(phase, result?.correct)}
              </ThemedText>
            </View>

            <View style={styles.choices}>
            {Array.from({ length: DEFAULT_AFC_N }, (_, i) => (
              <Pressable
                key={i}
                accessibilityRole="button"
                accessibilityLabel={`${i + 1}번 소리`}
                accessibilityState={{ disabled: choiceDisabled }}
                disabled={choiceDisabled}
                onPress={() => onChoose(i)}
                style={({ pressed }) => [
                  styles.choiceButton,
                  {
                    backgroundColor:
                      pressed && !choiceDisabled
                        ? theme.accentTint
                        : theme.surface,
                    borderColor:
                      pressed && !choiceDisabled
                        ? theme.accentBorder
                        : theme.border,
                  },
                  Shadows.card,
                  choiceDisabled && styles.disabled,
                ]}
              >
                {({ pressed }) => (
                  <ThemedText
                    type="metric"
                    style={[
                      styles.choiceNumber,
                      {
                        color:
                          pressed && !choiceDisabled
                            ? theme.accent
                            : theme.text,
                      },
                    ]}
                  >
                    {i + 1}
                  </ThemedText>
                )}
              </Pressable>
            ))}
            </View>

            {phase === "feedback" && result && stair ? (
              <ThemedText
                themeColor="textMuted"
                type="small"
                style={styles.detail}
              >
                {`선택 ${result.chosenIndex + 1} · 정답 ${result.oddIndex + 1}`}
                {` · 방금 떨림 ${result.depthDb.toFixed(0)} · 다음 떨림 ${stair.depthDb.toFixed(0)}`}
              </ThemedText>
            ) : null}
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

        <View
          style={[
            styles.actions,
            (phase === "playing" || phase === "choose") && styles.stopActions,
          ]}
        >
          {phase === "idle" || phase === "summary" ? (
            <>
              <ActionButton
                variant="primary"
                label={phase === "summary" ? "다시 연습" : "연습 시작"}
                textScale={idleTextScale}
                onPress={onStart}
              />
              {phase === "summary" ? (
                <ActionButton
                  label="처음으로"
                  textScale={idleTextScale}
                  onPress={resetToIdle}
                />
              ) : null}
              {onBack ? (
                <ActionButton
                  label="뒤로 가기"
                  textScale={idleTextScale}
                  onPress={() => {
                    abortRef.current = true;
                    abortAmAfcPlayback();
                    onBack();
                  }}
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

          {phase === "playing" || phase === "choose" ? (
            <ActionButton icon="stop" label="중지" onPress={onStopPress} />
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
    alignSelf: "center",
    width: "100%",
    paddingHorizontal: 22,
    paddingTop: 20,
    paddingBottom: 26,
    alignItems: "stretch",
    gap: Spacing.two + 2,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
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
  /** 타일 바깥으로 한 겹 더 도는 옅은 링(시안의 `inset:-8px`). */
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
   *
   * 여기는 WRS·링6와 달리 `flexShrink`가 아니라 `flex: 1` + `flexGrow: 1`이다 —
   * 아래 `promptArea`가 `flex: 1`로 남는 자리를 먹어 가운데 정렬을 만들고 있어서,
   * 스크롤이 자리를 넘겨주지 않으면 그 정렬이 무너지기 때문이다.
   * 자리가 남는 화면(868dp)에서는 스크롤이 그 자리를 그대로 promptArea에 넘겨
   * 배치가 수정 전과 같다.
   */
  runningScroll: {
    flex: 1,
  },
  runningContent: {
    // 자리가 남으면 예전처럼, 모자랄 때만 스크롤. gap은 `safeArea`와 같은 값.
    flexGrow: 1,
    gap: Spacing.two + 2,
  },
  promptArea: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    paddingVertical: 22,
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
    aspectRatio: 1,
    borderWidth: 1.5,
    borderRadius: Radius.large,
    alignItems: "center",
    justifyContent: "center",
  },
  choiceNumber: {
    fontSize: 36,
    lineHeight: 44,
    fontWeight: "500",
  },
  detail: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
  },
  /** 요약 카드 영역만 스크롤. `flex: 1`이라 버튼이 자연히 바닥에 남는다. */
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
