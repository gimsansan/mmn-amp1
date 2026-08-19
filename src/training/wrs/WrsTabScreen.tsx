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
import { WrsSessionScreen } from "@/training/wrs/WrsSessionScreen";
import { WrsTwoCharScreen } from "@/training/wrs/WrsTwoCharScreen";

type Track = "picker" | "one" | "two";

type TrainingTrack = "one" | "two";

const TRACK_FACE: Record<TrainingTrack, { icon: IconName; title: string }> = {
  one: { icon: "oneChar", title: "한 글자" },
  two: { icon: "twoChar", title: "두 글자" },
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
];

/**
 * 단어 듣기 탭 — 한 글자·두 글자 선택.
 * 소리 높낮이처럼 탭 안에서 고른 뒤 그 연습으로 들어간다.
 */
export function WrsTabScreen() {
  const theme = useTheme();
  const [track, setTrack] = useState<Track>("picker");

  const backToPicker = useCallback(() => {
    setTrack("picker");
  }, []);

  const openTrack = useCallback((next: TrainingTrack) => {
    setTrack(next);
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
    return <WrsSessionScreen onBack={backToPicker} />;
  }

  if (track === "two") {
    return <WrsTwoCharScreen onBack={backToPicker} />;
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
