import {
  DEFAULT_DURATION_SEC,
  DEFAULT_GAIN,
  DEFAULT_RAMP_SEC,
  DEFAULT_REFERENCE_HZ,
  playPureTone,
  stopPureTone,
} from '@/audio/pureTone';
import { hzFromCents } from '@/audio/cents';

/** n 미확정 → 3AFC를 확인용 기본으로 둠(심리음향 관례에 흔한 선택). */
export const DEFAULT_AFC_N = 3;

/** 계단식 전 확인용 고정 Δ. 10~150 범위 안. 적응은 ②-3. */
export const DEFAULT_TRIAL_DELTA_CENTS = 50;

/** 자극 간 묵음(ISI). 스펙 미확정. */
export const DEFAULT_ISI_SEC = 0.35;

export type FreqAfcTrial = {
  n: number;
  referenceHz: number;
  deltaCents: number;
  /** 다른 음(오드볼) 구간 인덱스 0..n-1 */
  oddIndex: number;
  /** +1 = 기준보다 높음, -1 = 낮음 */
  oddSign: 1 | -1;
  /** 구간별 주파수 */
  intervalHz: number[];
};

export type CreateFreqAfcTrialOptions = {
  n?: number;
  referenceHz?: number;
  deltaCents?: number;
  /** 테스트용 고정. 없으면 균등 난수. */
  oddIndex?: number;
  oddSign?: 1 | -1;
  random?: () => number;
};

export type PlayFreqAfcTrialOptions = {
  durationSec?: number;
  isiSec?: number;
  gain?: number;
  rampSec?: number;
  /** true면 재생 루프 중단 */
  shouldAbort?: () => boolean;
};

export type FreqAfcChoiceResult = {
  correct: boolean;
  chosenIndex: number;
  oddIndex: number;
  deltaCents: number;
};

function assertPositiveInt(name: string, value: number): void {
  if (!Number.isInteger(value) || value < 2) {
    throw new RangeError(`${name} must be an integer >= 2: ${value}`);
  }
}

/**
 * 한 시행 자극 스펙 생성.
 * n-1개 기준음 + 1개 (기준 ± Δcent). 과제: “다른 음” 구간 고르기.
 */
export function createFreqAfcTrial(
  options: CreateFreqAfcTrialOptions = {}
): FreqAfcTrial {
  const n = options.n ?? DEFAULT_AFC_N;
  const referenceHz = options.referenceHz ?? DEFAULT_REFERENCE_HZ;
  const deltaCents = options.deltaCents ?? DEFAULT_TRIAL_DELTA_CENTS;
  const random = options.random ?? Math.random;

  assertPositiveInt('n', n);
  if (!Number.isFinite(referenceHz) || referenceHz <= 0) {
    throw new RangeError(`referenceHz must be a positive finite number: ${referenceHz}`);
  }
  if (!Number.isFinite(deltaCents) || deltaCents <= 0) {
    throw new RangeError(`deltaCents must be a positive finite number: ${deltaCents}`);
  }

  const oddIndex =
    options.oddIndex ?? Math.min(n - 1, Math.floor(random() * n));
  if (!Number.isInteger(oddIndex) || oddIndex < 0 || oddIndex >= n) {
    throw new RangeError(`oddIndex out of range: ${oddIndex}`);
  }

  const oddSign: 1 | -1 =
    options.oddSign ?? (random() < 0.5 ? -1 : 1);

  const oddHz = hzFromCents(referenceHz, oddSign * deltaCents);
  const intervalHz = Array.from({ length: n }, (_, i) =>
    i === oddIndex ? oddHz : referenceHz
  );

  return {
    n,
    referenceHz,
    deltaCents,
    oddIndex,
    oddSign,
    intervalHz,
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

/**
 * 구간을 순서대로 재생(동일 duration·gain·ramp). 자극 중 입력은 UI에서 막는다.
 */
export async function playFreqAfcTrial(
  trial: FreqAfcTrial,
  options: PlayFreqAfcTrialOptions = {}
): Promise<void> {
  const durationSec = options.durationSec ?? DEFAULT_DURATION_SEC;
  const isiSec = options.isiSec ?? DEFAULT_ISI_SEC;
  const gain = options.gain ?? DEFAULT_GAIN;
  const rampSec = options.rampSec ?? DEFAULT_RAMP_SEC;
  const shouldAbort = options.shouldAbort;

  for (let i = 0; i < trial.intervalHz.length; i++) {
    if (shouldAbort?.()) {
      stopPureTone();
      throw new Error('ABORTED');
    }

    await playPureTone({
      frequencyHz: trial.intervalHz[i],
      durationSec,
      gain,
      rampSec,
    });

    if (shouldAbort?.()) {
      stopPureTone();
      throw new Error('ABORTED');
    }

    if (i < trial.intervalHz.length - 1 && isiSec > 0) {
      await sleep(Math.round(isiSec * 1000), shouldAbort);
    }
  }
}

export function scoreFreqAfcChoice(
  trial: FreqAfcTrial,
  chosenIndex: number
): FreqAfcChoiceResult {
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
    deltaCents: trial.deltaCents,
  };
}

export function abortFreqAfcPlayback(): void {
  stopPureTone();
}
