import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
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
import { Card } from "@/components/ui/card";
import { ScreenHeader } from "@/components/ui/screen-header";
import { ListeningCheckEntryButton } from "@/components/ui/listening-check-entry-button";
import { StatsEntryButton } from "@/components/ui/stats-entry-button";
import { Icon, type IconName } from "@/components/ui/icon";
import {
  MaxContentWidth,
  Radius,
  Spacing,
} from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import { ListeningCheckScreen } from "@/training/ListeningCheckScreen";
import { StatsScreen } from "@/training/StatsScreen";
import { WrsBingoScreen } from "@/training/wrs/WrsBingoScreen";
import type { WrsDifficulty } from "@/training/wrs/wrsDistractors";
import { hasKoreanVoice } from "@/training/wrs/wrsTts";
import { WrsSessionScreen } from "@/training/wrs/WrsSessionScreen";
import { WrsTwoCharScreen } from "@/training/wrs/WrsTwoCharScreen";
import { WrsVoiceGuideScreen } from "@/training/wrs/WrsVoiceGuideScreen";

type Track = "picker" | "one" | "two" | "bingo" | "voiceGuide";

type TrainingTrack = "one" | "two" | "bingo";

type TrackOption = {
  track: TrainingTrack;
  difficulty?: WrsDifficulty;
  icon: IconName;
  title: string;
  description: string;
};

const TRACK_OPTIONS: readonly TrackOption[] = [
  {
    track: "one",
    icon: "oneChar",
    title: "한 글자",
    description: "한 글자 단어를 듣고 보기에서 고르는 연습",
  },
  {
    track: "two",
    icon: "twoChar",
    title: "두 글자",
    description: "두 글자 단어를 듣고 보기에서 고르는 연습",
  },
  {
    track: "bingo",
    difficulty: "easy",
    icon: "bingoLine",
    title: "빙고 · 쉬운 판",
    description: "소리가 많이 다른 단어로 줄을 만드는 연습",
  },
  {
    track: "bingo",
    difficulty: "hard",
    icon: "bingoLine",
    title: "빙고 · 비슷한 소리",
    description: "소리가 비슷한 단어로 줄을 만드는 연습",
  },
];

/**
 * 단어 듣기 탭 — 한 글자·두 글자·빙고(쉬운 판/비슷한 소리) 선택.
 * 듣기 준비·통계는 헤더 아이콘으로 화면을 갈아끼움(소리 높낮이 목록과 같음).
 */
