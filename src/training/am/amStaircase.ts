/**
 * ① AM 깊이(MDT) — 2-down-1-up 계단식 (dB = 20·log₁₀ m).
 * 설계 §6 제안: 시작 0 dB(m=1), 스텝 6→반전 2회 후 2 dB. 임상 역치 아님.
 */

/** 가장 쉬움(m=1). */
export const MAX_DEPTH_DB = 0;

/**
 * 하한(가장 어려움). −40은 일반인도 감지 불가라 −30으로 완화(설계 목적값, 미검증).
 * m ≈ 0.032 (−30 dB).
 * `주의`: 바닥 반전 몰림(역치 뭉개짐)은 −30으로 완화만, 근본 해결 아님.
 */
export const MIN_DEPTH_DB = -30;

export const COARSE_STEP_DB = 6;
export const FINE_STEP_DB = 2;

/**
 * 3단계 가변 스텝 표(6→4→2, 전환 반전 2·4). freq/pitch2 스케줄과 같은 구조.
 * `fromReversal` 이상의 반전 횟수에서 해당 `step`을 적용한다.
 */
export const STEP_SCHEDULE_DB = [
  { fromReversal: 0, step: COARSE_STEP_DB },
  { fromReversal: 2, step: 4 },
  { fromReversal: 4, step: FINE_STEP_DB },
] as const;

/**
 * @deprecated 2단계 시절 상수. 3단계 `STEP_SCHEDULE_DB`로 대체됨(호환용 유지).
 */
export const FINE_STEP_AFTER_REVERSALS = 4;

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

export type AmStepScheduleEntry = { fromReversal: number; step: number };

export type ApplyAmStaircaseResultOptions = {
  minDepthDb?: number;
  maxDepthDb?: number;
  /** 반전 수 기준 가변 스텝 표. 없으면 `STEP_SCHEDULE_DB`. */
  stepSchedule?: readonly AmStepScheduleEntry[];
};

function clampDepth(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/**
 * 반전 횟수에 대응하는 조정 폭(dB). 스케줄에서 `fromReversal <= reversalCount`인
 * 항목 중 마지막 값을 쓴다.
 */
function stepSizeFor(
  reversalCount: number,
  schedule: readonly AmStepScheduleEntry[]
): number {
  let step: number = schedule[0].step;
  for (const entry of schedule) {
    if (reversalCount >= entry.fromReversal) {
      step = entry.step;
    }
  }
  return step;
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
  const schedule = options.stepSchedule ?? STEP_SCHEDULE_DB;
  const step = stepSizeFor(state.reversalCount, schedule);
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
