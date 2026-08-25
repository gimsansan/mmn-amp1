/**
 * 통계 읽기 창구 — 저장소 5개(`ling6Store` · `sessionStore` · `wrsStore` ·
 * `twoCharStore` · `sentClosed/store`)를 **그대로 두고** 읽는 쪽만 한 곳으로 모은다.
 * 저장 키 통합·마이그레이션이 아니다(`docs/training-stats-recommendation.md` §3
 * 「읽는 API만 봉투로 투영」).
 *
 * 화면은 이 파일의 `kind`만 알면 되고, 어느 키에서 나왔는지는 몰라도 된다.
 */

import {
  clearLing6DailyRecords,
  listLing6DailyRecords,
  type SavedLing6Record,
} from "@/training/ling6/ling6Store";
import { SOUND_TRIAL_COUNT } from "@/training/ling6/ling6Session";
import {
  deleteSavedSessionsByTrack,
  isCountedInStats,
  listSavedSessions,
  type SavedSessionRecord,
  type SessionTrack,
} from "@/training/sessionStore";
import {
  clearTwoCharRecords,
  listTwoCharRecords,
  type SavedTwoCharRecord,
} from "@/training/wrs/twoCharStore";
import {
  clearWrsRecords,
  listWrsRecords,
  type SavedWrsRecord,
} from "@/training/wrs/wrsStore";
import {
  clearSentClosedRecords,
  listSentClosedRecords,
  type SavedSentClosedRecord,
} from "@/training/sentClosed/store";

/** 통계 한 종목. 칩 하나 = kind 하나. */
export type StatsKind =
  | "ling6"
  | "pitch2"
  | "freq"
  | "wrs1"
  | "wrs2"
  | "am"
  | "sent";

/** 하단 탭 단위 묶음. 「다른 연습」 줄은 이 단위로 센다. */
export type StatsGroup = "ling6" | "pitch" | "wrs" | "am" | "sent";

/** 칩 순서 = 하단 탭 순서(링 6 · 소리 높낮이 · 단어 듣기 · 떨림 · 문장 듣기). */
export const STATS_KINDS: readonly StatsKind[] = [
  "ling6",
  "pitch2",
  "freq",
  "wrs1",
  "wrs2",
  "am",
  "sent",
];

export const STATS_GROUPS: readonly StatsGroup[] = [
  "ling6",
  "pitch",
  "wrs",
  "am",
  "sent",
];

/** 칩·지우기 버튼에 쓰는 종목 이름. */
export const KIND_LABEL: Record<StatsKind, string> = {
  ling6: "링 6",
  pitch2: "높낮이 비교",
  freq: "다른 음 찾기",
  wrs1: "한 글자",
  wrs2: "두 글자",
  am: "떨림",
  sent: "문장 듣기",
};

/** 「다른 연습」 줄에 쓰는 탭 이름. */
export const GROUP_LABEL: Record<StatsGroup, string> = {
  ling6: "링 6",
  pitch: "소리 높낮이",
  wrs: "단어 듣기",
  am: "떨림",
  sent: "문장 듣기",
};

export const GROUP_OF_KIND: Record<StatsKind, StatsGroup> = {
  ling6: "ling6",
  pitch2: "pitch",
  freq: "pitch",
  wrs1: "wrs",
  wrs2: "wrs",
  am: "am",
  sent: "sent",
};

export const KINDS_OF_GROUP: Record<StatsGroup, readonly StatsKind[]> = {
  ling6: ["ling6"],
  pitch: ["pitch2", "freq"],
  wrs: ["wrs1", "wrs2"],
  am: ["am"],
  sent: ["sent"],
};

/**
 * 한 번 읽어 둔 다섯 저장소. 칩을 바꿔도 다시 읽지 않는다.
 * `sessions`는 귀풀기(practice)를 이미 걸러 낸 뒤다.
 */
export type StatsFeed = {
  readonly ling6: readonly SavedLing6Record[];
  readonly sessions: readonly SavedSessionRecord[];
  readonly wrs1: readonly SavedWrsRecord[];
  readonly wrs2: readonly SavedTwoCharRecord[];
  readonly sent: readonly SavedSentClosedRecord[];
};

export const EMPTY_STATS_FEED: StatsFeed = {
  ling6: [],
  sessions: [],
  wrs1: [],
  wrs2: [],
  sent: [],
};

