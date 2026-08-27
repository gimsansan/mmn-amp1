import { Pressable, StyleSheet } from "react-native";

import { Icon } from "@/components/ui/icon";
import { Radius } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";

type ListeningCheckEntryButtonProps = {
  onPress: () => void;
};

/** 헤더 우측 — 소리 점검(재생 확인). 통계 버튼과 같은 크기. */
export function ListeningCheckEntryButton({
  onPress,
}: Readonly<ListeningCheckEntryButtonProps>) {
  const theme = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="소리 점검"
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
      <Icon name="headphones" size={28} color={theme.accent} />
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
