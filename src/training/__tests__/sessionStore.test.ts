/**
 * P0-2 회귀 방지 — 저장소 접근 직렬화.
 *
 * AsyncStorage를 **지연이 있는** 인메모리 목으로 대체한다. 지연이 없으면
 * read→write 사이에 다른 호출이 끼어들 틈이 없어 경합 자체가 재현되지 않는다.
 */

jest.mock('@react-native-async-storage/async-storage', () => {
  let store: Record<string, string> = {};
  const delay = () => new Promise<void>((resolve) => setTimeout(resolve, 0));

  return {
    __esModule: true,
    default: {
      getItem: async (key: string): Promise<string | null> => {
        await delay();
        return store[key] ?? null;
      },
      setItem: async (key: string, value: string): Promise<void> => {
        await delay();
        store[key] = value;
      },
      removeItem: async (key: string): Promise<void> => {
        await delay();
        delete store[key];
      },
      __setRaw: (key: string, value: string): void => {
        store[key] = value;
      },
      __reset: (): void => {
        store = {};
      },
    },
  };
});

import AsyncStorage from '@react-native-async-storage/async-storage';

import type { AmSessionSummary } from '@/training/am/amSession';
import type { FreqSessionSummary } from '@/training/freq/freqSession';
import type { PitchCompareSummary } from '@/training/pitch2afc/pitchSummary';
import {
  MAX_MEASURE_SESSIONS,
  SESSION_RECORD_VERSION,
  appendAmSessionSummary,
  appendFreqSessionSummary,
  appendPitch2SessionSummary,
  clearSavedSessions,
  deleteSavedSession,
  deleteSavedSessionsByTrack,
  isCountedInStats,
  listSavedSessions,
} from '@/training/sessionStore';

const storageMock = AsyncStorage as unknown as {
  __reset: () => void;
  __setRaw: (key: string, value: string) => void;
};

const STORAGE_KEY = 'training.sessionHistory.v1';

function freqSummary(trialCount: number): FreqSessionSummary {
  return {
    trialCount,
    reversalCount: 4,
    endReason: 'reversals',
    meanReversalDeltaCents: 120,
    easiestDeltaCents: 150,
    hardestDeltaCents: 110,
    correctCount: trialCount,
  };
}

function amSummary(trialCount: number): AmSessionSummary {
  return {
    trialCount,
    reversalCount: 4,
    endReason: 'reversals',
    meanReversalDepthDb: -17.5,
    easiestDepthDb: 0,
    hardestDepthDb: -22,
    correctCount: trialCount,
  };
}

function pitch2Summary(trialCount: number): PitchCompareSummary {
  return {
    trialCount,
    reversalCount: 4,
    endReason: 'reversals',
    meanReversalCents: 45,
    easiestCents: 150,
    hardestCents: 20,
    correctCount: trialCount,
  };
}

beforeEach(() => {
  storageMock.__reset();
});

describe('sessionStore — 저장 직렬화', () => {
  it('동시에 저장한 두 건이 모두 남는다', async () => {
    const [freq, am] = await Promise.all([
      appendFreqSessionSummary(freqSummary(15)),
      appendAmSessionSummary(amSummary(18)),
    ]);

    const rows = await listSavedSessions();

    expect(rows).toHaveLength(2);
    expect(rows.map((r) => r.id).sort()).toEqual([freq.id, am.id].sort());
  });

  it('동시에 저장한 다섯 건이 모두 남는다', async () => {
    await Promise.all(
      Array.from({ length: 5 }, (_, i) => appendFreqSessionSummary(freqSummary(i + 1)))
    );

    const rows = await listSavedSessions();

    expect(rows).toHaveLength(5);
    expect(new Set(rows.map((r) => r.id)).size).toBe(5);
  });

  it('저장 직후 목록 조회가 방금 저장한 건을 포함한다', async () => {
    const record = await appendFreqSessionSummary(freqSummary(7));
    const rows = await listSavedSessions();

    expect(rows[0].id).toBe(record.id);
    expect(rows[0].track).toBe('freq');
  });

  it('세 트랙(freq·am·pitch2)을 동시에 저장해도 모두 남는다', async () => {
    const [freq, am, pitch2] = await Promise.all([
      appendFreqSessionSummary(freqSummary(15)),
      appendAmSessionSummary(amSummary(18)),
      appendPitch2SessionSummary(pitch2Summary(21)),
    ]);

    const rows = await listSavedSessions();

    expect(rows).toHaveLength(3);
    expect(rows.map((r) => r.id).sort()).toEqual(
      [freq.id, am.id, pitch2.id].sort()
    );
  });
});

