import { useCallback, useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import {
  abortAmAfcPlayback,
  createAmAfcTrial,
  playAmAfcTrial,
  scoreAmAfcChoice,
  type AmAfcChoiceResult,
  type AmAfcTrial,
} from '@/training/amAfcTrial';
import {
  applyAmSessionResult,
  createAmSession,
  endAmSessionManual,
  endReasonLabel,
  summarizeAmSession,
  type AmSessionState,
  type AmSessionSummary,
} from '@/training/amSession';
import { DEFAULT_AFC_N } from '@/training/freqAfcTrial';
import {
  DEFAULT_MAX_TRIALS,
  DEFAULT_TARGET_REVERSALS,
} from '@/training/freqSession';

type Phase = 'idle' | 'playing' | 'choose' | 'feedback' | 'summary';

function phaseCaption(phase: Phase, correct: boolean | undefined): string {
  switch (phase) {
    case 'playing':
      return '듣는 중… 소리가 끝난 뒤 고르세요';
    case 'choose':
      return '떨리는 소리를 고르세요';
    case 'feedback':
      return correct ? '맞았어요' : '아쉬워요';
    case 'summary':
      return '오늘 연습이 끝났어요';
    default:
      return '시작을 누르면 난이도가 맞춰지는 연습이 이어집니다';
  }
}

function progressCaption(
  phase: Phase,
  trialNumber: number,
  reversalCount: number,
  summaryReason: string
): string {
  if (phase === 'idle') {
    return `난이도 전환 ${DEFAULT_TARGET_REVERSALS}번 또는 연습 ${DEFAULT_MAX_TRIALS}번까지`;
  }
  if (phase === 'summary') {
    return summaryReason;
  }
  return `연습 ${trialNumber} · 전환 ${reversalCount}/${DEFAULT_TARGET_REVERSALS}`;
}

type AmSessionScreenProps = {
  /** 연습 목록으로 돌아가기(idle·요약에서만 노출). */
  onBack?: () => void;
};

/**
 * ① AM/포락선 — 훈련용 정적 UI.
 * 변조 깊이(m/dB)를 색·크기·게이지에 연동하지 않음. 요약은 진단 역치가 아님.
 */
export function AmSessionScreen({ onBack }: Readonly<AmSessionScreenProps>) {
  const theme = useTheme();
  const abortRef = useRef(false);
  const [phase, setPhase] = useState<Phase>('idle');
  const [session, setSession] = useState<AmSessionState | null>(null);
  const [trial, setTrial] = useState<AmAfcTrial | null>(null);
  const [result, setResult] = useState<AmAfcChoiceResult | null>(null);
  const [summary, setSummary] = useState<AmSessionSummary | null>(null);
  const [lastError, setLastError] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      abortRef.current = true;
      abortAmAfcPlayback();
    };
  }, []);

  const goSummary = useCallback((next: AmSessionState) => {
    abortAmAfcPlayback();
    setSession(next);
    setSummary(summarizeAmSession(next));
    setPhase('summary');
    setTrial(null);
  }, []);

  const resetToIdle = useCallback(() => {
    abortRef.current = true;
    abortAmAfcPlayback();
    setPhase('idle');
    setSession(null);
    setTrial(null);
    setResult(null);
    setSummary(null);
  }, []);

  const runTrial = useCallback(async (state: AmSessionState) => {
    if (state.status === 'completed') {
      return;
    }

    setLastError(null);
    setResult(null);
    abortRef.current = false;

    const next = createAmAfcTrial({
      n: DEFAULT_AFC_N,
      depthDb: state.stair.depthDb,
    });
    setTrial(next);
    setPhase('playing');

    try {
      await playAmAfcTrial(next, {
        shouldAbort: () => abortRef.current,
      });
      if (abortRef.current) {
        return;
      }
      setPhase('choose');
    } catch (e) {
      if (e instanceof Error && e.message === 'ABORTED') {
        return;
      }
      setLastError(e instanceof Error ? e.message : String(e));
      setPhase('idle');
      setSession(null);
      setTrial(null);
    }
  }, []);

  const onStart = useCallback(() => {
    const next = createAmSession();
    setSession(next);
    setSummary(null);
    void runTrial(next);
  }, [runTrial]);

  const onChoose = useCallback(
    (index: number) => {
      if (!trial || !session || phase !== 'choose') {
        return;
      }
      const scored = scoreAmAfcChoice(trial, index);
      const next = applyAmSessionResult(session, scored.correct);
      setResult(scored);
      setSession(next);

      if (next.status === 'completed') {
        goSummary(next);
        return;
      }
      setPhase('feedback');
    },
    [goSummary, phase, session, trial]
  );

  const onNext = useCallback(() => {
    if (!session || session.status === 'completed') {
      return;
    }
    void runTrial(session);
  }, [runTrial, session]);

  const onEndManual = useCallback(() => {
    if (!session) {
      resetToIdle();
      return;
    }
    goSummary(endAmSessionManual(session));
  }, [goSummary, resetToIdle, session]);

  const choiceDisabled = phase !== 'choose';
  const stair = session?.stair;
  let trialNumber = stair?.trialCount ?? 0;
  if (phase === 'playing' || phase === 'choose') {
    trialNumber += 1;
  }

  const meanText =
    summary?.meanReversalDepthDb == null
      ? '—'
      : `약 ${summary.meanReversalDepthDb.toFixed(1)}`;

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ThemedText type="subtitle">떨림 찾기</ThemedText>
        <ThemedText themeColor="textSecondary" style={styles.caption}>
          웰니스 연습 · 병원 검사·진단을 대신하지 않아요
        </ThemedText>
        <ThemedText themeColor="textSecondary" style={styles.caption}>
          {progressCaption(
            phase,
            trialNumber,
            stair?.reversalCount ?? 0,
            endReasonLabel(summary?.endReason ?? null)
          )}
        </ThemedText>
        <ThemedText type="smallBold" style={styles.prompt}>
          {phaseCaption(phase, result?.correct)}
        </ThemedText>

        {phase !== 'summary' && phase !== 'idle' ? (
          <View style={styles.choices}>
            {Array.from({ length: DEFAULT_AFC_N }, (_, i) => (
              <Pressable
                key={i}
                accessibilityRole="button"
                accessibilityLabel={`${i + 1}번 소리`}
                accessibilityState={{ disabled: choiceDisabled }}
                disabled={choiceDisabled}
                onPress={() => onChoose(i)}
                style={({ pressed }) => [
                  styles.choiceButton,
                  { backgroundColor: theme.backgroundElement },
                  choiceDisabled && styles.disabled,
                  pressed && !choiceDisabled && styles.pressed,
                ]}>
                <ThemedText type="subtitle">{i + 1}</ThemedText>
              </Pressable>
            ))}
          </View>
        ) : null}

        {phase === 'summary' && summary ? (
          <ThemedView type="backgroundElement" style={styles.summaryBox}>
            <ThemedText style={styles.caption}>
              {`연습 ${summary.trialCount} · 정답 ${summary.correctCount} · 전환 ${summary.reversalCount}`}
            </ThemedText>
            <ThemedText style={styles.caption}>
              {`최근 난이도 참고 · 떨림 정도 ${meanText}`}
            </ThemedText>
            <ThemedText themeColor="textSecondary" type="small" style={styles.caption}>
              숫자가 작을수록 더 얕은 떨림 · 청력 검사·진단 결과 아님
            </ThemedText>
          </ThemedView>
        ) : null}

        <View style={styles.actions}>
          {phase === 'idle' || phase === 'summary' ? (
            <>
              <Pressable
                accessibilityRole="button"
                onPress={onStart}
                style={({ pressed }) => [
                  styles.actionButton,
                  { backgroundColor: theme.backgroundElement },
                  pressed && styles.pressed,
                ]}>
                <ThemedText type="smallBold">
                  {phase === 'summary' ? '다시 연습' : '연습 시작'}
                </ThemedText>
              </Pressable>
              {onBack ? (
                <Pressable
                  accessibilityRole="button"
                  onPress={() => {
                    abortRef.current = true;
                    abortAmAfcPlayback();
                    onBack();
                  }}
                  style={({ pressed }) => [
                    styles.actionButton,
                    { backgroundColor: theme.backgroundElement },
                    pressed && styles.pressed,
                  ]}>
                  <ThemedText type="smallBold">연습 목록</ThemedText>
                </Pressable>
              ) : null}
            </>
          ) : null}

          {phase === 'feedback' ? (
            <>
              <Pressable
                accessibilityRole="button"
                onPress={onNext}
                style={({ pressed }) => [
                  styles.actionButton,
                  { backgroundColor: theme.backgroundElement },
                  pressed && styles.pressed,
                ]}>
                <ThemedText type="smallBold">다음</ThemedText>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                onPress={onEndManual}
                style={({ pressed }) => [
                  styles.actionButton,
                  { backgroundColor: theme.backgroundElement },
                  pressed && styles.pressed,
                ]}>
                <ThemedText type="smallBold">끝내기</ThemedText>
              </Pressable>
            </>
          ) : null}

          {phase === 'playing' || phase === 'choose' ? (
            <Pressable
              accessibilityRole="button"
              onPress={onEndManual}
              style={({ pressed }) => [
                styles.actionButton,
                { backgroundColor: theme.backgroundElement },
                pressed && styles.pressed,
              ]}>
              <ThemedText type="smallBold">중지</ThemedText>
            </Pressable>
          ) : null}
        </View>

        {phase === 'feedback' && result && stair ? (
          <ThemedText themeColor="textSecondary" type="small" style={styles.caption}>
            {`선택 ${result.chosenIndex + 1} · 정답 ${result.oddIndex + 1}`}
            {` · 방금 떨림 ${result.depthDb.toFixed(0)} · 다음 떨림 ${stair.depthDb.toFixed(0)}`}
          </ThemedText>
        ) : null}

        {lastError ? (
          <ThemedText themeColor="textSecondary" style={styles.error}>
            {lastError}
          </ThemedText>
        ) : null}
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
  caption: {
    textAlign: 'center',
  },
  prompt: {
    textAlign: 'center',
    marginTop: Spacing.one,
  },
  summaryBox: {
    alignSelf: 'stretch',
    padding: Spacing.three,
    borderRadius: Spacing.three,
    gap: Spacing.two,
  },
  choices: {
    alignSelf: 'stretch',
    flexDirection: 'row',
    gap: Spacing.three,
    marginTop: Spacing.two,
  },
  actions: {
    alignSelf: 'stretch',
    flexDirection: 'row',
    gap: Spacing.two,
    marginTop: Spacing.two,
  },
  choiceButton: {
    flex: 1,
    minHeight: 72,
    paddingVertical: Spacing.four,
    paddingHorizontal: Spacing.three,
    borderRadius: Spacing.three,
    alignItems: 'center',
    justifyContent: 'center',
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
  error: {
    textAlign: 'center',
    marginTop: Spacing.two,
  },
});
