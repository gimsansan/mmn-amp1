/**
 * freq 계단식 — 가변 스텝(50→20→10)·범위(10~300)·시작(200) 회귀.
 * pitch2와 파라미터를 통일한 뒤의 동작을 고정한다. 임상 역치 검증이 아님.
 */

import {
  DEFAULT_START_DELTA_CENTS,
  MAX_DELTA_CENTS,
  MIN_DELTA_CENTS,
  STEP_SCHEDULE,
  applyStaircaseResult,
  createFreqStaircase,
  stepForReversals,
} from '@/training/freq/freqStaircase';

/** 연속 정답 2회를 넣어 한 번 하강시킨다. */
function down(state: ReturnType<typeof createFreqStaircase>) {
  return applyStaircaseResult(applyStaircaseResult(state, true), true);
}

describe('freqStaircase — 통일된 상수', () => {
  it('시작 200 / 범위 10~300', () => {
    expect(DEFAULT_START_DELTA_CENTS).toBe(200);
    expect(MIN_DELTA_CENTS).toBe(10);
    expect(MAX_DELTA_CENTS).toBe(300);

    const s = createFreqStaircase();
    expect(s.deltaCents).toBe(200);
    expect(s.currentStep).toBe(50);
  });

  it('스텝 스케줄은 50→20→10 (전환 반전 2·4)', () => {
    expect(STEP_SCHEDULE.map((e) => e.step)).toEqual([50, 20, 10]);
    expect(stepForReversals(0)).toBe(50);
    expect(stepForReversals(1)).toBe(50);
    expect(stepForReversals(2)).toBe(20);
    expect(stepForReversals(3)).toBe(20);
    expect(stepForReversals(4)).toBe(10);
    expect(stepForReversals(9)).toBe(10);
  });
});

describe('freqStaircase — 가변 스텝 적용', () => {
  it('반전 전에는 50 cent씩 움직인다(2-down)', () => {
    const s0 = createFreqStaircase();
    const s1 = down(s0);
    expect(s1.deltaCents).toBe(150); // 200 - 50
    const s2 = down(s1);
    expect(s2.deltaCents).toBe(100); // 150 - 50
  });

  it('오답은 즉시 상승(1-up), 같은 스텝', () => {
    const s0 = createFreqStaircase();
    const up = applyStaircaseResult(s0, false);
    expect(up.deltaCents).toBe(250); // 200 + 50 (상한 300 이내)
    expect(up.reversalCount).toBe(0); // 첫 이동엔 반전 없음
  });

  it('반전이 쌓이면 스텝이 좁아진다', () => {
    // 하강(down) 한 번으로 방향 확정 → 오답으로 첫 반전 발생
    let s = createFreqStaircase();
    s = down(s); // 200→150, 방향 down
    s = applyStaircaseResult(s, false); // 150→200, 방향 up = 반전 1
    expect(s.reversalCount).toBe(1);
    expect(s.currentStep).toBe(50); // 아직 반전 2 미만

    s = down(s); // 방향 down = 반전 2 → 이후 스텝 20
    expect(s.reversalCount).toBe(2);
    expect(s.currentStep).toBe(20);
  });

  it('stepCents 옵션을 주면 고정 스텝(하위호환)', () => {
    const s0 = createFreqStaircase();
    const s1 = applyStaircaseResult(
      applyStaircaseResult(s0, true, { stepCents: 10 }),
      true,
      { stepCents: 10 }
    );
    expect(s1.deltaCents).toBe(190); // 200 - 10
  });
});
