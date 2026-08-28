import AsyncStorage from "@react-native-async-storage/async-storage";

import {
  INST_TRIAL_COUNT,
  type InstSummary,
} from "@/training/inst/instSession";

/** 세션 1건 append. 다른 종목 저장소와 키를 섞지 않는다. */
const STORAGE_KEY = "training.instSessions.v1";
export const INST_RECORD_VERSION = 1;
export const MAX_INST_SESSIONS = 50;

export type { InstSummary };

export type SavedInstRecord = {
  id: string;
  savedAt: string;
  schemaVersion: number;
  summary: InstSummary;
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

/** 12문항을 다 채운 기록만 목록에 남긴다. 반쪽 기록은 추세를 왜곡한다. */
function isValidSummary(value: unknown): value is InstSummary {
  return (
    isPlainObject(value) &&
    value.trialCount === INST_TRIAL_COUNT &&
    isInRange(value.correctCount, 0, INST_TRIAL_COUNT) &&
    isInRange(value.percent, 0, 100)
  );
}

function isValidRecord(value: unknown): value is SavedInstRecord {
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

async function readAllRaw(): Promise<SavedInstRecord[]> {
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
  rows: readonly SavedInstRecord[],
): SavedInstRecord[] {
  return [...rows].sort((a, b) => b.savedAt.localeCompare(a.savedAt));
}

export function listInstRecords(): Promise<SavedInstRecord[]> {
  return enqueue(async () => sortNewestFirst(await readAllRaw()));
}

/** 12개를 다 고른 세션만 넣는다. 중간 종료는 호출하지 말 것. */
export async function appendInstSummary(
  summary: InstSummary,
  now: Date = new Date(),
): Promise<SavedInstRecord> {
  if (summary.trialCount !== INST_TRIAL_COUNT) {
    throw new Error("inst record needs a full 12-trial list");
  }
  if (!isInRange(summary.correctCount, 0, summary.trialCount)) {
    throw new Error("inst record has an impossible correct count");
  }

  return enqueue(async () => {
    const record: SavedInstRecord = {
      id: newId(),
      savedAt: now.toISOString(),
      schemaVersion: INST_RECORD_VERSION,
      summary,
    };
    const next = sortNewestFirst([record, ...(await readAllRaw())]).slice(
      0,
      MAX_INST_SESSIONS,
    );
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    return record;
  });
}

export function clearInstRecords(): Promise<void> {
  return enqueue(async () => {
    await AsyncStorage.removeItem(STORAGE_KEY);
  });
}

export function formatInstSavedAt(iso: string): string {
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