/**
 * 다섯 저장소를 한 번에 읽는다. 레코드가 전부 요약 숫자라 합쳐도 수십 KB다.
 * 하나가 깨져도 나머지는 보여 준다(그 종목만 빈 목록).
 */
export async function loadStatsFeed(): Promise<StatsFeed> {
  const [ling6, sessions, wrs1, wrs2, sent] = await Promise.all([
    listLing6DailyRecords().catch((): SavedLing6Record[] => []),
    listSavedSessions().catch((): SavedSessionRecord[] => []),
    listWrsRecords().catch((): SavedWrsRecord[] => []),
    listTwoCharRecords().catch((): SavedTwoCharRecord[] => []),
    listSentClosedRecords().catch((): SavedSentClosedRecord[] => []),
  ]);

  return {
    ling6,
    // 통계·추세는 연습(measure)만. 귀풀기는 저장하지 않지만 구기록이 남아 있다.
    sessions: sessions.filter(isCountedInStats),
    wrs1,
    wrs2,
    sent,
  };
}

/** 이 kind가 `sessionStore` 트랙인지. 아니면 전용 저장소를 쓴다. */
function isSessionTrack(kind: StatsKind): kind is SessionTrack {
  return kind === "pitch2" || kind === "freq" || kind === "am";
}

/** 선택한 종목의 세션만. 음고·떨림용. */
export function sessionRowsOfKind(
  feed: StatsFeed,
  kind: SessionTrack,
): SavedSessionRecord[] {
  return feed.sessions.filter((row) => row.track === kind);
}

export function countOfKind(feed: StatsFeed, kind: StatsKind): number {
  switch (kind) {
    case "ling6":
      return feed.ling6.length;
    case "wrs1":
      return feed.wrs1.length;
    case "wrs2":
      return feed.wrs2.length;
    case "sent":
      return feed.sent.length;
    default:
      return sessionRowsOfKind(feed, kind).length;
  }
}

export function countOfGroup(feed: StatsFeed, group: StatsGroup): number {
  return KINDS_OF_GROUP[group].reduce(
    (sum, kind) => sum + countOfKind(feed, kind),
    0,
  );
}

/**
 * 그 종목 기록만 지운다. 다른 종목은 건드리지 않는다.
 * 음고·떨림은 한 상자를 나눠 쓰므로 트랙 단위 삭제.
 */
export function clearStatsKind(kind: StatsKind): Promise<void> {
  switch (kind) {
    case "ling6":
      return clearLing6DailyRecords();
    case "wrs1":
      return clearWrsRecords();
    case "wrs2":
      return clearTwoCharRecords();
    case "sent":
      return clearSentClosedRecords();
    default:
      return deleteSavedSessionsByTrack(kind);
  }
}

// ─── 한 줄 근황 ─────────────────────────────────────────────────────────
// 「다른 연습」 줄에 쓰는 최신 1건 요약. 그래프용 전체 목록과 달리 점 하나면 된다.

export type StatsGlance = {
  /** 그 종목의 최신 기록 시각(ISO) 또는 날짜키. */
  readonly occurredAt: string;
  /** 「오늘」 「어제」 「3일 전」. */
  readonly whenCopy: string;
  /** 「5/6 맞힘」 같은 짧은 결과. 대표 숫자가 없으면 null. */
  readonly resultCopy: string | null;
};

/** 그룹 안에서 어느 종목이 최신이었는지까지 알려 준다(줄을 누르면 그 칩으로). */
export type StatsGroupGlance = StatsGlance & { readonly kind: StatsKind };

function startOfLocalDay(date: Date): number {
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
  ).getTime();
}

