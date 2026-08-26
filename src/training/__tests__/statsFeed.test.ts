import type { SavedSessionRecord } from "@/training/sessionStore";
import {
  countOfKind,
  sessionRowsOfKind,
  type StatsFeed,
} from "@/training/statsFeed";

function localIso(
  year: number,
  month: number,
  day: number,
  hour = 9,
): string {
  return new Date(year, month - 1, day, hour).toISOString();
}

function amRecord(savedAt: string): SavedSessionRecord {
  return {
    id: `am-${savedAt}`,
    track: "am",
    savedAt,
    schemaVersion: 1,
    mode: "measure",
    summary: {
      trialCount: 20,
      reversalCount: 6,
      endReason: "reversals",
      meanReversalDepthDb: -6,
      easiestDepthDb: -6,
      hardestDepthDb: -14,
      correctCount: 15,
    },
  };
}

function pitch2Record(savedAt: string): SavedSessionRecord {
  return {
    id: `pitch2-${savedAt}`,
    track: "pitch2",
    savedAt,
    schemaVersion: 1,
    mode: "measure",
    summary: {
      trialCount: 20,
      correctCount: 15,
      reversalCount: 6,
      endReason: "reversals",
      meanReversalCents: 40,
      easiestCents: 200,
      hardestCents: 30,
    },
  };
}

const EMPTY: StatsFeed = {
  ling6: [],
  sessions: [],
  wrs1: [],
  wrs2: [],
  sent: [],
};

describe("countOfKind · sessionRowsOfKind", () => {
  it("종목별로 세고, 같은 상자여도 트랙이 섞이지 않는다", () => {
    const feed: StatsFeed = {
      ...EMPTY,
      sessions: [
        pitch2Record(localIso(2026, 8, 20)),
        pitch2Record(localIso(2026, 8, 19)),
        amRecord(localIso(2026, 8, 18)),
      ],
    };

    expect(countOfKind(feed, "pitch2")).toBe(2);
    expect(countOfKind(feed, "freq")).toBe(0);
    expect(countOfKind(feed, "am")).toBe(1);
    expect(sessionRowsOfKind(feed, "freq")).toEqual([]);
    expect(sessionRowsOfKind(feed, "am")).toHaveLength(1);
  });
});
