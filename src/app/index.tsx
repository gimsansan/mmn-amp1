import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';

/**
 * 홈 — 웰니스 진입(정적). 훈련 입력은 연습 탭.
 * Expo 스타터 카피 제거.
 */
export default function HomeScreen() {
  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ThemedText type="title" style={styles.title}>
          청능 연습
        </ThemedText>
        <ThemedText themeColor="textSecondary" style={styles.caption}>
          웰니스·훈련 · 병원 검사·진단을 대신하지 않아요
        </ThemedText>
        <ThemedText themeColor="textSecondary" style={styles.caption}>
          아래 연습 탭에서 「다른 음 찾기」또는 「떨림 찾기」를 시작하세요
        </ThemedText>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  safeArea: {
    flex: 1,
    maxWidth: MaxContentWidth,
    paddingHorizontal: Spacing.four,
    paddingBottom: BottomTabInset + Spacing.three,
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.three,
  },
  title: {
    textAlign: 'center',
  },
  caption: {
    textAlign: 'center',
  },
});
