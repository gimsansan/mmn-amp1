import Constants from "expo-constants";
import { useFocusEffect } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  BackHandler,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { DEFAULT_CARRIER_HZ } from "@/audio/amTone";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Card, CardDivider } from "@/components/ui/card";
import { Icon, type IconName } from "@/components/ui/icon";
import {
  BottomTabInset,
  MaxContentWidth,
  Radius,
  Spacing,
} from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import { AmSessionScreen } from "@/training/AmSessionScreen";
import { ListeningCheckScreen } from "@/training/ListeningCheckScreen";
import {
  SessionHistoryScreen,
  peekLatestSession,
  type LatestSessionPeek,
} from "@/training/SessionHistoryScreen";
import { listSavedSessions } from "@/training/sessionStore";

// 'stats' = 통계 화면(연습 탭 안에서 상태 스와프). 음고 2종은 소리 높낮이 탭.
type Track = "picker" | "am" | "stats";

const APP_DISPLAY_NAME = "청능 연습";

type TrainingTrack = "am";

/**
 * 트랙의 얼굴 — 아이콘과 제목. 연습 선택 카드·듣기 준비·시작 화면이 모두 이걸 쓴다.
 */
const TRACK_FACE: Record<TrainingTrack, { icon: IconName; title: string }> = {
  am: { icon: "vibrate", title: "떨림 찾기" },
};

type TrackOption = {
  track: TrainingTrack;
  description: string;
};

type TrackSection = {
  label: string;
  options: readonly TrackOption[];
};

// 연습 탭에는 떨림만. 음고 2종은 소리 높낮이 탭.
const TRAINING_SECTIONS: readonly TrackSection[] = [
  {
    label: "떨림",
    options: [
      {
        track: "am",
        description: "소리가 떨리는지 찾는 연습",
      },
    ],
  },
];

/**
 * 연습 탭 — 트랙 선택 → 듣기 준비 → 정적 훈련 UI.
 * 통계는 이 탭 안에서 스와프. 앱 정보(고지·버전)는 이 화면 하단.
 */
