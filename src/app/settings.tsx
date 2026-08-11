import Constants from 'expo-constants';
import { useCallback, useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { ActionButton } from '@/components/ui/action-button';
import { Card, CardDivider } from '@/components/ui/card';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { clearSavedSessions } from '@/training/sessionStore';

const APP_DISPLAY_NAME = '청능 연습';

/**
 * 설정 탭(정적).
 *
 * mnn에는 기준음 프리셋·진동·온보딩 플래그 저장소가 없어(그 항목은 훈련 로직·새
 * 저장소가 필요) 여기서는 다루지 않는다. 앱 정보·고지·로컬 데이터 초기화만 둔다.
 */
export default function SettingsScreen() {
  const [clearing, setClearing] = useState(false);
  const version = Constants.expoConfig?.version ?? '1.0.0';

  const doClear = useCallback(() => {
    setClearing(true);
    void clearSavedSessions()
      .then(() => {
        Alert.alert('완료', '이 기기의 연습 기록을 지웠어요.');
      })
      .catch(() => {
        Alert.alert('오류', '기록을 지우지 못했어요.');
      })
      .finally(() => {
        setClearing(false);
      });
  }, []);

  const confirmClear = useCallback(() => {
    Alert.alert(
      '연습 기록 삭제',
      '이 기기에 저장된 연습 기록을 모두 지울까요? 되돌릴 수 없어요.',
      [
        { text: '취소', style: 'cancel' },
        { text: '삭제', style: 'destructive', onPress: doClear },
      ]
    );
  }, [doClear]);

  return (
    <ThemedView style={styles.fill}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.screenHeader}>
          <ThemedText type="screenTitle">설정</ThemedText>
          <ThemedText themeColor="textSecondary" type="small" style={styles.caption}>
            앱 정보와 기기에 저장된 기록을 관리해요
          </ThemedText>
        </View>

        <View style={styles.section}>
          <ThemedText themeColor="textMuted" type="smallBold" style={styles.sectionLabel}>
            앱 정보
          </ThemedText>
          <Card style={styles.card}>
            <View style={styles.infoRow}>
              <ThemedText type="smallBold">{APP_DISPLAY_NAME}</ThemedText>
              <ThemedText themeColor="textMuted" type="mono">
                v{version}
              </ThemedText>
            </View>
            <CardDivider />
            <ThemedText themeColor="textSecondary" type="small" style={styles.body}>
              이 앱은 의료기기가 아니에요. 질병의 진단·치료·예방에 쓸 수 없고, 소리를
              듣고 견주어 보는 웰니스·훈련 콘텐츠예요.
            </ThemedText>
          </Card>
        </View>

        <View style={styles.section}>
          <ThemedText themeColor="textMuted" type="smallBold" style={styles.sectionLabel}>
            데이터 관리
          </ThemedText>
          <Card style={styles.card}>
            <ThemedText themeColor="textSecondary" type="small" style={styles.body}>
              연습 기록은 이 기기에만 저장돼요. 서버로 보내지 않아요.
            </ThemedText>
            <ActionButton
              label={clearing ? '지우는 중…' : '연습 기록 전체 삭제'}
              disabled={clearing}
              fill={false}
              onPress={confirmClear}
            />
          </Card>
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
    paddingTop: Spacing.three,
    paddingBottom: BottomTabInset + Spacing.three,
    alignItems: 'stretch',
    gap: Spacing.four,
  },
  screenHeader: {
    gap: Spacing.one + 2,
  },
  caption: {
    fontSize: 11.5,
    lineHeight: 17,
    maxWidth: 240,
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
  card: {
    gap: Spacing.three - 4,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  body: {
    fontSize: 12.5,
    lineHeight: 19,
  },
});
