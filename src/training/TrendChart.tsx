import { useId, useState } from 'react';
import { StyleSheet, View, type LayoutChangeEvent } from 'react-native';
import Svg, {
  Circle,
  Defs,
  G,
  Line,
  LinearGradient,
  Path,
  Stop,
  Text as SvgText,
} from 'react-native-svg';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

/** 추이 한 점 — 대표값(작을수록 잘함)과 저장 시각. */
export type TrendPoint = {
  /** cent(음 높이 차이) 또는 dB(떨림 정도). 대표값 없는 세션은 호출부에서 제외. */
  value: number;
  savedAt: string;
};

const CHART_HEIGHT = 132;
const PAD_TOP = 12;
const PAD_BOTTOM = 12;
const PAD_X = 8;
/** 중간 점. 선 색으로 채움. */
const DOT_R = 3;
/** 마지막 점만 크게. 흰 면 + 주황 테두리. */
const LAST_DOT_R = 5;
const LAST_STROKE = 3;
/** 이하면 회차마다 점. 초과면 첫·끝만. 선·면적은 전부. 세 차트 동일. */
const MAX_ALL_DOTS = 12;

export type TrendChartProps = {
  /** 시간순(오래→최근). 최소 2점. */
  points: readonly TrendPoint[];
  /** 출발선. 세션 점이 아님. 있으면 y범위에만 넣고 점선으로 그림. */
  referenceValue?: number;
  /** 점선 옆 짧은 라벨. 예: 시작 200 */
  referenceLabel?: string;
};

/**
 * 경량 추이 라인 그래프. **Skia 미사용**(react-native-svg).
 *
 * **방향(2026-08-12 목업 채택)**: 값이 클수록 위, 작을수록 아래.
 * 대표값은 작을수록 더 세밀한 연습이라, 숫자가 작아지면 선이 **내려간다**.
 * (이전 「위=잘함」 반전은 폐기 — 사용자 목업이 더 직관적이라 판단.)
 * 여기 값은 **점수·진단 역치가 아니다**(웰니스 방침).
 */
export function TrendChart({
  points,
  referenceValue,
  referenceLabel,
}: Readonly<TrendChartProps>) {
  const theme = useTheme();
  const [width, setWidth] = useState(0);
  // 한 화면에 그래프가 여러 개라 그라데이션 id가 겹치지 않게 고유값을 쓴다.
  const gradientId = useId();

  const onLayout = (e: LayoutChangeEvent) => {
    setWidth(e.nativeEvent.layout.width);
  };

  const values = points.map((p) => p.value);
  if (referenceValue != null && Number.isFinite(referenceValue)) {
    values.push(referenceValue);
  }
  const min = Math.min(...values);
  const max = Math.max(...values);
  // 모든 값이 같으면 폭이 0 → 나눗셈 보호. 이때 선은 가운데 수평선이 된다.
  const span = max - min || 1;

  const plotW = Math.max(0, width - PAD_X * 2);
  const plotH = CHART_HEIGHT - PAD_TOP - PAD_BOTTOM;
  const baseY = CHART_HEIGHT - PAD_BOTTOM;

  const xy = points.map((p, i) => {
    const x =
      PAD_X + (points.length === 1 ? plotW / 2 : (plotW * i) / (points.length - 1));
    // 값이 클수록 위(작은 y). 좋아질수록(값↓) 아래로 내려간다.
    const y = PAD_TOP + ((max - p.value) / span) * plotH;
    return { x, y };
  });

  const linePath = xy
    .map((pt, i) => `${i === 0 ? 'M' : 'L'} ${pt.x.toFixed(1)} ${pt.y.toFixed(1)}`)
    .join(' ');

  // 선 아래를 채우는 면(그라데이션). 마지막 점 → 바닥 → 첫 점 바닥으로 닫는다.
  const lastX = xy.at(-1)?.x;
  const firstX = xy.at(0)?.x;
  const areaPath =
    lastX != null && firstX != null
      ? `${linePath} L ${lastX.toFixed(1)} ${baseY} L ${firstX.toFixed(1)} ${baseY} Z`
      : '';

  const ref = referenceValue;
  const showReference = ref != null && Number.isFinite(ref) && width > 0;
  const refY = showReference
    ? PAD_TOP + ((max - ref) / span) * plotH
    : 0;

  return (
    <View style={styles.wrap}>
      <View style={styles.chartArea} onLayout={onLayout}>
        {width > 0 ? (
          <Svg width={width} height={CHART_HEIGHT}>
            <Defs>
              <LinearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0" stopColor={theme.accent} stopOpacity={0.35} />
                <Stop offset="1" stopColor={theme.accent} stopOpacity={0} />
              </LinearGradient>
            </Defs>

            <Path d={areaPath} fill={`url(#${gradientId})`} />
            {showReference ? (
              <G>
                <Line
                  x1={PAD_X}
                  y1={refY}
                  x2={width - PAD_X}
                  y2={refY}
                  stroke={theme.textMuted}
                  strokeWidth={1}
                  strokeDasharray="4 4"
                />
                {referenceLabel ? (
                  <SvgText
                    x={PAD_X}
                    y={refY - 4}
                    fontSize={9}
                    fill={theme.textMuted}
                  >
                    {referenceLabel}
                  </SvgText>
                ) : null}
              </G>
            ) : null}
            <Path
              d={linePath}
              stroke={theme.accent}
              strokeWidth={2.5}
              fill="none"
              strokeLinejoin="round"
              strokeLinecap="round"
            />
            {xy.map((pt, i) => {
              const isLast = i === xy.length - 1;
              const showDot =
                xy.length <= MAX_ALL_DOTS || i === 0 || isLast;
              if (!showDot) {
                return null;
              }
              return (
                <Circle
                  key={`${points[i].savedAt}-${i}`}
                  cx={pt.x}
                  cy={pt.y}
                  r={isLast ? LAST_DOT_R : DOT_R}
                  fill={isLast ? theme.surface : theme.accent}
                  stroke={isLast ? theme.highlight : theme.accent}
                  strokeWidth={isLast ? LAST_STROKE : 0}
                />
              );
            })}
          </Svg>
        ) : null}
      </View>

      <View style={styles.axisRow}>
        <ThemedText type="small" themeColor="textMuted" style={styles.axisText}>
          가장 오래된
        </ThemedText>
        <ThemedText type="small" themeColor="textMuted" style={styles.axisText}>
          최근
        </ThemedText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: Spacing.one,
  },
  chartArea: {
    height: CHART_HEIGHT,
  },
  axisRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  axisText: {
    fontSize: 14,
    lineHeight: 20,
  },
});
