import {
  LING6_SOUND_IDS,
  type Ling6Choice,
  type Ling6SoundId,
} from "@/training/ling6/sounds";

export type Ling6Trial = {
  target: Ling6Choice;
};

export type Ling6SessionSummary = {
  trialCount: number;
  correctCount: number;
};

/** 소리 시행 = 6음소 각 1회. 예측 방지를 위해 무음 2회를 섞는다. */
export const SOUND_TRIAL_COUNT = LING6_SOUND_IDS.length;
export const SILENCE_TRIAL_COUNT = 2;
export const TOTAL_TRIAL_COUNT = SOUND_TRIAL_COUNT + SILENCE_TRIAL_COUNT;

export type Rng = () => number;

function shuffleInPlace<T>(items: T[], rng: Rng): T[] {
  for (let i = items.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1));
    const current = items[i];
    const swap = items[j];
    if (current === undefined || swap === undefined) {
      continue;
    }
    items[i] = swap;
    items[j] = current;
  }
  return items;
}

/**
 * 6개 소리를 한 번씩 섞고, 무음 2개를 끼운다.
 * 첫 시행은 소리로 둔다(과제를 바로 이해하게).
 */
export function createLing6Trials(rng: Rng = Math.random): Ling6Trial[] {
  const sounds: Ling6SoundId[] = [...LING6_SOUND_IDS];
  shuffleInPlace(sounds, rng);
  const trials: Ling6Trial[] = sounds.map((id) => ({ target: id }));

  for (let n = 0; n < SILENCE_TRIAL_COUNT; n += 1) {
    const pos = 1 + Math.floor(rng() * trials.length);
    trials.splice(pos, 0, { target: "silence" });
  }

  return trials;
}

export function scoreLing6Choice(
  target: Ling6Choice,
  choice: Ling6Choice,
): boolean {
  return target === choice;
}

export function summarizeLing6Session(
  results: readonly boolean[],
): Ling6SessionSummary {
  return {
    trialCount: results.length,
    correctCount: results.filter(Boolean).length,
  };
}

/**
 * 그래프·요약 옆 문구. 판정("청력은 ○○")이 아니라 이번·지난 연습 비교.
 * 주 단위 집계는 아직 없어서 직전 연습과 비교한다.
 */
export function ling6ProgressCopy(
  previousCorrect: number | null,
  thisCorrect: number,
): string | null {
  if (previousCorrect === null) {
    return null;
  }
  if (thisCorrect > previousCorrect) {
    return "지난번보다 맞힌 개수가 늘었어요";
  }
  if (thisCorrect < previousCorrect) {
    return "지난번보다 맞힌 개수가 줄었어요";
  }
  return "지난번과 같은 개수를 맞혔어요";
}

export function ling6ResultCopy(summary: Ling6SessionSummary): string {
  return `이번 연습에서 ${summary.trialCount}개 중 ${summary.correctCount}개를 맞혔어요`;
}
