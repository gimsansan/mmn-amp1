import {
  envelopeRmsScale,
  envelopeSegments,
  equalPowerHarmonics,
  MAX_ENVELOPE_SCALE,
  MIN_LEVEL,
  toRealImag,
  type ToneEnvelope,
} from "@/audio/instrumentSpectra";

/** 어택·디케이·릴리스가 없는 「내내 최대」 포락선. 계산의 기준점. */
const FLAT: ToneEnvelope = {
  attackSec: 0,
  decaySec: 0,
  sustainLevel: 1,
  releaseSec: 0,
};

describe("equalPowerHarmonics", () => {
  it("사인 하나는 그대로 둔다", () => {
    expect(equalPowerHarmonics([1])).toEqual([1]);
  });

  it("하모닉이 늘어도 파워 합이 1이 되게 줄인다", () => {
    const harmonics = equalPowerHarmonics([1, 1]);
    const power = harmonics.reduce((sum, a) => sum + a * a, 0);
    expect(power).toBeCloseTo(1, 10);
    expect(harmonics[0]).toBeCloseTo(Math.SQRT1_2, 10);
  });

  it("서로 다른 악기 스펙트럼이 같은 파워로 맞춰진다", () => {
    const powerOf = (spectrum: readonly number[]): number =>
      equalPowerHarmonics(spectrum).reduce((sum, a) => sum + a * a, 0);
    expect(powerOf([1, 0.62, 0.4, 0.24])).toBeCloseTo(powerOf([1, 0.28]), 10);
  });

  it("빈 스펙트럼과 음수는 거부한다", () => {
    expect(() => equalPowerHarmonics([])).toThrow(RangeError);
    expect(() => equalPowerHarmonics([1, -0.5])).toThrow(RangeError);
    expect(() => equalPowerHarmonics([0, 0])).toThrow(RangeError);
  });
});

describe("toRealImag", () => {
  it("0번은 DC로 비우고 사인 성분만 imag에 싣는다", () => {
    const { real, imag } = toRealImag([1, 0.5]);
    expect(real).toHaveLength(3);
    expect(imag).toHaveLength(3);
    expect([...real]).toEqual([0, 0, 0]);
    expect(imag[0]).toBe(0);
    expect(imag[1]).toBeGreaterThan(imag[2] ?? 0);
  });
});

describe("envelopeSegments", () => {
  it("어택·디케이·릴리스가 없으면 한 구간으로 편다", () => {
    const segments = envelopeSegments(FLAT, 1.6);
    expect(segments).toHaveLength(1);
    expect(segments[0]).toMatchObject({
      startSec: 0,
      endSec: 1.6,
      startValue: 1,
      endValue: 1,
    });
  });

  it("구간이 이어 붙고 마지막이 길이에 딱 맞는다", () => {
    const segments = envelopeSegments(
      { attackSec: 0.09, decaySec: 0.18, sustainLevel: 0.8, releaseSec: 0.12 },
      1.6,
    );
    expect(segments[0]?.startSec).toBe(0);
    for (let i = 1; i < segments.length; i += 1) {
      expect(segments[i]?.startSec).toBeCloseTo(segments[i - 1]?.endSec ?? -1, 10);
    }
    expect(segments.at(-1)?.endSec).toBeCloseTo(1.6, 10);
    expect(segments.at(-1)?.endValue).toBe(MIN_LEVEL);
  });

  it("길이가 모자라면 셋을 비율대로 줄인다", () => {
    const segments = envelopeSegments(
      { attackSec: 1, decaySec: 1, sustainLevel: 0.5, releaseSec: 1 },
      1.5,
    );
    // 3초짜리를 1.5초에 넣으므로 각 구간이 절반. 서스테인 유지 구간은 사라진다.
    expect(segments).toHaveLength(3);
    expect(segments[0]?.endSec).toBeCloseTo(0.5, 10);
    expect(segments.at(-1)?.endSec).toBeCloseTo(1.5, 10);
  });

  it("길이가 0 이하면 거부한다", () => {
    expect(() => envelopeSegments(FLAT, 0)).toThrow(RangeError);
  });
});

describe("envelopeRmsScale", () => {
  it("내내 최대인 포락선은 보정하지 않는다", () => {
    expect(envelopeRmsScale(FLAT, 1.6)).toBeCloseTo(1, 10);
  });

  it("길이 내내 오르기만 하는 선형 포락선은 √3배", () => {
    // ∫(t/D)²dt / D = 1/3 → 배율 = √3.
    const scale = envelopeRmsScale(
      { attackSec: 1.6, decaySec: 0, sustainLevel: 1, releaseSec: 0 },
      1.6,
    );
    expect(scale).toBeCloseTo(Math.sqrt(3), 10);
  });

  it("금방 잦아드는 소리를 더 키운다", () => {
    const plucked: ToneEnvelope = {
      attackSec: 0.005,
      decaySec: 1.4,
      sustainLevel: 0.02,
      releaseSec: 0.195,
    };
    const bowed: ToneEnvelope = {
      attackSec: 0.09,
      decaySec: 0.18,
      sustainLevel: 0.8,
      releaseSec: 0.12,
    };
    expect(envelopeRmsScale(plucked, 1.6)).toBeGreaterThan(
      envelopeRmsScale(bowed, 1.6),
    );
  });

  it("거의 무음이어도 상한에서 자른다", () => {
    const scale = envelopeRmsScale(
      {
        attackSec: 0.001,
        decaySec: 0.001,
        sustainLevel: MIN_LEVEL,
        releaseSec: 0.001,
      },
      1,
    );
    expect(scale).toBe(MAX_ENVELOPE_SCALE);
  });
});
