import AsyncStorage from "@react-native-async-storage/async-storage";

import {
  SENT_CLOSED_TRIAL_COUNT,
  type SentClosedSummary,
} from "@/training/sentClosed/trials";

const STORAGE_KEY = "training.sentClosedSessions.v1";
/** 기록 형식. 1 = 들은 횟수만 — 배포 전에 사라진 형식이라 읽을 때 버린다. */
export const SENT_CLOSED_RECORD_VERSION = 2;
export const MAX_SENT_CLOSED_SESSIONS = 50;

/** 저장하는 요약 = `summarizeSentClosed`가 만든 그것. */
export type { SentClosedSummary };

export type SavedSentClosedRecord = {
  id: string;
  savedAt: string;
  schemaVersion: number;
  summary: SentClosedSummary;
};

function newId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function isInRange(value: unknown, min: number, max: number): value is number {
  return (
    typeof value === "number" &&
    Number.isFinite(value) &&
    value >= min &&
    value <= max
  );
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/** 맞힌 수·비율이 다 있어야 한다. 없거나 반쪽인 기록은 목록에서 뺀다. */
function isValidSummary(value: unknown): value is SentClosedSummary {
  return (
    isPlainObject(value) &&
    value.trialCount === SENT_CLOSED_TRIAL_COUNT &&
    isInRange(value.correctCount, 0, SENT_CLOSED_TRIAL_COUNT) &&
    isInRange(value.percent, 0, 100)
  );
}

function isValidRecord(value: unknown): value is SavedSentClosedRecord {
  return (
    isPlainObject(value) &&
    typeof value.id === "string" &&
    typeof value.savedAt === "string" &&
    typeof value.schemaVersion === "number" &&
    isValidSummary(value.summary)
  );
}

/** 읽기·쓰기를 한 줄로 세운다 — 두 세션이 겹쳐 저장돼도 뒤엣것이 앞엣것을 덮지 않는다. */
let tail: Promise<unknown> = Promise.resolve();

function enqueue<T>(task: () => Promise<T>): Promise<T> {
  const run = tail.then(task, task);
  tail = run.catch(() => undefined);
  return run;
}

async function readAllRaw(): Promise<SavedSentClosedRecord[]> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return [];
  }
  try {
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter(isValidRecord) : [];
  } catch {
    return [];
  }
}

function sortNewestFirst(
  rows: readonly SavedSentClosedRecord[],
): SavedSentClosedRecord[] {
  return [...rows].sort((a, b) => b.savedAt.localeCompare(a.savedAt));
}

export function listSentClosedRecords(): Promise<SavedSentClosedRecord[]> {
  return enqueue(async () => sortNewestFirst(await readAllRaw()));
}

/** 18개를 다 고른 세션만 넣는다. 중간 종료는 호출하지 말 것. */
export async function appendSentClosedSummary(
  summary: SentClosedSummary,
  now: Date = new Date(),
): Promise<SavedSentClosedRecord> {
  if (summary.trialCount !== SENT_CLOSED_TRIAL_COUNT) {
    throw new Error("sent-closed record needs a full 18-trial list");
  }
  if (!isInRange(summary.correctCount, 0, summary.trialCount)) {
    throw new Error("sent-closed record has an impossible correct count");
  }

  return enqueue(async () => {
    const record: SavedSentClosedRecord = {
      id: newId(),
      savedAt: now.toISOString(),
      schemaVersion: SENT_CLOSED_RECORD_VERSION,
      summary,
    };
    const next = sortNewestFirst([record, ...(await readAllRaw())]).slice(
      0,
      MAX_SENT_CLOSED_SESSIONS,
    );
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    return record;
  });
}

export function clearSentClosedRecords(): Promise<void> {
  return enqueue(async () => {
    await AsyncStorage.removeItem(STORAGE_KEY);
  });
}

export function formatSentClosedSavedAt(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return iso;
  }
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hour = String(date.getHours()).padStart(2, "0");
  const minute = String(date.getMinutes()).padStart(2, "0");
  return `${month}/${day} ${hour}:${minute}`;
}
