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
import { confirmEndSession } from "@/training/confirmEndSession";
import {
  DEFAULT_AFC_N,
  abortFreqAfcPlayback,
  createFreqAfcTrial,
  playFreqAfcTrial,
  scoreFreqAfcChoice,
  type FreqAfcChoiceResult,
  type FreqAfcTrial,
} from "@/training/freq/freqAfcTrial";
import {
  applySessionResult,
  createFreqSession,
  endReasonLabel,
  endSessionManual,
  summarizeSession,
  type FreqSessionState,
  type FreqSessionSummary,
} from "@/training/freq/freqSession";
import {
  DEFAULT_SESSION_MODE,
  maxTrialsFor,
  modeProgressCaption,
  targetReversalsFor,
  type SessionMode,
} from "@/training/sessionMode";
import { SessionModeToggle } from "@/training/SessionModeToggle";
import { SessionProgressBar } from "@/training/SessionProgressBar";
import { appendFreqSessionSummary } from "@/training/sessionStore";
import { SummaryCard } from "@/training/SummaryCard";

/** idle(연습 선택) 화면 텍스트만 균일하게 살짝 키우는 배율(사용자 요청). */
const TEXT_SCALE = 1.2;

type Phase = "idle" | "playing" | "choose" | "feedback" | "summary";

