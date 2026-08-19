import { useState } from "react";
import { StyleSheet, View, type LayoutChangeEvent } from "react-native";
import Svg, { Circle, Line, Path, Text as SvgText } from "react-native-svg";

import { ThemedText } from "@/components/themed-text";
import { Card } from "@/components/ui/card";
import { Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import { formatWrsSavedAt } from "@/training/wrs/wrsStore";
import {
  canShowWrsTrend,
  chronologicalWrs,
  formatWrsDateShort,
  wrsTimeOrdinal,
  type PercentSessionRecord,
} from "@/training/wrs/wrsTrend";

const CHART_HEIGHT = 132;
const PAD_TOP = 10;
const PAD_BOTTOM = 18;
const PAD_LEFT = 22;
const PAD_RIGHT = 10;
const DOT_R = 3.5;
const PERCENT_MAX = 100;
const TICKS = [0, 50, 100] as const;

export function WrsProgressPanel({
  records,
}: Readonly<{ records: readonly PercentSessionRecord[] }>) {
  if (records.length === 0) {
    return null;
  }

  const showTrend = canShowWrsTrend(records);

  return (
    <View style={styles.stack}>
      {showTrend ? (
        <Card style={styles.card}>
          <ThemedText type="smallBold">맞힌 비율 변화</ThemedText>
          <ThemedText type="small" themeColor="textMuted" style={styles.note}>
            청력 검사가 아니에요.
          </ThemedText>
          <WrsPercentTrend records={chronologicalWrs(records)} />
        </Card>
      ) : null}
      <WrsRecentList records={records} />
    </View>
  );
}

function WrsRecentList({
  records,
}: Readonly<{ records: readonly PercentSessionRecord[] }>) {
  const recent = records.slice(0, 8);
  return (
    <Card style={styles.card}>
      <ThemedText type="smallBold">최근 연습</ThemedText>
      {recent.map((record) => (
        <View key={record.id} style={styles.historyRow}>
          <ThemedText type="mono" themeColor="textMuted">
            {formatWrsSavedAt(record.savedAt)}
          </ThemedText>
          <ThemedText type="smallBold">
            {record.summary.correctCount}/{record.summary.trialCount} · 약{" "}
            {record.summary.percent}%
          </ThemedText>
        </View>
      ))}
    </Card>
  );
}

function WrsPercentTrend({
  records,
}: Readonly<{ records: readonly PercentSessionRecord[] }>) {
  const theme = useTheme();
  const [width, setWidth] = useState(0);

  const onLayout = (event: LayoutChangeEvent) => {
    setWidth(event.nativeEvent.layout.width);
  };

  const plotW = Math.max(0, width - PAD_LEFT - PAD_RIGHT);
  const plotH = CHART_HEIGHT - PAD_TOP - PAD_BOTTOM;
  const ordinals = records.map((record) => wrsTimeOrdinal(record.savedAt));
  const minOrd = Math.min(...ordinals);
  const maxOrd = Math.max(...ordinals);
  const spanOrd = maxOrd - minOrd || 1;

  const xy = records.map((record, index) => {
    const x = PAD_LEFT + ((ordinals[index] - minOrd) / spanOrd) * plotW;
    const y =
      PAD_TOP + ((PERCENT_MAX - record.summary.percent) / PERCENT_MAX) * plotH;
    return { x, y };
  });

  const linePath = xy
    .map(
      (point, index) =>
        `${index === 0 ? "M" : "L"} ${point.x.toFixed(1)} ${point.y.toFixed(1)}`,
    )
    .join(" ");

  const first = records[0];
  const last = records[records.length - 1];

  return (
    <View style={styles.chartWrap}>
      <View style={styles.chartArea} onLayout={onLayout}>
        {width > 0 ? (
          <Svg width={width} height={CHART_HEIGHT}>
            {TICKS.map((tick) => {
              const y = PAD_TOP + ((PERCENT_MAX - tick) / PERCENT_MAX) * plotH;
              return (
                <Line
                  key={`tick-${tick}`}
                  x1={PAD_LEFT}
                  y1={y}
                  x2={width - PAD_RIGHT}
                  y2={y}
                  stroke={theme.border}
                  strokeWidth={1}
                />
              );
            })}
            {TICKS.map((tick) => {
              const y = PAD_TOP + ((PERCENT_MAX - tick) / PERCENT_MAX) * plotH;
              return (
                <SvgText
                  key={`label-${tick}`}
                  x={2}
                  y={y + 3}
                  fontSize={9}
                  fill={theme.textMuted}
                >
                  {tick}
                </SvgText>
              );
            })}
            <Path
              d={linePath}
              stroke={theme.accent}
              strokeWidth={2.5}
              fill="none"
              strokeLinejoin="round"
              strokeLinecap="round"
            />
            {xy.map((point, index) => {
              const isLast = index === xy.length - 1;
              return (
                <Circle
                  key={`${records[index]?.id}-${index}`}
                  cx={point.x}
                  cy={point.y}
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
          {first ? formatWrsDateShort(first.savedAt) : ""}
        </ThemedText>
        <ThemedText type="small" themeColor="textMuted" style={styles.axisText}>
          기록 0~100%
        </ThemedText>
        <ThemedText type="small" themeColor="textMuted" style={styles.axisText}>
          {last ? formatWrsDateShort(last.savedAt) : ""}
        </ThemedText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  stack: {
    gap: Spacing.three,
  },
  card: {
    gap: Spacing.two,
  },
  note: {
    fontSize: 12,
    lineHeight: 18,
  },
  historyRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: Spacing.two,
  },
  chartWrap: {
    gap: Spacing.one,
  },
  chartArea: {
    height: CHART_HEIGHT,
  },
  axisRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  axisText: {
    fontSize: 11.5,
    lineHeight: 16,
  },
});
