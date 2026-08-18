import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { BackHandler, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { StatsEntryButton } from "@/components/ui/stats-entry-button";
import { BottomTabInset, MaxContentWidth, Spacing } from "@/constants/theme";
import { SessionHistoryScreen } from "@/training/SessionHistoryScreen";

/** 단어인지도 탭 자리. 세션·자극은 아직 없음. */
export function WrsSessionScreen() {
  const [showStats, setShowStats] = useState(false);

  const closeStats = useCallback(() => {
    setShowStats(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      if (!showStats) {
        return;
      }
      const sub = BackHandler.addEventListener("hardwareBackPress", () => {
        closeStats();
        return true;
      });
      return () => sub.remove();
    }, [showStats, closeStats]),
  );

  if (showStats) {
    return <SessionHistoryScreen onBack={closeStats} />;
  }

  return (
    <ThemedView style={styles.fill}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.headerRow}>
          <ThemedText type="screenTitle">단어인지도</ThemedText>
          <StatsEntryButton onPress={() => setShowStats(true)} />
        </View>
        <ThemedText themeColor="textSecondary" type="small">
          연습 화면은 다음에 이어서 넣을게요
        </ThemedText>
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
    paddingTop: Spacing.four,
    paddingBottom: BottomTabInset + Spacing.three,
    gap: Spacing.two,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
});