/** ISO도 날짜키(`YYYY-MM-DD`)도 **로컬 날짜**로 읽는다. */
function parseOccurredAt(value: string): Date | null {
  const dateKey = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (dateKey) {
    return new Date(
      Number(dateKey[1]),
      Number(dateKey[2]) - 1,
      Number(dateKey[3]),
    );
  }
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

const RELATIVE_DAY_LIMIT = 30;

/** 「오늘 / 어제 / N일 전」. 한 달이 넘으면 날짜로. */
export function relativeDayCopy(occurredAt: string, now: Date = new Date()) {
  const then = parseOccurredAt(occurredAt);
  if (then == null) {
    return "";
  }
  const days = Math.round(
    (startOfLocalDay(now) - startOfLocalDay(then)) / 86_400_000,
  );
  if (days <= 0) {
    return "오늘";
  }
  if (days === 1) {
    return "어제";
  }
  if (days < RELATIVE_DAY_LIMIT) {
    return `${days}일 전`;
  }
  return `${then.getMonth() + 1}월 ${then.getDate()}일`;
}

/** cent·dB 큰 값 표기는 그래프 카드와 같게. 단위어는 여기서 붙인다. */
function pitchGlanceCopy(record: SavedSessionRecord): string | null {
  let cents: number | null = null;
  if (record.track === "pitch2") {
    cents = record.summary.meanReversalCents;
  } else if (record.track === "freq") {
    cents = record.summary.meanReversalDeltaCents;
  }
  return cents == null ? null : `음높이 차이 ${Math.round(cents)}`;
}

function amGlanceCopy(record: SavedSessionRecord): string | null {
  if (record.track !== "am") {
    return null;
  }
  const depth = record.summary.meanReversalDepthDb;
  return depth == null ? null : `떨림 ${depth.toFixed(1)} dB`;
}

function percentGlanceCopy(summary: {
  correctCount: number;
  trialCount: number;
  percent: number;
}): string {
  return `${summary.correctCount}/${summary.trialCount} · ${summary.percent}%`;
}

/** 그 종목의 최신 1건. 기록이 없으면 null. */
export function glanceOfKind(
  feed: StatsFeed,
  kind: StatsKind,
  now: Date = new Date(),
): StatsGlance | null {
  if (kind === "ling6") {
    // 날짜 1레코드라 최신 = 날짜키가 가장 큰 것.
    const latest = [...feed.ling6].sort((a, b) =>
      b.dateKey.localeCompare(a.dateKey),
    )[0];
    if (!latest) {
      return null;
    }
    return {
      occurredAt: latest.dateKey,
      whenCopy: relativeDayCopy(latest.dateKey, now),
      resultCopy: `${latest.summary.passCount}/${SOUND_TRIAL_COUNT} 맞힘`,
    };
  }

  if (kind === "wrs1" || kind === "wrs2") {
    // 두 저장소 모두 최신이 앞으로 정렬돼 있다.
    const rows = kind === "wrs1" ? feed.wrs1 : feed.wrs2;
    const latest = rows[0];
    if (!latest) {
      return null;
    }
    return {
      occurredAt: latest.savedAt,
      whenCopy: relativeDayCopy(latest.savedAt, now),
      resultCopy: percentGlanceCopy(latest.summary),
    };
  }

  if (kind === "sent") {
    const latest = feed.sent[0];
    if (!latest) {
      return null;
    }
    return {
      occurredAt: latest.savedAt,
      whenCopy: relativeDayCopy(latest.savedAt, now),
      resultCopy: percentGlanceCopy(latest.summary),
    };
  }

  const latest = sessionRowsOfKind(feed, kind)[0];
  if (!latest) {
    return null;
  }
  return {
    occurredAt: latest.savedAt,
    whenCopy: relativeDayCopy(latest.savedAt, now),
    resultCopy: kind === "am" ? amGlanceCopy(latest) : pitchGlanceCopy(latest),
  };
}

/** 그룹 안에서 가장 최근에 한 종목의 근황. 「다른 연습」 한 줄이 이것. */
export function glanceOfGroup(
  feed: StatsFeed,
  group: StatsGroup,
  now: Date = new Date(),
): StatsGroupGlance | null {
  let best: StatsGroupGlance | null = null;
  for (const kind of KINDS_OF_GROUP[group]) {
    const glance = glanceOfKind(feed, kind, now);
    if (glance == null) {
      continue;
    }
    if (best == null || glance.occurredAt > best.occurredAt) {
      best = { ...glance, kind };
    }
  }
  return best;
}

/** 근황 줄 오른쪽 문구. 기록이 없으면 「기록 없음」. */
export function glanceLineCopy(glance: StatsGlance | null): string {
  if (glance == null) {
    return "기록 없음";
  }
  return glance.resultCopy == null
    ? glance.whenCopy
    : `${glance.whenCopy} · ${glance.resultCopy}`;
}

export { isSessionTrack };
