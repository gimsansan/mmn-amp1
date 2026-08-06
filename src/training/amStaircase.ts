/**
 * ① AM 깊이(MDT) — 2-down-1-up 계단식 (dB = 20·log₁₀ m).
 * 설계 §6 제안: 시작 0 dB(m=1), 스텝 6→반전 2회 후 2 dB. 임상 역치 아님.
 */

/** 가장 쉬움(m=1). */
export const MAX_DEPTH_DB = 0;

/**
 * 하한(가장 어려움). 엔진 분해능·파일럿용 임시값.
 * m ≈ 0.01 (−40 dB).
 */
export const MIN_DEPTH_DB = -40;

export const COARSE_STEP_DB = 6;
export const FINE_STEP_DB = 2;

/** 이 반전 수 이후부터 fine step. 설계 §6 제안. */
export const FINE_STEP_AFTER_REVERSALS = 2;

/** 쉬운 쪽(0 dB)에서 시작 — 설계 §6. */
export const DEFAULT_START_DEPTH_DB = 0;

export type StaircaseDirection = 'up' | 'down';

export type AmStaircaseTrialRecord = {
  trialIndex: number;
  depthDb: number;
  correct: boolean;
  stepped: boolean;
  reversal: boolean;
  stepDb: number;
};

export type AmStaircaseState = {
  depthDb: number;
  consecutiveCorrect: number;
  trialCount: number;
  lastStepDirection: StaircaseDirection | null;
  reversalCount: number;
  history: AmStaircaseTrialRecord[];
  done: boolean;
};

export type CreateAmStaircaseOptions = {
  startDepthDb?: number;
  minDepthDb?: number;
  maxDepthDb?: number;
};

export type ApplyAmStaircaseResultOptions = {
  minDepthDb?: number;
  maxDepthDb?: number;
  coarseStepDb?: number;
  fineStepDb?: number;
  fineStepAfterReversals?: number;
};

function clampDepth(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function stepSizeFor(
  reversalCount: number,
  coarse: number,
  fine: number,
  after: number
): number {
  return reversalCount >= after ? fine : coarse;
}

export function createAmStaircase(
  options: CreateAmStaircaseOptions = {}
): AmStaircaseState {
  const min = options.minDepthDb ?? MIN_DEPTH_DB;
  const max = options.maxDepthDb ?? MAX_DEPTH_DB;
  const start = options.startDepthDb ?? DEFAULT_START_DEPTH_DB;

  if (!Number.isFinite(min) || !Number.isFinite(max) || min > max) {
    throw new RangeError(`invalid min/max: ${min}..${max}`);
  }
  if (!Number.isFinite(start) || start > 0) {
    throw new RangeError(`startDepthDb must be finite and ≤ 0: ${start}`);
  }

  return {
    depthDb: clampDepth(start, min, max),
    consecutiveCorrect: 0,
    trialCount: 0,
    lastStepDirection: null,
    reversalCount: 0,
    history: [],
    done: false,
  };
}

/**
 * 한 시행 정오답 반영.
 * 연속 2정 → depthDb −step(더 어렵게), 1오 → depthDb +step(더 쉽게, 상한 0).
 */
export function applyAmStaircaseResult(
  state: AmStaircaseState,
  correct: boolean,
  options: ApplyAmStaircaseResultOptions = {}
): AmStaircaseState {
  if (state.done) {
    return state;
  }

  const min = options.minDepthDb ?? MIN_DEPTH_DB;
  const max = options.maxDepthDb ?? MAX_DEPTH_DB;
  const coarse = options.coarseStepDb ?? COARSE_STEP_DB;
  const fine = options.fineStepDb ?? FINE_STEP_DB;
  const after = options.fineStepAfterReversals ?? FINE_STEP_AFTER_REVERSALS;
  const step = stepSizeFor(state.reversalCount, coarse, fine, after);
  const trialIndex = state.trialCount + 1;

  let consecutiveCorrect = state.consecutiveCorrect;
  let depthDb = state.depthDb;
  let lastStepDirection = state.lastStepDirection;
  let reversalCount = state.reversalCount;
  let stepped = false;
  let reversal = false;
  let stepDirection: StaircaseDirection | null = null;

  if (correct) {
    consecutiveCorrect += 1;
    if (consecutiveCorrect >= 2) {
      consecutiveCorrect = 0;
      const next = clampDepth(depthDb - step, min, max);
      if (next !== depthDb) {
        stepped = true;
        // 더 어려움(더 음수) = down
        stepDirection = 'down';
        depthDb = next;
      }
    }
  } else {
    consecutiveCorrect = 0;
    const next = clampDepth(depthDb + step, min, max);
    if (next !== depthDb) {
      stepped = true;
      // 더 쉬움(0에 가까움) = up
      stepDirection = 'up';
      depthDb = next;
    }
  }

  if (
    stepped &&
    stepDirection &&
    lastStepDirection &&
    stepDirection !== lastStepDirection
  ) {
    reversal = true;
    reversalCount += 1;
  }

  if (stepped && stepDirection) {
    lastStepDirection = stepDirection;
  }

  const record: AmStaircaseTrialRecord = {
    trialIndex,
    depthDb: state.depthDb,
    correct,
    stepped,
    reversal,
    stepDb: step,
  };

  return {
    depthDb,
    consecutiveCorrect,
    trialCount: trialIndex,
    lastStepDirection,
    reversalCount,
    history: [...state.history, record],
    done: false,
  };
}
