import { Pressable, StyleSheet } from "react-native";

import { Icon } from "@/components/ui/icon";
import { Radius } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";

type StatsEntryButtonProps = {
  onPress: () => void;
};

/** 헤더 우측 — 측정 통계 화면 진입. 탭마다 같은 그림. */
export function StatsEntryButton({ onPress }: Readonly<StatsEntryButtonProps>) {
  const theme = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="연습 통계 보기"
      onPress={onPress}
      hitSlop={8}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: theme.accentTint,
          borderColor: theme.accentBorder,
        },
        pressed && styles.pressed,
      ]}
    >
      <Icon name="chart" size={28} color={theme.accent} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 60,
    height: 40,
    borderRadius: Radius.small + 1,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  pressed: {
    opacity: 0.7,
  },
});
