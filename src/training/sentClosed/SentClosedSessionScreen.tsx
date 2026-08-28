import { useFocusEffect } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  BackHandler,
  Image,
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
import { ListeningCheckEntryButton } from "@/components/ui/listening-check-entry-button";
import { ScreenHeader } from "@/components/ui/screen-header";
import { StatsEntryButton } from "@/components/ui/stats-entry-button";
import { MaxContentWidth, Radius, Shadows, Spacing } from "@/constants/theme";
import { usePressScale } from "@/hooks/use-press-scale";
import { useTheme } from "@/hooks/use-theme";
import { confirmEndSession } from "@/training/confirmEndSession";
import { ListeningCheckScreen } from "@/training/ListeningCheckScreen";
import {
  playSentClosedScene,
  stopSentClosedPlayback,
  waitSentClosedLeadIn,
} from "@/training/sentClosed/play";
import {
  SCENES,
  sceneOf,
  type Scene,
  type SceneId,
} from "@/training/sentClosed/scenes";
import {
  appendSentClosedSummary,
  listSentClosedRecords,
} from "@/training/sentClosed/store";
import {
  SENT_CLOSED_TRIAL_COUNT,
  createSentClosedTrials,
  scoreSentClosedChoice,
  sentClosedResultCopy,
  summarizeSentClosed,
  type ClosedSentOutcome,
  type ClosedSentTrial,
} from "@/training/sentClosed/trials";
import { SessionProgressBar } from "@/training/SessionProgressBar";
import { StatsScreen } from "@/training/StatsScreen";

type Phase = "idle" | "playing" | "choose" | "feedback" | "summary";

/** idle(연습 선택) 화면 텍스트만 균일하게 살짝 키우는 배율(사용자 요청). */
const TEXT_SCALE = 1.2;

const PREVIEW_COUNT = 6;

function pickPreviewScenes(scenes: readonly Scene[]): Scene[] {
  const next = [...scenes];
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    const current = next[i];
    const swap = next[j];
    if (current === undefined || swap === undefined) {
      continue;
    }
    next[i] = swap;
    next[j] = current;
  }
  return next.slice(0, PREVIEW_COUNT);
}

