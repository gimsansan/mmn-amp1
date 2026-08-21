import { useFocusEffect } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Alert,
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
import { StatsEntryButton } from "@/components/ui/stats-entry-button";
import {
  BottomTabInset,
  MaxContentWidth,
  Radius,
  Shadows,
  Spacing,
} from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import { confirmEndSession } from "@/training/confirmEndSession";
import { SessionProgressBar } from "@/training/SessionProgressBar";
import { TabStatsScreen } from "@/training/TabStatsScreen";
import {
  createTwoCharTrials,
  nextTwoCharListIndex,
  scoreTwoCharChoice,
  summarizeTwoChar,
  TWO_CHAR_TRIAL_COUNT,
  type TwoCharTrial,
} from "@/training/wrs/twoCharSession";
import {
  appendTwoCharSummary,
  clearTwoCharRecords,
  listTwoCharRecords,
  type SavedTwoCharRecord,
} from "@/training/wrs/twoCharStore";
import { WrsProgressPanel } from "@/training/wrs/WrsProgressPanel";
import {
  wrsPercentCopy,
  wrsResultCopy,
  type WrsSessionSummary,
} from "@/training/wrs/wrsSession";
import { speakWrsWord, stopWrsSpeech } from "@/training/wrs/wrsTts";

type Phase = "idle" | "playing" | "choose" | "feedback" | "summary";

type TwoCharOutcome = {
  target: string;
  choice: string;
  correct: boolean;
};

type WrsTwoCharScreenProps = {
  onBack: () => void;
  /** 목록에서 막 들어왔을 때 바로 시작. */
  autoStart?: boolean;
  onAutoStartConsumed?: () => void;
};

/**
 * 두 글자 — 한 장 12개, 4지(정답+어려운 오답+안 비슷한 2).
 * 역치형 측정이 아님.
 */