describe('sessionStore — pitch2 트랙', () => {
  it('pitch2 요약을 저장하고 track/schemaVersion과 함께 읽는다', async () => {
    const record = await appendPitch2SessionSummary(pitch2Summary(12));
    const rows = await listSavedSessions();

    expect(rows[0].id).toBe(record.id);
    expect(rows[0].track).toBe('pitch2');
    expect(rows[0].schemaVersion).toBe(SESSION_RECORD_VERSION);
    expect(rows[0].summary.trialCount).toBe(12);
  });

  it('요약 수치가 null이어도 정상으로 본다(값 없음이 정상)', async () => {
    await appendPitch2SessionSummary({
      trialCount: 0,
      reversalCount: 0,
      correctCount: 0,
      endReason: 'manual',
      meanReversalCents: null,
      easiestCents: null,
      hardestCents: null,
    });

    const rows = await listSavedSessions();

    expect(rows).toHaveLength(1);
    expect(rows[0].track).toBe('pitch2');
  });
});

describe('sessionStore — 기존 동작 유지', () => {
  it('최신 기록이 앞에 온다', async () => {
    const first = await appendFreqSessionSummary(freqSummary(1));
    const second = await appendAmSessionSummary(amSummary(2));

    const rows = await listSavedSessions();

    expect(rows.map((r) => r.id)).toEqual([second.id, first.id]);
  });

  it(`한 트랙 측정이 ${MAX_MEASURE_SESSIONS}건을 넘으면 그 트랙 오래된 측정만 버린다`, async () => {
    for (let i = 0; i < MAX_MEASURE_SESSIONS + 3; i++) {
      await appendFreqSessionSummary(freqSummary(i), 'measure');
    }

    const rows = await listSavedSessions();

    expect(rows).toHaveLength(MAX_MEASURE_SESSIONS);
    // 최신이 앞 → 마지막에 넣은 trialCount가 맨 앞
    expect(rows[0].summary.trialCount).toBe(MAX_MEASURE_SESSIONS + 2);
  });

  it('귀풀기(practice)는 저장하지 않는다', async () => {
    await appendFreqSessionSummary(freqSummary(3), 'practice');

    expect(await listSavedSessions()).toEqual([]);
  });

  it('귀풀기를 넣어도 측정 이력은 그대로다', async () => {
    for (let i = 0; i < MAX_MEASURE_SESSIONS; i++) {
      await appendFreqSessionSummary(freqSummary(i), 'measure');
    }
    for (let i = 0; i < 10; i++) {
      await appendAmSessionSummary(amSummary(i), 'practice');
    }

    const rows = await listSavedSessions();
    const measureCount = rows.filter((r) => r.mode === 'measure').length;
    const practiceCount = rows.filter((r) => r.mode === 'practice').length;

    expect(measureCount).toBe(MAX_MEASURE_SESSIONS);
    expect(practiceCount).toBe(0);
    expect(rows).toHaveLength(MAX_MEASURE_SESSIONS);
  });

  it('측정 상한은 트랙별 — 한 트랙을 넘쳐도 다른 트랙 측정은 남는다', async () => {
    for (let i = 0; i < 5; i++) {
      await appendAmSessionSummary(amSummary(i), 'measure');
    }
    for (let i = 0; i < 4; i++) {
      await appendPitch2SessionSummary(pitch2Summary(i), 'measure');
    }
    for (let i = 0; i < MAX_MEASURE_SESSIONS + 3; i++) {
      await appendFreqSessionSummary(freqSummary(i), 'measure');
    }

    const rows = await listSavedSessions();
    const freqMeasure = rows.filter((r) => r.track === 'freq' && r.mode === 'measure');
    const amMeasure = rows.filter((r) => r.track === 'am' && r.mode === 'measure');
    const pitchMeasure = rows.filter(
      (r) => r.track === 'pitch2' && r.mode === 'measure'
    );

    expect(freqMeasure).toHaveLength(MAX_MEASURE_SESSIONS);
    expect(amMeasure).toHaveLength(5);
    expect(pitchMeasure).toHaveLength(4);
  });

  it('다음 연습 저장 때 남아 있던 귀풀기 기록은 버린다', async () => {
    storageMock.__setRaw(
      STORAGE_KEY,
      JSON.stringify([
        {
          id: 'old-practice',
          track: 'freq',
          savedAt: '2026-08-07T00:00:00.000Z',
          schemaVersion: 1,
          mode: 'practice',
          summary: freqSummary(3),
        },
      ])
    );

    await appendAmSessionSummary(amSummary(1), 'measure');
    const rows = await listSavedSessions();

    expect(rows).toHaveLength(1);
    expect(rows[0].track).toBe('am');
    expect(rows.some((r) => r.id === 'old-practice')).toBe(false);
  });

  it('저장된 값이 깨져 있으면 빈 목록으로 시작한다', async () => {
    storageMock.__setRaw(STORAGE_KEY, '{not json');

    const rows = await listSavedSessions();

    expect(rows).toEqual([]);
  });

  it('배열이 아닌 값이 저장돼 있으면 빈 목록으로 본다', async () => {
    storageMock.__setRaw(STORAGE_KEY, '{"a":1}');

    expect(await listSavedSessions()).toEqual([]);
  });

  it('초기화하면 목록이 빈다', async () => {
    await appendFreqSessionSummary(freqSummary(3));
    await clearSavedSessions();

    expect(await listSavedSessions()).toEqual([]);
  });
});

