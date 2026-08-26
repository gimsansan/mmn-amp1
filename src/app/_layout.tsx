import { DefaultTheme, ThemeProvider } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";

import AppTabs from "@/components/app-tabs";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  /**
   * 네이티브 스플래시를 내린다.
   *
   * 전에는 Expo 로고 오버레이(`AnimatedSplashOverlay`)의 `onLayout`이 이걸 불렀다.
   * 오버레이를 걷어내면서(2026-08-22) 여기로 옮겼다 — **이 줄이 없으면
   * `preventAutoHideAsync`가 붙잡은 스플래시가 영영 안 내려가 첫 화면에서 멈춘다.**
   *
   * 첫 렌더 뒤에 부르므로 탭이 그려지기 전 빈 화면이 보이지 않는다.
   * 이미 내려간 뒤 다시 부르면 거부되므로(개발 중 새로고침) 삼킨다.
   */
  useEffect(() => {
    SplashScreen.hideAsync().catch(() => {});
  }, []);

  return (
    // 라이트 고정 — 다크 모드 구현 안 함(use-theme.ts 참고).
    // 하단 5탭: 소리 구분 · PTA(음고) · 단어 듣기 · 떨림 · 문장 듣기. 통계는 각 탭 헤더에서 스와프.
    <ThemeProvider value={DefaultTheme}>
      <AppTabs />
    </ThemeProvider>
  );
}
