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
import {
  BottomTabInset,
  MaxContentWidth,
  Spacing,
} from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import { confirmEndSession } from "@/training/confirmEndSession";
import {
  BINGO_CELL_COUNT,
  BINGO_MAX_CUES,
  bingoLineCells,
  bingoResultCopy,
  createBingoBoard,
  pickBingoCue,
  scoreBingoTap,
  summarizeBingo,
  type BingoSummary,
} from "@/training/wrs/wrsBingo";
import type { WrsDifficulty } from "@/training/wrs/wrsDistractors";
import { speakWrsWord, stopWrsSpeech } from "@/training/wrs/wrsTts";

type Phase = "idle" | "playing" | "choose" | "feedback" | "summary";

type WrsBingoScreenProps = {
  onBack: () => void;
};

export function WrsBingoScreen({ onBack }: Readonly<WrsBingoScreenProps>) {
  const theme = useTheme();
  const abortRef = useRef(false);
  const boardRef = useRef<string[]>([]);
  const markedRef = useRef<boolean[]>(emptyMarked());
  const cueRef = useRef<string | null>(null);
  const cueCountRef = useRef(0);

  const [phase, setPhase] = useState<Phase>("idle");
  const [board, setBoard] = useState<string[]>([]);
  const [marked, setMarked] = useState<boolean[]>(emptyMarked());
  const [line, setLine] = useState<readonly number[] | null>(null);
  const [lastCorrect, setLastCorrect] = useState<boolean | undefined>(
    undefined,
  );
  const [summary, setSummary] = useState<BingoSummary | null>(null);
  const [lastError, setLastError] = useState<string | null>(null);
  const [lastDifficulty, setLastDifficulty] = useState<WrsDifficulty | null>(
    null,
  );

  const running =
    phase === "playing" || phase === "choose" || phase === "feedback";
  const tapDisabled = phase !== "choose";

  const resetRun = useCallback(() => {
    abortRef.current = true;
    void stopWrsSpeech();
    boardRef.current = [];
    markedRef.current = emptyMarked();
    cueRef.current = null;
    cueCountRef.current = 0;
    setBoard([]);
    setMarked(emptyMarked());
    setLine(null);
    setLastCorrect(undefined);
    setSummary(null);
    setLastError(null);
    setPhase("idle");
  }, []);

  const leaveToA = useCallback(() => {
    abortRef.current = true;
    void stopWrsSpeech();
    onBack();
  }, [onBack]);

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

  useEffect(() => {
    if (phase === "idle" || phase === "summary") {
      const sub = BackHandler.addEventListener("hardwareBackPress", () => {
        leaveToA();
        return true;
      });
      return () => sub.remove();
    }
    const sub = BackHandler.addEventListener("hardwareBackPress", () => {
      confirmEndSession(resetRun);
      return true;
    });
    return () => sub.remove();
  }, [leaveToA, phase, resetRun]);

  const finishRun = useCallback((nextLine: readonly number[] | null) => {
    abortRef.current = true;
    void stopWrsSpeech();
    setLastError(null);
    setLine(nextLine);
    setSummary(
      summarizeBingo({
        cueCount: cueCountRef.current,
        marked: markedRef.current,
      }),
    );
    setPhase("summary");
  }, []);

  const playCue = useCallback(
    async (avoid: string | null) => {
      const nextCue = pickBingoCue(
        boardRef.current,
        markedRef.current,
        Math.random,
        avoid,
      );
      if (!nextCue) {
        finishRun(bingoLineCells(markedRef.current));
        return;
      }
      cueRef.current = nextCue;
      cueCountRef.current += 1;
      abortRef.current = false;
      setLastError(null);
      setLastCorrect(undefined);
      setPhase("playing");
      if (__DEV__) {
        console.log(`[WrsBingo] cue: ${nextCue}`);
      }
      try {
        await speakWrsWord(nextCue);
        if (abortRef.current) {
          return;
        }
        setPhase("choose");
      } catch {
        if (abortRef.current) {
          return;
        }
        setLastError("단어를 읽지 못했어요. 칸을 고르거나 다시 시작해 주세요.");
        setPhase("choose");
      }
    },
    [finishRun],
  );

  const onStart = useCallback(
    (difficulty: WrsDifficulty) => {
      abortRef.current = false;
      setLastDifficulty(difficulty);
      const nextBoard = createBingoBoard(difficulty);
      boardRef.current = nextBoard;
      markedRef.current = emptyMarked();
      cueRef.current = null;
      cueCountRef.current = 0;
      setBoard(nextBoard);
      setMarked(emptyMarked());
      setLine(null);
      setSummary(null);
      setLastCorrect(undefined);
      setLastError(null);
      void playCue(null);
    },
    [playCue],
  );

  const onTap = useCallback(
    (choice: string, index: number) => {
      if (phase !== "choose") {
        return;
      }
      if (markedRef.current[index]) {
        return;
      }
      const cue = cueRef.current;
      if (!cue) {
        return;
      }
      const correct = scoreBingoTap(cue, choice);
      setLastCorrect(correct);
      if (!correct) {
        if (cueCountRef.current >= BINGO_MAX_CUES) {
          finishRun(null);
          return;
        }
        setPhase("feedback");
        return;
      }
      setLastError(null);
      const nextMarked = markedRef.current.map((on, i) =>
        i === index ? true : on,
      );
      markedRef.current = nextMarked;
      setMarked(nextMarked);
      const nextLine = bingoLineCells(nextMarked);
      if (nextLine) {
        finishRun(nextLine);
        return;
      }
      if (cueCountRef.current >= BINGO_MAX_CUES) {
        finishRun(null);
        return;
      }
      setPhase("feedback");
    },
    [finishRun, phase],
  );

  const onNext = useCallback(() => {
    const nextLine = bingoLineCells(markedRef.current);
    if (nextLine || cueCountRef.current >= BINGO_MAX_CUES) {
      finishRun(nextLine);
      return;
    }
    const avoid = lastCorrect ? null : cueRef.current;
    void playCue(avoid);
  }, [finishRun, lastCorrect, playCue]);

  const onEndManual = useCallback(() => {
    finishRun(bingoLineCells(markedRef.current));
  }, [finishRun]);

  return (
    <ThemedView style={styles.fill}>
      <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
        <View style={styles.header}>
          <View style={styles.headerRow}>
            <ThemedText type="screenTitle">단어 빙고</ThemedText>
          </View>
          <ThemedText
            themeColor="textSecondary"
            type="small"
            style={styles.caption}
          >
            들은 단어를 판에서 눌러요 · 병원 검사가 아니에요
          </ThemedText>
        </View>

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
                3×3 판에 단어가 있어요. 들린 칸을 누르면 칠해집니다.
                가로·세로·대각 한 줄이면 끝나요. 맞히기 기록에는 안 남아요.
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
                {summary ? bingoResultCopy(summary) : "연습이 끝났어요"}
              </ThemedText>
            </View>
            {board.length === BINGO_CELL_COUNT ? (
              <BingoBoard
                board={board}
                marked={marked}
                line={line}
                disabled
                onPress={() => undefined}
              />
            ) : null}
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
              {promptCopy(phase, lastCorrect)}
            </ThemedText>
          </View>
        ) : null}

        {running && board.length === BINGO_CELL_COUNT ? (
          <BingoBoard
            board={board}
            marked={marked}
            line={line}
            disabled={tapDisabled}
            onPress={onTap}
          />
        ) : null}

        {lastError && running ? (
          <ThemedText
            themeColor="textSecondary"
            type="small"
            style={styles.caption}
          >
            {lastError}
          </ThemedText>
        ) : null}

        <View style={styles.actions}>
          {phase === "summary" && lastDifficulty ? (
            <View style={styles.actionRow}>
              <ActionButton
                label="다시 하기"
                accessibilityLabel="방금 난이도로 다시 하기"
                onPress={() => onStart(lastDifficulty)}
              />
            </View>
          ) : null}

          {phase === "idle" || phase === "summary" ? (
            <View style={styles.actionRow}>
              <ActionButton
                variant={phase === "idle" ? "primary" : "secondary"}
                label="비슷한 소리"
                accessibilityLabel="비슷한 소리 판"
                onPress={() => onStart("hard")}
              />
              <ActionButton label="쉬운 판" onPress={() => onStart("easy")} />
              <ActionButton label="뒤로 가기" onPress={leaveToA} />
            </View>
          ) : null}

          {phase === "feedback" ? (
            <View style={styles.actionRow}>
              <ActionButton variant="primary" label="다음" onPress={onNext} />
              <ActionButton
                label="끝내기"
                onPress={() => confirmEndSession(onEndManual)}
              />
            </View>
          ) : null}

          {phase === "playing" || phase === "choose" ? (
            <View style={styles.actionRow}>
              <ActionButton
                label="중지"
                onPress={() => confirmEndSession(onEndManual)}
              />
            </View>
          ) : null}
        </View>
      </SafeAreaView>
    </ThemedView>
  );
}

