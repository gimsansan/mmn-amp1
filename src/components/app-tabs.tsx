import { NativeTabs } from "expo-router/unstable-native-tabs";

import { Colors } from "@/constants/theme";

/**
 * 하단 4탭 — 링 6 · PTA(음고) · 단어 듣기 · 떨림.
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

      <NativeTabs.Trigger name="pta">
        <NativeTabs.Trigger.Label>소리 높낮이</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="ear" md="hearing" />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="wrs">
        <NativeTabs.Trigger.Label>단어 듣기</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="text.bubble" md="chat" />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Label>떨림</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          sf="iphone.radiowaves.left.and.right"
          md="vibration"
        />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
