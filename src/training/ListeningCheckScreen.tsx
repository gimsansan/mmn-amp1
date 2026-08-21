import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { playPureTone, stopPureTone } from "@/audio/pureTone";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { ActionButton } from "@/components/ui/action-button";
import { Card } from "@/components/ui/card";
import { Equalizer } from "@/components/ui/equalizer";
import { Icon, type IconName } from "@/components/ui/icon";
import {
  BottomTabInset,
  MaxContentWidth,
  Radius,
  Shadows,
  Spacing,
} from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";

/** 샘플음 길이(초). 볼륨을 맞출 만큼만. 훈련 자극(0.5초)과 별개. */
const SAMPLE_DURATION_SEC = 1.5;

/** idle 안내 화면 텍스트만 균일하게 살짝 키우는 배율(사용자 요청). */
const TEXT_SCALE = 1.2;

type ListeningCheckScreenProps = {
  /** 어느 연습으로 들어가는지(제목에 표시). */
  trackTitle: string;
  /**
   * 그 연습의 아이콘. 연습 선택 카드 → 이 화면이 **같은 그림**으로 이어져
   * 제목을 읽기 전에 어떤 연습인지 알아볼 수 있게 한다.
   */
  trackIcon: IconName;
  /**
   * 샘플음 주파수(Hz). **그 연습에서 실제로 듣게 될 음**을 쓴다.
   * ② 다른 음 찾기 = 기준음, ① 떨림 찾기 = 반송파.
   */
  sampleHz: number;
  onStart: () => void;
  onBack: () => void;
  /** 소리 높낮이 — 귀풀기/연습 토글. 통과 후 idle을 건너뛰므로 여기서 고른다. */
  extra?: ReactNode;
};

/** 카드 머리줄 — 파란 선 아이콘 + 굵은 한 줄. */
function GuideHeader({
  icon,
  title,
}: Readonly<{ icon: IconName; title: string }>) {
  const theme = useTheme();

  return (
    <View style={styles.guideHeader}>
      <Icon name={icon} size={18} color={theme.accent} />
      <ThemedText
        type="smallBold"
        style={[styles.guideTitle, styles.guideTitleText]}
      >
        {title}
      </ThemedText>
    </View>
  );
}

/**
 * 연습 시작 전 청취 조건 안내(정적).
 *
 * 목적: 스피커/이어폰·기기 볼륨에 따라 자극이 달라져 **세션끼리 비교하기 어려워지는 것**을 줄인다.
 * `주의`: 이 화면은 **보정(calibration)이 아니다.** 앱은 절대 음압을 알지 못하므로
 * dB 수치·권장 레벨을 제시하지 않고, 볼륨을 대신 바꾸지도 않는다(OS 볼륨 존중).
 */