describe('sessionStore — 건별 삭제', () => {
  it('지정한 1건만 지우고 나머지는 순서를 유지한다', async () => {
    const a = await appendFreqSessionSummary(freqSummary(1), 'measure');
    const b = await appendAmSessionSummary(amSummary(2), 'measure');
    const c = await appendPitch2SessionSummary(pitch2Summary(3), 'measure');

    await deleteSavedSession(b.id);

    const rows = await listSavedSessions();
    expect(rows.map((r) => r.id)).toEqual([c.id, a.id]);
  });

  it('없는 id면 목록을 그대로 둔다', async () => {
    const kept = await appendFreqSessionSummary(freqSummary(1));

    await deleteSavedSession('missing-id');

    const rows = await listSavedSessions();
    expect(rows.map((r) => r.id)).toEqual([kept.id]);
  });

  it('마지막 1건을 지우면 목록이 빈다', async () => {
    const only = await appendAmSessionSummary(amSummary(1), 'measure');

    await deleteSavedSession(only.id);

    expect(await listSavedSessions()).toEqual([]);
  });
});

describe('sessionStore — 트랙별 삭제', () => {
  it('지정한 트랙만 지우고 다른 트랙은 남긴다', async () => {
    const pitch = await appendPitch2SessionSummary(pitch2Summary(1), 'measure');
    const freqFirst = await appendFreqSessionSummary(freqSummary(2), 'measure');
    const freqSecond = await appendFreqSessionSummary(freqSummary(3), 'measure');
    const am = await appendAmSessionSummary(amSummary(4), 'measure');

    await deleteSavedSessionsByTrack('freq');

    const rows = await listSavedSessions();
    expect(rows.map((r) => r.id).sort()).toEqual([am.id, pitch.id].sort());
    expect(rows.some((r) => r.id === freqFirst.id)).toBe(false);
    expect(rows.some((r) => r.id === freqSecond.id)).toBe(false);
  });

  it('해당 트랙이 없으면 목록을 그대로 둔다', async () => {
    const kept = await appendAmSessionSummary(amSummary(1));

    await deleteSavedSessionsByTrack('pitch2');

    const rows = await listSavedSessions();
    expect(rows.map((r) => r.id)).toEqual([kept.id]);
  });

  it('마지막 트랙을 지우면 목록이 빈다', async () => {
    await appendPitch2SessionSummary(pitch2Summary(1), 'measure');
    await appendPitch2SessionSummary(pitch2Summary(2), 'measure');

    await deleteSavedSessionsByTrack('pitch2');

    expect(await listSavedSessions()).toEqual([]);
  });
});

describe('sessionStore — 연습/측정 모드', () => {
  it('귀풀기 mode는 저장하지 않고 연습만 남긴다', async () => {
    await appendFreqSessionSummary(freqSummary(4), 'practice');
    await appendAmSessionSummary(amSummary(4), 'measure');

    const rows = await listSavedSessions();

    expect(rows).toHaveLength(1);
    expect(rows[0].track).toBe('am');
    expect(rows[0].mode).toBe('measure');
  });

  it('mode를 생략하면 측정으로 저장한다(호환 기본값)', async () => {
    await appendPitch2SessionSummary(pitch2Summary(4));

    const rows = await listSavedSessions();

    expect(rows[0].mode).toBe('measure');
  });

  it('isCountedInStats: 귀풀기만 제외, 연습·구버전(mode 없음)은 포함', async () => {
    const practice = {
      id: 'practice-row',
      track: 'freq' as const,
      savedAt: '2026-08-07T00:00:00.000Z',
      schemaVersion: 1,
      mode: 'practice' as const,
      summary: freqSummary(4),
    };
    const measure = {
      id: 'measure-row',
      track: 'am' as const,
      savedAt: '2026-08-07T00:00:01.000Z',
      schemaVersion: 1,
      mode: 'measure' as const,
      summary: amSummary(4),
    };
    storageMock.__setRaw(STORAGE_KEY, JSON.stringify([practice, measure]));

    const rows = await listSavedSessions();
    const counted = rows.filter(isCountedInStats).map((r) => r.id);

    expect(counted).toEqual(['measure-row']);
  });

  it('mode가 없는 구버전 레코드는 통계에 포함(측정 간주)', async () => {
    const legacy = {
      id: 'legacy-no-mode',
      track: 'freq' as const,
      savedAt: '2026-08-07T00:00:00.000Z',
      schemaVersion: 1,
      summary: freqSummary(10),
    };
    storageMock.__setRaw(STORAGE_KEY, JSON.stringify([legacy]));

    const rows = await listSavedSessions();

    expect(rows[0].mode).toBeUndefined();
    expect(isCountedInStats(rows[0])).toBe(true);
  });

  it('mode가 아는 값이 아니면 레코드를 버린다', async () => {
    const bad = {
      id: 'bad-mode',
      track: 'freq' as const,
      savedAt: '2026-08-07T00:00:00.000Z',
      schemaVersion: 1,
      mode: 'exam',
      summary: freqSummary(10),
    };
    storageMock.__setRaw(STORAGE_KEY, JSON.stringify([bad]));

    expect(await listSavedSessions()).toEqual([]);
  });
});

