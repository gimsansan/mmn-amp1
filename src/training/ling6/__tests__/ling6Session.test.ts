import {
  createLing6Trials,
  ling6ProgressCopy,
  ling6ResultCopy,
  scoreLing6Choice,
  SILENCE_TRIAL_COUNT,
  SOUND_TRIAL_COUNT,
  summarizeLing6Session,
  TOTAL_TRIAL_COUNT,
} from "@/training/ling6/ling6Session";
import { LING6_SOUND_IDS } from "@/training/ling6/sounds";

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

describe("요약 문구", () => {
  it("맞힌 개수로 연습 결과 문장을 만든다", () => {
    expect(
      ling6ResultCopy({ trialCount: 8, correctCount: 6 }),
    ).toBe("이번 연습에서 8개 중 6개를 맞혔어요");
  });

  it("직전 기록이 없으면 비교 문구가 없다", () => {
    expect(ling6ProgressCopy(null, 5)).toBeNull();
  });

  it("직전보다 늘면 향상 문구", () => {
    expect(ling6ProgressCopy(4, 6)).toBe("지난번보다 맞힌 개수가 늘었어요");
  });

  it("직전보다 줄면 감소 문구", () => {
    expect(ling6ProgressCopy(6, 4)).toBe("지난번보다 맞힌 개수가 줄었어요");
  });

  it("같으면 유지 문구", () => {
    expect(ling6ProgressCopy(5, 5)).toBe("지난번과 같은 개수를 맞혔어요");
  });
});

describe("summarizeLing6Session", () => {
  it("정오 배열을 개수로 접는다", () => {
    expect(summarizeLing6Session([true, false, true, true])).toEqual({
      trialCount: 4,
      correctCount: 3,
    });
  });
});
