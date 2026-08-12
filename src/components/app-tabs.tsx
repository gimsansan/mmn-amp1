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
      {/* 2탭 축소: 홈·설정 제거. 앱 정보는 연습 하단, 기록 삭제는 통계 하단으로 이동. */}
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Label>연습</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          src={require('@/assets/images/tabIcons/explore.png')}
          renderingMode="template"
        />
      </NativeTabs.Trigger>

      {/* 통계는 전용 PNG 자산이 없어 시스템 심볼(Android Material · iOS SF)로 그린다. */}
      <NativeTabs.Trigger name="stats">
        <NativeTabs.Trigger.Label>통계</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="chart.bar" md="bar_chart" />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