export function SentClosedSessionScreen() {
  const theme = useTheme();
  const abortRef = useRef(false);
  const runSeqRef = useRef(0);
  const savedRef = useRef(false);
  const trialsRef = useRef<ClosedSentTrial[]>([]);
  const outcomesRef = useRef<ClosedSentOutcome[]>([]);

  const [phase, setPhase] = useState<Phase>("idle");
  const [trialIndex, setTrialIndex] = useState(0);
  const [lastCorrect, setLastCorrect] = useState<boolean | undefined>(
    undefined,
  );
  const [lastTarget, setLastTarget] = useState<SceneId | null>(null);
  const [resultLine, setResultLine] = useState<string | null>(null);
  const [saveNote, setSaveNote] = useState<string | null>(null);
  const [lastError, setLastError] = useState<string | null>(null);
  const [leadIn, setLeadIn] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [showCheck, setShowCheck] = useState(false);
  const [trials, setTrials] = useState<ClosedSentTrial[]>([]);
  const [outcomeCount, setOutcomeCount] = useState(0);
  const [historyLen, setHistoryLen] = useState(0);

  const running =
    phase === "playing" || phase === "choose" || phase === "feedback";
  const choiceDisabled = phase !== "choose";
  // idle 안내 화면에서만 버튼 글자를 키운다(summary·진행 중은 기본 크기).
  const idleTextScale = phase === "idle" ? TEXT_SCALE : 1;
  const currentTrial = trials[trialIndex];
  const showIdlePreview = phase === "idle";
  const previewScenes = useMemo(
    () => (showIdlePreview ? pickPreviewScenes(SCENES) : []),
    [showIdlePreview],
  );

  const resetRun = useCallback(() => {
    abortRef.current = true;
    stopSentClosedPlayback();
    trialsRef.current = [];
    outcomesRef.current = [];
    savedRef.current = false;
    setOutcomeCount(0);
    setTrialIndex(0);
    setTrials([]);
    setLastCorrect(undefined);
    setLastTarget(null);
    setResultLine(null);
    setSaveNote(null);
    setLastError(null);
    setLeadIn(false);
    setPhase("idle");
  }, []);

  const refreshHistory = useCallback(async () => {
    try {
      const rows = await listSentClosedRecords();
      setHistoryLen(rows.length);
    } catch {
      setHistoryLen(0);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      abortRef.current = false;
      void refreshHistory();
      return () => {
        abortRef.current = true;
        stopSentClosedPlayback();
      };
    }, [refreshHistory]),
  );

  useEffect(() => {
    return () => {
      abortRef.current = true;
      stopSentClosedPlayback();
    };
  }, []);

  const openStats = useCallback(() => {
    void refreshHistory();
    setShowStats(true);
  }, [refreshHistory]);

  const closeStats = useCallback(() => {
    setShowStats(false);
  }, []);

  const openCheck = useCallback(() => {
    setShowCheck(true);
  }, []);

  const closeCheck = useCallback(() => {
    setShowCheck(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      if (showStats) {
        const sub = BackHandler.addEventListener("hardwareBackPress", () => {
          closeStats();
          return true;
        });
        return () => sub.remove();
      }
      if (showCheck) {
        const sub = BackHandler.addEventListener("hardwareBackPress", () => {
          closeCheck();
          return true;
        });
        return () => sub.remove();
      }
      if (phase === "idle" || phase === "summary") {
        return;
      }
      const sub = BackHandler.addEventListener("hardwareBackPress", () => {
        confirmEndSession(resetRun);
        return true;
      });
      return () => sub.remove();
    }, [closeCheck, closeStats, phase, resetRun, showCheck, showStats]),
  );

  const playCurrent = useCallback(async (index: number) => {
    const trial = trialsRef.current[index];
    if (!trial) {
      return;
    }
    const seq = ++runSeqRef.current;
    const aborted = () => abortRef.current || runSeqRef.current !== seq;
    abortRef.current = false;
    setLastError(null);
    setPhase("playing");
    try {
      if (index === 0) {
        setLeadIn(true);
        await waitSentClosedLeadIn();
        if (aborted()) {
          return;
        }
        setLeadIn(false);
      }
      await playSentClosedScene(trial.target);
      if (aborted()) {
        return;
      }
      setPhase("choose");
    } catch {
      if (aborted()) {
        return;
      }
      setLeadIn(false);
      setLastError("소리를 재생하지 못했어요. 다시 시작해 주세요.");
      setPhase("choose");
    }
  }, []);

  const onStart = useCallback(() => {
    abortRef.current = false;
    savedRef.current = false;
    const next = createSentClosedTrials();
    trialsRef.current = next;
    outcomesRef.current = [];
    setTrials(next);
    setOutcomeCount(0);
    setTrialIndex(0);
    setLastCorrect(undefined);
    setLastTarget(null);
    setResultLine(null);
    setSaveNote(null);
    void playCurrent(0);
  }, [playCurrent]);

  const finishSession = useCallback(async () => {
    stopSentClosedPlayback();
    setPhase("summary");
    const summary = summarizeSentClosed(outcomesRef.current);
    setResultLine(sentClosedResultCopy(summary.trialCount));

    if (summary.trialCount !== SENT_CLOSED_TRIAL_COUNT) {
      setSaveNote(null);
      return;
    }
    if (savedRef.current) {
      return;
    }
    savedRef.current = true;
    try {
      await appendSentClosedSummary(summary);
      setSaveNote("기기에 기록했어요");
      await refreshHistory();
    } catch {
      setSaveNote("기록에 남기지 못했어요");
    }
  }, [refreshHistory]);

  const onChoose = useCallback(
    (choice: SceneId) => {
      if (phase !== "choose") {
        return;
      }
      const trial = trialsRef.current[trialIndex];
      if (!trial) {
        return;
      }
      const correct = scoreSentClosedChoice(trial.target, choice);
      outcomesRef.current = [
        ...outcomesRef.current,
        { target: trial.target, choice, correct },
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

  const onStopPress = useCallback(() => {
    confirmEndSession(onEndManual, {
      onOpen: () => {
        abortRef.current = true;
        stopSentClosedPlayback();
      },
      onCancel: () => {
        void playCurrent(trialIndex);
      },
    });
  }, [onEndManual, playCurrent, trialIndex]);

  if (showStats) {
    return <StatsScreen initialKind="sent" onBack={closeStats} />;
  }

  if (showCheck) {
    return (
      <ListeningCheckScreen trackIcon="headphones" onBack={closeCheck} />
    );
  }

  return (
    <ThemedView style={styles.fill}>
      <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
        <ScreenHeader
          title="문장 듣기"
          caption="들은 문장을 그림에서 고르는 연습 · 병원 검사가 아니에요"
          action={
            phase === "idle" || phase === "summary" ? (
              <View style={styles.headerActions}>
                <ListeningCheckEntryButton onPress={openCheck} />
                <StatsEntryButton onPress={openStats} />
              </View>
            ) : null
          }
        />

        {running ? (
          <SessionProgressBar
            current={outcomeCount}
            total={SENT_CLOSED_TRIAL_COUNT}
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
                짧은 문장을 들려 줘요. 그림 세 장 중에서 들은 내용과 같은 그림을
                고르면 됩니다. 점수를 매기는 검사가 아니에요.
              </ThemedText>
            </Card>
            {showIdlePreview ? (
              <View style={styles.previewGrid}>
                {previewScenes.map((scene) => (
                  <PreviewCell key={scene.id} scene={scene} />
                ))}
              </View>
            ) : null}
          </ScrollView>
        ) : null}

        {phase === "summary" ? (
          <ScrollView
            style={styles.fill}
            contentContainerStyle={styles.summaryContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.headline}>
              <Icon name="check" size={28} color={theme.positive} />
              <ThemedText type="smallBold" style={styles.headlineText}>
                오늘 연습 끝
              </ThemedText>
            </View>
            <Card style={styles.summaryCard}>
              <ThemedText type="smallBold" style={styles.resultLine}>
                {resultLine}
              </ThemedText>
              {saveNote ? (
                <ThemedText
                  themeColor="textSecondary"
                  type="small"
                  style={styles.footnote}
                >
                  {saveNote}
                </ThemedText>
              ) : null}
            </Card>
          </ScrollView>
        ) : null}

        {running ? (
          <ScrollView
            style={[styles.fill, styles.runningScroll]}
            contentContainerStyle={styles.runningContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.promptArea}>
              <Equalizer
                color={theme.accent}
                bars={3}
                playing={phase === "playing" && !leadIn}
              />
              <ThemedText
                type="smallBold"
                themeColor="textSecondary"
                style={styles.statusText}
              >
                {leadIn ? "곧 들어요…" : null}
                {!leadIn && phase === "playing"
                  ? "듣는 중… 소리가 끝난 뒤 고르세요"
                  : null}
                {phase === "choose" ? "들은 문장에 맞는 그림을 고르세요" : null}
                {phase === "feedback"
                  ? lastCorrect
                    ? "맞았어요"
                    : "아쉬워요 · 맞는 그림을 표시했어요"
                  : null}
              </ThemedText>
            </View>

            <View style={styles.choiceGrid}>
              {(currentTrial?.choices ?? []).map((id, index) => {
                const scene = sceneOf(id);
                return (
                  <ChoiceCell
                    key={id}
                    scene={scene}
                    index={index}
                    disabled={choiceDisabled}
                    marked={
                      phase === "feedback" && lastTarget === id
                        ? "answer"
                        : null
                    }
                    onPress={() => onChoose(id)}
                  />
                );
              })}
            </View>
          </ScrollView>
        ) : null}

        {lastError ? (
          <ThemedText themeColor="textSecondary" type="small">
            {lastError}
          </ThemedText>
        ) : null}

        <View style={styles.actions}>
          {phase === "idle" || phase === "summary" ? (
            <ActionButton
              variant="primary"
              fill={false}
              label={phase === "summary" ? "다시 연습" : "시작"}
              textScale={idleTextScale}
              onPress={onStart}
            />
          ) : null}

          {phase === "summary" ? (
            <ActionButton fill={false} label="처음으로" onPress={resetRun} />
          ) : null}

          {phase === "feedback" ? (
            <>
              <ActionButton
                variant="primary"
                fill={false}
                label="다음"
                onPress={onNext}
              />
              {/*
               * 피드백에서는 「중지」(취소 시 재생 복구)를 쓰지 않는다. 이미 답한
               * 문항을 다시 재생해 `choose`로 되돌리면 같은 문항 답이 한 번 더
               * 쌓여 18개를 다 해도 19개가 되고, 그러면 기록이 조용히 버려진다
               * (요약 문구만 「18개」로 남는다). 단어 듣기와 같은 배치다.
               */}
              <ActionButton
                fill={false}
                label="끝내기"
                onPress={() => confirmEndSession(onEndManual)}
              />
            </>
          ) : null}

          {phase === "playing" || phase === "choose" ? (
            <ActionButton fill={false} label="중지" onPress={onStopPress} />
          ) : null}
        </View>
      </SafeAreaView>
    </ThemedView>
  );
}

/** 미리보기·고르기 칸: 정사각 에셋의 좌우 여백을 잘라 인물만 조금 키운다. */
const PREVIEW_FIGURE_SCALE = 1.5;
const CHOICE_FIGURE_SCALE = 1.3;

function PreviewCell({ scene }: Readonly<{ scene: Scene }>) {
  const theme = useTheme();
  return (
    <View
      style={[
        styles.previewCell,
        { backgroundColor: theme.surface, borderColor: theme.border },
      ]}
    >
      <View style={styles.previewClip}>
        <Image
          source={scene.image}
          style={styles.previewImage}
          resizeMode="contain"
        />
      </View>
    </View>
  );
}

function ChoiceCell({
  scene,
  index,
  disabled,
  marked,
  onPress,
}: Readonly<{
  scene: Scene;
  index: number;
  disabled: boolean;
  marked: "answer" | null;
  onPress: () => void;
}>) {
  const theme = useTheme();
  const answer = marked === "answer";
  const { scale, onPressIn, onPressOut } = usePressScale();

  return (
    <Animated.View
      style={[styles.choiceCellOuter, { transform: [{ scale }] }]}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`그림 ${index + 1}`}
        accessibilityState={{ disabled }}
        disabled={disabled}
        onPress={onPress}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        style={({ pressed }) => [
          styles.choiceCell,
          {
            backgroundColor: theme.surface,
            borderColor: answer
              ? theme.accent
              : pressed && !disabled
                ? theme.accentBorder
                : theme.border,
          },
          Shadows.card,
          pressed && !disabled && styles.pressed,
          disabled && styles.disabled,
        ]}
      >
        <View style={styles.choiceClip}>
          <Image
            source={scene.image}
            style={styles.choiceImage}
            resizeMode="contain"
          />
        </View>
      </Pressable>
    </Animated.View>
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
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
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
  previewGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.two,
  },
  previewCell: {
    width: "31.5%",
    flexGrow: 1,
    borderWidth: 1,
    borderRadius: Radius.large - 4,
    overflow: "hidden",
  },
  previewClip: {
    height: 150,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },
  previewImage: {
    width: "100%",
    height: 150,
    transform: [{ scale: PREVIEW_FIGURE_SCALE }],
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
  runningScroll: {
    flexShrink: 1,
  },
  runningContent: {
    gap: Spacing.three,
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
  choiceCellOuter: {
    width: "31.5%",
  },
  choiceCell: {
    width: "100%",
    borderWidth: 1.5,
    borderRadius: Radius.large - 4,
    overflow: "hidden",
  },
  choiceClip: {
    height: 180,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },
  choiceImage: {
    width: "100%",
    height: 180,
    transform: [{ scale: CHOICE_FIGURE_SCALE }],
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
