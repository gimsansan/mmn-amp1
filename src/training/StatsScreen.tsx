/**
 * 통합 연습 기록 화면 — 네 탭 어디서 열어도 같은 화면.
 * 헤더 차트 버튼 한 번에 그 탭 통계가 뜨고(칩이 그 종목으로 열림), 다른 종목은
 * 칩 하나로 건너뛴다. 아래 「다른 연습」 줄은 눌러 보지 않아도 근황이 보이게 한다.
 *
 * 한 번에 하나만 그린다 — 네 그래프를 세로로 쌓지 않는다.
 * 저장소는 열 때 한 번만 읽고(`loadStatsFeed`), 칩 전환은 메모리로 처리한다.
 */

import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { ActionButton } from "@/components/ui/action-button";
import { Card } from "@/components/ui/card";
import { MaxContentWidth, Radius, Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import { SessionTrendPanel } from "@/training/SessionTrendPanel";
import { Ling6ProgressPanel } from "@/training/ling6/Ling6ProgressPanel";
import {
  clearStatsKind,
  countOfGroup,
  countOfKind,
  EMPTY_STATS_FEED,
  glanceLineCopy,
  glanceOfGroup,
  GROUP_LABEL,
  GROUP_OF_KIND,
  isSessionTrack,
  KIND_LABEL,
  KINDS_OF_GROUP,
  loadStatsFeed,
  sessionRowsOfKind,
  STATS_GROUPS,
  STATS_KINDS,
  type StatsFeed,
  type StatsGroup,
  type StatsKind,
} from "@/training/statsFeed";
import { WrsProgressPanel } from "@/training/wrs/WrsProgressPanel";

type StatsScreenProps = {
  /** 이 화면을 연 탭의 종목. 칩이 여기서 시작한다. */
  initialKind: StatsKind;
  onBack: () => void;
};

/** 선택한 종목의 본문. 종목마다 이미 있던 패널을 그대로 쓴다. */
function KindPanel({
  feed,
  kind,
}: Readonly<{ feed: StatsFeed; kind: StatsKind }>) {
  if (kind === "ling6") {
    return <Ling6ProgressPanel records={feed.ling6} />;
  }
  if (kind === "wrs1") {
    return <WrsProgressPanel records={feed.wrs1} />;
  }
  if (kind === "wrs2") {
    return <WrsProgressPanel records={feed.wrs2} />;
  }
  if (!isSessionTrack(kind)) {
    return null;
  }
  return <SessionTrendPanel rows={sessionRowsOfKind(feed, kind)} track={kind} />;
}

function KindChips({
  value,
  onChange,
}: Readonly<{ value: StatsKind; onChange: (next: StatsKind) => void }>) {
  const theme = useTheme();

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.chipScroll}
      contentContainerStyle={styles.chipRow}
    >
      {STATS_KINDS.map((kind) => {
        const active = kind === value;
        return (
          <Pressable
            key={kind}
            accessibilityRole="button"
            accessibilityLabel={`${KIND_LABEL[kind]} 기록 보기`}
            accessibilityState={{ selected: active }}
            onPress={() => onChange(kind)}
            style={[
              styles.chip,
              {
                borderColor: active ? theme.accentBorder : theme.border,
                backgroundColor: active ? theme.accentTint : theme.surface,
              },
            ]}
          >
            <ThemedText
              type="small"
              style={{ color: active ? theme.accent : theme.textSecondary }}
            >
              {KIND_LABEL[kind]}
            </ThemedText>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

/**
 * 지금 보고 있는 탭을 뺀 나머지 근황. 그래프 없이 한 줄씩.
 * 누르면 화면을 옮기지 않고 위 칩만 바꾼다.
 */
function OtherTrainingCard({
  feed,
  currentGroup,
  onPick,
}: Readonly<{
  feed: StatsFeed;
  currentGroup: StatsGroup;
  onPick: (kind: StatsKind) => void;
}>) {
  const others = STATS_GROUPS.filter((group) => group !== currentGroup);

  return (
    <Card style={styles.otherCard}>
      <ThemedText type="smallBold">다른 연습</ThemedText>
      {others.map((group) => {
        const glance = glanceOfGroup(feed, group);
        // 기록이 없으면 그 탭의 첫 종목으로 보낸다(빈 화면 안내가 뜬다).
        const target = glance?.kind ?? KINDS_OF_GROUP[group][0];
        const empty = countOfGroup(feed, group) === 0;
        return (
          <Pressable
            key={group}
            accessibilityRole="button"
            accessibilityLabel={`${GROUP_LABEL[group]} 기록 보기`}
            onPress={() => onPick(target)}
            style={({ pressed }) => [
              styles.otherRow,
              pressed && styles.otherRowPressed,
            ]}
          >
            <ThemedText type="smallBold" style={styles.otherLabel}>
              {GROUP_LABEL[group]}
            </ThemedText>
            <ThemedText
              themeColor={empty ? "textMuted" : "textSecondary"}
              type="small"
              style={styles.otherValue}
              numberOfLines={1}
            >
              {glanceLineCopy(glance)}
            </ThemedText>
          </Pressable>
        );
      })}
    </Card>
  );
}

function ClearKindButton({
  kind,
  clearing,
  disabled,
  onPress,
}: Readonly<{
  kind: StatsKind;
  clearing: boolean;
  disabled: boolean;
  onPress: () => void;
}>) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${KIND_LABEL[kind]} 연습 기록 지우기`}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.clearKind,
        disabled && styles.clearKindDisabled,
        pressed && !disabled && styles.clearKindPressed,
      ]}
    >
      <ThemedText themeColor="danger" type="small" style={styles.clearKindLabel}>
        {clearing ? "지우는 중…" : `${KIND_LABEL[kind]} 기록 지우기`}
      </ThemedText>
    </Pressable>
  );
}

export function StatsScreen({
  initialKind,
  onBack,
}: Readonly<StatsScreenProps>) {
  const [kind, setKind] = useState<StatsKind>(initialKind);
  const [feed, setFeed] = useState<StatsFeed>(EMPTY_STATS_FEED);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [clearing, setClearing] = useState(false);

  const reload = useCallback(() => {
    setLoading(true);
    setError(null);
    void loadStatsFeed()
      .then((next) => {
        setFeed(next);
      })
      .catch(() => {
        setError("기록을 불러오지 못했어요");
        setFeed(EMPTY_STATS_FEED);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  // 첫 진입과, 탭이 살아있는 채로 포커스가 돌아올 때 갱신한다.
  // `useFocusEffect`는 마운트에서도 한 번 도므로 별도 `useEffect`를 두면 두 번 읽는다.
  useFocusEffect(
    useCallback(() => {
      reload();
    }, [reload]),
  );

  const doClear = useCallback(() => {
    setClearing(true);
    void clearStatsKind(kind)
      .then(() => {
        Alert.alert("완료", `${KIND_LABEL[kind]} 연습 기록을 지웠어요.`);
        reload();
      })
      .catch(() => {
        Alert.alert("오류", "기록을 지우지 못했어요.");
      })
      .finally(() => {
        setClearing(false);
      });
  }, [kind, reload]);

  const confirmClear = useCallback(() => {
    Alert.alert(
      "기록 삭제",
      `${KIND_LABEL[kind]} 연습 기록을 모두 지울까요? 다른 연습 기록은 그대로예요. 되돌릴 수 없어요.`,
      [
        { text: "취소", style: "cancel" },
        { text: "삭제", style: "destructive", onPress: doClear },
      ],
    );
  }, [doClear, kind]);

  const hasRecords = countOfKind(feed, kind) > 0;
  const currentGroup = GROUP_OF_KIND[kind];

  return (
    <ThemedView style={styles.fill}>
      <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
        <View style={styles.screenHeader}>
          <ThemedText type="screenTitle">연습 기록</ThemedText>
          <ThemedText
            themeColor="textSecondary"
            type="small"
            style={styles.caption}
            numberOfLines={1}
          >
            이 기기에만 저장 · 점수·청력 검사·진단 결과 아님
          </ThemedText>
        </View>

        <KindChips value={kind} onChange={setKind} />

        <ScrollView
          style={styles.body}
          contentContainerStyle={styles.bodyContent}
          showsVerticalScrollIndicator={false}
        >
          {loading ? (
            <ThemedText
              themeColor="textMuted"
              type="small"
              style={styles.notice}
            >
              불러오는 중…
            </ThemedText>
          ) : null}

          {error ? (
            <ThemedText
              themeColor="textSecondary"
              type="small"
              style={styles.notice}
            >
              {error}
            </ThemedText>
          ) : null}

          {!loading && !error && !hasRecords ? (
            <ThemedText
              themeColor="textMuted"
              type="small"
              style={styles.notice}
            >
              아직 {KIND_LABEL[kind]} 기록이 없어요
            </ThemedText>
          ) : null}

          {!loading && !error && hasRecords ? (
            <KindPanel feed={feed} kind={kind} />
          ) : null}

          {!loading && !error ? (
            <OtherTrainingCard
              feed={feed}
              currentGroup={currentGroup}
              onPick={setKind}
            />
          ) : null}
        </ScrollView>

        <View style={styles.footer}>
          <ActionButton
            fill={false}
            variant="primary"
            label="뒤로 가기"
            onPress={onBack}
          />
          <ClearKindButton
            kind={kind}
            clearing={clearing}
            disabled={clearing || !hasRecords}
            onPress={confirmClear}
          />
        </View>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  fill: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    maxWidth: MaxContentWidth,
    alignSelf: "center",
    width: "100%",
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.three,
    paddingBottom: Spacing.three,
    alignItems: "stretch",
    gap: Spacing.three - 2,
  },
  screenHeader: {
    gap: Spacing.one + 2,
  },
  caption: {
    fontSize: 11.5,
    lineHeight: 17,
  },
  /**
   * `horizontal` ScrollView는 RN 기본 스타일이 `flexGrow: 1`이라 세로로 늘어난다.
   * 그러면 칩이 `stretch`로 따라 늘어나 화면을 잡아먹는다 — 둘 다 막는다.
   */
  chipScroll: {
    flexGrow: 0,
    flexShrink: 0,
  },
  chipRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
    paddingRight: Spacing.two,
  },
  chip: {
    borderWidth: 1,
    borderRadius: Radius.pill,
    paddingHorizontal: Spacing.three - 4,
    paddingVertical: Spacing.one + 2,
    justifyContent: "center",
  },
  body: {
    flex: 1,
  },
  bodyContent: {
    gap: Spacing.three,
    paddingBottom: Spacing.two,
  },
  notice: {
    textAlign: "center",
    paddingVertical: Spacing.three,
  },
  otherCard: {
    gap: Spacing.two,
  },
  otherRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: Spacing.two,
    minHeight: 40,
  },
  otherRowPressed: {
    opacity: 0.7,
  },
  otherLabel: {
    flexShrink: 0,
  },
  otherValue: {
    flexShrink: 1,
    fontSize: 12.5,
    lineHeight: 18,
    textAlign: "right",
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: Spacing.two,
  },
  clearKind: {
    flexShrink: 1,
    minHeight: 44,
    justifyContent: "center",
    paddingHorizontal: Spacing.two,
  },
  clearKindLabel: {
    fontSize: 12.5,
    lineHeight: 18,
    textAlign: "right",
  },
  clearKindPressed: {
    opacity: 0.7,
  },
  clearKindDisabled: {
    opacity: 0.4,
  },
});
