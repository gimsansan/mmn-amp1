/**
 * 「높낮이 비교」 세션 요약 — 저장 스키마의 단일 출처.
 *
 * 화면(`PitchCompareScreen`)이 만들고, 저장소(`sessionStore`)가 읽는다.
 * cent 값은 **진단 역치·점수가 아니라** 최근 난이도 참고값이다(웰니스 방침).
 */

export type PitchCompareEndReason = 'reversals' | 'max_trials' | 'manual';

export type PitchCompareSummary = {
  trialCount: number;
  correctCount: number;
  reversalCount: number;
  endReason: PitchCompareEndReason;
  /** 최근 반전 지점 cent 평균. 없으면 null. 진단 역치 아님. */
  meanReversalCents: number | null;
  /** 세션 중 가장 큰 cent 격차(가장 쉬움). 점수·역치 아님. */
  easiestCents: number | null;
  /** 세션 중 가장 작은 cent 격차(가장 어려움). 점수·역치 아님. */
  hardestCents: number | null;
};
