/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import '@/global.css';

import { Platform } from 'react-native';

/**
 * 「Clean Clinical」 팔레트 — 화이트·블루 기반의 정밀 의료기기 톤.
 * 여백을 넓게 두고 수치는 모노스페이스로 계기판처럼 읽히게 한다.
 *
 * **라이트 전용이다.** 원본 시안에 다크가 없었고, 다크는 구현하지 않기로 결정했다
 * (2026-08-11). OS가 다크 모드여도 이 값으로 그린다 — `use-theme.ts` 참고.
 * 다시 하게 되면 여기에 `dark`를 더하고 `useTheme`에서 갈라주면 된다.
 */
export const Colors = {
  light: {
    text: '#10233A',
    background: '#F6F9FD',
    /** 카드·버튼 면. 레거시 호출부와 이름을 맞추려고 유지(= surface). */
    backgroundElement: '#FFFFFF',
    backgroundSelected: '#EAF2FE',
    textSecondary: '#6B7A8A',
    /** 카드 면. */
    surface: '#FFFFFF',
    border: '#E4EBF3',
    /** 카드 안쪽 구분선(테두리보다 더 옅음). */
    borderSubtle: '#EEF3F8',
    /** 라벨·타임스탬프 등 3차 텍스트. */
    textMuted: '#8A9BAD',
    accent: '#1668E3',
    accentTint: '#EAF2FE',
    accentBorder: '#CFE0F7',
    onAccent: '#FFFFFF',
    /** 추이 그래프 최근 점 강조(따뜻한 대비색). 점수·역치 색 아님. */
    highlight: '#F5833F',
    /** 통계 아이콘 막대 등 긍정 표시. */
    positive: '#1F9D6B',
    /** 파괴적 행동 글자(전체 삭제 등). 흰 면 유지, 채도 낮은 빨강. */
    danger: '#9B3B3B',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light;

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

/** 시안의 모서리 반경. Spacing과 축이 달라 따로 둔다. */
export const Radius = {
  /** 아이콘 타일·작은 버튼 */
  small: 12,
  /** 액션 버튼 */
  medium: 14,
  /** 리스트 카드·선택지 타일 */
  large: 20,
  /** 아이콘 타일(큰 것) */
  tile: 24,
  /** 알약(배지) */
  pill: 999,
} as const;

/**
 * 시안의 그림자. iOS는 shadow*, 안드로이드는 elevation으로 근사한다.
 * `추정`: 안드로이드 elevation은 blur/offset을 그대로 재현하지 못해 눈대중으로 맞춘 값.
 */
export const Shadows = {
  card: {
    shadowColor: '#10233A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 18,
    elevation: 2,
  },
  /** 파란 주 버튼 — 색이 있는 그림자. */
  accent: {
    shadowColor: '#1668E3',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 4,
  },
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
