import { useCallback, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { DEFAULT_CARRIER_HZ } from '@/audio/amTone';
import { DEFAULT_REFERENCE_HZ } from '@/audio/pureTone';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Card } from '@/components/ui/card';
import { Icon, type IconName } from '@/components/ui/icon';
import { BottomTabInset, MaxContentWidth, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { AmSessionScreen } from '@/training/AmSessionScreen';
import { FreqSessionScreen } from '@/training/FreqSessionScreen';
import { ListeningCheckScreen } from '@/training/ListeningCheckScreen';
import { PitchCompareScreen } from '@/training/pitch2afc/PitchCompareScreen';

type Track = 'picker' | 'pitch2' | 'freq' | 'am';

/** 듣기 준비 화면 제목(훈련 트랙만). */
const TRACK_TITLE: Record<'pitch2' | 'freq' | 'am', string> = {
  pitch2: '높낮이 비교',
  freq: '다른 음 찾기',
  am: '떨림 찾기',
};

type TrackOption = {
  track: Exclude<Track, 'picker'>;
  icon: IconName;
  title: string;
  description: string;
};

type TrackSection = {
  label: string;
  options: readonly TrackOption[];
};

// §4-6: 훈련 3종을 계열별 섹션으로 묶는다. 음고 2(높낮이·다른 음) / 떨림 1(포락).
const TRAINING_SECTIONS: readonly TrackSection[] = [
  {
    label: '음고',
    options: [
      {
        track: 'pitch2',
        icon: 'wave',
        title: '높낮이 비교',
        description: '두 소리 중 어느 쪽이 높은지 맞히는 연습',
      },
      {
        track: 'freq',
        icon: 'wave',
        title: '다른 음 찾기',
        description: '조금 다른 음높이를 찾는 연습',
      },
    ],
  },
  {
    label: '떨림',
    options: [
      {
        track: 'am',
        icon: 'ripple',
        title: '떨림 찾기',
        description: '소리가 떨리는지 찾는 연습',
      },
    ],
  },
];

/** 연습 탭 — 트랙 선택 → 듣기 준비 → 정적 훈련 UI. 기록은 통계 탭으로 분리(§2-3). */
export default function ExploreScreen() {
  const theme = useTheme();
  const [track, setTrack] = useState<Track>('picker');
  /**
   * 이번 진입에서 듣기 준비를 지났는지. 트랙을 고를 때마다 다시 확인한다
   * — 기기·볼륨은 세션 사이에 바뀔 수 있으므로.
   */
  const [checked, setChecked] = useState(false);

  const backToPicker = useCallback(() => {
    setTrack('picker');
    setChecked(false);
  }, []);

  const openTrack = useCallback((next: Track) => {
    setChecked(false);
    setTrack(next);
  }, []);

  const passCheck = useCallback(() => {
    setChecked(true);
  }, []);

  const renderCard = useCallback(
    (option: TrackOption) => (
      <Pressable
        key={option.track}
        accessibilityRole="button"
        accessibilityLabel={`${option.title} — ${option.description}`}
        onPress={() => openTrack(option.track)}
        style={({ pressed }) => [styles.cardPress, pressed && styles.pressed]}>
        <Card style={styles.card}>
          <View style={[styles.cardIcon, { backgroundColor: theme.accentTint }]}>
            <Icon name={option.icon} size={22} color={theme.accent} />
          </View>
          <View style={styles.cardText}>
            <ThemedText type="smallBold" style={styles.cardTitle}>
              {option.title}
            </ThemedText>
            <ThemedText themeColor="textSecondary" type="small" style={styles.cardCaption}>
              {option.description}
            </ThemedText>
          </View>
        </Card>
      </Pressable>
    ),
    [openTrack, theme.accent, theme.accentTint],
  );

  // 훈련 트랙은 듣기 준비를 한 번 지난 뒤에 들어간다(음고·떨림 공통 — 화면 중복 없음).
  if ((track === 'pitch2' || track === 'freq' || track === 'am') && !checked) {
    const title = TRACK_TITLE[track];
    // ① 떨림 찾기만 반송파, 음고 트랙(높낮이·다른 음)은 기준음을 미리 들려준다.
    const sampleHz = track === 'am' ? DEFAULT_CARRIER_HZ : DEFAULT_REFERENCE_HZ;
    return (
      <ListeningCheckScreen
        trackTitle={title}
        sampleHz={sampleHz}
        onStart={passCheck}
        onBack={backToPicker}
      />
    );
  }

  if (track === 'pitch2') {
    return <PitchCompareScreen onBack={backToPicker} />;
  }

  if (track === 'freq') {
    return <FreqSessionScreen onBack={backToPicker} />;
  }

  if (track === 'am') {
    return <AmSessionScreen onBack={backToPicker} />;
  }

  return (
    <ThemedView style={styles.fill}>
      <SafeAreaView style={styles.safeArea}>
        <ThemedText type="screenTitle">연습 선택</ThemedText>
        <ThemedText themeColor="textSecondary" type="small" style={styles.caption}>
          웰니스·훈련 · 병원 검사·진단을 대신하지 않아요
        </ThemedText>

        <View style={styles.sections}>
          {TRAINING_SECTIONS.map((section) => (
            <View key={section.label} style={styles.section}>
              <ThemedText
                themeColor="textSecondary"
                type="smallBold"
                style={styles.sectionLabel}>
                {section.label}
              </ThemedText>
              <View style={styles.list}>{section.options.map(renderCard)}</View>
            </View>
          ))}
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
    paddingTop: Spacing.four,
    paddingBottom: BottomTabInset + Spacing.three,
    alignItems: 'stretch',
    gap: Spacing.two,
  },
  caption: {
    fontSize: 12,
    lineHeight: 18,
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three - 2,
    paddingVertical: Spacing.three + 2,
  },
  cardIcon: {
    width: 44,
    height: 44,
    borderRadius: Radius.small + 1,
    flexShrink: 0,
    alignItems: 'center',
    justifyContent: 'center',
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
});
