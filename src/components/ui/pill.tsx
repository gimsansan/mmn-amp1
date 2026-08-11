import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Icon, type IconName } from '@/components/ui/icon';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type PillProps = {
  label: string;
  icon?: IconName;
  /** 수치가 섞인 문구는 모노스페이스로(진행 상황 배지 등). */
  mono?: boolean;
  /** 가로로 꽉 채울지(요약 화면의 저장 안내처럼). */
  stretch?: boolean;
};

/** 시안의 알약 배지 — 옅은 파랑 배경 + 파란 글자. */
export function Pill({ label, icon, mono = false, stretch = false }: Readonly<PillProps>) {
  const theme = useTheme();

  return (
    <View
      style={[
        styles.pill,
        stretch ? styles.stretch : styles.hug,
        { backgroundColor: theme.accentTint },
      ]}>
      {icon ? <Icon name={icon} size={14} color={theme.accent} strokeWidth={2.2} /> : null}
      <ThemedText type={mono ? 'mono' : 'small'} style={{ color: theme.accent }}>
        {label}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two - 2,
    paddingVertical: Spacing.two - 2,
    paddingHorizontal: Spacing.three - 2,
    borderRadius: Radius.pill,
  },
  hug: {
    alignSelf: 'center',
  },
  stretch: {
    alignSelf: 'stretch',
  },
});
