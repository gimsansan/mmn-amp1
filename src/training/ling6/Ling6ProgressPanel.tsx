import { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  View,
  type LayoutChangeEvent,
} from "react-native";
import Svg, { Circle, Line, Path, Text as SvgText } from "react-native-svg";

import { ThemedText } from "@/components/themed-text";
import { Card } from "@/components/ui/card";
import { Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import {
  passCountOf,
  SOUND_TRIAL_COUNT,
  type Ling6PhonemeMap,
} from "@/training/ling6/ling6Session";
import {
  formatDateKeyShort,
  LING6_RECORD_VERSION,
  localDateKey,
  shiftDateKey,
  type SavedLing6Record,
} from "@/training/ling6/ling6Store";
import { LING6_SOUND_IDS, LING6_SOUNDS } from "@/training/ling6/sounds";

const CELL = 22;
const COL_W = 28;
const ROW_H = 26;
const LABEL_W = 64;
const CHART_HEIGHT = 132;
const PAD_TOP = 10;
const PAD_BOTTOM = 18;
const PAD_LEFT = 18;
const PAD_RIGHT = 10;
const DOT_R = 3.5;

function chronological(
  records: readonly SavedLing6Record[],
): SavedLing6Record[] {
  return [...records].sort((a, b) => a.dateKey.localeCompare(b.dateKey));
}

function dateOrdinal(dateKey: string): number {
  const [year, month, day] = dateKey.split("-").map(Number);
  return Date.UTC(year ?? 0, (month ?? 1) - 1, day ?? 1) / 86_400_000;
}

/** 같은 날짜는 칸 색이 안 바뀌게 시드만 씀. 저장하지 않음. */
function seededUnit(seed: string): () => number {
  let x = 1;
  for (const ch of seed) {
    x = Math.imul(x, 31) + (ch.codePointAt(0) ?? 0);
  }
  x = (x >>> 0) + 1;
  return () => {
    x = (Math.imul(x, 1664525) + 1013904223) >>> 0;
    return x / 4294967296;
  };
}

function randomPhonemeMap(dateKey: string): Ling6PhonemeMap {
  const next = seededUnit(`ling6-preview-${dateKey}`);
  const map = {} as Ling6PhonemeMap;
  for (const id of LING6_SOUND_IDS) {
    map[id] = next() < 0.5;
  }
  return map;
}

function previewRecord(dateKey: string): SavedLing6Record {
  const byPhoneme = randomPhonemeMap(dateKey);
  return {
    id: `preview-${dateKey}`,
    dateKey,
    savedAt: `${dateKey}T00:00:00.000Z`,
    schemaVersion: LING6_RECORD_VERSION,
    summary: {
      passCount: passCountOf(byPhoneme),
      byPhoneme,
    },
  };
}

/** 추이선은 점이 2개 필요해서, 모자란 날만 미리보기로 채운다. */
function ensureTwoDays(
  records: readonly SavedLing6Record[],
): SavedLing6Record[] {
  const rows = chronological(records);
  if (rows.length >= 2) {
    return rows;
  }
  if (rows.length === 1) {
    const only = rows[0];
    if (!only) {
      return rows;
    }
    return chronological([previewRecord(shiftDateKey(only.dateKey, -1)), only]);
  }
  const today = localDateKey();
  return chronological([
    previewRecord(shiftDateKey(today, -1)),
    previewRecord(today),
  ]);
}

export function Ling6ProgressPanel({
  records,
}: Readonly<{ records: readonly SavedLing6Record[] }>) {
  const rows = ensureTwoDays(records);

  return (
    <View style={styles.stack}>
      <Card style={styles.card}>
        <ThemedText type="smallBold">음소별 진행 상황</ThemedText>
        <ThemedText type="small" themeColor="textMuted" style={styles.note}>
          맞힌 날·아쉬운 날이에요. 청력 검사가 아니에요.
        </ThemedText>
        <Ling6PhonemeGrid records={rows} />
        <View style={styles.legendRow}>
          <LegendSwatch kind="pass" label="맞춤" />
          <LegendSwatch kind="fail" label="아쉬움" />
        </View>
      </Card>

      <Card style={styles.card}>
        <ThemedText type="smallBold">맞힌 개수 변화</ThemedText>
        <Ling6PassTrend records={rows} />
      </Card>
    </View>
  );
}

function LegendSwatch({
  kind,
  label,
}: Readonly<{ kind: "pass" | "fail"; label: string }>) {
  const theme = useTheme();
  return (
    <View style={styles.legendItem}>
      <View
        style={[
          styles.swatch,
          {
            backgroundColor: kind === "pass" ? theme.positive : "#E8D0D0",
          },
        ]}
      />
      <ThemedText
        type="small"
        themeColor="textMuted"
        style={styles.legendLabel}
      >
        {label}
      </ThemedText>
    </View>
  );
}

function Ling6PhonemeGrid({
  records,
}: Readonly<{ records: readonly SavedLing6Record[] }>) {
  const theme = useTheme();

  return (
    <View style={styles.gridRow}>
      <View style={styles.labelCol}>
        <View style={styles.dateRow} />
        {LING6_SOUNDS.map((sound) => (
          <View key={sound.id} style={styles.phonemeLabel}>
            <ThemedText type="smallBold" style={styles.phonemeKo}>
              {sound.label}
            </ThemedText>
            <ThemedText
              type="small"
              themeColor="textMuted"
              style={styles.phonemeIpa}
            >
              /{sound.ipa}/
            </ThemedText>
          </View>
        ))}
      </View>

      <ScrollView
        horizontal
        nestedScrollEnabled
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.gridScroll}
      >
        <View>
          <View style={styles.dateRow}>
            {records.map((record) => (
              <ThemedText
                key={`d-${record.dateKey}`}
                type="small"
                themeColor="textMuted"
                style={styles.dateLabel}
              >
                {formatDateKeyShort(record.dateKey)}
              </ThemedText>
            ))}
          </View>
          {LING6_SOUNDS.map((sound) => (
            <View key={sound.id} style={styles.cellRow}>
              {records.map((record) => {
                const passed = record.summary.byPhoneme[sound.id];
                return (
                  <View
                    key={`${sound.id}-${record.dateKey}`}
                    accessibilityLabel={`${sound.label} ${formatDateKeyShort(record.dateKey)} ${passed ? "맞춤" : "아쉬움"}`}
                    style={[
                      styles.cell,
                      {
                        backgroundColor: passed ? theme.positive : "#E8D0D0",
                      },
                    ]}
                  />
                );
              })}
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

function Ling6PassTrend({
  records,
}: Readonly<{ records: readonly SavedLing6Record[] }>) {
  const theme = useTheme();
  const [width, setWidth] = useState(0);

  const onLayout = (event: LayoutChangeEvent) => {
    setWidth(event.nativeEvent.layout.width);
  };

  const plotW = Math.max(0, width - PAD_LEFT - PAD_RIGHT);
  const plotH = CHART_HEIGHT - PAD_TOP - PAD_BOTTOM;
  const ordinals = records.map((record) => dateOrdinal(record.dateKey));
  const minOrd = Math.min(...ordinals);
  const maxOrd = Math.max(...ordinals);
  const spanOrd = maxOrd - minOrd || 1;

  const xy = records.map((record, index) => {
    const x =
      records.length === 1
        ? PAD_LEFT + plotW / 2
        : PAD_LEFT + ((ordinals[index] - minOrd) / spanOrd) * plotW;
    const y =
      PAD_TOP +
      ((SOUND_TRIAL_COUNT - record.summary.passCount) / SOUND_TRIAL_COUNT) *
        plotH;
    return { x, y };
  });

  const linePath = xy
    .map(
      (point, index) =>
        `${index === 0 ? "M" : "L"} ${point.x.toFixed(1)} ${point.y.toFixed(1)}`,
    )
    .join(" ");

  const ticks = [0, 3, 6];
  const first = records[0];
  const last = records[records.length - 1];

  return (
    <View style={styles.chartWrap}>
      <View style={styles.chartArea} onLayout={onLayout}>
        {width > 0 ? (
          <Svg width={width} height={CHART_HEIGHT}>
            {ticks.map((tick) => {
              const y =
                PAD_TOP +
                ((SOUND_TRIAL_COUNT - tick) / SOUND_TRIAL_COUNT) * plotH;
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
            {ticks.map((tick) => {
              const y =
                PAD_TOP +
                ((SOUND_TRIAL_COUNT - tick) / SOUND_TRIAL_COUNT) * plotH;
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
                  key={`${records[index]?.dateKey}-${index}`}
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
          {first ? formatDateKeyShort(first.dateKey) : ""}
        </ThemedText>
        <ThemedText type="small" themeColor="textMuted" style={styles.axisText}>
          기록 0~6
        </ThemedText>
        <ThemedText type="small" themeColor="textMuted" style={styles.axisText}>
          {last ? formatDateKeyShort(last.dateKey) : ""}
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
  legendRow: {
    flexDirection: "row",
    gap: Spacing.three,
    marginTop: Spacing.one,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.one,
  },
  swatch: {
    width: 12,
    height: 12,
    borderRadius: 3,
  },
  legendLabel: {
    fontSize: 12,
    lineHeight: 16,
  },
  gridRow: {
    flexDirection: "row",
    marginTop: Spacing.one,
  },
  labelCol: {
    width: LABEL_W,
  },
  gridScroll: {
    paddingRight: Spacing.two,
  },
  dateRow: {
    flexDirection: "row",
    height: ROW_H,
    alignItems: "center",
  },
  dateLabel: {
    width: COL_W,
    fontSize: 10,
    lineHeight: 14,
    textAlign: "center",
  },
  phonemeLabel: {
    height: ROW_H,
    justifyContent: "center",
  },
  phonemeKo: {
    fontSize: 12,
    lineHeight: 14,
  },
  phonemeIpa: {
    fontSize: 10,
    lineHeight: 12,
  },
  cellRow: {
    flexDirection: "row",
    height: ROW_H,
    alignItems: "center",
  },
  cell: {
    width: CELL,
    height: CELL,
    marginHorizontal: (COL_W - CELL) / 2,
    borderRadius: 4,
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
