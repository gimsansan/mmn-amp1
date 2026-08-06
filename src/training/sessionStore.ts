import AsyncStorage from '@react-native-async-storage/async-storage';

import type { AmSessionSummary } from '@/training/amSession';
import type { FreqSessionSummary } from '@/training/freqSession';

/** 로컬 연습 기록 키. 스키마 바꾸면 버전 bump. */
const STORAGE_KEY = 'training.sessionHistory.v1';

/** 기기 보관 상한. 오래된 것부터 버림. */
export const MAX_SAVED_SESSIONS = 50;

export type SessionTrack = 'freq' | 'am';

export type SavedFreqSessionRecord = {
  id: string;
  track: 'freq';
  savedAt: string;
  summary: FreqSessionSummary;
};

export type SavedAmSessionRecord = {
  id: string;
  track: 'am';
  savedAt: string;
  summary: AmSessionSummary;
};

export type SavedSessionRecord = SavedFreqSessionRecord | SavedAmSessionRecord;

function newId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

async function readAll(): Promise<SavedSessionRecord[]> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  if (raw == null || raw === '') {
    return [];
  }
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed as SavedSessionRecord[];
  } catch {
    return [];
  }
}

async function writeAll(records: SavedSessionRecord[]): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(records));
}

/** 세션 종료 요약만 저장. 진단·역치 아님. 실패 시 throw. */
export async function appendFreqSessionSummary(
  summary: FreqSessionSummary
): Promise<SavedFreqSessionRecord> {
  const record: SavedFreqSessionRecord = {
    id: newId(),
    track: 'freq',
    savedAt: new Date().toISOString(),
    summary,
  };
  const next = [record, ...(await readAll())].slice(0, MAX_SAVED_SESSIONS);
  await writeAll(next);
  return record;
}

export async function appendAmSessionSummary(
  summary: AmSessionSummary
): Promise<SavedAmSessionRecord> {
  const record: SavedAmSessionRecord = {
    id: newId(),
    track: 'am',
    savedAt: new Date().toISOString(),
    summary,
  };
  const next = [record, ...(await readAll())].slice(0, MAX_SAVED_SESSIONS);
  await writeAll(next);
  return record;
}

export async function listSavedSessions(): Promise<SavedSessionRecord[]> {
  return readAll();
}

/** 개발·수동 초기화용. */
export async function clearSavedSessions(): Promise<void> {
  await AsyncStorage.removeItem(STORAGE_KEY);
}
