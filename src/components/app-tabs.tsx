import { NativeTabs } from "expo-router/unstable-native-tabs";

import { Colors } from "@/constants/theme";

/**
 * 하단 6탭 — 소리 구분 · PTA(음고) · 단어 듣기 · 떨림 · 문장 듣기 · 악기 소리.
 * NativeTabs(unstable). 아이콘은 시스템 심볼(전용 PNG 없음).
 *
 * `주의`: 여섯이 이 줄의 한계다. 더 늘리면 라벨이 줄바꿈되거나 잘린다 —
 * 새 종목을 또 붙일 때는 탭을 늘리지 말고 종목 묶음 화면을 먼저 생각할 것.
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
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Label>소리 구분</NativeTabs.Trigger.Label>
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

      <NativeTabs.Trigger name="am">
        <NativeTabs.Trigger.Label>떨림</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          sf="iphone.radiowaves.left.and.right"
          md="vibration"
        />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="sent">
        <NativeTabs.Trigger.Label>문장 듣기</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="text.quote" md="subtitles" />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="inst">
        <NativeTabs.Trigger.Label>악기 소리</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="pianokeys" md="piano" />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
