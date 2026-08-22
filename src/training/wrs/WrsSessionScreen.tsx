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
import { Card } from "@/components/ui/card";
import { Equalizer } from "@/components/ui/equalizer";
import { Icon } from "@/components/ui/icon";
import { Pill } from "@/components/ui/pill";
import { ScreenHeader } from "@/components/ui/screen-header";
import { StatsEntryButton } from "@/components/ui/stats-entry-button";
import {
  MaxContentWidth,
  Radius,
  Shadows,
  Spacing,
} from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import { confirmEndSession } from "@/training/confirmEndSession";
import { SessionProgressBar } from "@/training/SessionProgressBar";
import { StatsScreen } from "@/training/StatsScreen";
import {
  createWrsTrials,
  scoreWrsChoice,
  summarizeWrs,
  wrsPercentCopy,
  wrsResultCopy,
  WRS_TRIAL_COUNT,
  type WrsSessionSummary,
  type WrsTrial,
  type WrsTrialOutcome,
} from "@/training/wrs/wrsSession";
import { appendWrsSummary } from "@/training/wrs/wrsStore";
import {
  speakWrsWord,
  stopWrsSpeech,
  waitFirstWordLeadIn,
} from "@/training/wrs/wrsTts";

type Phase = "idle" | "playing" | "choose" | "feedback" | "summary";

type WrsSessionScreenProps = {
  /** 단어 듣기 목록으로 돌아가기(idle·요약에서만 노출). */
  onBack?: () => void;
  /** 목록에서 막 들어왔을 때 바로 시작. */
  autoStart?: boolean;
  onAutoStartConsumed?: () => void;
};

