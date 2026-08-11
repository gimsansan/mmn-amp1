import { useId, useState } from 'react';
import { StyleSheet, View, type LayoutChangeEvent } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Path, Stop } from 'react-native-svg';

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
const DOT_R = 3.5;

export type TrendChartProps = {
  /** 시간순(오래→최근). 최소 2점. */
  points: readonly TrendPoint[];
};

/**
 * 경량 추이 라인 그래프. **Skia 미사용**(react-native-svg).
 *
 * **방향(2026-08-12 목업 채택)**: 값이 클수록 위, 작을수록 아래.
 * 대표값(들을 수 있는 최소 차이)은 작을수록 잘하는 것이라, 좋아질수록 선이 **내려간다**.
 * (이전 「위=잘함」 반전은 폐기 — 사용자 목업이 더 직관적이라 판단.)
 * 여기 값은 **점수·진단 역치가 아니다**(웰니스 방침).
 */
export function TrendChart({ points }: Readonly<TrendChartProps>) {
  const theme = useTheme();
  const [width, setWidth] = useState(0);
  // 한 화면에 그래프가 여러 개라 그라데이션 id가 겹치지 않게 고유값을 쓴다.
  const gradientId = useId();

  const onLayout = (e: LayoutChangeEvent) => {
    setWidth(e.nativeEvent.layout.width);
  };

  const values = points.map((p) => p.value);
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
  const areaPath =
    xy.length > 0
      ? `${linePath} L ${xy[xy.length - 1].x.toFixed(1)} ${baseY} L ${xy[0].x.toFixed(
          1
        )} ${baseY} Z`
      : '';

  return (
    <View style={styles.wrap}>
      <View style={styles.chartArea} onLayout={onLayout}>
        {width > 0 ? (
          <Svg width={width} height={CHART_HEIGHT}>
            <Defs>
              <LinearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0" stopColor={theme.accent} stopOpacity={0.22} />
                <Stop offset="1" stopColor={theme.accent} stopOpacity={0} />
              </LinearGradient>
            </Defs>

            <Path d={areaPath} fill={`url(#${gradientId})`} />
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
              return (
                <Circle
                  key={`${points[i].savedAt}-${i}`}
                  cx={pt.x}
                  cy={pt.y}
                  r={isLast ? DOT_R + 1.5 : DOT_R}
                  fill={isLast ? theme.highlight : theme.surface}
                  stroke={isLast ? theme.highlight : theme.accent}
                  strokeWidth={2}
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
    fontSize: 11.5,
    lineHeight: 16,
  },
});
