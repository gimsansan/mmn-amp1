import AsyncStorage from "@react-native-async-storage/async-storage";

import {
  isCompletePhonemeMap,
  type Ling6DailySummary,
  type Ling6PhonemeMap,
  passCountOf,
} from "@/training/ling6/ling6Session";
import { LING6_SOUND_IDS, type Ling6SoundId } from "@/training/ling6/sounds";

/** 일자 1레코드. 기존 세션 append 키와 섞지 않는다. */
const STORAGE_KEY = "training.ling6Daily.v1";
export const LING6_RECORD_VERSION = 1;
/** 날짜 상한. 연습 탭 측정 50과 맞추되 저장소는 분리. */
export const MAX_LING6_DAYS = 50;
/** 「지난주」 비교에 필요한 최소 날짜 간격. */
export const HIGH_FREQ_LOOKBACK_DAYS = 6;

export type SavedLing6Record = {
  id: string;
  dateKey: string;
  savedAt: string;
  schemaVersion: number;
  summary: Ling6DailySummary;
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

function isDateKey(value: unknown): value is string {
  return typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function isPhonemeMap(value: unknown): value is Ling6PhonemeMap {
  if (!isPlainObject(value)) {
    return false;
  }
  return LING6_SOUND_IDS.every((id: Ling6SoundId) => typeof value[id] === "boolean");
}

function isValidRecord(value: unknown): value is SavedLing6Record {
  if (!isPlainObject(value)) {
    return false;
  }
  if (typeof value.id !== "string" || typeof value.savedAt !== "string") {
    return false;
  }
  if (!isDateKey(value.dateKey)) {
    return false;
  }
  if (!isPlainObject(value.summary)) {
    return false;
  }
  if (!isPhonemeMap(value.summary.byPhoneme)) {
    return false;
  }
  if (!isFiniteNumber(value.summary.passCount)) {
    return false;
  }
  return value.summary.passCount === passCountOf(value.summary.byPhoneme);
}

export function localDateKey(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function shiftDateKey(dateKey: string, days: number): string {
  const [year, month, day] = dateKey.split("-").map(Number);
  const next = new Date(year ?? 0, (month ?? 1) - 1, day ?? 1);
  next.setDate(next.getDate() + days);
  return localDateKey(next);
}

export function formatDateKeyShort(dateKey: string): string {
  const parts = dateKey.split("-");
  const month = Number(parts[1]);
  const day = Number(parts[2]);
  return `${month}/${day}`;
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

async function readAllRaw(): Promise<SavedLing6Record[]> {
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

async function writeAllRaw(rows: readonly SavedLing6Record[]): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(rows));
}

function sortNewestFirst(rows: readonly SavedLing6Record[]): SavedLing6Record[] {
  return [...rows].sort((a, b) => b.dateKey.localeCompare(a.dateKey));
}

/** 최신 날짜가 앞. */
export async function listLing6DailyRecords(): Promise<SavedLing6Record[]> {
  return enqueue(async () => sortNewestFirst(await readAllRaw()));
}

/**
 * 그날 점검 1건으로 덮어쓴다. 6음소를 다 고른 세션만 넣을 것.
 * 중간 연습 반복은 같은 날짜를 치환하므로 가로축이 세션 횟수로 늘어나지 않는다.
 */
export async function upsertLing6DailyRecord(
  byPhoneme: Ling6PhonemeMap,
  now: Date = new Date(),
): Promise<SavedLing6Record> {
  if (!isCompletePhonemeMap(byPhoneme)) {
    throw new Error("ling6 daily record needs all 6 phonemes");
  }

  return enqueue(async () => {
    const dateKey = localDateKey(now);
    const rows = await readAllRaw();
    const existing = rows.find((row) => row.dateKey === dateKey);
    const record: SavedLing6Record = {
      id: existing?.id ?? newId(),
      dateKey,
      savedAt: now.toISOString(),
      schemaVersion: LING6_RECORD_VERSION,
      summary: {
        passCount: passCountOf(byPhoneme),
        byPhoneme,
      },
    };
    const next = sortNewestFirst([
      record,
      ...rows.filter((row) => row.dateKey !== dateKey),
    ]).slice(0, MAX_LING6_DAYS);
    await writeAllRaw(next);
    return record;
  });
}

/** 오늘을 제외한 가장 최근 날짜의 통과 개수. 없으면 null. */
export async function peekPreviousDayPassCount(
  todayKey: string = localDateKey(),
): Promise<number | null> {
  const rows = await listLing6DailyRecords();
  const previous = rows.find((row) => row.dateKey < todayKey);
  return previous ? previous.summary.passCount : null;
}

/** 오늘보다 HIGH_FREQ_LOOKBACK_DAYS 이상 앞선 가장 최근 음소 기록. */
export async function peekHighFreqBaseline(
  todayKey: string = localDateKey(),
): Promise<Ling6PhonemeMap | null> {
  const cutoff = shiftDateKey(todayKey, -HIGH_FREQ_LOOKBACK_DAYS);
  const rows = await listLing6DailyRecords();
  const previous = rows.find((row) => row.dateKey <= cutoff);
  return previous ? previous.summary.byPhoneme : null;
}

/** 링 6 일자 기록만 지운다. 측정 통계(`sessionStore`)는 건드리지 않는다. */
export function clearLing6DailyRecords(): Promise<void> {
  return enqueue(async () => {
    await AsyncStorage.removeItem(STORAGE_KEY);
  });
}
