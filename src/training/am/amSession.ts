import {
  applyAmStaircaseResult,
  createAmStaircase,
  type AmStaircaseState,
} from '@/training/am/amStaircase';
import {
  DEFAULT_AVERAGE_LAST_REVERSALS,
  DEFAULT_MAX_TRIALS,
  DEFAULT_TARGET_REVERSALS,
  type SessionEndReason,
} from '@/training/freq/freqSession';

export { endReasonLabel } from '@/training/freq/freqSession';

export type AmSessionState = {
  stair: AmStaircaseState;
  /** `null`이면 반전 종료 없음(귀풀기). */
  targetReversals: number | null;
  /** `null`이면 시행 한도 없음(귀풀기). */
  maxTrials: number | null;
  averageLastReversals: number;
  status: 'active' | 'completed';
  endReason: SessionEndReason | null;
};

export type CreateAmSessionOptions = {
  startDepthDb?: number;
  targetReversals?: number | null;
  maxTrials?: number | null;
  averageLastReversals?: number;
};

export type AmSessionSummary = {
  trialCount: number;
  reversalCount: number;
  endReason: SessionEndReason | null;
  /** 최근 반전 시행의 depthDb 평균. 없으면 null. 진단 역치 아님. */
  meanReversalDepthDb: number | null;
  /** 이번 세션 history 중 가장 큰 depthDb(가장 쉬움, 0에 가까움). 점수·역치 아님. */
  easiestDepthDb: number | null;
  /** 이번 세션 history 중 가장 작은 depthDb(가장 어려움). 점수·역치 아님. */
  hardestDepthDb: number | null;
  correctCount: number;
};

export type { SessionEndReason };

function assertOptionalPositiveInt(name: string, value: number | null): void {
  if (value == null) {
    return;
  }
  if (!Number.isInteger(value) || value < 1) {
    throw new RangeError(`${name} must be integer >= 1 or null: ${value}`);
  }
}

export function createAmSession(
  options: CreateAmSessionOptions = {}
): AmSessionState {
  const targetReversals =
    options.targetReversals === undefined
      ? DEFAULT_TARGET_REVERSALS
      : options.targetReversals;
  const maxTrials =
    options.maxTrials === undefined ? DEFAULT_MAX_TRIALS : options.maxTrials;
  const averageLastReversals =
    options.averageLastReversals ?? DEFAULT_AVERAGE_LAST_REVERSALS;

  assertOptionalPositiveInt('targetReversals', targetReversals);
  assertOptionalPositiveInt('maxTrials', maxTrials);
  if (!Number.isInteger(averageLastReversals) || averageLastReversals < 1) {
    throw new RangeError(
      `averageLastReversals must be integer >= 1: ${averageLastReversals}`
    );
  }

  return {
    stair: createAmStaircase({
      startDepthDb: options.startDepthDb,
    }),
    targetReversals,
    maxTrials,
    averageLastReversals,
    status: 'active',
    endReason: null,
  };
}

function withEndCheck(session: AmSessionState): AmSessionState {
  if (session.status === 'completed') {
    return session;
  }

  const { stair, targetReversals, maxTrials } = session;

  if (targetReversals != null && stair.reversalCount >= targetReversals) {
    return {
      ...session,
      stair: { ...stair, done: true },
      status: 'completed',
      endReason: 'reversals',
    };
  }

  if (maxTrials != null && stair.trialCount >= maxTrials) {
    return {
      ...session,
      stair: { ...stair, done: true },
      status: 'completed',
      endReason: 'max_trials',
    };
  }

  return session;
}

export function applyAmSessionResult(
  session: AmSessionState,
  correct: boolean
): AmSessionState {
  if (session.status === 'completed') {
    return session;
  }

  const stair = applyAmStaircaseResult(session.stair, correct);
  return withEndCheck({ ...session, stair });
}

export function endAmSessionManual(session: AmSessionState): AmSessionState {
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

export function summarizeAmSession(session: AmSessionState): AmSessionSummary {
  const { stair, averageLastReversals, endReason } = session;
  const reversalDepths = stair.history
    .filter((h) => h.reversal)
    .map((h) => h.depthDb);
  const slice = reversalDepths.slice(-averageLastReversals);
  const meanReversalDepthDb =
    slice.length === 0
      ? null
      : slice.reduce((a, b) => a + b, 0) / slice.length;

  const correctCount = stair.history.filter((h) => h.correct).length;
  const depths = stair.history.map((h) => h.depthDb);
  const easiestDepthDb = depths.length === 0 ? null : Math.max(...depths);
  const hardestDepthDb = depths.length === 0 ? null : Math.min(...depths);

  return {
    trialCount: stair.trialCount,
    reversalCount: stair.reversalCount,
    endReason,
    meanReversalDepthDb,
    easiestDepthDb,
    hardestDepthDb,
    correctCount,
  };
}
