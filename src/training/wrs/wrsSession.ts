import {
  buildChoices,
  shuffleInPlace,
  type ConfusionAxis,
  type Rng,
  type WrsDifficulty,
} from "@/training/wrs/wrsDistractors";
import { WRS_WORDS } from "@/training/wrs/wrsWords";

/** 한 목록 길이. 관례상 25단어 전후. */
export const WRS_TRIAL_COUNT = 25;

export type WrsTrial = {
  target: string;
  choices: readonly [string, string, string, string];
  axis: ConfusionAxis;
  difficulty: WrsDifficulty;
};

export type WrsTrialOutcome = {
  target: string;
  choice: string;
  correct: boolean;
  axis: ConfusionAxis;
};

export type WrsSessionSummary = {
  trialCount: number;
  correctCount: number;
  percent: number;
};

export function createWrsTrials(rng: Rng = Math.random): WrsTrial[] {
  const picked = shuffleInPlace([...WRS_WORDS], rng).slice(0, WRS_TRIAL_COUNT);
  return picked.map((target) => {
    const built = buildChoices(target, rng);
    return {
      target,
      choices: built.choices,
      axis: built.axis,
      difficulty: built.difficulty,
    };
  });
}

export function scoreWrsChoice(target: string, choice: string): boolean {
  return target === choice;
}

export function summarizeWrs(
  outcomes: readonly WrsTrialOutcome[],
): WrsSessionSummary {
  const trialCount = outcomes.length;
  const correctCount = outcomes.filter((row) => row.correct).length;
  const percent =
    trialCount === 0 ? 0 : Math.round((100 * correctCount) / trialCount);
  return { trialCount, correctCount, percent };
}

export function wrsResultCopy(summary: WrsSessionSummary): string {
  if (summary.trialCount <= 0) {
    return "연습이 짧아서 참고할 숫자가 없어요";
  }
  return `${summary.trialCount}개 중 ${summary.correctCount}개를 맞혔어요`;
}

export function wrsPercentCopy(summary: WrsSessionSummary): string {
  if (summary.trialCount <= 0) {
    return "";
  }
  return `맞힌 비율 약 ${summary.percent}%`;
}
