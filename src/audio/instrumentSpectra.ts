/**
 * 악기 음색 표 — 하모닉 진폭과 진폭 포락선.
 *
 * 오디오 노드를 import 하지 않는다. 여기 있는 것은 전부 순수 계산이라
 * 테스트가 `react-native-audio-api`(네이티브)를 끌고 오지 않는다.
 * 노드에 싣는 일은 `instrumentTone.ts`가 한다.
 *
 * `추정`: 하모닉 값은 Meyer 3장·Plazak(2010)이 말하는 악기군 경향
 * (건반·퉁김은 완만한 감쇠, 활 현은 상부 하모닉이 오래 남음, 관·입김은 거의
 * 순음)을 눈대중으로 옮긴 것이다. **실측 스펙트럼이 아니다.**
 * 실제 녹음 wav로 갈아탈 때 이 파일은 통째로 버려도 된다.
 */

/** h1(기음)부터 차례로 놓은 상대 진폭. 값의 절대 크기는 뜻이 없다 — 비율만 쓴다. */
export type HarmonicSpectrum = readonly number[];

/**
 * 진폭 포락선. 어택·디케이·서스테인·릴리스.
 *
 * 온셋(어택)이 음색 인지에 크게 관여한다(Meyer 3장) — 퉁김·때림은 몇 ms,
 * 활·입김은 수십 ms다. 여기서는 **음색 단서를 만드는 축**이지 난이도 축이 아니다.
 */
export type ToneEnvelope = {
  attackSec: number;
  decaySec: number;
  /** 디케이가 내려앉는 높이(0~1). 퉁김·때림은 0에 가깝고 활·입김은 높다. */
  sustainLevel: number;
  releaseSec: number;
};

/**
 * 지수 램프의 바닥. WebAudio의 `exponentialRampToValueAtTime`은 0을 못 받는다.
 * 들리지 않을 만큼 작으면서(−80 dB) 0이 아닌 값.
 */
export const MIN_LEVEL = 1e-4;

/** 포락선 한 구간. `startSec`의 `startValue`에서 `endSec`의 `endValue`로 간다. */
export type EnvelopeSegment = {
  startSec: number;
  startValue: number;
  endSec: number;
  endValue: number;
  curve: "linear" | "exponential";
};

function clampLevel(value: number): number {
  return Math.min(1, Math.max(MIN_LEVEL, value));
}

/**
 * 하모닉을 **등파워로** 맞춘다. 배율 = 1/√(Σaᵢ²).
 *
 * 이러면 하모닉이 몇 개든 파형의 RMS가 진폭 1 사인과 같아진다. 안 맞추면
 * 하모닉이 많은 바이올린이 그냥 더 크게 들려 **음색이 아니라 크기로** 고를 수 있다.
 * (피크가 아니라 파워를 맞추는 이유: 귀가 듣는 것은 파워 쪽이다.)
 */
export function equalPowerHarmonics(
  spectrum: HarmonicSpectrum,
): number[] {
  if (spectrum.length === 0) {
    throw new RangeError("spectrum must have at least one harmonic");
  }
  let sumSquares = 0;
  for (const amplitude of spectrum) {
    if (!Number.isFinite(amplitude) || amplitude < 0) {
      throw new RangeError(
        `harmonic amplitude must be a non-negative finite number: ${amplitude}`,
      );
    }
    sumSquares += amplitude * amplitude;
  }
  if (sumSquares <= 0) {
    throw new RangeError("spectrum must have at least one non-zero harmonic");
  }
  const scale = 1 / Math.sqrt(sumSquares);
  return spectrum.map((amplitude) => amplitude * scale);
}

/**
 * `createPeriodicWave(real, imag)`에 넣을 두 배열.
 * 0번은 DC(항상 0), k번이 k차 하모닉이다. 사인 성분이므로 전부 `imag`에 싣는다.
 */
