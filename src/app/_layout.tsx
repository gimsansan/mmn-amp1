import { DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';

import { AnimatedSplashOverlay } from '@/components/animated-icon';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  return (
    // 라이트 고정 — 다크 모드 구현 안 함(use-theme.ts 참고).
    // 탭 바 제거(2→1 단일면): 홈(연습 선택)이 유일한 화면, 통계는 홈 안에서 스와프.
    <ThemeProvider value={DefaultTheme}>
      <AnimatedSplashOverlay />
      <Stack screenOptions={{ headerShown: false }} />
    </ThemeProvider>
  );
}