export default function ExploreScreen() {
  const theme = useTheme();
  const [track, setTrack] = useState<Track>("picker");
  /**
   * 이번 진입에서 듣기 준비를 지났는지. 트랙을 고를 때마다 다시 확인한다
   * — 기기·볼륨은 세션 사이에 바뀔 수 있으므로.
   */
  const [checked, setChecked] = useState(false);
  /** 홈 상단 peek 카드용 최근 세션 요약. 기록 없으면 null(카드 숨김). */
  const [peek, setPeek] = useState<LatestSessionPeek | null>(null);
  const version = Constants.expoConfig?.version ?? "1.0.0";

  const backToPicker = useCallback(() => {
    setTrack("picker");
    setChecked(false);
  }, []);

  const openTrack = useCallback((next: Track) => {
    setChecked(false);
    setTrack(next);
  }, []);

  const passCheck = useCallback(() => {
    setChecked(true);
  }, []);

  // 홈으로 돌아올 때마다 최근 세션을 다시 읽어 peek을 갱신한다
  // (세션 종료·통계에서 삭제 후에도 반영되도록).
  useEffect(() => {
    if (track !== "picker") {
      return;
    }
    let alive = true;
    void listSavedSessions()
      .then((rows) => {
        if (alive) {
          setPeek(peekLatestSession(rows));
        }
      })
      .catch(() => {
        if (alive) {
          setPeek(null);
        }
      });
    return () => {
      alive = false;
    };
  }, [track]);

  // 이 탭이 보일 때만. 소리 높낮이 탭의 뒤로가기와 겹치지 않게.
  useFocusEffect(
    useCallback(() => {
      if (track === "picker") {
        return;
      }
      const sub = BackHandler.addEventListener("hardwareBackPress", () => {
        backToPicker();
        return true;
      });
      return () => sub.remove();
    }, [track, backToPicker]),
  );

  const renderCard = useCallback(
    (option: TrackOption) => {
      const face = TRACK_FACE[option.track];
      return (
        <Pressable
          key={option.track}
          accessibilityRole="button"
          accessibilityLabel={`${face.title} — ${option.description}`}
          onPress={() => openTrack(option.track)}
          style={({ pressed }) => [styles.cardPress, pressed && styles.pressed]}
        >
          <Card style={styles.card}>
            <View
              style={[styles.cardIcon, { backgroundColor: theme.accentTint }]}
            >
              <Icon name={face.icon} size={22} color={theme.accent} />
            </View>
            <View style={styles.cardText}>
              <ThemedText type="smallBold" style={styles.cardTitle}>
                {face.title}
              </ThemedText>
              <ThemedText
                themeColor="textSecondary"
                type="small"
                style={styles.cardCaption}
              >
                {option.description}
              </ThemedText>
            </View>
          </Card>
        </Pressable>
      );
    },
    [openTrack, theme.accent, theme.accentTint],
  );

  if (track === "am" && !checked) {
    const face = TRACK_FACE.am;
    return (
      <ListeningCheckScreen
        trackTitle={face.title}
        trackIcon={face.icon}
        sampleHz={DEFAULT_CARRIER_HZ}
        onStart={passCheck}
        onBack={backToPicker}
      />
    );
  }

  if (track === "am") {
    return <AmSessionScreen onBack={backToPicker} />;
  }

  // 통계 = 별도 탭 대신 홈 안에서 스와프. push가 아니라 매 진입 시 마운트되므로
  // SessionHistoryScreen의 useEffect가 다시 돌아 자동 갱신된다.
  if (track === "stats") {
    return <SessionHistoryScreen onBack={backToPicker} />;
  }

  return (
    <ThemedView style={styles.fill}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          style={styles.fill}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.top}>
            <View style={styles.headerRow}>
              <ThemedText type="screenTitle">연습 선택</ThemedText>
              {/* 통계 진입점(헤더 우측). 하단 탭은 링 6 · PTA · 단어인지도 · 연습. */}
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="연습 통계 보기"
                onPress={() => openTrack("stats")}
                hitSlop={8}
                style={({ pressed }) => [
                  styles.statsButton,
                  {
                    backgroundColor: theme.accentTint,
                    borderColor: theme.accentBorder,
                  },
                  pressed && styles.pressed,
                ]}
              >
                <Icon name="chart" size={28} color={theme.accent} />
              </Pressable>
            </View>
            <ThemedText
              themeColor="textSecondary"
              type="small"
              style={styles.caption}
            >
              웰니스·훈련 · 병원 검사·진단을 대신하지 않아요
            </ThemedText>

            {/* 최근 연습 1줄 요약(그래프 없음) → 통계 화면으로 이동. 발견성 두 번째 경로. */}
            {peek ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`최근 연습 ${peek.trackTitle} · 전체 통계 보기`}
                onPress={() => openTrack("stats")}
                style={({ pressed }) => [
                  styles.peekPress,
                  pressed && styles.pressed,
                ]}
              >
                <Card style={styles.peekCard}>
                  <View style={styles.peekText}>
                    <ThemedText
                      themeColor="textMuted"
                      type="small"
                      style={styles.peekLabel}
                    >
                      최근 연습 · {peek.savedAt}
                    </ThemedText>
                    <ThemedText
                      type="smallBold"
                      numberOfLines={1}
                      style={styles.peekValue}
                    >
                      {peek.trackTitle} · {peek.meanLabel} {peek.meanValue}
                    </ThemedText>
                  </View>
                  <ThemedText type="smallBold" style={{ color: theme.accent }}>
                    전체 보기 ›
                  </ThemedText>
                </Card>
              </Pressable>
            ) : null}

            <View style={styles.sections}>
              {TRAINING_SECTIONS.map((section) => (
                <View key={section.label} style={styles.section}>
                  <ThemedText
                    themeColor="textSecondary"
                    type="smallBold"
                    style={styles.sectionLabel}
                  >
                    {section.label}
                  </ThemedText>
                  <View style={styles.list}>
                    {section.options.map(renderCard)}
                  </View>
                </View>
              ))}
            </View>
          </View>

          {/* 앱 정보(고지·버전). 설정 탭은 없음. */}
          <View style={styles.appInfo}>
            <Card style={styles.appInfoCard}>
              <View style={styles.appInfoRow}>
                <ThemedText type="smallBold">{APP_DISPLAY_NAME}</ThemedText>
                <ThemedText themeColor="textMuted" type="mono">
                  v{version}
                </ThemedText>
              </View>
              <CardDivider />
              <ThemedText
                themeColor="textSecondary"
                type="small"
                style={styles.appInfoBody}
              >
                이 앱은 의료기기가 아니에요. 질병의 진단·치료·예방에 쓸 수 없고,
                소리를 듣고 견주어 보는 웰니스·훈련 콘텐츠예요.
              </ThemedText>
            </Card>
          </View>
        </ScrollView>
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
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.four,
    paddingBottom: BottomTabInset + Spacing.three,
  },
  top: {
    gap: Spacing.two,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  statsButton: {
    width: 60,
    height: 40,
    borderRadius: Radius.small + 1,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  caption: {
    fontSize: 12,
    lineHeight: 18,
  },
  peekPress: {
    borderRadius: Radius.large - 2,
    marginTop: Spacing.one,
  },
  peekCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
    paddingVertical: Spacing.three - 2,
  },
  peekText: {
    flexShrink: 1,
    flexGrow: 1,
    gap: 2,
  },
  peekLabel: {
    fontSize: 11.5,
    lineHeight: 16,
  },
  peekValue: {
    fontSize: 14,
    lineHeight: 20,
  },
  sections: {
    marginTop: Spacing.three,
    gap: Spacing.three,
  },
  section: {
    gap: Spacing.two,
  },
  sectionLabel: {
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.4,
    marginLeft: Spacing.half,
  },
  list: {
    gap: Spacing.three - 2,
  },
  cardPress: {
    borderRadius: Radius.large - 2,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.three - 2,
    paddingVertical: Spacing.three + 2,
  },
  cardIcon: {
    width: 44,
    height: 44,
    borderRadius: Radius.small + 1,
    flexShrink: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  cardText: {
    flexShrink: 1,
    gap: Spacing.half,
  },
  cardTitle: {
    fontSize: 15,
    lineHeight: 22,
  },
  cardCaption: {
    fontSize: 12,
    lineHeight: 18,
  },
  pressed: {
    opacity: 0.7,
  },
  appInfo: {
    // 카드가 적을 땐 하단으로 밀고, 많아지면 스크롤된다.
    marginTop: "auto",
    paddingTop: Spacing.four,
  },
  appInfoCard: {
    gap: Spacing.three - 4,
  },
  appInfoRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  appInfoBody: {
    fontSize: 12.5,
    lineHeight: 19,
  },
});
