import AsyncStorage from '@react-native-async-storage/async-storage';

import type { AmSessionSummary } from '@/training/am/amSession';
import type { FreqSessionSummary, SessionEndReason } from '@/training/freq/freqSession';
import type { PitchCompareSummary } from '@/training/pitch2afc/pitchSummary';

/** 로컬 연습 기록 키. 스키마 바꾸면 버전 bump. */
const STORAGE_KEY = 'training.sessionHistory.v1';

/**
 * 레코드 스키마 버전.
 * 필드 구성을 바꾸면 이 값을 올리고 `migrateRecord`에 분기를 추가한다.
 * 초기 저장분에는 이 필드가 없으므로 **없으면 1로 본다**.
 */
export const SESSION_RECORD_VERSION = 1;

/**
 * 기기 보관 상한.
 *
 * 연습(측정)만 **트랙별** 50. 한 트랙을 많이 해도 다른 트랙 그래프가 밀리지 않는다.
 * 귀풀기는 저장하지 않는다(이번 결과 카드만). 합계 상한은 두지 않는다(최대 150).
 */
export const MAX_MEASURE_SESSIONS = 50;

export type SessionTrack = 'freq' | 'am' | 'pitch2';

const SESSION_TRACKS: readonly SessionTrack[] = ['freq', 'am', 'pitch2'];

/**
 * 세션 성격.
 * - `practice`: 귀풀기(한도 없음). **저장하지 않음.** 이번 결과 카드만.
 * - `measure`: 연습(반전 6). 기록 + 통계 포함.
 *
 * `주의`: 구버전 레코드에는 이 필드가 없다(`undefined`). 없으면 **측정으로 간주**해
 * 통계에 포함한다(기존 데이터를 통계에서 빠뜨리지 않기 위해).
 */
export type SessionMode = 'practice' | 'measure';

export type SavedFreqSessionRecord = {
  id: string;
  track: 'freq';
  savedAt: string;
  /** 없으면 1(초기 저장분). */
  schemaVersion?: number;
  /** 없으면 측정으로 간주(구버전 호환). */
  mode?: SessionMode;
  summary: FreqSessionSummary;
};

export type SavedAmSessionRecord = {
  id: string;
  track: 'am';
  savedAt: string;
  /** 없으면 1(초기 저장분). */
  schemaVersion?: number;
  /** 없으면 측정으로 간주(구버전 호환). */
  mode?: SessionMode;
  summary: AmSessionSummary;
};

export type SavedPitch2SessionRecord = {
  id: string;
  track: 'pitch2';
  savedAt: string;
  /** 없으면 1(초기 저장분). */
  schemaVersion?: number;
  /** 없으면 측정으로 간주(구버전 호환). */
  mode?: SessionMode;
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

const SESSION_MODES: ReadonlySet<string> = new Set(['practice', 'measure']);

/** mode는 선택 필드 — 없으면(undefined) 허용, 있으면 아는 값이어야 한다. */
function isSessionModeOrAbsent(value: unknown): value is SessionMode | undefined {
  return value === undefined || (typeof value === 'string' && SESSION_MODES.has(value));
}

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
  if (!isSessionModeOrAbsent(value.mode)) {
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
 * 상한을 적용해 초과분을 버린다.
 *
 * `merged`(최신이 앞). 연습(측정)만 트랙마다 `slice(MAX_MEASURE_SESSIONS)`.
 * 귀풀기(`practice`)는 남기지 않는다. 원래 순서는 유지.
 */
function capByMode(
  merged: readonly SavedSessionRecord[]
): SavedSessionRecord[] {
  const keep = new Set<string>();
  for (const track of SESSION_TRACKS) {
    for (const row of merged
      .filter((r) => isCountedInStats(r) && r.track === track)
      .slice(0, MAX_MEASURE_SESSIONS)) {
      keep.add(row.id);
    }
  }
  return merged.filter((r) => keep.has(r.id));
}

/**
 * 레코드 1건 추가(최신이 앞). 연습(측정)만 트랙별 상한. 귀풀기는 쓰지 않음.
 * `build`는 큐 안에서 실행되므로 `savedAt`·`id`가 **실제 기록 순서와 일치**한다.
 */
function appendRecord<R extends SavedSessionRecord>(build: () => R): Promise<R> {
  return enqueue(async () => {
    const record = build();
    if (record.mode === 'practice') {
      return record;
    }
    const next = capByMode([
      record as SavedSessionRecord,
      ...(await readAllRaw()),
    ]);
    await writeAllRaw(next);
    return record;
  });
}

/**
 * 세션 종료 요약만 저장. 진단·역치 아님. 실패 시 throw.
 * `mode` 생략 시 측정으로 저장(구버전 호출부 호환).
 */
export function appendFreqSessionSummary(
  summary: FreqSessionSummary,
  mode: SessionMode = 'measure'
): Promise<SavedFreqSessionRecord> {
  return appendRecord<SavedFreqSessionRecord>(() => ({
    id: newId(),
    track: 'freq',
    savedAt: new Date().toISOString(),
    schemaVersion: SESSION_RECORD_VERSION,
    mode,
    summary,
  }));
}

export function appendAmSessionSummary(
  summary: AmSessionSummary,
  mode: SessionMode = 'measure'
): Promise<SavedAmSessionRecord> {
  return appendRecord<SavedAmSessionRecord>(() => ({
    id: newId(),
    track: 'am',
    savedAt: new Date().toISOString(),
    schemaVersion: SESSION_RECORD_VERSION,
    mode,
    summary,
  }));
}

/** 「높낮이 비교」 세션 종료 요약 저장. 진단·역치 아님. 실패 시 throw. */
export function appendPitch2SessionSummary(
  summary: PitchCompareSummary,
  mode: SessionMode = 'measure'
): Promise<SavedPitch2SessionRecord> {
  return appendRecord<SavedPitch2SessionRecord>(() => ({
    id: newId(),
    track: 'pitch2',
    savedAt: new Date().toISOString(),
    schemaVersion: SESSION_RECORD_VERSION,
    mode,
    summary,
  }));
}

/**
 * 이 레코드가 통계·추세 집계에 포함되는지.
 * 귀풀기(`practice`)만 제외한다. `mode`가 없는 구버전 레코드는 포함(측정으로 간주).
 */
export function isCountedInStats(record: SavedSessionRecord): boolean {
  return record.mode !== 'practice';
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

/**
 * 기록 1건 삭제. 연습·측정 구분 없음.
 * 없는 id면 아무 것도 하지 않는다. 마지막 1건이면 저장 키를 제거한다.
 */
export function deleteSavedSession(id: string): Promise<void> {
  return enqueue(async () => {
    const prev = await readAllRaw();
    const next = prev.filter((r) => r.id !== id);
    if (next.length === prev.length) {
      return;
    }
    if (next.length === 0) {
      await AsyncStorage.removeItem(STORAGE_KEY);
      return;
    }
    await writeAllRaw(next);
  });
}

/**
 * 한 트랙의 기록만 삭제(연습·측정 모두). 다른 트랙은 그대로.
 * 해당 트랙이 없으면 아무 것도 하지 않는다. 남는 기록이 없으면 키를 제거한다.
 */
export function deleteSavedSessionsByTrack(track: SessionTrack): Promise<void> {
  return enqueue(async () => {
    const prev = await readAllRaw();
    const next = prev.filter((r) => r.track !== track);
    if (next.length === prev.length) {
      return;
    }
    if (next.length === 0) {
      await AsyncStorage.removeItem(STORAGE_KEY);
      return;
    }
    await writeAllRaw(next);
  });
}
