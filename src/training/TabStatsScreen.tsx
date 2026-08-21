import { type ReactNode } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { ActionButton } from "@/components/ui/action-button";
import { MaxContentWidth, Spacing } from "@/constants/theme";

type TabStatsScreenProps = {
  title: string;
  onBack: () => void;
  empty: boolean;
  children?: ReactNode;
};

/**
 * 탭 통계 스와프 껍데기. `SessionHistoryScreen`과 같은 입구(헤더 차트 → 이 화면).
 * 연습 기록 화면이다.
 */
export function TabStatsScreen({
  title,
  onBack,
  empty,
  children,
}: Readonly<TabStatsScreenProps>) {
  return (
    <ThemedView style={styles.fill}>
      <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
        <View style={styles.header}>
          <ThemedText type="screenTitle">{title}</ThemedText>
          <ThemedText themeColor="textSecondary" type="caption" numberOfLines={1}>
            이 기기에만 저장돼요 · 연습 기록이에요
          </ThemedText>
        </View>

        {empty ? (
          <ThemedText themeColor="textMuted" type="small" style={styles.empty}>
            아직 기록된 연습이 없어요
          </ThemedText>
        ) : (
          <ScrollView
            style={styles.fill}
            contentContainerStyle={styles.body}
            showsVerticalScrollIndicator={false}
          >
            {children}
          </ScrollView>
        )}

        <View style={styles.actions}>
          <ActionButton
            fill={false}
            variant="primary"
            label="뒤로 가기"
            onPress={onBack}
          />
        </View>
      </SafeAreaView>
    </ThemedView>
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
    paddingBottom: Spacing.three,
    alignItems: "stretch",
    gap: Spacing.three,
  },
  header: {
    gap: Spacing.one,
  },
  empty: {
    textAlign: "center",
  },
  body: {
    gap: Spacing.three,
    paddingBottom: Spacing.two,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "center",
  },
});
