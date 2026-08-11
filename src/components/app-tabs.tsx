import { NativeTabs } from 'expo-router/unstable-native-tabs';

import { Colors } from '@/constants/theme';

export default function AppTabs() {
  // 라이트 고정 — use-theme.ts와 동일 방침(다크 모드 구현 안 함).
  const colors = Colors.light;

  return (
    // 시안의 탭 바 — 흰 면 위에 선택된 탭만 시그널 블루.
    <NativeTabs
      backgroundColor={colors.surface}
      indicatorColor={colors.accentTint}
      labelStyle={{ color: colors.textMuted, selected: { color: colors.accent } }}>
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Label>홈</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          src={require('@/assets/images/tabIcons/home.png')}
          renderingMode="template"
        />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="explore">
        <NativeTabs.Trigger.Label>연습</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          src={require('@/assets/images/tabIcons/explore.png')}
          renderingMode="template"
        />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