export function ListeningCheckScreen({
  trackTitle,
  trackIcon,
  sampleHz,
  onStart,
  onBack,
  extra,
}: Readonly<ListeningCheckScreenProps>) {
  const theme = useTheme();
  const abortRef = useRef(false);
  const [playing, setPlaying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      abortRef.current = true;
      stopPureTone();
    };
  }, []);

  const onPlaySample = useCallback(() => {
    if (playing) {
      return;
    }
    setError(null);
    setPlaying(true);
    abortRef.current = false;

    void playPureTone({
      frequencyHz: sampleHz,
      durationSec: SAMPLE_DURATION_SEC,
    })
      .catch(() => {
        if (!abortRef.current) {
          setError("소리를 재생하지 못했어요. 기기 소리 설정을 확인해 주세요");
        }
      })
      .finally(() => {
        if (!abortRef.current) {
          setPlaying(false);
        }
      });
  }, [playing, sampleHz]);

  const leave = useCallback((next: () => void) => {
    abortRef.current = true;
    stopPureTone();
    next();
  }, []);

  return (
    <ThemedView style={styles.fill}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          {/* 시작 화면 hero 타일을 줄인 것 — 안내 카드가 쌓이는 화면이라 링은 뺀다. */}
          <View
            style={[styles.trackMark, { backgroundColor: theme.accentTint }]}
          >
            <Icon name={trackIcon} size={30} color={theme.accent} />
          </View>
          <ThemedText
            type="screenTitle"
            style={[styles.centered, styles.title]}
          >
            듣기 준비
          </ThemedText>
          <ThemedText
            themeColor="textSecondary"
            type="small"
            style={styles.subtitle}
          >
            {trackTitle}
          </ThemedText>
        </View>

        <Card style={styles.box}>
          <GuideHeader
            icon="headphones"
            title="이어폰이나 헤드폰을 쓰는 게 좋아요"
          />
          <ThemedText
            themeColor="textSecondary"
            type="small"
            style={styles.body}
          >
            조용한 곳에서, 연습하는 동안 같은 기기를 쓰면 지난 연습과 견주어
            보기 쉬워요
          </ThemedText>
        </Card>

        <Card style={styles.box}>
          <GuideHeader
            icon="speaker"
            title="소리 크기를 편안하게 맞춰 주세요"
          />
          <ThemedText
            themeColor="textSecondary"
            type="small"
            style={styles.body}
          >
            아래 소리를 들으며 기기 볼륨을 조절하세요. 또렷하게 들리되 크게
            느껴지지 않는 정도가 좋아요
          </ThemedText>
          <Pressable
            accessibilityRole="button"
            accessibilityState={{ disabled: playing, busy: playing }}
            disabled={playing}
            onPress={onPlaySample}
            style={({ pressed }) => [
              styles.sampleButton,
              { backgroundColor: theme.accent },
              Shadows.accent,
              playing && styles.playing,
              pressed && !playing && styles.pressed,
            ]}
          >
            {playing ? (
              <Equalizer color={theme.onAccent} height={16} barWidth={3} />
            ) : null}
            <ThemedText
              type="smallBold"
              style={[{ color: theme.onAccent }, styles.sampleButtonText]}
            >
              {playing ? "재생 중…" : "소리 들어보기"}
            </ThemedText>
          </Pressable>
        </Card>

        {extra}

        <ThemedText
          themeColor="textMuted"
          type="small"
          style={styles.disclaimer}
        >
          웰니스 연습 · 병원 검사·진단을 대신하지 않아요
        </ThemedText>

        {error ? (
          <ThemedText
            themeColor="textSecondary"
            type="small"
            style={styles.centered}
          >
            {error}
          </ThemedText>
        ) : null}

        <View style={styles.actions}>
          <ActionButton
            variant="primary"
            label="연습 시작"
            textScale={TEXT_SCALE}
            onPress={() => leave(onStart)}
          />
          <ActionButton
            label="뒤로 가기"
            textScale={TEXT_SCALE}
            onPress={() => leave(onBack)}
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
    paddingBottom: BottomTabInset + Spacing.three,
    alignItems: "stretch",
    gap: Spacing.three - 4,
  },
  header: {
    alignItems: "center",
    gap: Spacing.one,
    marginBottom: Spacing.two,
  },
  trackMark: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.two - 2,
  },
  centered: {
    textAlign: "center",
  },
  /** screenTitle(23/30) × TEXT_SCALE. */
  title: {
    fontSize: 23 * TEXT_SCALE,
    lineHeight: 30 * TEXT_SCALE,
  },
  subtitle: {
    fontSize: 12 * TEXT_SCALE,
    lineHeight: 18 * TEXT_SCALE,
    textAlign: "center",
  },
  box: {
    gap: Spacing.two - 1,
  },
  guideHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
  },
  guideTitle: {
    flexShrink: 1,
  },
  /** smallBold(14/20) × TEXT_SCALE. */
  guideTitleText: {
    fontSize: 14 * TEXT_SCALE,
    lineHeight: 20 * TEXT_SCALE,
  },
  body: {
    fontSize: 12 * TEXT_SCALE,
    lineHeight: 19 * TEXT_SCALE,
  },
  /** smallBold(14/20) × TEXT_SCALE. */
  sampleButtonText: {
    fontSize: 14 * TEXT_SCALE,
    lineHeight: 20 * TEXT_SCALE,
  },
  sampleButton: {
    minHeight: 44,
    marginTop: Spacing.two - 2,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.two + 1,
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
    borderRadius: Radius.small,
  },
  disclaimer: {
    fontSize: 14 * TEXT_SCALE,
    lineHeight: 20 * TEXT_SCALE,
    textAlign: "center",
    marginTop: Spacing.two,
  },
  actions: {
    flexDirection: "row",
    gap: Spacing.three - 4,
    // 안내 카드가 위에 쌓이므로 버튼은 바닥으로 민다(시안의 `margin-top:auto`).
    marginTop: "auto",
    paddingTop: Spacing.three,
  },
  playing: {
    // 재생 중에도 버튼이 살아 있는 것처럼 보이게 — 완전히 흐려지지 않는다.
    opacity: 0.85,
  },
  pressed: {
    opacity: 0.7,
  },
});
