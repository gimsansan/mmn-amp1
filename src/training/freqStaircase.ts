/**
 * ② 주파수 변별 — 2-down-1-up 계단식 (cent).
 * HarmoniTune 재사용: ±10, 10~150. 임상 역치 확정용이 아님(훈련 적응).
 */

export const MIN_DELTA_CENTS = 10;
export const MAX_DELTA_CENTS = 150;
export const STEP_CENTS = 10;

/** 쉬운 쪽(큰 Δ)에서 시작 — HarmoniTune류 관례. 시작값 파일럿 추정. */
export const DEFAULT_START_DELTA_CENTS = 150;

export type StaircaseDirection = 'up' | 'down';

export type StaircaseTrialRecord = {
  trialIndex: number;
  deltaCents: number;
  correct: boolean;
  /** 이번 응답으로 Δ가 바뀌었는지 */
  stepped: boolean;
  /** 직전 스텝 방향과 반대면 반전 */
  reversal: boolean;
};

export type FreqStaircaseState = {
  deltaCents: number;
  consecutiveCorrect: number;
  trialCount: number;
  /** 마지막 Δ 변경 방향(반전 판정용). 아직 스텝 없으면 null */
  lastStepDirection: StaircaseDirection | null;
  reversalCount: number;
  history: StaircaseTrialRecord[];
  done: boolean;
};

export type CreateFreqStaircaseOptions = {
  startDeltaCents?: number;
  minDeltaCents?: number;
  maxDeltaCents?: number;
  stepCents?: number;
};

export type ApplyStaircaseResultOptions = {
  minDeltaCents?: number;
  maxDeltaCents?: number;
  stepCents?: number;
};

function clampDelta(
  value: number,
  min: number,
  max: number
): number {
  return Math.min(max, Math.max(min, value));
}

export function createFreqStaircase(
  options: CreateFreqStaircaseOptions = {}
): FreqStaircaseState {
  const min = options.minDeltaCents ?? MIN_DELTA_CENTS;
  const max = options.maxDeltaCents ?? MAX_DELTA_CENTS;
  const start = options.startDeltaCents ?? DEFAULT_START_DELTA_CENTS;

  if (!Number.isFinite(min) || !Number.isFinite(max) || min > max) {
    throw new RangeError(`invalid min/max: ${min}..${max}`);
  }
  if (!Number.isFinite(start)) {
    throw new RangeError(`startDeltaCents must be finite: ${start}`);
  }

  return {
    deltaCents: clampDelta(start, min, max),
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
 * 연속 2정 → Δ −step(더 어렵게), 1오 → Δ +step(더 쉽게). 범위 clamp.
 */
export function applyStaircaseResult(
  state: FreqStaircaseState,
  correct: boolean,
  options: ApplyStaircaseResultOptions = {}
): FreqStaircaseState {
  if (state.done) {
    return state;
  }

  const min = options.minDeltaCents ?? MIN_DELTA_CENTS;
  const max = options.maxDeltaCents ?? MAX_DELTA_CENTS;
  const step = options.stepCents ?? STEP_CENTS;
  const trialIndex = state.trialCount + 1;

  let consecutiveCorrect = state.consecutiveCorrect;
  let deltaCents = state.deltaCents;
  let lastStepDirection = state.lastStepDirection;
  let reversalCount = state.reversalCount;
  let stepped = false;
  let reversal = false;
  let stepDirection: StaircaseDirection | null = null;

  if (correct) {
    consecutiveCorrect += 1;
    if (consecutiveCorrect >= 2) {
      consecutiveCorrect = 0;
      const next = clampDelta(deltaCents - step, min, max);
      if (next !== deltaCents) {
        stepped = true;
        stepDirection = 'down';
        deltaCents = next;
      }
      // 하한에 붙으면 Δ 불변. 연속정답 카운트만 리셋(2-down 소모).
    }
  } else {
    consecutiveCorrect = 0;
    const next = clampDelta(deltaCents + step, min, max);
    if (next !== deltaCents) {
      stepped = true;
      stepDirection = 'up';
      deltaCents = next;
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

  const record: StaircaseTrialRecord = {
    trialIndex,
    deltaCents: state.deltaCents,
    correct,
    stepped,
    reversal,
  };

  return {
    deltaCents,
    consecutiveCorrect,
    trialCount: trialIndex,
    lastStepDirection,
    reversalCount,
    history: [...state.history, record],
    done: false,
  };
}
