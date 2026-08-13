import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Icon, type IconName } from '@/components/ui/icon';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

/** mono(12/16)·small(14/20) 기본 크기. textScale 배율의 기준. */
const MONO_BASE = { fontSize: 12, lineHeight: 16 };
const SMALL_BASE = { fontSize: 14, lineHeight: 20 };

type PillProps = {
  label: string;
  icon?: IconName;
  /** 수치가 섞인 문구는 모노스페이스로(진행 상황 배지 등). */
  mono?: boolean;
  /** 가로로 꽉 채울지(요약 화면의 저장 안내처럼). */
  stretch?: boolean;
  /** 라벨 글자 배율(기본 1). idle 안내 화면에서만 살짝 키우는 용도. */
  textScale?: number;
};

/** 시안의 알약 배지 — 옅은 파랑 배경 + 파란 글자. */
export function Pill({
  label,
  icon,
  mono = false,
  stretch = false,
  textScale = 1,
}: Readonly<PillProps>) {
  const theme = useTheme();
  const base = mono ? MONO_BASE : SMALL_BASE;
  const scaledLabel =
    textScale === 1
      ? null
      : {
          fontSize: base.fontSize * textScale,
          lineHeight: base.lineHeight * textScale,
        };

  return (
    <View
      style={[
        styles.pill,
        stretch ? styles.stretch : styles.hug,
        { backgroundColor: theme.accentTint },
      ]}>
      {icon ? <Icon name={icon} size={14} color={theme.accent} strokeWidth={2.2} /> : null}
      <ThemedText type={mono ? 'mono' : 'small'} style={[{ color: theme.accent }, scaledLabel]}>
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
