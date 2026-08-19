import Svg, { Circle, Path, Rect } from 'react-native-svg';

import { Colors } from '@/constants/theme';

export type IconName =
  /** 앱 상징(귀·나선). */
  | 'logo'
  /** 높낮이 비교 — 높이가 다른 두 막대. */
  | 'bars'
  /** ② 다른 음 찾기 — 돋보기로 다른 하나를 찾기. */
  | 'findTone'
  /** ① 떨림 찾기 — 진동하는 소리. */
  | 'vibrate'
  /** 연습 기록 — 목록. */
  | 'list'
  /** 연습 통계 — 다색 채움 막대(예외: 단색 stroke 아님). */
  | 'chart'
  | 'check'
  | 'headphones'
  | 'speaker'
  | 'stop'
  /** 높낮이 비교 — 더 높아요 / 더 낮아요. */
  | 'arrowUp'
  | 'arrowDown'
  /** 단어 빙고 — 3×3 중 한 줄이 이어짐. */
  | 'bingoLine'
  /** 단어 듣기 — 한 글자. */
  | 'oneChar'
  /** 단어 듣기 — 두 글자. */
  | 'twoChar';

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

      {/*
        훈련 3종은 **아이콘만으로 구분되어야 한다**. 예전엔 높낮이·다른 음이 같은
        파형(wave)을 써서 제목을 읽어야 구분됐다. 그래서 각 과제의 성격을 그림에 담는다:
        높이 대비(bars) / 다른 하나 찾기(findTone) / 진동(vibrate).
        연습 선택 카드와 시작 화면이 같은 아이콘을 쓰므로 여기서 바꾸면 둘 다 따라온다.
      */}
      {name === 'bars' ? (
        <>
          {/* 낮은 쪽은 흐리게 — 두 소리의 '높이 차'가 그림의 주제. */}
          <Rect x="4" y="14" width="5" height="6" rx="1.4" fill={color} opacity={0.4} />
          <Rect x="15" y="7" width="5" height="13" rx="1.4" fill={color} />
        </>
      ) : null}

      {name === 'findTone' ? (
        <>
          <Circle cx="10" cy="10" r="6.4" {...stroke} />
          <Path d="M14.7 14.7L20 20" {...stroke} />
          {/* 렌즈 안 점 셋 — 가운데 하나만 크다(= 찾아야 할 다른 음). */}
          <Circle cx="7.7" cy="10" r="0.9" fill={color} opacity={0.5} />
          <Circle cx="10.6" cy="10" r="1.5" fill={color} />
          <Circle cx="13" cy="10" r="0.9" fill={color} opacity={0.5} />
        </>
      ) : null}

      {name === 'vibrate' ? (
        <>
          <Circle cx="12" cy="12" r="2" fill={color} />
          <Path d="M7.5 8.5a6 6 0 0 0 0 7" {...stroke} />
          <Path d="M16.5 8.5a6 6 0 0 1 0 7" {...stroke} />
        </>
      ) : null}

      {name === 'list' ? <Path d="M4 5h16M4 12h16M4 19h10" {...stroke} /> : null}

      {name === 'chart' ? (
        <>
          {/* 통계 진입점용 — 막대별 fill. color prop은 기준선에만 쓴다. */}
          <Path d="M4 20h16" {...stroke} />
          <Rect x="5.5" y="14" width="3" height="6" rx="0.8" fill={Colors.light.accent} />
          <Rect x="10.5" y="9" width="3" height="11" rx="0.8" fill={Colors.light.highlight} />
          <Rect x="15.5" y="5" width="3" height="15" rx="0.8" fill={Colors.light.positive} />
        </>
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

      {name === 'arrowUp' ? (
        <Path d="M12 5v14M12 5l-6 6M12 5l6 6" {...stroke} />
      ) : null}

      {name === 'arrowDown' ? (
        <Path d="M12 19V5M12 19l-6-6M12 19l6-6" {...stroke} />
      ) : null}

      {name === 'bingoLine' ? (
        <>
          <Rect x="3" y="3" width="5" height="5" rx="1" {...stroke} opacity={0.45} />
          <Rect x="9.5" y="3" width="5" height="5" rx="1" {...stroke} opacity={0.45} />
          <Rect x="16" y="3" width="5" height="5" rx="1" {...stroke} opacity={0.45} />
          <Rect x="3" y="9.5" width="5" height="5" rx="1" fill={color} />
          <Rect x="9.5" y="9.5" width="5" height="5" rx="1" fill={color} />
          <Rect x="16" y="9.5" width="5" height="5" rx="1" fill={color} />
          <Rect x="3" y="16" width="5" height="5" rx="1" {...stroke} opacity={0.45} />
          <Rect x="9.5" y="16" width="5" height="5" rx="1" {...stroke} opacity={0.45} />
          <Rect x="16" y="16" width="5" height="5" rx="1" {...stroke} opacity={0.45} />
        </>
      ) : null}

      {name === 'oneChar' ? (
        <Rect x="7" y="5" width="10" height="14" rx="2" {...stroke} />
      ) : null}

      {name === 'twoChar' ? (
        <>
          <Rect x="3" y="5" width="8" height="14" rx="2" {...stroke} />
          <Rect x="13" y="5" width="8" height="14" rx="2" {...stroke} />
        </>
      ) : null}
    </Svg>
  );
}