function phaseCaption(phase: Phase, correct: boolean | undefined): string {
  switch (phase) {
    case "playing":
      return "듣는 중… 소리가 끝난 뒤 고르세요";
    case "choose":
      return "다른 음을 고르세요";
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

type FreqSessionScreenProps = {
  /** 연습 목록으로 돌아가기(idle·요약에서만 노출). */
  onBack?: () => void;
};

/**
 * ② 주파수 변별 — 훈련용 정적 UI.
 * Δ(cent)를 색·크기·게이지에 연동하지 않음. 요약은 진단 역치가 아님.
 */
export function FreqSessionScreen({
  onBack,
}: Readonly<FreqSessionScreenProps>) {
  const theme = useTheme();
  const abortRef = useRef(false);
  /** 이번 세션 요약을 이미 저장했는지. 중복 저장 방지(세션 시작 시 리셋). */
  const savedRef = useRef(false);
  /** 이번 세션의 모드(반전 4/8·저장 mode). 세션 시작 시 토글값으로 고정. */
  const runModeRef = useRef<SessionMode>(DEFAULT_SESSION_MODE);
  const [phase, setPhase] = useState<Phase>("idle");
  /** idle에서 고른 모드. 진행 중엔 `runModeRef`가 실제 세션 값을 들고 있다. */
  const [mode, setMode] = useState<SessionMode>(DEFAULT_SESSION_MODE);
  const [session, setSession] = useState<FreqSessionState | null>(null);
  const [trial, setTrial] = useState<FreqAfcTrial | null>(null);
  const [result, setResult] = useState<FreqAfcChoiceResult | null>(null);
  const [summary, setSummary] = useState<FreqSessionSummary | null>(null);
  const [lastError, setLastError] = useState<string | null>(null);
  const [saveNote, setSaveNote] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      abortRef.current = true;
      abortFreqAfcPlayback();
    };
  }, []);

  const goSummary = useCallback((next: FreqSessionState) => {
    // 진행 중인 시행이 있으면 재생 루프까지 멈춘다.
    // stopPureTone()은 대기 promise를 resolve만 하므로, 이 플래그가 없으면
    // 남은 구간이 계속 재생되고 runTrial이 phase를 'choose'로 되돌린다.
    abortRef.current = true;
    abortFreqAfcPlayback();
    const nextSummary = summarizeSession(next);
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
    setSaveNote(null);
    void appendFreqSessionSummary(nextSummary, "measure")
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
    abortFreqAfcPlayback();
    setPhase("idle");
    setSession(null);
    setTrial(null);
    setResult(null);
    setSummary(null);
    setSaveNote(null);
  }, []);

  const runTrial = useCallback(async (state: FreqSessionState) => {
    if (state.status === "completed") {
      return;
    }

    setLastError(null);
    setResult(null);
    abortRef.current = false;

    const next = createFreqAfcTrial({
      n: DEFAULT_AFC_N,
      deltaCents: state.stair.deltaCents,
    });
    setTrial(next);
    setPhase("playing");

    try {
      await playFreqAfcTrial(next, {
        shouldAbort: () => abortRef.current,
      });
      if (abortRef.current) {
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

  const onStart = useCallback(() => {
    runModeRef.current = mode;
    const next = createFreqSession({
      targetReversals: targetReversalsFor(mode),
      maxTrials: maxTrialsFor(mode),
    });
    savedRef.current = false;
    setSession(next);
    setSummary(null);
    setSaveNote(null);
    void runTrial(next);
  }, [mode, runTrial]);

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
      const scored = scoreFreqAfcChoice(trial, index);
      const next = applySessionResult(session, scored.correct);
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
    goSummary(endSessionManual(session));
  }, [goSummary, resetToIdle, session]);

  const choiceDisabled = phase !== "choose";
  const stair = session?.stair;
  let trialNumber = stair?.trialCount ?? 0;
  if (phase === "playing" || phase === "choose") {
    trialNumber += 1;
  }
  // idle은 고른 모드, 진행/요약은 실제 세션의 목표 반전 수를 쓴다.
  const targetReversals = session?.targetReversals ?? targetReversalsFor(mode);

  const meanText =
    summary?.meanReversalDeltaCents == null
      ? "—"
      : `약 ${Math.round(summary.meanReversalDeltaCents)}`;
  const easiestText =
    summary?.easiestDeltaCents == null
      ? "—"
      : `약 ${Math.round(summary.easiestDeltaCents)}`;
  const hardestText =
    summary?.hardestDeltaCents == null
      ? "—"
      : `약 ${Math.round(summary.hardestDeltaCents)}`;

  const running =
    phase === "playing" || phase === "choose" || phase === "feedback";
  // idle 안내 화면에서만 버튼 글자를 키운다(summary·진행 중은 기본 크기).
  const idleTextScale = phase === "idle" ? TEXT_SCALE : 1;

  return (
    <ThemedView style={styles.fill}>
      <SafeAreaView style={styles.safeArea}>
        {phase === "idle" ? (
          <View style={styles.hero}>
            <View
              style={[styles.heroMark, { backgroundColor: theme.accentTint }]}
            >
              <View
                style={[styles.heroRing, { borderColor: theme.accentBorder }]}
              />
              {/* 연습 선택 카드와 같은 아이콘을 키운 것 — 제목 전에 그림으로 알아보게. */}
              <Icon name="findTone" size={40} color={theme.accent} />
            </View>
            <ThemedText type="heading" style={styles.heroHeading}>
              다른 음 찾기
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
              onChange={setMode}
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
          </View>
        ) : (
          <View style={styles.header}>
            <ThemedText type="screenTitle" style={styles.runningTitle}>
              다른 음 찾기
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
          요약만 스크롤한다. 글자 크기를 키우면(시스템 설정 최대 200%) 카드가
          화면을 넘겨 버튼에 닿을 수 없게 되므로. 버튼은 스크롤 밖에 두어
          항상 보이게 한다 — 진행 중 화면은 선택지가 고정돼야 해서 감싸지 않는다.
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
                meanLabel="음높이 차이"
                meanValue={meanText}
                easiestValue={easiestText}
                hardestValue={hardestText}
                footnote="작을수록 더 세밀한 구분 · 점수·청력 검사·진단 결과 아님"
              />
            ) : null}

            {saveNote ? <Pill stretch icon="check" label={saveNote} /> : null}
          </ScrollView>
        ) : null}

        {running ? (
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
        ) : null}

        {running ? (
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
        ) : null}

        {phase === "feedback" && result && stair ? (
          <ThemedText themeColor="textMuted" type="small" style={styles.detail}>
            {`선택 ${result.chosenIndex + 1} · 정답 ${result.oddIndex + 1}`}
            {` · 방금 차이 ${result.deltaCents} · 다음 차이 ${stair.deltaCents}`}
          </ThemedText>
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
                label={phase === "summary" ? "다시 연습" : "시작하기"}
                textScale={idleTextScale}
                onPress={onStart}
              />
              {onBack ? (
                <ActionButton
                  label="뒤로 가기"
                  textScale={idleTextScale}
                  onPress={() => {
                    abortRef.current = true;
                    abortFreqAfcPlayback();
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
            <ActionButton
              icon="stop"
              label="중지"
              onPress={() => confirmEndSession(onEndManual)}
            />
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
    paddingBottom: BottomTabInset + 26,
    alignItems: "stretch",
    gap: Spacing.two + 2,
  },
  hero: {
    flex: 1,
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
    fontSize: 12.5,
    lineHeight: 19,
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
    fontSize: 12,
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
    fontSize: 11,
    lineHeight: 16,
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
