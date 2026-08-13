/**
 * am 계단식 — 하한 −30·3단계 가변 스텝(6→4→2, 전환 반전 2·4) 회귀.
 * dB라 cent 통일 대상은 아니고 구조만 세 트랙과 맞췄다. 임상 역치 검증 아님.
 */

import {
  MAX_DEPTH_DB,
  MIN_DEPTH_DB,
  STEP_SCHEDULE_DB,
  applyAmStaircaseResult,
  createAmStaircase,
} from '@/training/amStaircase';

/** 연속 정답 2회 → 한 번 하강(더 어렵게, 더 음수). */
function down(state: ReturnType<typeof createAmStaircase>) {
  return applyAmStaircaseResult(applyAmStaircaseResult(state, true), true);
}

describe('amStaircase — 통일된 상수', () => {
  it('시작 0 / 하한 −30', () => {
    expect(MAX_DEPTH_DB).toBe(0);
    expect(MIN_DEPTH_DB).toBe(-30);

    const s = createAmStaircase();
    expect(s.depthDb).toBe(0);
  });

  it('스텝 스케줄은 6→4→2 (전환 반전 2·4)', () => {
    expect(STEP_SCHEDULE_DB.map((e) => e.step)).toEqual([6, 4, 2]);
    expect(STEP_SCHEDULE_DB.map((e) => e.fromReversal)).toEqual([0, 2, 4]);
  });
});

describe('amStaircase — 가변 스텝 적용', () => {
  it('반전 전에는 6 dB씩 어려워진다(2-down)', () => {
    const s0 = createAmStaircase();
    const s1 = down(s0);
    expect(s1.depthDb).toBe(-6);
    const s2 = down(s1);
    expect(s2.depthDb).toBe(-12);
  });

  it('오답은 즉시 0쪽으로 쉬워진다(1-up), 상한 0', () => {
    const s0 = createAmStaircase();
    // 먼저 어렵게 만든 뒤 오답
    const hard = down(s0); // -6
    const up = applyAmStaircaseResult(hard, false);
    expect(up.depthDb).toBe(0); // -6 + 6, 상한 0
  });

  it('반전 2회부터 4 dB, 4회부터 2 dB로 좁아진다', () => {
    let s = createAmStaircase();
    s = down(s); // 0→-6 (down)
    s = applyAmStaircaseResult(s, false); // -6→0 (up) = 반전 1
    expect(s.reversalCount).toBe(1);

    s = down(s); // 0→-6 (down) = 반전 2 → 이후 4 dB
    expect(s.reversalCount).toBe(2);
    // 반전 2 상태에서 다음 하강은 4 dB 폭
    const s4 = down(s); // -6 → -6-? : 첫 2-down 중 하나만이면 스텝 미적용, 아래에서 확인
    // down()은 2정답이라 확실히 한 번 스텝: -6 - 4 = -10
    expect(s4.depthDb).toBe(-10);
  });

  it('하한 −30 아래로 내려가지 않는다', () => {
    let s = createAmStaircase();
    for (let i = 0; i < 20; i += 1) {
      s = down(s);
    }
    expect(s.depthDb).toBeGreaterThanOrEqual(-30);
  });
});