function emptyMarked(): boolean[] {
  return Array.from({ length: BINGO_CELL_COUNT }, () => false);
}

function promptCopy(
  phase: Phase,
  lastCorrect: boolean | undefined,
): string | null {
  if (phase === "playing") {
    return "듣는 중… 소리가 끝난 뒤 칸을 누르세요";
  }
  if (phase === "choose") {
    return "들은 단어를 누르세요";
  }
  if (phase !== "feedback") {
    return null;
  }
  if (lastCorrect) {
    return "맞았어요";
  }
  return "아쉬워요 · 그 칸이 아니에요";
}

function BingoBoard({
  board,
  marked,
  line,
  disabled,
  onPress,
}: Readonly<{
  board: readonly string[];
  marked: readonly boolean[];
  line: readonly number[] | null;
  disabled: boolean;
  onPress: (word: string, index: number) => void;
}>) {
  const theme = useTheme();
  const rows = [0, 1, 2];
  return (
    <View style={[styles.bingoBoard, { borderColor: theme.border }]}>
      {rows.map((row) => (
        <View key={row} style={styles.bingoRow}>
          {rows.map((col) => {
            const index = row * 3 + col;
            const word = board[index];
            if (!word) {
              return null;
            }
            return (
              <BingoCell
                key={word}
                word={word}
                row={row}
                col={col}
                marked={marked[index] === true}
                inLine={line?.includes(index) === true}
                disabled={disabled || marked[index] === true}
                onPress={() => onPress(word, index)}
              />
            );
          })}
        </View>
      ))}
    </View>
  );
}

