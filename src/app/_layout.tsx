import { DefaultTheme, ThemeProvider } from "expo-router";
import * as SplashScreen from "expo-splash-screen";

import { AnimatedSplashOverlay } from "@/components/animated-icon";
import AppTabs from "@/components/app-tabs";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  return (
    // 라이트 고정 — 다크 모드 구현 안 함(use-theme.ts 참고).
    // 하단 2탭: 좌 링 6 · 우 연습(음고·떨림). 통계는 연습 탭 안에서 스와프.
    <ThemeProvider value={DefaultTheme}>
      <AnimatedSplashOverlay />
      <AppTabs />
    </ThemeProvider>
  );
}
