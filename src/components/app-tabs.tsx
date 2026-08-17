import { NativeTabs } from "expo-router/unstable-native-tabs";

import { Colors } from "@/constants/theme";

/**
 * 하단 2탭 — 왼쪽 링 6(말소리 구분 연습), 오른쪽 기존 음고·떨림 연습.
 * NativeTabs(unstable). 아이콘은 시스템 심볼(전용 PNG 없음).
 */
export default function AppTabs() {
  const colors = Colors.light;

  return (
    <NativeTabs
      backgroundColor={colors.surface}
      indicatorColor={colors.accentTint}
      tintColor={colors.accent}
      iconColor={{ default: colors.textMuted, selected: colors.accent }}
      labelStyle={{
        default: { color: colors.textMuted },
        selected: { color: colors.accent },
      }}
    >
      <NativeTabs.Trigger name="ling6">
        <NativeTabs.Trigger.Label>링 6</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="waveform" md="mic" />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Label>연습</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="slider.horizontal.3" md="tune" />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
