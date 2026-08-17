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

import {
  appendLing6SessionSummary,
  listLing6Sessions,
  MAX_LING6_SESSIONS,
  peekPreviousCorrectCount,
} from "@/training/ling6/ling6Store";

const storageMock = AsyncStorage as unknown as { __reset: () => void };

describe("ling6Store", () => {
  beforeEach(() => {
    storageMock.__reset();
  });

  it("요약을 앞에 쌓고 직전 맞힌 개수를 읽는다", async () => {
    expect(await peekPreviousCorrectCount()).toBeNull();

    await appendLing6SessionSummary({ trialCount: 8, correctCount: 5 });
    expect(await peekPreviousCorrectCount()).toBe(5);

    await appendLing6SessionSummary({ trialCount: 8, correctCount: 7 });
    expect(await peekPreviousCorrectCount()).toBe(7);

    const rows = await listLing6Sessions();
    expect(rows).toHaveLength(2);
    expect(rows[0]?.summary.correctCount).toBe(7);
    expect(rows[1]?.summary.correctCount).toBe(5);
  });

  it(`보관 상한 ${MAX_LING6_SESSIONS}을 넘으면 오래된 것부터 버린다`, async () => {
    for (let i = 0; i < MAX_LING6_SESSIONS + 3; i += 1) {
      await appendLing6SessionSummary({ trialCount: 8, correctCount: i });
    }

    const rows = await listLing6Sessions();
    expect(rows).toHaveLength(MAX_LING6_SESSIONS);
    expect(rows[0]?.summary.correctCount).toBe(MAX_LING6_SESSIONS + 2);
  });
});