export function WrsSessionScreen({
  onBack,
  autoStart = false,
  onAutoStartConsumed,
}: Readonly<WrsSessionScreenProps>) {
  const theme = useTheme();
  const abortRef = useRef(false);
  const savedRef = useRef(false);
  const trialsRef = useRef<WrsTrial[]>([]);
  const outcomesRef = useRef<WrsTrialOutcome[]>([]);

  const [phase, setPhase] = useState<Phase>("idle");
  const [trialIndex, setTrialIndex] = useState(0);
  const [lastCorrect, setLastCorrect] = useState<boolean | undefined>(
    undefined,
  );
  const [lastTarget, setLastTarget] = useState<string | null>(null);
  const [summary, setSummary] = useState<WrsSessionSummary | null>(null);
  const [saveNote, setSaveNote] = useState<string | null>(null);
  const [lastError, setLastError] = useState<string | null>(null);
  /**
   * 첫 단어 앞의 뜸 동안 켜진다. 이때도 「듣는 중」이라고 하면 난청 사용자가
   * 소리를 놓친 줄 안다 — 아직 안 났다는 걸 말로 알린다.
   */
  const [leadIn, setLeadIn] = useState(false);
  const [showStats, setShowStats] = useState(false);
  /**
   * 화면이 그리는 값은 ref가 아니라 state로 둔다 — ref는 바꿔도 다시 그리지 않아서
   * 옆에 있는 `setPhase` 덕에 우연히 맞게 보일 뿐이다. ref는 비동기 콜백에서
   * 최신 값을 읽는 용도로 남긴다(`WrsBingoScreen`의 `markedRef`+`marked`와 같은 짝).
   */
  const [trials, setTrials] = useState<WrsTrial[]>([]);
  const [outcomeCount, setOutcomeCount] = useState(0);

  const running =
    phase === "playing" || phase === "choose" || phase === "feedback";
  const choiceDisabled = phase !== "choose";
  const currentTrial = trials[trialIndex];

  const resetRun = useCallback(() => {
    abortRef.current = true;
    void stopWrsSpeech();
    trialsRef.current = [];
    outcomesRef.current = [];
    savedRef.current = false;
    setTrials([]);
    setOutcomeCount(0);
    setTrialIndex(0);
    setLastCorrect(undefined);
    setLastTarget(null);
    setSummary(null);
    setSaveNote(null);
    setLastError(null);
    setLeadIn(false);
    setPhase("idle");
  }, []);

  useFocusEffect(
    useCallback(() => {
      abortRef.current = false;
      return () => {
        abortRef.current = true;
        void stopWrsSpeech();
      };
    }, []),
  );

  useEffect(() => {
    return () => {
      abortRef.current = true;
      void stopWrsSpeech();
    };
  }, []);

  // 탭이 마운트된 채 남으므로 포커스가 없을 때는 걷어낸다 — 안 그러면 다른 탭의
  // 뒤로가기를 이 화면이 가로챈다(`BackHandler`는 등록 역순으로 먼저 true를 문다).
  useFocusEffect(
    useCallback(() => {
      if (showStats) {
        const sub = BackHandler.addEventListener("hardwareBackPress", () => {
          setShowStats(false);
          return true;
        });
        return () => sub.remove();
      }
      if (phase === "idle" || phase === "summary") {
        if (!onBack) {
          return;
        }
        const sub = BackHandler.addEventListener("hardwareBackPress", () => {
          onBack();
          return true;
        });
        return () => sub.remove();
      }
      const sub = BackHandler.addEventListener("hardwareBackPress", () => {
        confirmEndSession(resetRun);
        return true;
      });
      return () => sub.remove();
    }, [onBack, phase, resetRun, showStats]),
  );

  const playCurrent = useCallback(async (index: number) => {
    const trial = trialsRef.current[index];
    if (!trial) {
      return;
    }
    abortRef.current = false;
    setLastError(null);
    setPhase("playing");
    // 첫 단어만 뜸을 들인다 — 두 번째부터는 「고르기 → 다음」 사이가 이미 있다.
    if (index === 0) {
      setLeadIn(true);
      await waitFirstWordLeadIn();
      setLeadIn(false);
      if (abortRef.current) {
        return;
      }
    }
    try {
      await speakWrsWord(trial.target);
      if (abortRef.current) {
        return;
      }
      setPhase("choose");
    } catch {
      if (abortRef.current) {
        return;
      }
      setLastError("단어를 읽지 못했어요. 보기를 고르거나 다시 시작해 주세요.");
      setPhase("choose");
    }
  }, []);

  const onStart = useCallback(() => {
    abortRef.current = false;
    savedRef.current = false;
    const nextTrials = createWrsTrials();
    trialsRef.current = nextTrials;
    outcomesRef.current = [];
    setTrials(nextTrials);
    setOutcomeCount(0);
    setTrialIndex(0);
    setLastCorrect(undefined);
    setLastTarget(null);
    setSummary(null);
    setSaveNote(null);
    void playCurrent(0);
  }, [playCurrent]);

  const autoStartOnceRef = useRef(false);
  useEffect(() => {
    if (!autoStart || autoStartOnceRef.current) {
      return;
    }
    autoStartOnceRef.current = true;
    onStart();
    onAutoStartConsumed?.();
  }, [autoStart, onAutoStartConsumed, onStart]);

  const finishSession = useCallback(async () => {
    abortRef.current = true;
    await stopWrsSpeech();
    const nextSummary = summarizeWrs(outcomesRef.current);
    setSummary(nextSummary);
    setPhase("summary");

    if (nextSummary.trialCount !== WRS_TRIAL_COUNT) {
      setSaveNote("25개를 다 고르지 않아 기록에는 안 남겼어요");
      return;
    }

    if (savedRef.current) {
      return;
    }
    savedRef.current = true;
    try {
      await appendWrsSummary(nextSummary);
      setSaveNote("기기에 기록했어요");
    } catch {
      setSaveNote("기록에 남기지 못했어요");
    }
  }, []);

  const onChoose = useCallback(
    (choice: string) => {
      if (phase !== "choose") {
        return;
      }
      const trial = trialsRef.current[trialIndex];
      if (!trial) {
        return;
      }
      const correct = scoreWrsChoice(trial.target, choice);
      outcomesRef.current = [
        ...outcomesRef.current,
        {
          target: trial.target,
          choice,
          correct,
          axis: trial.axis,
        },
      ];
      setOutcomeCount(outcomesRef.current.length);
      setLastCorrect(correct);
      setLastTarget(trial.target);
      setPhase("feedback");
    },
    [phase, trialIndex],
  );

  const onNext = useCallback(() => {
    const nextIndex = trialIndex + 1;
    if (nextIndex >= trialsRef.current.length) {
      void finishSession();
      return;
    }
    setTrialIndex(nextIndex);
    setLastCorrect(undefined);
    setLastTarget(null);
    void playCurrent(nextIndex);
  }, [finishSession, playCurrent, trialIndex]);

  const onEndManual = useCallback(() => {
    void finishSession();
  }, [finishSession]);

  const openStats = useCallback(() => {
    setShowStats(true);
  }, []);

  const closeStats = useCallback(() => {
    setShowStats(false);
  }, []);

  if (showStats) {
    return (
      <StatsScreen initialKind="wrs1" onBack={closeStats} />
    );
  }

  return (
    <ThemedView style={styles.fill}>
      <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
        <ScreenHeader
          title="한 글자"
          caption="들은 단어를 보기에서 고르는 연습 · 병원 검사가 아니에요"
          action={
            phase === "idle" || phase === "summary" ? (
              <StatsEntryButton onPress={openStats} />
            ) : null
          }
        />

        {running ? (
          <SessionProgressBar current={outcomeCount} total={WRS_TRIAL_COUNT} />
        ) : null}

        {phase === "idle" ? (
          <ScrollView
            style={styles.fill}
            contentContainerStyle={styles.idleContent}
            showsVerticalScrollIndicator={false}
          >
            <Card style={styles.idleCard}>
              <ThemedText type="smallBold">이렇게 연습해요</ThemedText>
              <ThemedText
                themeColor="textSecondary"
                type="small"
                style={styles.idleBody}
              >
                한 글자 단어 하나를 읽어 줘요. 비슷한 소리 보기 네 개 중에서
                들은 단어를 고르면 됩니다. 한 번은 25개예요. 목소리는 기계음이라
                사람 말과 다를 수 있어요.
              </ThemedText>
            </Card>
          </ScrollView>
        ) : null}

        {phase === "summary" ? (
          <ScrollView
            style={styles.fill}
            contentContainerStyle={styles.summaryContent}
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
                연습이 끝났어요
              </ThemedText>
            </View>
            {summary ? (
              <Card size="large" style={styles.summaryCard}>
                <ThemedText type="heading" style={styles.resultLine}>
                  {wrsResultCopy(summary)}
                </ThemedText>
                {wrsPercentCopy(summary) ? (
                  <ThemedText type="smallBold" style={{ color: theme.accent }}>
                    {wrsPercentCopy(summary)}
                  </ThemedText>
                ) : null}
                <ThemedText
                  type="small"
                  themeColor="textMuted"
                  style={styles.footnote}
                >
                  연습 기록이에요. 청력 검사·진단 결과가 아니에요.
                </ThemedText>
              </Card>
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
              playing={phase === "playing" && !leadIn}
            />
            <ThemedText
              type="smallBold"
              themeColor="textSecondary"
              style={styles.statusText}
            >
              {promptCopy(phase, lastCorrect, lastTarget, leadIn)}
            </ThemedText>
          </View>
        ) : null}

        {running && currentTrial ? (
          <View style={styles.choiceGrid}>
            {currentTrial.choices.map((word) => (
              <ChoiceCell
                key={word}
                word={word}
                disabled={choiceDisabled}
                marked={
                  phase === "feedback" && lastTarget === word ? "answer" : null
                }
                onPress={() => onChoose(word)}
              />
            ))}
          </View>
        ) : null}

        {lastError ? (
          <ThemedText
            themeColor="textSecondary"
            type="small"
          >
            {lastError}
          </ThemedText>
        ) : null}

        <View style={styles.actions}>
          {phase === "idle" || phase === "summary" ? (
            <ActionButton
              variant="primary"
              fill={false}
              label={phase === "summary" ? "다시 연습" : "연습 시작"}
              onPress={onStart}
            />
          ) : null}

          {phase === "summary" ? (
            <ActionButton fill={false} label="처음으로" onPress={resetRun} />
          ) : null}

          {(phase === "idle" || phase === "summary") && onBack ? (
            <ActionButton fill={false} label="뒤로 가기" onPress={onBack} />
          ) : null}

          {phase === "feedback" ? (
            <>
              <ActionButton
                variant="primary"
                fill={false}
                label="다음"
                onPress={onNext}
              />
              <ActionButton
                fill={false}
                label="끝내기"
                onPress={() => confirmEndSession(onEndManual)}
              />
            </>
          ) : null}

          {phase === "playing" || phase === "choose" ? (
            <ActionButton
              fill={false}
              label="중지"
              onPress={() => confirmEndSession(onEndManual)}
            />
          ) : null}
        </View>
      </SafeAreaView>
    </ThemedView>
  );
}

function choiceBorder(
  theme: { accent: string; accentBorder: string; border: string },
  answer: boolean,
  pressed: boolean,
): string {
  if (answer) {
    return theme.accent;
  }
  if (pressed) {
    return theme.accentBorder;
  }
  return theme.border;
}

function promptCopy(
  phase: Phase,
  lastCorrect: boolean | undefined,
  lastTarget: string | null,
  leadIn: boolean,
): string | null {
  if (leadIn) {
    return "잠시 뒤 들려 드려요";
  }
  if (phase === "playing") {
    return "듣는 중… 소리가 끝난 뒤 고르세요";
  }
  if (phase === "choose") {
    return "들은 단어를 고르세요";
  }
  if (phase !== "feedback") {
    return null;
  }
  if (lastCorrect) {
    return "맞았어요";
  }
  return `아쉬워요 · 정답은 ${lastTarget ?? ""}`;
}

function ChoiceCell({
  word,
  disabled,
  marked,
  onPress,
}: Readonly<{
  word: string;
  disabled: boolean;
  marked: "answer" | null;
  onPress: () => void;
}>) {
  const theme = useTheme();
  const answer = marked === "answer";

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={word}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.choiceCell,
        {
          backgroundColor: theme.surface,
          borderColor: choiceBorder(theme, answer, pressed && !disabled),
        },
        Shadows.card,
        pressed && !disabled && styles.pressed,
        disabled && styles.disabled,
      ]}
    >
      <ThemedText type="heading" style={styles.choiceWord}>
        {word}
      </ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  fill: {
    flex: 1,
  },
  safe: {
    flex: 1,
    maxWidth: MaxContentWidth,
    alignSelf: "center",
    width: "100%",
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.three,
    paddingBottom: Spacing.four,
    gap: Spacing.three,
  },
  idleContent: {
    gap: Spacing.three,
    paddingBottom: Spacing.two,
  },
  idleCard: {
    gap: Spacing.two,
  },
  idleBody: {
    fontSize: 14,
    lineHeight: 20,
  },
  summaryContent: {
    gap: Spacing.three,
    paddingBottom: Spacing.two,
  },
  headline: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
  },
  headlineText: {
    fontSize: 16,
    lineHeight: 22,
  },
  summaryCard: {
    gap: Spacing.two,
  },
  resultLine: {
    fontSize: 20,
    lineHeight: 28,
  },
  footnote: {
    fontSize: 14,
    lineHeight: 20,
  },
  promptArea: {
    alignItems: "center",
    gap: Spacing.two,
  },
  statusText: {
    textAlign: "center",
  },
  choiceGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.two,
    justifyContent: "space-between",
  },
  choiceCell: {
    width: "48%",
    minHeight: 72,
    borderWidth: 1.5,
    borderRadius: Radius.large - 4,
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.two,
    alignItems: "center",
    justifyContent: "center",
  },
  choiceWord: {
    fontSize: 28,
    lineHeight: 36,
  },
  actions: {
    marginTop: "auto",
    gap: Spacing.two,
    flexGrow: 0,
  },
  pressed: {
    opacity: 0.85,
  },
  disabled: {
    opacity: 0.55,
  },
});
