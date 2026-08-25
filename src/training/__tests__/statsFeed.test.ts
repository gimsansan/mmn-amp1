import type { SavedLing6Record } from "@/training/ling6/ling6Store";
import type { SavedSessionRecord } from "@/training/sessionStore";
import {
  countOfGroup,
  countOfKind,
  glanceLineCopy,
  glanceOfGroup,
  glanceOfKind,
  relativeDayCopy,
  sessionRowsOfKind,
  type StatsFeed,
} from "@/training/statsFeed";
import type { SavedTwoCharRecord } from "@/training/wrs/twoCharStore";
import type { SavedWrsRecord } from "@/training/wrs/wrsStore";

/** 기준 시각을 고정해야 「어제」가 오늘 날짜에 따라 흔들리지 않는다. */
const NOW = new Date(2026, 7, 21, 10, 0, 0); // 2026-08-21 10:00 로컬

function localIso(
  year: number,
  month: number,
  day: number,
  hour = 9,
): string {
  return new Date(year, month - 1, day, hour).toISOString();
}

function ling6Record(dateKey: string, passCount: number): SavedLing6Record {
  return {
    id: `ling6-${dateKey}`,
    dateKey,
    savedAt: `${dateKey}T09:00:00.000Z`,
    schemaVersion: 1,
    summary: {
      passCount,
      byPhoneme: { a: true, u: true, i: true, m: true, sh: false, s: false },
    },
  };
}

function wrsRecord(savedAt: string, correctCount: number): SavedWrsRecord {
  return {
    id: `wrs-${savedAt}`,
    savedAt,
    schemaVersion: 1,
    summary: {
      trialCount: 25,
      correctCount,
      percent: Math.round((correctCount / 25) * 100),
    },
  };
}

function twoCharRecord(
  savedAt: string,
  correctCount: number,
): SavedTwoCharRecord {
  return {
    id: `two-${savedAt}`,
    savedAt,
    schemaVersion: 1,
    summary: {
      trialCount: 12,
      correctCount,
      percent: Math.round((correctCount / 12) * 100),
    },
  };
}

function amRecord(
  savedAt: string,
  meanReversalDepthDb: number | null,
): SavedSessionRecord {
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
      meanReversalDepthDb,
      easiestDepthDb: -6,
      hardestDepthDb: -14,
      correctCount: 15,
    },
  };
}

