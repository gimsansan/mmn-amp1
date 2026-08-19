import AsyncStorage from "@react-native-async-storage/async-storage";

import {
  WRS_TRIAL_COUNT,
  type WrsSessionSummary,
} from "@/training/wrs/wrsSession";

/** 세션 append. 링 6 일자 키·측정 sessionStore와 섞지 않는다. */
const STORAGE_KEY = "training.wrsSessions.v1";
export const WRS_RECORD_VERSION = 1;
export const MAX_WRS_SESSIONS = 50;

export type SavedWrsRecord = {
  id: string;
  savedAt: string;
  schemaVersion: number;
  summary: WrsSessionSummary;
};

function newId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isValidSummary(value: unknown): value is WrsSessionSummary {
  if (!isPlainObject(value)) {
    return false;
  }
  if (!isFiniteNumber(value.trialCount) || value.trialCount < 0) {
    return false;
  }
  if (!isFiniteNumber(value.correctCount) || value.correctCount < 0) {
    return false;
  }
  if (value.correctCount > value.trialCount) {
    return false;
  }
  if (!isFiniteNumber(value.percent) || value.percent < 0 || value.percent > 100) {
    return false;
  }
  return true;
}

function isValidRecord(value: unknown): value is SavedWrsRecord {
  if (!isPlainObject(value)) {
    return false;
  }
  if (typeof value.id !== "string" || typeof value.savedAt !== "string") {
    return false;
  }
  return isValidSummary(value.summary);
}

let tail: Promise<unknown> = Promise.resolve();

function enqueue<T>(task: () => Promise<T>): Promise<T> {
  const run = tail.then(task, task);
  tail = run.then(
    () => undefined,
    () => undefined,
  );
  return run;
}

async function readAllRaw(): Promise<SavedWrsRecord[]> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return [];
  }
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed.filter(isValidRecord);
  } catch {
    return [];
  }
}

async function writeAllRaw(rows: readonly SavedWrsRecord[]): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(rows));
}

function sortNewestFirst(rows: readonly SavedWrsRecord[]): SavedWrsRecord[] {
  return [...rows].sort((a, b) => b.savedAt.localeCompare(a.savedAt));
}

export async function listWrsRecords(): Promise<SavedWrsRecord[]> {
  return enqueue(async () => sortNewestFirst(await readAllRaw()));
}

/**
 * 25개를 다 고른 세션만 넣는다. 중간 종료는 호출하지 말 것.
 */
export async function appendWrsSummary(
  summary: WrsSessionSummary,
  now: Date = new Date(),
): Promise<SavedWrsRecord> {
  if (summary.trialCount !== WRS_TRIAL_COUNT) {
    throw new Error("wrs record needs a full 25-trial list");
  }

  return enqueue(async () => {
    const record: SavedWrsRecord = {
      id: newId(),
      savedAt: now.toISOString(),
      schemaVersion: WRS_RECORD_VERSION,
      summary,
    };
    const next = sortNewestFirst([record, ...(await readAllRaw())]).slice(
      0,
      MAX_WRS_SESSIONS,
    );
    await writeAllRaw(next);
    return record;
  });
}

export function clearWrsRecords(): Promise<void> {
  return enqueue(async () => {
    await AsyncStorage.removeItem(STORAGE_KEY);
  });
}

export function formatWrsSavedAt(iso: string): string {
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
