import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Card, CardDivider } from '@/components/ui/card';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type SummaryCardProps = {
  /** 카드 맨 위 줄(기록 목록의 트랙명·시각). 세션 요약에서는 생략. */
  header?: ReactNode;
  trialCount: number;
  correctCount: number;
  reversalCount: number;
  /** 트랙마다 다른 지표 이름 — ② 「음높이 차이」 / ① 「떨림 정도」. */
  meanLabel: string;
  meanValue: string;
  easiestValue: string;
  hardestValue: string;
  /** 카드 맨 아래 회색 한 줄(진단 아님 고지 등). */
  footnote?: string | null;
};

function Stat({
  label,
  value,
  accent = false,
}: Readonly<{ label: string; value: number; accent?: boolean }>) {
  const theme = useTheme();

  return (
    <View style={styles.statCell}>
      <ThemedText type="small" themeColor="textMuted" style={styles.statLabel}>
        {label}
      </ThemedText>
      <ThemedText type="metric" style={accent ? { color: theme.accent } : undefined}>
        {value}
      </ThemedText>
    </View>
  );
}

function MetricRow({ label, value }: Readonly<{ label: string; value: string }>) {
  return (
    <View style={styles.metricRow}>
      <ThemedText type="small" themeColor="textSecondary" style={styles.metricLabel}>
        {label}
      </ThemedText>
      <ThemedText type="mono" style={styles.metricValue}>
        {value}
      </ThemedText>
    </View>
  );
}

/**
 * 연습 결과 요약 카드 — 세션 끝(①②)과 기록 목록이 같은 모양을 쓴다.
 *
 * `주의`: 수치를 색·게이지로 강조하지 않는다. 여기 값은 **점수도 진단 역치도 아니다**.
 * 강조 색은 「연습 횟수」 한 칸에만 쓴다(시안 규칙).
 */
export function SummaryCard({
  header,
  trialCount,
  correctCount,
  reversalCount,
  meanLabel,
  meanValue,
  easiestValue,
  hardestValue,
  footnote,
}: Readonly<SummaryCardProps>) {
  const theme = useTheme();

  return (
    <Card size="large" style={styles.card}>
      {header ? (
        <>
          {header}
          <CardDivider />
        </>
      ) : null}

      <View style={styles.statsRow}>
        <Stat label="연습" value={trialCount} accent />
        <View style={[styles.statDivider, { backgroundColor: theme.borderSubtle }]} />
        <Stat label="정답" value={correctCount} />
        <View style={[styles.statDivider, { backgroundColor: theme.borderSubtle }]} />
        <Stat label="전환" value={reversalCount} />
      </View>

      <CardDivider />

      <View style={styles.metrics}>
        <ThemedText type="mono" themeColor="textMuted" style={styles.sectionTitle}>
          최근 난이도 참고
        </ThemedText>
        <MetricRow label={meanLabel} value={meanValue} />
        <MetricRow label="가장 쉬움" value={easiestValue} />
        <MetricRow label="가장 어려움" value={hardestValue} />
      </View>

      {footnote ? (
        <ThemedText type="small" themeColor="textMuted" style={styles.footnote}>
          {footnote}
        </ThemedText>
      ) : null}
    </Card>
  );
}

/** 기록 목록 카드의 머리줄(트랙명 + 선택 배지 + 저장 시각). */
export function SummaryCardHeader({
  title,
  savedAt,
  badge,
}: Readonly<{ title: string; savedAt: string; badge?: string | null }>) {
  const theme = useTheme();
  return (
    <View style={styles.header}>
      <View style={styles.headerTitleRow}>
        <ThemedText type="smallBold" style={styles.headerTitle}>
          {title}
        </ThemedText>
        {badge ? (
          <View style={[styles.badge, { backgroundColor: theme.borderSubtle }]}>
            <ThemedText type="small" themeColor="textMuted" style={styles.badgeText}>
              {badge}
            </ThemedText>
          </View>
        ) : null}
      </View>
      <ThemedText type="mono" themeColor="textMuted" style={styles.headerDate}>
        {savedAt}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    alignSelf: 'stretch',
    gap: Spacing.three,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  headerTitleRow: {
    flexShrink: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one + 2,
  },
  headerTitle: {
    flexShrink: 1,
    fontSize: 15,
  },
  badge: {
    flexShrink: 0,
    borderRadius: Radius.pill,
    paddingHorizontal: Spacing.two - 2,
    paddingVertical: 1,
  },
  badgeText: {
    fontSize: 10.5,
    lineHeight: 15,
  },
  headerDate: {
    flexShrink: 0,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
  },
  statCell: {
    flex: 1,
    alignItems: 'center',
    gap: Spacing.one,
  },
  statLabel: {
    fontSize: 11,
    lineHeight: 15,
  },
  statDivider: {
    width: 1,
    alignSelf: 'stretch',
  },
  metrics: {
    gap: Spacing.one,
  },
  sectionTitle: {
    letterSpacing: 0.4,
    marginBottom: Spacing.one,
  },
  metricRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
    paddingVertical: Spacing.one + 2,
  },
  metricLabel: {
    flexShrink: 1,
    fontSize: 13,
  },
  metricValue: {
    flexShrink: 0,
    fontSize: 14,
    textAlign: 'right',
  },
  footnote: {
    fontSize: 11,
    lineHeight: 16,
    textAlign: 'center',
  },
});
