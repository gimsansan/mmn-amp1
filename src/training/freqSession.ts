import {
  applyStaircaseResult,
  createFreqStaircase,
  type FreqStaircaseState,
} from '@/training/freqStaircase';

/** 파일럿: 반전 4회 후 종료(사용자 합의 2026-08-06 — 세션이 길다는 청취 피드백). 설계 §6 관례 6~8보다 짧게. 제품 확정 아님. */
export const DEFAULT_TARGET_REVERSALS = 4;

/** 휴식·상한용 최대 시행. 설계: 시행 수 기준 휴식. 파일럿 추정. */
export const DEFAULT_MAX_TRIALS = 40;

/** 요약 시 최근 반전 몇 개의 Δ를 평균할지. 관례 제안, 임상 역치 아님. */
export const DEFAULT_AVERAGE_LAST_REVERSALS = 4;

export type SessionEndReason = 'reversals' | 'max_trials' | 'manual';

export type FreqSessionState = {
  stair: FreqStaircaseState;
  targetReversals: number;
  maxTrials: number;
  averageLastReversals: number;
  status: 'active' | 'completed';
  endReason: SessionEndReason | null;
};

export type CreateFreqSessionOptions = {
  startDeltaCents?: number;
  targetReversals?: number;
  maxTrials?: number;
  averageLastReversals?: number;
};

export type FreqSessionSummary = {
  trialCount: number;
  reversalCount: number;
  endReason: SessionEndReason | null;
  /** 최근 반전 시행의 Δ 평균. 없으면 null. 진단 역치 아님. */
  meanReversalDeltaCents: number | null;
  /** 이번 세션 history 중 가장 큰 Δ(가장 쉬움). 점수·역치 아님. */
  easiestDeltaCents: number | null;
  /** 이번 세션 history 중 가장 작은 Δ(가장 어려움). 점수·역치 아님. */
  hardestDeltaCents: number | null;
  correctCount: number;
};

export function createFreqSession(
  options: CreateFreqSessionOptions = {}
): FreqSessionState {
  const targetReversals = options.targetReversals ?? DEFAULT_TARGET_REVERSALS;
  const maxTrials = options.maxTrials ?? DEFAULT_MAX_TRIALS;
  const averageLastReversals =
    options.averageLastReversals ?? DEFAULT_AVERAGE_LAST_REVERSALS;

  if (!Number.isInteger(targetReversals) || targetReversals < 1) {
    throw new RangeError(`targetReversals must be integer >= 1: ${targetReversals}`);
  }
  if (!Number.isInteger(maxTrials) || maxTrials < 1) {
    throw new RangeError(`maxTrials must be integer >= 1: ${maxTrials}`);
  }
  if (!Number.isInteger(averageLastReversals) || averageLastReversals < 1) {
    throw new RangeError(
      `averageLastReversals must be integer >= 1: ${averageLastReversals}`
    );
  }

  return {
    stair: createFreqStaircase({
      startDeltaCents: options.startDeltaCents,
    }),
    targetReversals,
    maxTrials,
    averageLastReversals,
    status: 'active',
    endReason: null,
  };
}

function withEndCheck(session: FreqSessionState): FreqSessionState {
  if (session.status === 'completed') {
    return session;
  }

  const { stair, targetReversals, maxTrials } = session;

  if (stair.reversalCount >= targetReversals) {
    return {
      ...session,
      stair: { ...stair, done: true },
      status: 'completed',
      endReason: 'reversals',
    };
  }

  if (stair.trialCount >= maxTrials) {
    return {
      ...session,
      stair: { ...stair, done: true },
      status: 'completed',
      endReason: 'max_trials',
    };
  }

  return session;
}

/** 한 시행 정오답 반영 후 종료 조건 검사. */
export function applySessionResult(
  session: FreqSessionState,
  correct: boolean
): FreqSessionState {
  if (session.status === 'completed') {
    return session;
  }

  const stair = applyStaircaseResult(session.stair, correct);
  return withEndCheck({ ...session, stair });
}

/** 사용자가 중간에 끝냄. */
export function endSessionManual(session: FreqSessionState): FreqSessionState {
  if (session.status === 'completed') {
    return session;
  }

  return {
    ...session,
    stair: { ...session.stair, done: true },
    status: 'completed',
    endReason: 'manual',
  };
}

export function summarizeSession(session: FreqSessionState): FreqSessionSummary {
  const { stair, averageLastReversals, endReason } = session;
  const reversalDeltas = stair.history
    .filter((h) => h.reversal)
    .map((h) => h.deltaCents);
  const slice = reversalDeltas.slice(-averageLastReversals);
  const meanReversalDeltaCents =
    slice.length === 0
      ? null
      : slice.reduce((a, b) => a + b, 0) / slice.length;

  const correctCount = stair.history.filter((h) => h.correct).length;
  const deltas = stair.history.map((h) => h.deltaCents);
  const easiestDeltaCents =
    deltas.length === 0 ? null : Math.max(...deltas);
  const hardestDeltaCents =
    deltas.length === 0 ? null : Math.min(...deltas);

  return {
    trialCount: stair.trialCount,
    reversalCount: stair.reversalCount,
    endReason,
    meanReversalDeltaCents,
    easiestDeltaCents,
    hardestDeltaCents,
    correctCount,
  };
}

export function endReasonLabel(reason: SessionEndReason | null): string {
  switch (reason) {
    case 'reversals':
      return '오늘 연습량에 도달했어요';
    case 'max_trials':
      return '연습 횟수 한도에 도달했어요';
    case 'manual':
      return '직접 종료했어요';
    default:
      return '';
  }
}
