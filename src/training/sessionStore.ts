import AsyncStorage from '@react-native-async-storage/async-storage';

import type { AmSessionSummary } from '@/training/amSession';
import type { FreqSessionSummary, SessionEndReason } from '@/training/freqSession';
import type { PitchCompareSummary } from '@/training/pitch2afc/pitchSummary';

/** 로컬 연습 기록 키. 스키마 바꾸면 버전 bump. */
const STORAGE_KEY = 'training.sessionHistory.v1';

/**
 * 레코드 스키마 버전.
 * 필드 구성을 바꾸면 이 값을 올리고 `migrateRecord`에 분기를 추가한다.
 * 초기 저장분에는 이 필드가 없으므로 **없으면 1로 본다**.
 */
export const SESSION_RECORD_VERSION = 1;

/** 기기 보관 상한. 오래된 것부터 버림. */
export const MAX_SAVED_SESSIONS = 50;

export type SessionTrack = 'freq' | 'am' | 'pitch2';

export type SavedFreqSessionRecord = {
  id: string;
  track: 'freq';
  savedAt: string;
  /** 없으면 1(초기 저장분). */
  schemaVersion?: number;
  summary: FreqSessionSummary;
};

export type SavedAmSessionRecord = {
  id: string;
  track: 'am';
  savedAt: string;
  /** 없으면 1(초기 저장분). */
  schemaVersion?: number;
  summary: AmSessionSummary;
};

export type SavedPitch2SessionRecord = {
  id: string;
  track: 'pitch2';
  savedAt: string;
  /** 없으면 1(초기 저장분). */
  schemaVersion?: number;
  summary: PitchCompareSummary;
};

export type SavedSessionRecord =
  | SavedFreqSessionRecord
  | SavedAmSessionRecord
  | SavedPitch2SessionRecord;

function newId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

// ─── 저장된 값 형태 검증 ────────────────────────────────────────────────
// 저장소 내용은 앱이 썼더라도 **믿을 수 없는 입력**으로 다룬다(구버전·중단된 쓰기·
// 수동 조작). 형태가 어긋난 레코드는 읽는 시점에 버려서 화면이 넘어지지 않게 한다.

const END_REASONS: ReadonlySet<string> = new Set(['reversals', 'max_trials', 'manual']);

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

/** 요약의 수치 항목은 「값 없음」이 정상이라 null을 허용한다. */
function isFiniteNumberOrNull(value: unknown): value is number | null {
  return value === null || isFiniteNumber(value);
}