export function WrsTabScreen() {
  const theme = useTheme();
  const [track, setTrack] = useState<Track>("picker");
  const [autoStart, setAutoStart] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [showCheck, setShowCheck] = useState(false);
  const [bingoDifficulty, setBingoDifficulty] =
    useState<WrsDifficulty>("easy");

  const [pendingTrack, setPendingTrack] = useState<TrainingTrack | null>(null);
  const [pendingDifficulty, setPendingDifficulty] =
    useState<WrsDifficulty | null>(null);
  const [checking, setChecking] = useState(false);

  const closeStats = useCallback(() => {
    setShowStats(false);
  }, []);

  const closeCheck = useCallback(() => {
    setShowCheck(false);
  }, []);

  const backToPicker = useCallback(() => {
    setTrack("picker");
    setAutoStart(false);
    setPendingTrack(null);
    setPendingDifficulty(null);
    setShowStats(false);
    setShowCheck(false);
  }, []);

  /**
   * 세 연습 모두 한국어 TTS로 단어를 읽어 준다. 음성이 없으면 무음으로 진행돼
   * 찍기가 되므로, 시작 전에 확인하고 없으면 안내 화면으로 보낸다.
   */
  const openTrack = useCallback(
    (next: TrainingTrack, difficulty?: WrsDifficulty) => {
      const nextDifficulty =
        next === "bingo" ? (difficulty ?? "easy") : null;
      setChecking(true);
      void hasKoreanVoice()
        .then((ok) => {
          if (ok) {
            setPendingTrack(null);
            setPendingDifficulty(null);
            if (nextDifficulty) {
              setBingoDifficulty(nextDifficulty);
            }
            setAutoStart(true);
            setTrack(next);
            return;
          }
          setPendingTrack(next);
          setPendingDifficulty(nextDifficulty);
          setTrack("voiceGuide");
        })
        .finally(() => {
          setChecking(false);
        });
    },
    [],
  );

  const retryVoice = useCallback(() => {
    if (pendingTrack) {
      openTrack(pendingTrack, pendingDifficulty ?? undefined);
    }
  }, [openTrack, pendingTrack, pendingDifficulty]);

  const consumeAutoStart = useCallback(() => {
    setAutoStart(false);
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
      if (track === "picker") {
        return;
      }
      const sub = BackHandler.addEventListener("hardwareBackPress", () => {
        backToPicker();
        return true;
      });
      return () => sub.remove();
    }, [track, showStats, showCheck, backToPicker, closeStats, closeCheck]),
  );

  if (showStats) {
    return <StatsScreen initialKind="wrs1" onBack={closeStats} />;
  }

  if (showCheck) {
    return (
      <ListeningCheckScreen trackIcon="headphones" onBack={closeCheck} />
    );
  }

  if (track === "one") {
    return (
      <WrsSessionScreen
        onBack={backToPicker}
        autoStart={autoStart}
        onAutoStartConsumed={consumeAutoStart}
      />
    );
  }

  if (track === "two") {
    return (
      <WrsTwoCharScreen
        onBack={backToPicker}
        autoStart={autoStart}
        onAutoStartConsumed={consumeAutoStart}
      />
    );
  }

  if (track === "bingo") {
    return (
      <WrsBingoScreen
        onBack={backToPicker}
        autoStart={autoStart}
        onAutoStartConsumed={consumeAutoStart}
        initialDifficulty={bingoDifficulty}
      />
    );
  }

  if (track === "voiceGuide") {
    return (
      <WrsVoiceGuideScreen
        onRetry={retryVoice}
        onBack={backToPicker}
        checking={checking}
      />
    );
  }

  return (
    <ThemedView style={styles.fill}>
      <SafeAreaView edges={["top", "left", "right"]} style={styles.safeArea}>
        <ScrollView
          style={styles.fill}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.top}>
            <ScreenHeader
              title="단어 듣기"
              caption="들은 단어를 보기에서 고르는 연습 · 병원 검사가 아니에요"
              action={
                <View style={styles.headerActions}>
                  <ListeningCheckEntryButton
                    onPress={() => setShowCheck(true)}
                  />
                  <StatsEntryButton onPress={() => setShowStats(true)} />
                </View>
              }
            />

            <View style={styles.list}>
              {TRACK_OPTIONS.map((option) => {
                const optionKey = option.difficulty
                  ? `${option.track}-${option.difficulty}`
                  : option.track;
                return (
                  <Pressable
                    key={optionKey}
                    accessibilityRole="button"
                    accessibilityLabel={`${option.title} — ${option.description}`}
                    accessibilityState={{ disabled: checking }}
                    disabled={checking}
                    onPress={() =>
                      openTrack(option.track, option.difficulty)
                    }
                    style={({ pressed }) => [
                      styles.cardPress,
                      pressed && !checking && styles.pressed,
                    ]}
                  >
                    <Card style={styles.card}>
                      <View
                        style={[
                          styles.cardIcon,
                          { backgroundColor: theme.accentTint },
                        ]}
                      >
                        <Icon
                          name={option.icon}
                          size={22}
                          color={theme.accent}
                        />
                      </View>
                      <View style={styles.cardText}>
                        <ThemedText type="smallBold" style={styles.cardTitle}>
                          {option.title}
                        </ThemedText>
                        <ThemedText
                          themeColor="textSecondary"
                          type="small"
                          style={styles.cardCaption}
                        >
                          {option.description}
                        </ThemedText>
                      </View>
                    </Card>
                  </Pressable>
                );
              })}
            </View>
          </View>
        </ScrollView>
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
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.four,
    paddingBottom: Spacing.three,
  },
  top: {
    gap: Spacing.two,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
  },
  list: {
    marginTop: Spacing.three,
    gap: Spacing.three - 2,
  },
  cardPress: {
    borderRadius: Radius.large - 2,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.three - 2,
    paddingVertical: Spacing.three + 2,
  },
  cardIcon: {
    width: 44,
    height: 44,
    borderRadius: Radius.small + 1,
    flexShrink: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  cardText: {
    flexShrink: 1,
    gap: Spacing.half,
  },
  cardTitle: {
    fontSize: 15,
    lineHeight: 22,
  },
  cardCaption: {
    fontSize: 14,
    lineHeight: 20,
  },
  pressed: {
    opacity: 0.7,
  },
});