function pitch2Record(
  savedAt: string,
  meanReversalCents: number | null,
): SavedSessionRecord {
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
      meanReversalCents,
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

describe("relativeDayCopy", () => {
  it("오늘·어제·N일 전을 구분한다", () => {
    expect(relativeDayCopy("2026-08-21", NOW)).toBe("오늘");
    expect(relativeDayCopy("2026-08-20", NOW)).toBe("어제");
    expect(relativeDayCopy("2026-08-18", NOW)).toBe("3일 전");
  });

  it("한 달이 넘으면 날짜로 적는다", () => {
    expect(relativeDayCopy("2026-07-01", NOW)).toBe("7월 1일");
  });

  /** 날짜키를 UTC로 읽으면 UTC+9에서 하루가 밀린다. */
  it("날짜키를 로컬 날짜로 읽는다", () => {
    const lateNight = new Date(2026, 7, 21, 23, 30);
    expect(relativeDayCopy("2026-08-21", lateNight)).toBe("오늘");
  });

  it("읽을 수 없는 값은 빈 문자열", () => {
    expect(relativeDayCopy("nope", NOW)).toBe("");
  });
});

describe("glanceOfKind", () => {
  it("링 6은 맞힌 개수를 6분의 몇으로 적는다", () => {
    const feed: StatsFeed = {
      ...EMPTY,
      ling6: [ling6Record("2026-08-19", 4), ling6Record("2026-08-20", 5)],
    };

    expect(glanceOfKind(feed, "ling6", NOW)).toEqual({
      occurredAt: "2026-08-20",
      whenCopy: "어제",
      resultCopy: "5/6 맞힘",
    });
  });

  it("한 글자는 맞힌 수와 비율을 함께 적는다", () => {
    const feed: StatsFeed = {
      ...EMPTY,
      wrs1: [wrsRecord(localIso(2026, 8, 21), 21)],
    };

    expect(glanceLineCopy(glanceOfKind(feed, "wrs1", NOW))).toBe(
      "오늘 · 21/25 · 84%",
    );
  });

  it("떨림은 대표 깊이를 dB로 적는다", () => {
    const feed: StatsFeed = {
      ...EMPTY,
      sessions: [amRecord(localIso(2026, 8, 20), -6.53)],
    };

    expect(glanceLineCopy(glanceOfKind(feed, "am", NOW))).toBe(
      "어제 · 떨림 -6.5 dB",
    );
  });

  it("문장 듣기도 맞힌 수와 비율을 함께 적는다", () => {
    const feed: StatsFeed = {
      ...EMPTY,
      sent: [
        {
          id: "sent-1",
          savedAt: localIso(2026, 8, 21),
          schemaVersion: 2,
          summary: { trialCount: 18, correctCount: 15, percent: 83 },
        },
      ],
    };

    expect(glanceLineCopy(glanceOfKind(feed, "sent", NOW))).toBe(
      "오늘 · 15/18 · 83%",
    );
  });

  it("대표 숫자가 없으면 날짜만 남는다", () => {
    const feed: StatsFeed = {
      ...EMPTY,
      sessions: [pitch2Record(localIso(2026, 8, 21), null)],
    };

    expect(glanceLineCopy(glanceOfKind(feed, "pitch2", NOW))).toBe("오늘");
  });

  it("기록이 없으면 null이고 줄은 「기록 없음」", () => {
    expect(glanceOfKind(EMPTY, "wrs2", NOW)).toBeNull();
    expect(glanceLineCopy(null)).toBe("기록 없음");
  });

  /** 같은 상자를 쓰는 음고·떨림이 서로의 줄에 새지 않아야 한다. */
  it("음고 줄에 떨림 기록이 섞이지 않는다", () => {
    const feed: StatsFeed = {
      ...EMPTY,
      sessions: [amRecord(localIso(2026, 8, 21), -6)],
    };

    expect(glanceOfKind(feed, "pitch2", NOW)).toBeNull();
    expect(sessionRowsOfKind(feed, "freq")).toEqual([]);
  });
});

describe("glanceOfGroup", () => {
  it("탭 안에서 가장 최근에 한 종목을 고른다", () => {
    const feed: StatsFeed = {
      ...EMPTY,
      wrs1: [wrsRecord(localIso(2026, 8, 18), 20)],
      wrs2: [twoCharRecord(localIso(2026, 8, 20), 10)],
    };

    const glance = glanceOfGroup(feed, "wrs", NOW);

    expect(glance?.kind).toBe("wrs2");
    expect(glance?.whenCopy).toBe("어제");
  });

  it("한쪽만 있으면 그쪽을 고른다", () => {
    const feed: StatsFeed = {
      ...EMPTY,
      wrs1: [wrsRecord(localIso(2026, 8, 18), 20)],
    };

    expect(glanceOfGroup(feed, "wrs", NOW)?.kind).toBe("wrs1");
  });

  it("둘 다 없으면 null", () => {
    expect(glanceOfGroup(EMPTY, "pitch", NOW)).toBeNull();
  });
});

describe("countOfKind · countOfGroup", () => {
  it("종목별로 세고, 탭은 그 합", () => {
    const feed: StatsFeed = {
      ...EMPTY,
      sessions: [
        pitch2Record(localIso(2026, 8, 20), 40),
        pitch2Record(localIso(2026, 8, 19), 50),
        amRecord(localIso(2026, 8, 18), -6),
      ],
    };

    expect(countOfKind(feed, "pitch2")).toBe(2);
    expect(countOfKind(feed, "freq")).toBe(0);
    expect(countOfGroup(feed, "pitch")).toBe(2);
    expect(countOfGroup(feed, "am")).toBe(1);
  });
});
