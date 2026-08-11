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
import {
  abortAmAfcPlayback,
  createAmAfcTrial,
  playAmAfcTrial,
  scoreAmAfcChoice,
  type AmAfcChoiceResult,
  type AmAfcTrial,
} from "@/training/amAfcTrial";
import {
  applyAmSessionResult,
  createAmSession,
  endAmSessionManual,
  endReasonLabel,
  summarizeAmSession,
  type AmSessionState,
  type AmSessionSummary,
} from "@/training/amSession";
import { DEFAULT_AFC_N } from "@/training/freqAfcTrial";
import {
  DEFAULT_MAX_TRIALS,
  DEFAULT_TARGET_REVERSALS,
} from "@/training/freqSession";
import { appendAmSessionSummary } from "@/training/sessionStore";
import { SummaryCard } from "@/training/SummaryCard";

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
): string {
  if (phase === "idle") {
    return `난이도 전환 ${DEFAULT_TARGET_REVERSALS}번 또는 연습 ${DEFAULT_MAX_TRIALS}번까지`;
  }
  return `연습 ${trialNumber} · 전환 ${reversalCount}/${DEFAULT_TARGET_REVERSALS}`;
}

type AmSessionScreenProps = {
  /** 연습 목록으로 돌아가기(idle·요약에서만 노출). */
  onBack?: () => void;
};

/**
 * ① AM/포락선 — 훈련용 정적 UI.
 * 변조 깊이(m/dB)를 색·크기·게이지에 연동하지 않음. 요약은 진단 역치가 아님.
 */
export function AmSessionScreen({ onBack }: Readonly<AmSessionScreenProps>) {
  const theme = useTheme();
  const abortRef = useRef(false);
  /** 이번 세션 요약을 이미 저장했는지. 중복 저장 방지(세션 시작 시 리셋). */
  const savedRef = useRef(false);
  const [phase, setPhase] = useState<Phase>("idle");
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
    setSaveNote(null);
    void appendAmSessionSummary(nextSummary)
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
    abortRef.current = false;

    const next = createAmAfcTrial({
      n: DEFAULT_AFC_N,
      depthDb: state.stair.depthDb,
    });
    setTrial(next);
    setPhase("playing");

    try {
      await playAmAfcTrial(next, {
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
    const next = createAmSession();
    savedRef.current = false;
    setSession(next);
    setSummary(null);
    setSaveNote(null);
    void runTrial(next);
  }, [runTrial]);

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

  const choiceDisabled = phase !== "choose";
  const stair = session?.stair;
  let trialNumber = stair?.trialCount ?? 0;
  if (phase === "playing" || phase === "choose") {
    trialNumber += 1;
  }

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
              <Icon name="ripple" size={42} color={theme.accent} />
            </View>
            <ThemedText type="heading">떨림 찾기</ThemedText>
            <ThemedText
              themeColor="textSecondary"
              type="small"
              style={styles.caption}
            >
              웰니스 연습 · 병원 검사·진단을 대신하지 않아요
            </ThemedText>
            <Pill
              mono
              label={progressCaption(
                phase,
                trialNumber,
                stair?.reversalCount ?? 0,
              )}
            />
            <ThemedText type="smallBold" style={styles.heroPrompt}>
              {phaseCaption(phase, result?.correct)}
            </ThemedText>
          </View>
        ) : (
          <View style={styles.header}>
            <ThemedText type="screenTitle" style={styles.caption}>
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
                label={progressCaption(
                  phase,
                  trialNumber,
                  stair?.reversalCount ?? 0,
                )}
              />
            )}
          </View>
        )}

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
          <View style={styles.statusRow}>
            {phase === "playing" ? <Equalizer color={theme.accent} /> : null}
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
                <ThemedText type="metric" style={styles.choiceNumber}>
                  {i + 1}
                </ThemedText>
              </Pressable>
            ))}
          </View>
        ) : null}

        {phase === "feedback" && result && stair ? (
          <ThemedText themeColor="textMuted" type="small" style={styles.detail}>
            {`선택 ${result.chosenIndex + 1} · 정답 ${result.oddIndex + 1}`}
            {` · 방금 떨림 ${result.depthDb.toFixed(0)} · 다음 떨림 ${stair.depthDb.toFixed(0)}`}
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

        <View style={styles.actions}>
          {phase === "idle" || phase === "summary" ? (
            <>
              <ActionButton
                variant="primary"
                label={phase === "summary" ? "다시 연습" : "연습 시작"}
                onPress={onStart}
              />
              {onBack ? (
                <ActionButton
                  label="연습 목록"
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
              <ActionButton label="끝내기" onPress={onEndManual} />
            </>
          ) : null}

          {phase === "playing" || phase === "choose" ? (
            <ActionButton icon="stop" label="중지" onPress={onEndManual} />
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
    aspectRatio: 1,
    borderWidth: 1.5,
    borderRadius: Radius.large,
    alignItems: "center",
    justifyContent: "center",
  },
  choiceNumber: {
    fontSize: 30,
    lineHeight: 38,
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
    gap: Spacing.three - 4,
    marginTop: Spacing.two,
  },
  disabled: {
    opacity: 0.4,
  },
});
