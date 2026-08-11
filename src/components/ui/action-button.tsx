import { Pressable, StyleSheet, View, type PressableProps } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Icon, type IconName } from '@/components/ui/icon';
import { Radius, Shadows, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type ActionButtonProps = Omit<PressableProps, 'style' | 'children'> & {
  label: string;
  /** `primary`는 파란 채움(화면당 하나), `secondary`는 흰 배경 + 테두리. */
  variant?: 'primary' | 'secondary';
  icon?: IconName;
  /** 행 안에서 균등 분할할지. 단독 버튼이면 false. */
  fill?: boolean;
};

/** 시안의 48px 액션 버튼. 화면 하단 행에서 나란히 쓴다. */
export function ActionButton({
  label,
  variant = 'secondary',
  icon,
  fill = true,
  disabled,
  ...rest
}: Readonly<ActionButtonProps>) {
  const theme = useTheme();
  const primary = variant === 'primary';
  const contentColor = primary ? theme.onAccent : theme.text;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: !!disabled }}
      disabled={disabled}
      style={({ pressed }) => [
        styles.button,
        fill && styles.fill,
        primary
          ? [{ backgroundColor: theme.accent }, Shadows.accent]
          : { backgroundColor: theme.surface, borderWidth: 1, borderColor: theme.border },
        disabled && styles.disabled,
        pressed && !disabled && styles.pressed,
      ]}
      {...rest}>
      <View style={styles.content}>
        {icon ? <Icon name={icon} size={16} color={contentColor} strokeWidth={2} /> : null}
        <ThemedText type="smallBold" style={{ color: contentColor }}>
          {label}
        </ThemedText>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 48,
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.four,
    borderRadius: Radius.medium,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fill: {
    flex: 1,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  pressed: {
    opacity: 0.7,
  },
  disabled: {
    opacity: 0.4,
  },
});
