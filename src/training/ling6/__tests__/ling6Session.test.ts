import {
  collectPhonemeResults,
  createLing6Trials,
  highFreqPassCount,
  isCompletePhonemeMap,
  ling6HighFreqCopy,
  ling6ProgressCopy,
  ling6ResultCopy,
  passCountOf,
  scoreLing6Choice,
  SILENCE_TRIAL_COUNT,
  SOUND_TRIAL_COUNT,
  toDailySummary,
  TOTAL_TRIAL_COUNT,
} from "@/training/ling6/ling6Session";
import { LING6_SOUND_IDS } from "@/training/ling6/sounds";

const ALL_PASS = {
  m: true,
  u: true,
  a: true,
  i: true,
  sh: true,
  s: true,
} as const;

describe("createLing6Trials", () => {
  it("6개 소리를 한 번씩 넣고 무음 2개를 섞으며 첫 시행은 소리다", () => {
    for (let n = 0; n < 20; n += 1) {
      const trials = createLing6Trials();
      expect(trials).toHaveLength(TOTAL_TRIAL_COUNT);

      const sounds = trials
        .filter((trial) => trial.target !== "silence")
        .map((trial) => trial.target);
      const silences = trials.filter((trial) => trial.target === "silence");

      expect(sounds).toHaveLength(SOUND_TRIAL_COUNT);
      expect(silences).toHaveLength(SILENCE_TRIAL_COUNT);
      expect([...sounds].sort()).toEqual([...LING6_SOUND_IDS].sort());
      expect(trials[0]?.target).not.toBe("silence");
    }
  });
});

describe("scoreLing6Choice", () => {
  it("같은 선택이면 맞다", () => {
    expect(scoreLing6Choice("a", "a")).toBe(true);
    expect(scoreLing6Choice("silence", "silence")).toBe(true);
  });

  it("다른 선택이면 틀리다", () => {
    expect(scoreLing6Choice("a", "i")).toBe(false);
    expect(scoreLing6Choice("s", "silence")).toBe(false);
    expect(scoreLing6Choice("silence", "m")).toBe(false);
  });
});

describe("음소 요약", () => {
  it("무음을 빼고 6음을 다 고르면 완료 기록이 된다", () => {
    const map = collectPhonemeResults([
      { target: "m", correct: true },
      { target: "silence", correct: true },
      { target: "u", correct: false },
      { target: "a", correct: true },
      { target: "i", correct: true },
      { target: "sh", correct: false },
      { target: "s", correct: true },
      { target: "silence", correct: false },
    ]);

    expect(isCompletePhonemeMap(map)).toBe(true);
    if (!isCompletePhonemeMap(map)) {
      return;
    }
    expect(passCountOf(map)).toBe(4);
    expect(toDailySummary(map).passCount).toBe(4);
    expect(highFreqPassCount(map)).toBe(1);
  });

  it("6음을 다 고르지 않으면 날짜 기록이 아니다", () => {
    const map = collectPhonemeResults([
      { target: "m", correct: true },
      { target: "silence", correct: false },
    ]);
    expect(isCompletePhonemeMap(map)).toBe(false);
  });
});

describe("요약 문구", () => {
  it("맞힌 개수로 기록 문장을 만든다", () => {
    expect(ling6ResultCopy(4)).toBe("이번 기록에서 6개 중 4개를 맞혔어요");
  });

  it("직전 날짜 기록이 없으면 비교 문구가 없다", () => {
    expect(ling6ProgressCopy(null, 5)).toBeNull();
  });

  it("직전보다 늘면 개수를 넣어 말한다", () => {
    expect(ling6ProgressCopy(4, 6)).toBe("지난 기록보다 2개 늘었어요");
  });

  it("직전보다 줄면 감소 문구", () => {
    expect(ling6ProgressCopy(6, 4)).toBe("지난 기록보다 2개 줄었어요");
  });

  it("같으면 유지 문구", () => {
    expect(ling6ProgressCopy(5, 5)).toBe("지난 기록과 같은 개수를 맞혔어요");
  });

  it("고음이 지난주보다 늘었을 때만 고음 문구", () => {
    expect(
      ling6HighFreqCopy({ ...ALL_PASS, sh: false, s: false }, ALL_PASS),
    ).toBe("고음(/s/·/ʃ/)이 지난주보다 좋아지고 있어요");
    expect(ling6HighFreqCopy(ALL_PASS, ALL_PASS)).toBeNull();
    expect(ling6HighFreqCopy(null, ALL_PASS)).toBeNull();
  });
});
