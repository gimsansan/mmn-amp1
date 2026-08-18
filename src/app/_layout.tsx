import { DefaultTheme, ThemeProvider } from "expo-router";
import * as SplashScreen from "expo-splash-screen";

import { AnimatedSplashOverlay } from "@/components/animated-icon";
import AppTabs from "@/components/app-tabs";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  return (
    // 라이트 고정 — 다크 모드 구현 안 함(use-theme.ts 참고).
    // 하단 4탭: 링 6 · PTA(음고) · 단어인지도 · 떨림. 통계는 각 탭 헤더에서 스와프.
    <ThemeProvider value={DefaultTheme}>
      <AnimatedSplashOverlay />
      <AppTabs />
    </ThemeProvider>
  );
}
