import Svg, { Circle, Path, Rect } from 'react-native-svg';

export type IconName =
  /** 앱 상징(귀·나선). */
  | 'logo'
  /** ② 다른 음 찾기 — 음높이 파형. */
  | 'wave'
  /** ① 떨림 찾기 — 흔들리는 포락선. */
  | 'ripple'
  /** 연습 기록 — 목록. */
  | 'list'
  /** 연습 통계 — 막대 그래프. */
  | 'chart'
  | 'check'
  | 'headphones'
  | 'speaker'
  | 'stop';

type IconProps = {
  name: IconName;
  size?: number;
  color: string;
  /** 시안은 얇은 선(1.8). 작게 쓸 때만 올린다. */
  strokeWidth?: number;
};

/**
 * 시안의 선 아이콘 세트. 24×24 그리드·라운드 캡으로 통일한다.
 * 새 아이콘은 여기에 이름을 추가해서 쓴다(화면에서 SVG를 직접 그리지 않음).
 */
export function Icon({ name, size = 24, color, strokeWidth = 1.8 }: Readonly<IconProps>) {
  const stroke = {
    stroke: color,
    strokeWidth,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
  } as const;

  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {name === 'logo' ? (
        <>
          <Path d="M3 12a9 9 0 0 1 9-9v9" {...stroke} />
          <Path d="M12 12a9 9 0 0 0 9 9" {...stroke} />
          <Circle cx="12" cy="12" r="2.5" {...stroke} />
        </>
      ) : null}

      {name === 'wave' ? <Path d="M4 14h3l2-8 3 16 3-11 2 5h3" {...stroke} /> : null}

      {name === 'ripple' ? (
        <Path d="M3 12c2-5 4-5 6 0s4 5 6 0 4-5 6 0" {...stroke} />
      ) : null}

      {name === 'list' ? <Path d="M4 5h16M4 12h16M4 19h10" {...stroke} /> : null}

      {name === 'chart' ? (
        <Path d="M4 20h16M7 20v-5M12 20v-9M17 20v-13" {...stroke} />
      ) : null}

      {name === 'check' ? <Path d="M20 6L9 17l-5-5" {...stroke} strokeWidth={strokeWidth + 0.4} /> : null}

      {name === 'headphones' ? (
        <>
          <Path d="M4 13v-1a8 8 0 0 1 16 0v1" {...stroke} />
          <Rect x="3" y="13" width="4" height="7" rx="1.5" {...stroke} />
          <Rect x="17" y="13" width="4" height="7" rx="1.5" {...stroke} />
        </>
      ) : null}

      {name === 'speaker' ? (
        <>
          <Path d="M4 9v6h4l5 4V5L8 9H4z" {...stroke} />
          <Path d="M17 8a5 5 0 0 1 0 8" {...stroke} />
        </>
      ) : null}

      {name === 'stop' ? (
        <Rect x="6" y="6" width="12" height="12" rx="2" {...stroke} strokeWidth={strokeWidth + 0.2} />
      ) : null}
    </Svg>
  );
}
