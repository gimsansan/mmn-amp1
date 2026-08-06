import {
  applyAmStaircaseResult,
  createAmStaircase,
  type AmStaircaseState,
} from '@/training/amStaircase';
import {
  DEFAULT_AVERAGE_LAST_REVERSALS,
  DEFAULT_MAX_TRIALS,
  DEFAULT_TARGET_REVERSALS,
  type SessionEndReason,
} from '@/training/freqSession';

export { endReasonLabel } from '@/training/freqSession';

export type AmSessionState = {
  stair: AmStaircaseState;
  targetReversals: number;
  maxTrials: number;
  averageLastReversals: number;
  status: 'active' | 'completed';
  endReason: SessionEndReason | null;
};

export type CreateAmSessionOptions = {
  startDepthDb?: number;
  targetReversals?: number;
  maxTrials?: number;
  averageLastReversals?: number;
};

export type AmSessionSummary = {
  trialCount: number;
  reversalCount: number;
  endReason: SessionEndReason | null;
  /** 최근 반전 시행의 depthDb 평균. 없으면 null. 진단 역치 아님. */
  meanReversalDepthDb: number | null;
  correctCount: number;
};

export type { SessionEndReason };

export function createAmSession(
  options: CreateAmSessionOptions = {}
): AmSessionState {
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

  return {
    trialCount: stair.trialCount,
    reversalCount: stair.reversalCount,
    endReason,
    meanReversalDepthDb,
    correctCount,
  };
}
