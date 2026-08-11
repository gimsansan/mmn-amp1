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

      {/* 통계·설정은 전용 PNG 자산이 없어 시스템 심볼(Android Material · iOS SF)로 그린다. */}
      <NativeTabs.Trigger name="stats">
        <NativeTabs.Trigger.Label>통계</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="chart.bar" md="bar_chart" />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="settings">
        <NativeTabs.Trigger.Label>설정</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="gearshape" md="settings" />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