function BingoCell({
  word,
  row,
  col,
  marked,
  inLine,
  disabled,
  onPress,
}: Readonly<{
  word: string;
  row: number;
  col: number;
  marked: boolean;
  inLine: boolean;
  disabled: boolean;
  onPress: () => void;
}>) {
  const theme = useTheme();
  let backgroundColor: string = theme.surface;
  let textColor: string = theme.text;
  if (inLine) {
    backgroundColor = theme.accent;
    textColor = theme.onAccent;
  } else if (marked) {
    backgroundColor = theme.accentTint;
  }

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={word}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.bingoCell,
        {
          backgroundColor,
          borderColor: theme.border,
        },
        col === 2 && styles.bingoCellLastCol,
        row === 2 && styles.bingoCellLastRow,
        pressed && !disabled && styles.pressed,
        disabled && !marked && !inLine && styles.disabled,
      ]}
    >
      <ThemedText
        type="heading"
        style={[styles.bingoWord, { color: textColor }]}
      >
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
    paddingBottom: BottomTabInset,
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
  promptArea: {
    alignItems: "center",
    gap: Spacing.two,
  },
  statusText: {
    textAlign: "center",
  },
  bingoBoard: {
    width: "90%",
    alignSelf: "center",
    borderWidth: 2,
  },
  bingoRow: {
    flexDirection: "row",
  },
  bingoCell: {
    flex: 1,
    aspectRatio: 1,
    minHeight: 58,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: Spacing.one,
  },
  bingoCellLastCol: {
    borderRightWidth: 0,
  },
  bingoCellLastRow: {
    borderBottomWidth: 0,
  },
  bingoWord: {
    fontSize: 24,
    lineHeight: 32,
  },
  actions: {
    gap: Spacing.two,
    marginTop: "auto",
    flexGrow: 0,
  },
  actionRow: {
    flexDirection: "row",
    gap: Spacing.two,
  },
  pressed: {
    opacity: 0.85,
  },
  disabled: {
    opacity: 0.55,
  },
});