export function WrsTwoCharScreen({
  onBack,
  autoStart = false,
  onAutoStartConsumed,
}: Readonly<WrsTwoCharScreenProps>) {
  const theme = useTheme();
  const abortRef = useRef(false);
  const savedRef = useRef(false);
  const trialsRef = useRef<TwoCharTrial[]>([]);
  const outcomesRef = useRef<TwoCharOutcome[]>([]);

  const [phase, setPhase] = useState<Phase>("idle");
  const [trialIndex, setTrialIndex] = useState(0);
  const [lastCorrect, setLastCorrect] = useState<boolean | undefined>(
    undefined,
  );
  const [lastTarget, setLastTarget] = useState<string | null>(null);
  const [summary, setSummary] = useState<WrsSessionSummary | null>(null);
  const [saveNote, setSaveNote] = useState<string | null>(null);
  const [lastError, setLastError] = useState<string | null>(null);
  const [history, setHistory] = useState<SavedTwoCharRecord[]>([]);
  const [clearing, setClearing] = useState(false);
  const [showStats, setShowStats] = useState(false);
  /**
   * 화면이 그리는 값은 ref가 아니라 state로 둔다 — ref는 바꿔도 다시 그리지 않아서
   * 옆에 있는 `setPhase` 덕에 우연히 맞게 보일 뿐이다. ref는 비동기 콜백에서
   * 최신 값을 읽는 용도로 남긴다(`WrsBingoScreen`의 `markedRef`+`marked`와 같은 짝).
   */
  const [trials, setTrials] = useState<TwoCharTrial[]>([]);
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
    setPhase("idle");
  }, []);

  const refreshHistory = useCallback(async () => {
    try {
      setHistory(await listTwoCharRecords());
    } catch {
      setHistory([]);
    }
  }, []);

  const doClearHistory = useCallback(() => {
    setClearing(true);
    void clearTwoCharRecords()
      .then(() => {
        Alert.alert("완료", "두 글자 연습 기록을 지웠어요.");
        return refreshHistory();
      })
      .catch(() => {
        Alert.alert("오류", "기록을 지우지 못했어요.");
      })
      .finally(() => {
        setClearing(false);
      });
  }, [refreshHistory]);

  const confirmClearHistory = useCallback(() => {
    Alert.alert(
      "기록 삭제",
      "두 글자 연습 기록을 모두 지울까요? 되돌릴 수 없어요. 다른 연습 기록은 그대로예요.",
      [
        { text: "취소", style: "cancel" },
        { text: "삭제", style: "destructive", onPress: doClearHistory },
      ],
    );
  }, [doClearHistory]);

  useFocusEffect(
    useCallback(() => {
      abortRef.current = false;
      void refreshHistory();
      return () => {
        abortRef.current = true;
        void stopWrsSpeech();
      };
    }, [refreshHistory]),
  );

  useEffect(() => {
    return () => {
      abortRef.current = true;
      void stopWrsSpeech();
    };
  }, []);

  useEffect(() => {
    if (showStats) {
      const sub = BackHandler.addEventListener("hardwareBackPress", () => {
        setShowStats(false);
        return true;
      });
      return () => sub.remove();
    }
    if (phase === "idle" || phase === "summary") {
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
  }, [onBack, phase, resetRun, showStats]);

  const playCurrent = useCallback(async (index: number) => {
    const trial = trialsRef.current[index];
    if (!trial) {
      return;
    }
    abortRef.current = false;
    setLastError(null);
    setPhase("playing");
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
    void listTwoCharRecords()
      .then((rows) => {
        const nextTrials = createTwoCharTrials(nextTwoCharListIndex(rows.length));
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
      })
      .catch(() => {
        setLastError("연습을 시작하지 못했어요.");
      });
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
    const nextSummary = summarizeTwoChar(outcomesRef.current);
    setSummary(nextSummary);
    setPhase("summary");

    if (nextSummary.trialCount !== TWO_CHAR_TRIAL_COUNT) {
      setSaveNote("12개를 다 고르지 않아 기록에는 안 남겼어요");
      return;
    }

    if (savedRef.current) {
      return;
    }
    savedRef.current = true;
    try {
      await appendTwoCharSummary(nextSummary);
      setSaveNote("기기에 기록했어요");
      await refreshHistory();
    } catch {
      setSaveNote("기록에 남기지 못했어요");
    }
  }, [refreshHistory]);

  const onChoose = useCallback(
    (choice: string) => {
      if (phase !== "choose") {
        return;
      }
      const trial = trialsRef.current[trialIndex];
      if (!trial) {
        return;
      }
      const correct = scoreTwoCharChoice(trial.target, choice);
      outcomesRef.current = [
        ...outcomesRef.current,
        {
          target: trial.target,
          choice,
          correct,
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
    void refreshHistory();
    setShowStats(true);
  }, [refreshHistory]);

  const closeStats = useCallback(() => {
    setShowStats(false);
  }, []);

  if (showStats) {
    return (
      <TabStatsScreen
        title="연습 기록"
        onBack={closeStats}
        empty={history.length === 0}
      >
        <WrsProgressPanel records={history} />
        <ClearHistoryButton clearing={clearing} onPress={confirmClearHistory} />
      </TabStatsScreen>
    );
  }

  return (
    <ThemedView style={styles.fill}>
      <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
        <View style={styles.header}>
          <View style={styles.headerRow}>
            <ThemedText type="screenTitle">두 글자</ThemedText>
            {phase === "idle" || phase === "summary" ? (
              <StatsEntryButton onPress={openStats} />
            ) : null}
          </View>
          <ThemedText
            themeColor="textSecondary"
            type="small"
            style={styles.caption}
          >
            들은 단어를 보기에서 고르는 연습 · 병원 검사가 아니에요
          </ThemedText>
        </View>

        {running ? (
          <SessionProgressBar
            current={outcomeCount}
            total={TWO_CHAR_TRIAL_COUNT}
          />
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
                두 글자 단어 하나를 읽어 줘요. 비슷한 소리 보기 네 개 중에서
                들은 단어를 고르면 됩니다. 한 번은 12개예요. 목소리는 기계음이라
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
              playing={phase === "playing"}
            />
            <ThemedText
              type="smallBold"
              themeColor="textSecondary"
              style={styles.statusText}
            >
              {promptCopy(phase, lastCorrect, lastTarget)}
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
            style={styles.caption}
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

          {phase === "idle" || phase === "summary" ? (
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
): string | null {
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

function ClearHistoryButton({
  clearing,
  onPress,
}: Readonly<{ clearing: boolean; onPress: () => void }>) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="두 글자 연습 기록 지우기"
      accessibilityState={{ disabled: clearing }}
      disabled={clearing}
      onPress={onPress}
      style={({ pressed }) => [
        styles.clearHistory,
        clearing && styles.clearHistoryDisabled,
        pressed && !clearing && styles.clearHistoryPressed,
      ]}
    >
      <ThemedText
        themeColor="danger"
        type="small"
        style={styles.clearHistoryLabel}
      >
        {clearing ? "지우는 중…" : "두 글자 기록 지우기"}
      </ThemedText>
    </Pressable>
  );
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
    paddingBottom: BottomTabInset + Spacing.four,
    gap: Spacing.three,
  },
  header: {
    gap: Spacing.one,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  caption: {
    fontSize: 12,
    lineHeight: 18,
  },
  idleContent: {
    gap: Spacing.three,
    paddingBottom: Spacing.two,
  },
  idleCard: {
    gap: Spacing.two,
  },
  idleBody: {
    fontSize: 13,
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
    fontSize: 12,
    lineHeight: 18,
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
    fontSize: 26,
    lineHeight: 34,
  },
  actions: {
    marginTop: "auto",
    gap: Spacing.two,
    flexGrow: 0,
  },
  clearHistory: {
    alignSelf: "flex-end",
    minHeight: 44,
    justifyContent: "center",
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.one,
  },
  clearHistoryLabel: {
    fontSize: 12.5,
    lineHeight: 18,
  },
  clearHistoryPressed: {
    opacity: 0.7,
  },
  clearHistoryDisabled: {
    opacity: 0.4,
  },
  pressed: {
    opacity: 0.85,
  },
  disabled: {
    opacity: 0.55,
  },
});
