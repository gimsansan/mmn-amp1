import { Pressable, StyleSheet } from "react-native";

import { Icon } from "@/components/ui/icon";
import { Radius } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";

type BingoEntryButtonProps = {
  onPress: () => void;
};

/** 한 글자 헤더 우측 — 같은 연습에서 빙고로 스와프. */
export function BingoEntryButton({ onPress }: Readonly<BingoEntryButtonProps>) {
  const theme = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="단어 빙고"
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
      <Icon name="bingoLine" size={28} color={theme.accent} />
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