function isEndReasonOrNull(value: unknown): value is SessionEndReason | null {
  return value === null || (typeof value === 'string' && END_REASONS.has(value));
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/** 트랙과 무관하게 요약이 갖춰야 할 항목. */
function hasValidSummaryBase(summary: Record<string, unknown>): boolean {
  return (
    isFiniteNumber(summary.trialCount) &&
    isFiniteNumber(summary.reversalCount) &&
    isFiniteNumber(summary.correctCount) &&
    isEndReasonOrNull(summary.endReason)
  );
}

function isValidRecord(value: unknown): value is SavedSessionRecord {
  if (!isPlainObject(value)) {
    return false;
  }
  if (typeof value.id !== 'string' || value.id === '') {
    return false;
  }
  if (typeof value.savedAt !== 'string' || value.savedAt === '') {
    return false;
  }
  if (!isPlainObject(value.summary) || !hasValidSummaryBase(value.summary)) {
    return false;
  }

  const summary = value.summary;
  if (value.track === 'freq') {
    return (
      isFiniteNumberOrNull(summary.meanReversalDeltaCents) &&
      isFiniteNumberOrNull(summary.easiestDeltaCents) &&
      isFiniteNumberOrNull(summary.hardestDeltaCents)
    );
  }
  if (value.track === 'am') {
    return (
      isFiniteNumberOrNull(summary.meanReversalDepthDb) &&
      isFiniteNumberOrNull(summary.easiestDepthDb) &&
      isFiniteNumberOrNull(summary.hardestDepthDb)
    );
  }
  if (value.track === 'pitch2') {
    return (
      isFiniteNumberOrNull(summary.meanReversalCents) &&
      isFiniteNumberOrNull(summary.easiestCents) &&
      isFiniteNumberOrNull(summary.hardestCents)
    );
  }
  return false;
}

/**
 * 저장된 값 1건을 현재 스키마의 레코드로 만든다. 못 만들면 `null`(호출부가 버림).
 *
 * 스키마를 바꿀 때: `SESSION_RECORD_VERSION`을 올리고 여기에 버전별 분기를 넣는다.
 * 지금은 v1뿐이라 **형태 검증만** 하고 변환은 없다.
 *
 * `주의`: 검증은 **형태 기준**이다. 미래 버전(v2 등)이라도 v1 필드를 그대로 갖고
 * 있으면 통과시킨다 — 상위 호환 데이터를 함부로 버리지 않기 위해서다.
 */
function migrateRecord(value: unknown): SavedSessionRecord | null {
  if (!isValidRecord(value)) {
    return null;
  }
  return value;
}

/**
 * 저장소 접근 직렬화 큐.
 *
 * append는 read → 수정 → write 세 단계라 원자적이지 않다. 두 호출이 겹치면
 * 둘 다 같은 원본을 읽고 각자 한 건씩 얹어 덮어써 **한 건이 유실**된다.
 * 모든 접근을 이 큐에 태워 한 번에 하나만 실행한다.
 *
 * 주의: 같은 JS 런타임 안에서만 유효하다(프로세스·기기 간 잠금이 아님).
 */
let tail: Promise<unknown> = Promise.resolve();

function enqueue<T>(task: () => Promise<T>): Promise<T> {
  // 앞 작업이 실패해도 다음 작업은 실행한다(큐가 막히지 않도록 양쪽 핸들러에 연결).
  const run = tail.then(task, task);
  // 큐 꼬리에는 실패를 흘리지 않는다(처리는 호출자 몫).
  tail = run.then(
    () => undefined,
    () => undefined
  );
  return run;
}

/**
 * 큐 안에서만 호출할 것.
 * 형태가 어긋난 레코드는 **조용히 버린다**(전체를 못 읽는 것보다 낫다).
 * 버려진 레코드는 다음 쓰기 때 저장소에서도 사라진다.
 */
async function readAllRaw(): Promise<SavedSessionRecord[]> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  if (raw == null || raw === '') {
    return [];
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return [];
  }
  if (!Array.isArray(parsed)) {
    return [];
  }

  const records: SavedSessionRecord[] = [];
  for (const item of parsed) {
    const record = migrateRecord(item);
    if (record) {
      records.push(record);
    }
  }
  return records;
}

/** 큐 안에서만 호출할 것. */
async function writeAllRaw(records: SavedSessionRecord[]): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(records));
}

/**
 * 레코드 1건 추가(최신이 앞). 상한 초과분은 오래된 것부터 버림.
 * `build`는 큐 안에서 실행되므로 `savedAt`·`id`가 **실제 기록 순서와 일치**한다.
 */
function appendRecord<R extends SavedSessionRecord>(build: () => R): Promise<R> {
  return enqueue(async () => {
    const record = build();
    const next = [record as SavedSessionRecord, ...(await readAllRaw())].slice(
      0,
      MAX_SAVED_SESSIONS
    );
    await writeAllRaw(next);
    return record;
  });
}

/** 세션 종료 요약만 저장. 진단·역치 아님. 실패 시 throw. */
export function appendFreqSessionSummary(
  summary: FreqSessionSummary
): Promise<SavedFreqSessionRecord> {
  return appendRecord<SavedFreqSessionRecord>(() => ({
    id: newId(),
    track: 'freq',
    savedAt: new Date().toISOString(),
    schemaVersion: SESSION_RECORD_VERSION,
    summary,
  }));
}

export function appendAmSessionSummary(
  summary: AmSessionSummary
): Promise<SavedAmSessionRecord> {
  return appendRecord<SavedAmSessionRecord>(() => ({
    id: newId(),
    track: 'am',
    savedAt: new Date().toISOString(),
    schemaVersion: SESSION_RECORD_VERSION,
    summary,
  }));
}

/** 「높낮이 비교」 세션 종료 요약 저장. 진단·역치 아님. 실패 시 throw. */
export function appendPitch2SessionSummary(
  summary: PitchCompareSummary
): Promise<SavedPitch2SessionRecord> {
  return appendRecord<SavedPitch2SessionRecord>(() => ({
    id: newId(),
    track: 'pitch2',
    savedAt: new Date().toISOString(),
    schemaVersion: SESSION_RECORD_VERSION,
    summary,
  }));
}

/** 대기 중인 저장이 있으면 그것들이 끝난 뒤의 목록을 돌려준다. */
export function listSavedSessions(): Promise<SavedSessionRecord[]> {
  return enqueue(readAllRaw);
}

/** 개발·수동 초기화용. */
export function clearSavedSessions(): Promise<void> {
  return enqueue(async () => {
    await AsyncStorage.removeItem(STORAGE_KEY);
  });
}
