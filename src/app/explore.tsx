import { useCallback, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { AmSessionScreen } from '@/training/AmSessionScreen';
import { FreqSessionScreen } from '@/training/FreqSessionScreen';
import { SessionHistoryScreen } from '@/training/SessionHistoryScreen';

type Track = 'picker' | 'freq' | 'am' | 'history';

/** 연습 탭 — 트랙 선택 후 정적 훈련 UI. */
export default function ExploreScreen() {
  const theme = useTheme();
  const [track, setTrack] = useState<Track>('picker');

  const backToPicker = useCallback(() => {
    setTrack('picker');
  }, []);

  if (track === 'freq') {
    return <FreqSessionScreen onBack={backToPicker} />;
  }

  if (track === 'am') {
    return <AmSessionScreen onBack={backToPicker} />;
  }

  if (track === 'history') {
    return <SessionHistoryScreen onBack={backToPicker} />;
  }

  return (
    <ThemedView style={styles.fill}>
      <SafeAreaView style={styles.safeArea}>
        <ThemedText type="subtitle">연습 선택</ThemedText>
        <ThemedText themeColor="textSecondary" style={styles.caption}>
          웰니스·훈련 · 병원 검사·진단을 대신하지 않아요
        </ThemedText>

        <View style={styles.list}>
          <Pressable
            accessibilityRole="button"
            onPress={() => setTrack('freq')}
            style={({ pressed }) => [
              styles.card,
              { backgroundColor: theme.backgroundElement },
              pressed && styles.pressed,
            ]}>
            <ThemedText type="smallBold">다른 음 찾기</ThemedText>
            <ThemedText themeColor="textSecondary" type="small">
              조금 다른 음높이를 찾는 연습
            </ThemedText>
          </Pressable>

          <Pressable
            accessibilityRole="button"
            onPress={() => setTrack('am')}
            style={({ pressed }) => [
              styles.card,
              { backgroundColor: theme.backgroundElement },
              pressed && styles.pressed,
            ]}>
            <ThemedText type="smallBold">떨림 찾기</ThemedText>
            <ThemedText themeColor="textSecondary" type="small">
              소리가 떨리는지 찾는 연습
            </ThemedText>
          </Pressable>

          <Pressable
            accessibilityRole="button"
            onPress={() => setTrack('history')}
            style={({ pressed }) => [
              styles.card,
              { backgroundColor: theme.backgroundElement },
              pressed && styles.pressed,
            ]}>
            <ThemedText type="smallBold">연습 기록</ThemedText>
            <ThemedText themeColor="textSecondary" type="small">
              이 기기에 남긴 연습 요약 보기
            </ThemedText>
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
  list: {
    alignSelf: 'stretch',
    gap: Spacing.three,
    marginTop: Spacing.two,
  },
  card: {
    minHeight: 72,
    paddingVertical: Spacing.four,
    paddingHorizontal: Spacing.four,
    borderRadius: Spacing.three,
    gap: Spacing.one,
  },
  pressed: {
    opacity: 0.7,
  },
});