export function toRealImag(spectrum: HarmonicSpectrum): {
  real: Float32Array;
  imag: Float32Array;
} {
  const harmonics = equalPowerHarmonics(spectrum);
  const real = new Float32Array(harmonics.length + 1);
  const imag = new Float32Array(harmonics.length + 1);
  harmonics.forEach((amplitude, index) => {
    imag[index + 1] = amplitude;
  });
  return { real, imag };
}

/**
 * 포락선을 구간 목록으로 편다. 길이가 모자라면 어택·디케이·릴리스를 **비율대로**
 * 줄인다(하나만 잘라 내면 그 악기의 온셋 성격이 통째로 사라진다).
 */
export function envelopeSegments(
  envelope: ToneEnvelope,
  durationSec: number,
): EnvelopeSegment[] {
  if (!Number.isFinite(durationSec) || durationSec <= 0) {
    throw new RangeError(
      `durationSec must be a positive finite number: ${durationSec}`,
    );
  }
  const sustainLevel = clampLevel(envelope.sustainLevel);
  const raw = envelope.attackSec + envelope.decaySec + envelope.releaseSec;
  const squeeze = raw > durationSec ? durationSec / raw : 1;
  const attackSec = envelope.attackSec * squeeze;
  const decaySec = envelope.decaySec * squeeze;
  const releaseSec = envelope.releaseSec * squeeze;
  const holdSec = Math.max(
    0,
    durationSec - attackSec - decaySec - releaseSec,
  );

  const segments: EnvelopeSegment[] = [];
  let cursor = 0;

  const push = (
    lengthSec: number,
    startValue: number,
    endValue: number,
    curve: EnvelopeSegment["curve"],
  ): void => {
    if (lengthSec <= 0) {
      return;
    }
    segments.push({
      startSec: cursor,
      startValue,
      endSec: cursor + lengthSec,
      endValue,
      curve,
    });
    cursor += lengthSec;
  };

  push(attackSec, 0, 1, "linear");
  push(decaySec, 1, sustainLevel, "exponential");
  push(holdSec, sustainLevel, sustainLevel, "linear");
  push(releaseSec, sustainLevel, MIN_LEVEL, "exponential");

  return segments;
}

/** 구간 하나의 제곱 적분값(∫e(t)²dt). 선형·지수 각각 해석해가 있다. */
function segmentSquareIntegral(segment: EnvelopeSegment): number {
  const length = segment.endSec - segment.startSec;
  const v0 = segment.startValue;
  const v1 = segment.endValue;
  if (length <= 0) {
    return 0;
  }
  if (segment.curve === "linear") {
    return (length * (v0 * v0 + v0 * v1 + v1 * v1)) / 3;
  }
  // 지수: e(t) = v0·r^(t/L). ∫ = v0²·L·(r²−1)/(2·ln r).
  const ratio = v1 / v0;
  if (Math.abs(ratio - 1) < 1e-9) {
    return length * v0 * v0;
  }
  return (v0 * v0 * length * (ratio * ratio - 1)) / (2 * Math.log(ratio));
}

/** 상한. 이걸 안 두면 아주 짧은 퉁김이 피크에서 잘린다. */
export const MAX_ENVELOPE_SCALE = 2.5;

/**
 * 포락선의 RMS를 1로 되돌리는 배율.
 *
 * 때림·퉁김은 금방 잦아들어 **같은 피크라도 총 에너지가 훨씬 적다.** 그대로 두면
 * 피아노·기타가 조용한 소리, 바이올린·플루트가 큰 소리로 들려 음색 대신 크기가
 * 단서가 된다. 배율은 `MAX_ENVELOPE_SCALE`에서 자른다.
 */
export function envelopeRmsScale(
  envelope: ToneEnvelope,
  durationSec: number,
): number {
  const segments = envelopeSegments(envelope, durationSec);
  const total = segments.reduce(
    (sum, segment) => sum + segmentSquareIntegral(segment),
    0,
  );
  const meanSquare = total / durationSec;
  if (meanSquare <= 0) {
    return MAX_ENVELOPE_SCALE;
  }
  return Math.min(MAX_ENVELOPE_SCALE, 1 / Math.sqrt(meanSquare));
}
