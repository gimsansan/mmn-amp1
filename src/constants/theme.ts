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
    text: '#1B2B3D',
    background: '#F7F9FB',
    /** 카드·버튼 면. 레거시 호출부와 이름을 맞추려고 유지(= surface). */
    backgroundElement: '#FFFFFF',
    /** 선택 강조 면(= accentTint). 이 면 위 글자색 규칙은 accentTint 주석을 볼 것. */
    backgroundSelected: '#EAF1F9',
    /** 2차 본문. 흰 카드 4.76:1 · 배경 4.51:1 — WCAG AA. */
    textSecondary: '#64748B',
    /** 카드 면. */
    surface: '#FFFFFF',
    border: '#E6EBF0',
    /** 카드 안쪽 구분선(테두리보다 더 옅음). */
    borderSubtle: '#F0F4F8',
    /**
     * 라벨·타임스탬프 등 3차 텍스트.
     * 흰 카드 5.02:1 · 배경 4.76:1 — WCAG AA.
     * 여기 쓰이는 문구에 「청력 검사·진단 결과가 아니에요」 고지가 들어간다 — 흐리게 두지 말 것.
     */
    textMuted: '#5E7186',
    accent: '#2C6BB8',
    /**
     * 옅은 파란 면 — 아이콘 타일 · 선택된 세그먼트 · 탭 인디케이터.
     *
     * **이 면 위에 얹을 수 있는 글자색은 `accent`(4.73:1)와 `text`(12.64:1)뿐이다.**
     * 흰 카드에서 AA를 통과하던 나머지는 여기서 미달한다 —
     * `textMuted` 4.41 · `textSecondary` 4.18 · `positive` 4.01.
     * 흰 면 기준으로 고른 글자색을 이 면으로 그대로 옮기면 깨진다. 면을 바꾸면 글자색도 바꿀 것.
     */
    accentTint: '#EAF1F9',
    accentBorder: '#CDDDF0',
    onAccent: '#FFFFFF',
    /**
     * 추이 그래프 최근 점 강조(따뜻한 대비색). 점수·역치 색 아님.
     * 흰 면 3.24:1 · 배경 3.07:1 — 비텍스트 요소 기준(3:1)을 두 면 모두에서 맞춘 값.
     * **글자색으로 쓰지 말 것** (본문 4.5:1을 맞추려면 벽돌색이 되어 「따뜻한 대비색」이라는
     * 의도가 죽는다).
     */
    highlight: '#DA7333',
    /**
     * 그래프·막대에서 **강조 대상이 아닌** 표시(링 6 아쉬움 막대). 비텍스트 전용.
     * 트랙(`borderSubtle`) 대비 2.23:1 — 막대 높이를 서로 견줄 수 있는 최소선이다.
     * `highlight`(트랙 대비 2.93:1)보다는 낮게 두어 주황이 계속 먼저 눈에 들어오게 한다.
     */
    chartMuted: '#94A7BB',
    /** 통계 아이콘 막대 등 긍정 표시. 흰 면 4.56:1 — 14px 굵은 글자색으로도 쓰인다. */
    positive: '#1A865B',
    /** 파괴적 행동 글자(전체 삭제 등). 흰 면 6.81:1, 채도 낮은 빨강. */
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
    shadowColor: '#1B2B3D',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.05,
    shadowRadius: 16,
    elevation: 1,
  },
  /** 파란 주 버튼 — 색이 있는 그림자. */
  accent: {
    shadowColor: '#2C6BB8',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 14,
    elevation: 3,
  },
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
/**
 * 본문 한 줄의 최대 폭(dp). 이 앱은 세로 고정 폰용이지만 태블릿에 깔릴 수 있다.
 *
 * 폰은 320~411dp라 **이 값이 폰에서는 아무 일도 하지 않는다.** 태블릿에서만 걸린다.
 * 실기기 901dp에서 확인: 800이면 보기 칸이 384dp까지 늘어나 한 글자에 과하게 넓고
 * 가운데가 크게 빈다. 560이면 248dp로 폰 비율에 가까워지고 화면 가운데 정렬된다.
 * 480도 봤지만, 고령 사용자에게는 터치 영역이 큰 쪽이 유리해 560으로 뒀다.
 *
 * `주의`: 폭에 따라 열 수를 바꾸는 식의 분기는 넣지 않는다 — 이 앱이 여러 화면
 * 크기에서 튼튼한 이유가 「분기 없이 흐르는 레이아웃」이다.
 */
export const MaxContentWidth = 560;
