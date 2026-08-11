import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Icon } from '@/components/ui/icon';
import { BottomTabInset, MaxContentWidth, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

/**
 * 홈 — 웰니스 진입(정적). 훈련 입력은 연습 탭.
 * Expo 스타터 카피 제거.
 */
export default function HomeScreen() {
  const theme = useTheme();

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={[styles.mark, { backgroundColor: theme.accentTint }]}>
          <Icon name="logo" size={38} color={theme.accent} />
        </View>

        <ThemedText type="heading" style={styles.title}>
          청능 연습
        </ThemedText>

        <View style={styles.captions}>
          <ThemedText themeColor="textSecondary" type="small" style={styles.caption}>
            웰니스·훈련 · 병원 검사·진단을 대신하지 않아요
          </ThemedText>
          <ThemedText themeColor="textSecondary" type="small" style={styles.caption}>
            아래 연습 탭에서 「다른 음 찾기」또는 「떨림 찾기」를 시작하세요
          </ThemedText>
        </View>
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
  mark: {
    width: 76,
    height: 76,
    borderRadius: Radius.tile,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 30,
    lineHeight: 38,
    textAlign: 'center',
  },
  captions: {
    gap: Spacing.two,
    // 시안의 한 줄 길이(약 230px)에 맞춰 가운데로 모은다.
    maxWidth: 260,
  },
  caption: {
    fontSize: 13,
    lineHeight: 20,
    textAlign: 'center',
  },
});
