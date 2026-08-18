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

import { DEFAULT_REFERENCE_HZ } from "@/audio/pureTone";
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
import { FreqSessionScreen } from "@/training/FreqSessionScreen";
import { ListeningCheckScreen } from "@/training/ListeningCheckScreen";
import { PitchCompareScreen } from "@/training/pitch2afc/PitchCompareScreen";

type Track = "picker" | "pitch2" | "freq";

type TrainingTrack = "pitch2" | "freq";

const TRACK_FACE: Record<TrainingTrack, { icon: IconName; title: string }> = {
  pitch2: { icon: "bars", title: "높낮이 비교" },
  freq: { icon: "findTone", title: "다른 음 찾기" },
};

const TRACK_OPTIONS: readonly {
  track: TrainingTrack;
  description: string;
}[] = [
  {
    track: "pitch2",
    description: "두 소리 중 어느 쪽이 높은지 맞히는 연습",
  },
  {
    track: "freq",
    description: "조금 다른 음높이를 찾는 연습",
  },
];

/**
 * 소리 높낮이 탭 — 음고 2종 선택 → 듣기 준비 → 훈련.
 * 통계는 연습 탭에 둔다.
 */
export function PtaSessionScreen() {
  const theme = useTheme();
  const [track, setTrack] = useState<Track>("picker");
  const [checked, setChecked] = useState(false);

  const backToPicker = useCallback(() => {
    setTrack("picker");
    setChecked(false);
  }, []);

  const openTrack = useCallback((next: TrainingTrack) => {
    setChecked(false);
    setTrack(next);
  }, []);

  const passCheck = useCallback(() => {
    setChecked(true);
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

  if ((track === "pitch2" || track === "freq") && !checked) {
    const face = TRACK_FACE[track];
    return (
      <ListeningCheckScreen
        trackTitle={face.title}
        trackIcon={face.icon}
        sampleHz={DEFAULT_REFERENCE_HZ}
        onStart={passCheck}
        onBack={backToPicker}
      />
    );
  }

  if (track === "pitch2") {
    return <PitchCompareScreen onBack={backToPicker} />;
  }

  if (track === "freq") {
    return <FreqSessionScreen onBack={backToPicker} />;
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
            <ThemedText type="screenTitle">소리 높낮이</ThemedText>
            <ThemedText
              themeColor="textSecondary"
              type="small"
              style={styles.caption}
            >
              웰니스·훈련 · 병원 검사·진단을 대신하지 않아요
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
