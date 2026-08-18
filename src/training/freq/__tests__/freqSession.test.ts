/**
 * 귀풀기는 반전·시행 한도 없이 직접 종료만. 연습은 전환 6(기본값).
 */

import {
  applySessionResult,
  createFreqSession,
} from '@/training/freq/freqSession';

describe('freqSession — 모드별 종료', () => {
  it('귀풀기(null 한도)는 여러 시행 후에도 자동 종료하지 않는다', () => {
    let session = createFreqSession({
      targetReversals: null,
      maxTrials: null,
    });
    for (let i = 0; i < 12; i += 1) {
      session = applySessionResult(session, i % 3 !== 2);
    }
    expect(session.status).toBe('active');
    expect(session.endReason).toBeNull();
  });

  it('연습 기본값은 반전 6·시행 40', () => {
    const session = createFreqSession();
    expect(session.targetReversals).toBe(6);
    expect(session.maxTrials).toBe(40);
  });

  it('시행 한도에 닿으면 max_trials로 끝난다', () => {
    let session = createFreqSession({
      targetReversals: null,
      maxTrials: 2,
    });
    session = applySessionResult(session, true);
    expect(session.status).toBe('active');
    session = applySessionResult(session, true);
    expect(session.status).toBe('completed');
    expect(session.endReason).toBe('max_trials');
  });
});
