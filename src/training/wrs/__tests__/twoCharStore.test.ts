jest.mock("@react-native-async-storage/async-storage", () => {
  let store: Record<string, string> = {};
  const delay = () => new Promise<void>((resolve) => setTimeout(resolve, 0));

  return {
    __esModule: true,
    default: {
      getItem: async (key: string): Promise<string | null> => {
        await delay();
        return store[key] ?? null;
      },
      setItem: async (key: string, value: string): Promise<void> => {
        await delay();
        store[key] = value;
      },
      removeItem: async (key: string): Promise<void> => {
        await delay();
        delete store[key];
      },
      __reset: (): void => {
        store = {};
      },
    },
  };
});

import AsyncStorage from "@react-native-async-storage/async-storage";

import { TWO_CHAR_TRIAL_COUNT } from "@/training/wrs/twoCharLists";
import {
  appendTwoCharSummary,
  clearTwoCharRecords,
  listTwoCharRecords,
  MAX_TWO_CHAR_SESSIONS,
} from "@/training/wrs/twoCharStore";

const storageMock = AsyncStorage as unknown as { __reset: () => void };

function fullSummary(correctCount: number) {
  return {
    trialCount: TWO_CHAR_TRIAL_COUNT,
    correctCount,
    percent: Math.round((100 * correctCount) / TWO_CHAR_TRIAL_COUNT),
  };
}

describe("twoCharStore", () => {
  beforeEach(() => {
    storageMock.__reset();
  });

  it("최신이 앞에 오고 50건을 넘으면 오래된 것을 버린다", async () => {
    for (let i = 0; i < MAX_TWO_CHAR_SESSIONS + 2; i += 1) {
      await appendTwoCharSummary(
        fullSummary(i % 13),
        new Date(2026, 7, 1, 12, i),
      );
    }
    const rows = await listTwoCharRecords();
    expect(rows).toHaveLength(MAX_TWO_CHAR_SESSIONS);
    expect(rows[0]?.summary.correctCount).toBe((MAX_TWO_CHAR_SESSIONS + 1) % 13);
  });

  it("12개가 아니면 저장하지 않는다", async () => {
    await expect(
      appendTwoCharSummary({ trialCount: 3, correctCount: 2, percent: 67 }),
    ).rejects.toThrow("two-char record needs a full 12-trial list");
    expect(await listTwoCharRecords()).toHaveLength(0);
  });

  it("지우면 목록이 비다", async () => {
    await appendTwoCharSummary(fullSummary(10));
    await clearTwoCharRecords();
    expect(await listTwoCharRecords()).toHaveLength(0);
  });
});
