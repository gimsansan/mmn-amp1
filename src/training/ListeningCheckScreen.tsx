import { useCallback, useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { playPureTone, stopPureTone } from '@/audio/pureTone';

/** 샘플음 길이(초). 볼륨을 맞출 만큼만. 훈련 자극(0.5초)과 별개. */
const SAMPLE_DURATION_SEC = 1.5;

type ListeningCheckScreenProps = {
  /** 어느 연습으로 들어가는지(제목에 표시). */
  trackTitle: string;
  /**
   * 샘플음 주파수(Hz). **그 연습에서 실제로 듣게 될 음**을 쓴다.
   * ② 다른 음 찾기 = 기준음, ① 떨림 찾기 = 반송파.
   */
  sampleHz: number;
  onStart: () => void;
  onBack: () => void;
};

/**
 * 연습 시작 전 청취 조건 안내(정적).
 *
 * 목적: 스피커/이어폰·기기 볼륨에 따라 자극이 달라져 **세션끼리 비교하기 어려워지는 것**을 줄인다.
 * `주의`: 이 화면은 **보정(calibration)이 아니다.** 앱은 절대 음압을 알지 못하므로
 * dB 수치·권장 레벨을 제시하지 않고, 볼륨을 대신 바꾸지도 않는다(OS 볼륨 존중).
 */
export function ListeningCheckScreen({
  trackTitle,
  sampleHz,
  onStart,
  onBack,
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
          setError('소리를 재생하지 못했어요. 기기 소리 설정을 확인해 주세요');
        }
      })
      .finally(() => {
        if (!abortRef.current) {
          setPlaying(false);
        }
      });
  }, [playing, sampleHz]);

  const leave = useCallback(
    (next: () => void) => {
      abortRef.current = true;
      stopPureTone();
      next();
    },
    []
  );

  return (
    <ThemedView style={styles.fill}>
      <SafeAreaView style={styles.safeArea}>
        <ThemedText type="subtitle">듣기 준비</ThemedText>
        <ThemedText themeColor="textSecondary" type="small" style={styles.caption}>
          {trackTitle}
        </ThemedText>

        <ThemedView type="backgroundElement" style={styles.box}>
          <ThemedText type="smallBold">이어폰이나 헤드폰을 쓰는 게 좋아요</ThemedText>
          <ThemedText themeColor="textSecondary" type="small">
            조용한 곳에서, 연습하는 동안 같은 기기를 쓰면 지난 연습과 견주어 보기 쉬워요
          </ThemedText>
        </ThemedView>

        <ThemedView type="backgroundElement" style={styles.box}>
          <ThemedText type="smallBold">소리 크기를 편안하게 맞춰 주세요</ThemedText>
          <ThemedText themeColor="textSecondary" type="small">
            아래 소리를 들으며 기기 볼륨을 조절하세요. 또렷하게 들리되 크게 느껴지지 않는 정도가 좋아요
          </ThemedText>
          <Pressable
            accessibilityRole="button"
            accessibilityState={{ disabled: playing, busy: playing }}
            disabled={playing}
            onPress={onPlaySample}
            style={({ pressed }) => [
              styles.sampleButton,
              { backgroundColor: theme.backgroundSelected },
              playing && styles.disabled,
              pressed && !playing && styles.pressed,
            ]}>
            <ThemedText type="smallBold">
              {playing ? '재생 중…' : '소리 들어보기'}
            </ThemedText>
          </Pressable>
        </ThemedView>

        <ThemedText themeColor="textSecondary" type="small" style={styles.caption}>
          웰니스 연습 · 병원 검사·진단을 대신하지 않아요
        </ThemedText>

        {error ? (
          <ThemedText themeColor="textSecondary" type="small" style={styles.caption}>
            {error}
          </ThemedText>
        ) : null}

        <View style={styles.actions}>
          <Pressable
            accessibilityRole="button"
            onPress={() => leave(onStart)}
            style={({ pressed }) => [
              styles.actionButton,
              { backgroundColor: theme.backgroundElement },
              pressed && styles.pressed,
            ]}>
            <ThemedText type="smallBold">연습 시작</ThemedText>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            onPress={() => leave(onBack)}
            style={({ pressed }) => [
              styles.actionButton,
              { backgroundColor: theme.backgroundElement },
              pressed && styles.pressed,
            ]}>
            <ThemedText type="smallBold">연습 목록</ThemedText>
          </Pressable>
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
    alignSelf: 'center',
    width: '100%',
    paddingHorizontal: Spacing.four,
    paddingBottom: BottomTabInset + Spacing.three,
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.three,
  },
  caption: {
    textAlign: 'center',
  },
  box: {
    alignSelf: 'stretch',
    padding: Spacing.three,
    borderRadius: Spacing.three,
    gap: Spacing.two,
  },
  sampleButton: {
    minHeight: 48,
    marginTop: Spacing.one,
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.four,
    borderRadius: Spacing.three,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actions: {
    alignSelf: 'stretch',
    flexDirection: 'row',
    gap: Spacing.two,
    marginTop: Spacing.two,
  },
  actionButton: {
    flex: 1,
    minHeight: 48,
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.four,
    borderRadius: Spacing.three,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.7,
  },
  disabled: {
    opacity: 0.4,
  },
});
