/**
 * ② 주파수 변별 — 2-down-1-up 계단식 (cent).
 * pitch2(높낮이 비교)와 파라미터 통일: 시작 200, 10~300, 가변 스텝 50→20→10.
 * 임상 역치 확정용이 아님(훈련 적응). 값은 설계 목적값(미검증).
 */

export const MIN_DELTA_CENTS = 10;
export const MAX_DELTA_CENTS = 300;

/**
 * 가변 스텝 표 — 반전이 쌓일수록 조정 폭을 좁힌다(pitch2 `STAIRCASE.STEP_SCHEDULE`와 동일).
 * 초반엔 크게 움직여 빨리 수렴시키고, 자기 수준 근처에서는 미세 조정한다.
 * `fromReversal` 이상의 반전 횟수에서 해당 `step`을 적용한다.
 */
export const STEP_SCHEDULE = [
  { fromReversal: 0, step: 50 },
  { fromReversal: 2, step: 20 },
  { fromReversal: 4, step: 10 },
] as const;

/**
 * 하위호환용 기본 스텝(스케줄 0단계와 동일). `stepCents` 옵션을 명시하면 고정 스텝으로 동작.
 * @deprecated 스케줄 기반(`STEP_SCHEDULE`)을 쓴다. 고정 스텝이 꼭 필요할 때만 옵션으로 전달.
 */
export const STEP_CENTS = STEP_SCHEDULE[0].step;

/** 쉬운 쪽(큰 Δ)에서 시작 — pitch2와 동일. 시작값 설계 목적값(미검증). */
export const DEFAULT_START_DELTA_CENTS = 200;

/**
 * 반전 횟수에 대응하는 조정 폭. `STEP_SCHEDULE`에서 `fromReversal <= reversalCount`인
 * 항목 중 마지막 값을 쓴다.
 */
export function stepForReversals(reversalCount: number): number {
  let step: number = STEP_SCHEDULE[0].step;
  for (const entry of STEP_SCHEDULE) {
    if (reversalCount >= entry.fromReversal) {
      step = entry.step;
    }
  }
  return step;
}

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
  /** 다음 조정에 적용될 폭(cent). 반전 스케줄에 따라 좁아진다. */
  currentStep: number;
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
    currentStep: stepForReversals(0),
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
  // stepCents를 명시하면 고정 스텝, 없으면 반전 수 기준 가변 스텝(스케줄).
  const step = options.stepCents ?? state.currentStep;
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

  const nextStep =
    options.stepCents != null ? step : stepForReversals(reversalCount);

  return {
    deltaCents,
    consecutiveCorrect,
    trialCount: trialIndex,
    lastStepDirection,
    reversalCount,
    currentStep: nextStep,
    history: [...state.history, record],
    done: false,
  };
}