describe('sessionStore — 손상 레코드 방어 (P0-3)', () => {
  /** 형태가 온전한 freq 레코드 1건. */
  function goodRecord(id: string) {
    return {
      id,
      track: 'freq',
      savedAt: '2026-08-07T00:00:00.000Z',
      schemaVersion: 1,
      summary: freqSummary(10),
    };
  }

  function seed(...records: unknown[]): void {
    storageMock.__setRaw(STORAGE_KEY, JSON.stringify(records));
  }

  it('정상 레코드 사이에 섞인 손상 레코드만 버린다', async () => {
    seed(goodRecord('ok-1'), { track: 'freq' }, goodRecord('ok-2'));

    const rows = await listSavedSessions();

    expect(rows.map((r) => r.id)).toEqual(['ok-1', 'ok-2']);
  });

  it.each([
    ['summary가 없음', { id: 'x', track: 'freq', savedAt: '2026-08-07T00:00:00.000Z' }],
    ['summary가 null', { id: 'x', track: 'freq', savedAt: 'z', summary: null }],
    ['track이 모르는 값', { ...goodRecord('x'), track: 'unknown' }],
    ['id가 없음', { ...goodRecord('x'), id: undefined }],
    ['savedAt이 빈 문자열', { ...goodRecord('x'), savedAt: '' }],
    ['레코드가 null', null],
    ['레코드가 숫자', 42],
    [
      'trialCount가 문자열',
      { ...goodRecord('x'), summary: { ...freqSummary(1), trialCount: '다섯' } },
    ],
    [
      'endReason이 모르는 값',
      { ...goodRecord('x'), summary: { ...freqSummary(1), endReason: 'exploded' } },
    ],
    [
      'freq 레코드에 am 필드만 있음',
      { ...goodRecord('x'), summary: amSummary(3) },
    ],
    [
      'pitch2 레코드에 freq 필드만 있음',
      { ...goodRecord('x'), track: 'pitch2', summary: freqSummary(3) },
    ],
    [
      'pitch2 요약의 cent가 문자열',
      {
        ...goodRecord('x'),
        track: 'pitch2',
        summary: { ...pitch2Summary(3), meanReversalCents: '낮음' },
      },
    ],
  ])('버린다: %s', async (_label, broken) => {
    seed(broken, goodRecord('survivor'));

    const rows = await listSavedSessions();

    expect(rows.map((r) => r.id)).toEqual(['survivor']);
  });

  it('요약 수치가 null인 것은 정상으로 본다(값 없음이 정상)', async () => {
    seed({
      ...goodRecord('nulls'),
      summary: {
        trialCount: 0,
        reversalCount: 0,
        correctCount: 0,
        endReason: null,
        meanReversalDeltaCents: null,
        easiestDeltaCents: null,
        hardestDeltaCents: null,
      },
    });

    expect((await listSavedSessions()).map((r) => r.id)).toEqual(['nulls']);
  });

  it('schemaVersion이 없는 초기 저장분도 읽는다', async () => {
    const { schemaVersion: _omit, ...legacy } = goodRecord('legacy');
    seed(legacy);

    expect((await listSavedSessions()).map((r) => r.id)).toEqual(['legacy']);
  });

  it('새로 저장한 레코드에는 schemaVersion이 붙는다', async () => {
    await appendFreqSessionSummary(freqSummary(5));

    const rows = await listSavedSessions();

    expect(rows[0].schemaVersion).toBe(SESSION_RECORD_VERSION);
  });

  it('손상 레코드는 다음 저장 때 저장소에서도 사라진다', async () => {
    seed({ garbage: true }, goodRecord('ok-1'));

    await appendFreqSessionSummary(freqSummary(1));
    const rows = await listSavedSessions();

    expect(rows).toHaveLength(2);
    expect(rows.map((r) => r.id)).toContain('ok-1');
  });
});
