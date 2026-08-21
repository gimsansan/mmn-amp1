import { StyleSheet, View } from "react-native";

import { Radius } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";

/**
 * 훈련 진행 화면의 슬림 진행바. 폭 = 현재 전환 / 목표 전환.
 * 난이도·정오답과 색을 연동하지 않는다.
 */
export function SessionProgressBar({
  current,
  total,
}: Readonly<{
  current: number;
  total: number;
}>) {
  const theme = useTheme();
  const ratio = total <= 0 ? 0 : Math.min(1, Math.max(0, current / total));

  return (
    <View
      accessible
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: total, now: current }}
      style={[styles.track, { backgroundColor: theme.border }]}
    >
      <View
        style={[
          styles.fill,
          { width: `${ratio * 100}%`, backgroundColor: theme.accent },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    height: 5,
    borderRadius: Radius.pill,
    overflow: "hidden",
    alignSelf: "stretch",
  },
  fill: {
    height: "100%",
    borderRadius: Radius.pill,
  },
});
