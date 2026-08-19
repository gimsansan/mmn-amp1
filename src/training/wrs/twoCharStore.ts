import AsyncStorage from "@react-native-async-storage/async-storage";

import { TWO_CHAR_TRIAL_COUNT } from "@/training/wrs/twoCharLists";
import type { WrsSessionSummary } from "@/training/wrs/wrsSession";

const STORAGE_KEY = "training.twoCharSessions.v1";
export const TWO_CHAR_RECORD_VERSION = 1;
export const MAX_TWO_CHAR_SESSIONS = 50;

export type SavedTwoCharRecord = {
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

function isValidRecord(value: unknown): value is SavedTwoCharRecord {
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

async function readAllRaw(): Promise<SavedTwoCharRecord[]> {
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

async function writeAllRaw(rows: readonly SavedTwoCharRecord[]): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(rows));
}

function sortNewestFirst(
  rows: readonly SavedTwoCharRecord[],
): SavedTwoCharRecord[] {
  return [...rows].sort((a, b) => b.savedAt.localeCompare(a.savedAt));
}

export async function listTwoCharRecords(): Promise<SavedTwoCharRecord[]> {
  return enqueue(async () => sortNewestFirst(await readAllRaw()));
}

/** 12개를 다 고른 세션만 넣는다. 중간 종료는 호출하지 말 것. */
export async function appendTwoCharSummary(
  summary: WrsSessionSummary,
  now: Date = new Date(),
): Promise<SavedTwoCharRecord> {
  if (summary.trialCount !== TWO_CHAR_TRIAL_COUNT) {
    throw new Error("two-char record needs a full 12-trial list");
  }

  return enqueue(async () => {
    const record: SavedTwoCharRecord = {
      id: newId(),
      savedAt: now.toISOString(),
      schemaVersion: TWO_CHAR_RECORD_VERSION,
      summary,
    };
    const next = sortNewestFirst([record, ...(await readAllRaw())]).slice(
      0,
      MAX_TWO_CHAR_SESSIONS,
    );
    await writeAllRaw(next);
    return record;
  });
}

export function clearTwoCharRecords(): Promise<void> {
  return enqueue(async () => {
    await AsyncStorage.removeItem(STORAGE_KEY);
  });
}
