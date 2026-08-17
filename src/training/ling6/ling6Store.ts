import AsyncStorage from "@react-native-async-storage/async-storage";

import type { Ling6SessionSummary } from "@/training/ling6/ling6Session";

const STORAGE_KEY = "training.ling6History.v1";
export const LING6_RECORD_VERSION = 1;
export const MAX_LING6_SESSIONS = 30;

export type SavedLing6Record = {
  id: string;
  savedAt: string;
  schemaVersion: number;
  summary: Ling6SessionSummary;
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

function isValidRecord(value: unknown): value is SavedLing6Record {
  if (!isPlainObject(value)) {
    return false;
  }
  if (typeof value.id !== "string" || typeof value.savedAt !== "string") {
    return false;
  }
  if (!isPlainObject(value.summary)) {
    return false;
  }
  return (
    isFiniteNumber(value.summary.trialCount) &&
    isFiniteNumber(value.summary.correctCount)
  );
}

async function readAll(): Promise<SavedLing6Record[]> {
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

async function writeAll(rows: readonly SavedLing6Record[]): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(rows));
}

/** 최신이 앞. */
export async function listLing6Sessions(): Promise<SavedLing6Record[]> {
  return readAll();
}

export async function appendLing6SessionSummary(
  summary: Ling6SessionSummary,
): Promise<SavedLing6Record> {
  const record: SavedLing6Record = {
    id: newId(),
    savedAt: new Date().toISOString(),
    schemaVersion: LING6_RECORD_VERSION,
    summary,
  };
  const rows = await readAll();
  const next = [record, ...rows].slice(0, MAX_LING6_SESSIONS);
  await writeAll(next);
  return record;
}

/** 직전 연습의 맞힌 개수. 없으면 null. */
export async function peekPreviousCorrectCount(): Promise<number | null> {
  const rows = await readAll();
  const latest = rows[0];
  return latest ? latest.summary.correctCount : null;
}
