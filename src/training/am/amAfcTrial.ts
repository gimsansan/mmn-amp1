import {
  DEFAULT_DURATION_SEC,
  DEFAULT_GAIN,
  DEFAULT_RAMP_SEC,
} from '@/audio/pureTone';
import {
  DEFAULT_CARRIER_HZ,
  DEFAULT_MOD_HZ,
  mFromDepthDb,
  playAmTone,
  stopAmTone,
} from '@/audio/amTone';
import { DEFAULT_AFC_N, DEFAULT_ISI_SEC } from '@/training/freq/freqAfcTrial';

/** 확인용 고정 깊이(dB). m=1 → 0 dB. 적응은 ① 계단식. */
export const DEFAULT_TRIAL_DEPTH_DB = 0;

export type AmAfcTrial = {
  n: number;
  carrierHz: number;
  modHz: number;
  depthDb: number;
  m: number;
  /** 변조(오드볼) 구간 인덱스 0..n-1 */
  oddIndex: number;
  /** 구간별 변조 깊이 m (오드볼만 >0) */
  intervalM: number[];
};

export type CreateAmAfcTrialOptions = {
  n?: number;
  carrierHz?: number;
  modHz?: number;
  /** 20·log₁₀ m, ≤0. 기본 0 dB(m=1). */
  depthDb?: number;
  oddIndex?: number;
  random?: () => number;
};

export type PlayAmAfcTrialOptions = {
  durationSec?: number;
  isiSec?: number;
  gain?: number;
  rampSec?: number;
  shouldAbort?: () => boolean;
};

export type AmAfcChoiceResult = {
  correct: boolean;
  chosenIndex: number;
  oddIndex: number;
  depthDb: number;
  m: number;
};

function assertPositiveInt(name: string, value: number): void {
  if (!Number.isInteger(value) || value < 2) {
    throw new RangeError(`${name} must be an integer >= 2: ${value}`);
  }
}

/**
 * 한 시행 자극 스펙 생성.
 * n-1개 무변조 + 1개 AM(깊이 m). 과제: “떨리는 것” 구간 고르기.
 */
export function createAmAfcTrial(
  options: CreateAmAfcTrialOptions = {}
): AmAfcTrial {
  const n = options.n ?? DEFAULT_AFC_N;
  const carrierHz = options.carrierHz ?? DEFAULT_CARRIER_HZ;
  const modHz = options.modHz ?? DEFAULT_MOD_HZ;
  const depthDb = options.depthDb ?? DEFAULT_TRIAL_DEPTH_DB;
  const random = options.random ?? Math.random;

  assertPositiveInt('n', n);
  if (!Number.isFinite(carrierHz) || carrierHz <= 0) {
    throw new RangeError(`carrierHz must be a positive finite number: ${carrierHz}`);
  }
  if (!Number.isFinite(modHz) || modHz <= 0) {
    throw new RangeError(`modHz must be a positive finite number: ${modHz}`);
  }
  if (!Number.isFinite(depthDb) || depthDb > 0) {
    throw new RangeError(`depthDb must be finite and ≤ 0: ${depthDb}`);
  }

  const m = mFromDepthDb(depthDb);
  if (m > 1) {
    throw new RangeError(`m from depthDb exceeds 1: ${m}`);
  }

  const oddIndex =
    options.oddIndex ?? Math.min(n - 1, Math.floor(random() * n));
  if (!Number.isInteger(oddIndex) || oddIndex < 0 || oddIndex >= n) {
    throw new RangeError(`oddIndex out of range: ${oddIndex}`);
  }

  const intervalM = Array.from({ length: n }, (_, i) =>
    i === oddIndex ? m : 0
  );

  return {
    n,
    carrierHz,
    modHz,
    depthDb,
    m,
    oddIndex,
    intervalM,
  };
}

function sleep(ms: number, shouldAbort?: () => boolean): Promise<void> {
  return new Promise((resolve, reject) => {
    if (shouldAbort?.()) {
      reject(new Error('ABORTED'));
      return;
    }
    const started = Date.now();
    const tick = () => {
      if (shouldAbort?.()) {
        reject(new Error('ABORTED'));
        return;
      }
      const left = ms - (Date.now() - started);
      if (left <= 0) {
        resolve();
        return;
      }
      setTimeout(tick, Math.min(50, left));
    };
    setTimeout(tick, Math.min(50, ms));
  });
}

/** 구간을 순서대로 재생. 자극 중 입력은 UI에서 막는다. */
export async function playAmAfcTrial(
  trial: AmAfcTrial,
  options: PlayAmAfcTrialOptions = {}
): Promise<void> {
  const durationSec = options.durationSec ?? DEFAULT_DURATION_SEC;
  const isiSec = options.isiSec ?? DEFAULT_ISI_SEC;
  const gain = options.gain ?? DEFAULT_GAIN;
  const rampSec = options.rampSec ?? DEFAULT_RAMP_SEC;
  const shouldAbort = options.shouldAbort;

  for (let i = 0; i < trial.intervalM.length; i++) {
    if (shouldAbort?.()) {
      stopAmTone();
      throw new Error('ABORTED');
    }

    await playAmTone({
      carrierHz: trial.carrierHz,
      modHz: trial.modHz,
      m: trial.intervalM[i],
      durationSec,
      gain,
      rampSec,
    });

    if (shouldAbort?.()) {
      stopAmTone();
      throw new Error('ABORTED');
    }

    if (i < trial.intervalM.length - 1 && isiSec > 0) {
      await sleep(Math.round(isiSec * 1000), shouldAbort);
    }
  }
}

export function scoreAmAfcChoice(
  trial: AmAfcTrial,
  chosenIndex: number
): AmAfcChoiceResult {
  if (
    !Number.isInteger(chosenIndex) ||
    chosenIndex < 0 ||
    chosenIndex >= trial.n
  ) {
    throw new RangeError(`chosenIndex out of range: ${chosenIndex}`);
  }

  return {
    correct: chosenIndex === trial.oddIndex,
    chosenIndex,
    oddIndex: trial.oddIndex,
    depthDb: trial.depthDb,
    m: trial.m,
  };
}

export function abortAmAfcPlayback(): void {
  stopAmTone();
}
