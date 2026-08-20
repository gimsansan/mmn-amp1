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
import { Icon, type IconName } from "@/components/ui/icon";
import {
  BottomTabInset,
  MaxContentWidth,
  Radius,
  Spacing,
} from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import { WrsBingoScreen } from "@/training/wrs/WrsBingoScreen";
import { WrsSessionScreen } from "@/training/wrs/WrsSessionScreen";
import { WrsTwoCharScreen } from "@/training/wrs/WrsTwoCharScreen";

type Track = "picker" | "one" | "two" | "bingo";

type TrainingTrack = "one" | "two" | "bingo";

const TRACK_FACE: Record<TrainingTrack, { icon: IconName; title: string }> = {
  one: { icon: "oneChar", title: "한 글자" },
  two: { icon: "twoChar", title: "두 글자" },
  bingo: { icon: "bingoLine", title: "단어 빙고" },
};

const TRACK_OPTIONS: readonly {
  track: TrainingTrack;
  description: string;
}[] = [
  {
    track: "one",
    description: "한 글자 단어를 듣고 보기에서 고르는 연습",
  },
  {
    track: "two",
    description: "두 글자 단어를 듣고 보기에서 고르는 연습",
  },
  {
    track: "bingo",
    description: "들은 단어를 판에서 눌러 줄을 만드는 연습",
  },
];

/**
 * 단어 듣기 탭 — 한 글자·두 글자·빙고 선택.
 * 카드에서 바로 시작(빙고는 난이도를 고르는 idle 유지).
 */
export function WrsTabScreen() {
  const theme = useTheme();
  const [track, setTrack] = useState<Track>("picker");
  const [autoStart, setAutoStart] = useState(false);

  const backToPicker = useCallback(() => {
    setTrack("picker");
    setAutoStart(false);
  }, []);

  const openTrack = useCallback((next: TrainingTrack) => {
    setAutoStart(next !== "bingo");
    setTrack(next);
  }, []);

  const consumeAutoStart = useCallback(() => {
    setAutoStart(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      if (track === "picker") {
        return;
      }
      const sub = BackHandler.addEventListener("hardwareBackPress", () => {
        backToPicker();
        return true;
      });
      return () => sub.remove();
    }, [track, backToPicker]),
  );

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
    return <WrsBingoScreen onBack={backToPicker} />;
  }

  return (
    <ThemedView style={styles.fill}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          style={styles.fill}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.top}>
            <View style={styles.headerRow}>
              <ThemedText type="screenTitle">단어 듣기</ThemedText>
            </View>
            <ThemedText
              themeColor="textSecondary"
              type="small"
              style={styles.caption}
            >
              들은 단어를 보기에서 고르는 연습 · 병원 검사가 아니에요
            </ThemedText>

            <View style={styles.list}>
              {TRACK_OPTIONS.map((option) => {
                const face = TRACK_FACE[option.track];
                return (
                  <Pressable
                    key={option.track}
                    accessibilityRole="button"
                    accessibilityLabel={`${face.title} — ${option.description}`}
                    onPress={() => openTrack(option.track)}
                    style={({ pressed }) => [
                      styles.cardPress,
                      pressed && styles.pressed,
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
                          name={face.icon}
                          size={22}
                          color={theme.accent}
                        />
                      </View>
                      <View style={styles.cardText}>
                        <ThemedText type="smallBold" style={styles.cardTitle}>
                          {face.title}
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
    paddingBottom: BottomTabInset + Spacing.three,
  },
  top: {
    gap: Spacing.two,
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
    fontSize: 12,
    lineHeight: 18,
  },
  pressed: {
    opacity: 0.7,
  },
});
