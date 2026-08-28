import {
  AudioContext,
  GainNode,
  OscillatorNode,
  PeriodicWave,
} from 'react-native-audio-api';

import {
  envelopeRmsScale,
  envelopeSegments,
  MIN_LEVEL,
  toRealImag,
  type HarmonicSpectrum,
  type ToneEnvelope,
} from '@/audio/instrumentSpectra';
import { DEFAULT_GAIN } from '@/audio/pureTone';

/**
 * 악기 음색 한 음 재생 — 하모닉 합성 + 악기별 진폭 포락선.
 *
 * `나중계획안.md` §2가 남긴 미결(「`PeriodicWave` 지원 여부 확인」)의 답은
 * **지원한다**이다. 그래서 오실레이터를 하모닉 수만큼 쌓지 않고 하나만 쓴다
 * (모바일에서 오실레이터 N개는 비싸다).
 *
 * `주의`: 합성음이다. 진짜 악기 녹음이 아니다. 실물 wav가 생기면 이 모듈 대신
 * `expo-audio` 재생(`ling6Play.ts` 모양)으로 갈아타면 되고, 훈련 쪽
 * (`instPlay.ts` 위)은 손대지 않아도 된다.
 */

/**
 * 한 음의 길이(초). **악기마다 다르게 두지 않는다** — 길이가 다르면 음색을
 * 안 듣고 길이만으로 고를 수 있다(링 6의 「여섯 파일 길이를 맞춘다」와 같은 이유).
 * 포락선이 이 길이 안에서 어택·디케이·릴리스를 나눠 쓴다.
 */
export const INSTRUMENT_NOTE_SEC = 1.6;

export type PlayInstrumentToneOptions = {
  spectrum: HarmonicSpectrum;
  envelope: ToneEnvelope;
  /** 기음. 시행마다 굴려서 음고가 단서가 되지 않게 한다(`instSession.ts`). */
  frequencyHz: number;
  durationSec?: number;
  /** 무보정 피크 리니어 게인. 포락선 RMS 보정이 여기에 곱해진다. */
  gain?: number;
};

let sharedContext: AudioContext | null = null;
let activeOscillator: OscillatorNode | null = null;
let activeGain: GainNode | null = null;
let pendingResolve: (() => void) | null = null;
/** 스펙트럼은 안 변하는데 파형을 매번 만들 이유가 없다. 컨텍스트를 닫으면 버린다. */
let waveCache = new Map<string, PeriodicWave>();

function getContext(): AudioContext {
  if (!sharedContext) {
    sharedContext = new AudioContext();
  }
  return sharedContext;
}

async function ensureRunning(ctx: AudioContext): Promise<void> {
  if (ctx.state !== 'running') {
    await ctx.resume();
  }
}

function resolvePendingPlay(): void {
  const resolve = pendingResolve;
  pendingResolve = null;
  resolve?.();
}

function periodicWaveOf(
  ctx: AudioContext,
  spectrum: HarmonicSpectrum,
): PeriodicWave {
  const key = spectrum.join(',');
  const cached = waveCache.get(key);
  if (cached) {
    return cached;
  }
  const { real, imag } = toRealImag(spectrum);
  // 정규화를 끈다 — 켜면 브라우저 규칙대로 피크가 1로 눌려
  // `equalPowerHarmonics`가 맞춰 둔 등파워가 깨진다(= 크기가 단서가 된다).
  const wave = ctx.createPeriodicWave(real, imag, {
    disableNormalization: true,
  });
  waveCache.set(key, wave);
  return wave;
}

/** 진행 중인 음이 있으면 즉시 끊는다(클릭 가능 — 중단 경로). */
export function stopInstrumentTone(): void {
  const osc = activeOscillator;
  const gain = activeGain;
  activeOscillator = null;
  activeGain = null;

  if (!osc && !gain) {
    resolvePendingPlay();
    return;
  }

  try {
    const ctx = sharedContext;
    const now = ctx?.currentTime ?? 0;
    if (gain && ctx) {
      gain.gain.cancelScheduledValues(now);
      gain.gain.setValueAtTime(gain.gain.value, now);
      gain.gain.linearRampToValueAtTime(0, now + 0.01);
    }
    osc?.stop(now + 0.015);
  } catch {
    // already stopped
  }

  try {
    osc?.disconnect();
  } catch {
    // already disconnected
  }
  try {
    gain?.disconnect();
  } catch {
    // already disconnected
  }

  resolvePendingPlay();
}

/**
 * 악기음 1회 재생. oscillator(PeriodicWave) → gain(포락선) → destination.
 * Promise는 음이 끝나거나 `stopInstrumentTone`으로 끊길 때 resolve.
 */
export async function playInstrumentTone(
  options: PlayInstrumentToneOptions,
): Promise<void> {
  const { spectrum, envelope, frequencyHz } = options;
  const durationSec = options.durationSec ?? INSTRUMENT_NOTE_SEC;
  const peakGain = options.gain ?? DEFAULT_GAIN;

  if (!Number.isFinite(frequencyHz) || frequencyHz <= 0) {
    throw new RangeError(
      `frequencyHz must be a positive finite number: ${frequencyHz}`,
    );
  }
  if (!Number.isFinite(durationSec) || durationSec <= 0) {
    throw new RangeError(
      `durationSec must be a positive finite number: ${durationSec}`,
    );
  }
  if (!Number.isFinite(peakGain) || peakGain < 0) {
    throw new RangeError(
      `gain must be a non-negative finite number: ${peakGain}`,
    );
  }

  const ctx = getContext();
  await ensureRunning(ctx);

  stopInstrumentTone();

  const osc = ctx.createOscillator();
  osc.frequency.value = frequencyHz;
  osc.setPeriodicWave(periodicWaveOf(ctx, spectrum));

  const gain = ctx.createGain();
  const t0 = ctx.currentTime;
  const level = peakGain * envelopeRmsScale(envelope, durationSec);
  const tEnd = t0 + durationSec;

  gain.gain.setValueAtTime(0, t0);
  for (const segment of envelopeSegments(envelope, durationSec)) {
    const at = t0 + segment.endSec;
    const value = segment.endValue * level;
    if (segment.curve === 'linear') {
      gain.gain.linearRampToValueAtTime(value, at);
    } else {
      // 지수 램프는 0을 못 받는다 — 바닥이 MIN_LEVEL인 이유.
      gain.gain.exponentialRampToValueAtTime(
        Math.max(value, MIN_LEVEL * level),
        at,
      );
    }
  }
  // 지수 릴리스는 0에 닿지 않는다. 끝에서 딱 끊어 꼬리를 없앤다.
  gain.gain.setValueAtTime(0, tEnd);

  osc.connect(gain);
  gain.connect(ctx.destination);

  activeOscillator = osc;
  activeGain = gain;

  const ended = new Promise<void>((resolve) => {
    pendingResolve = resolve;
  });

  osc.onEnded = () => {
    const isCurrent = activeOscillator === osc;
    if (isCurrent) {
      activeOscillator = null;
      activeGain = null;
    }
    try {
      osc.disconnect();
      gain.disconnect();
    } catch {
      // already disconnected
    }
    // stopInstrumentTone이 이미 resolve한 경우(교체·중단)에는 다시 하지 않음.
    if (isCurrent) {
      resolvePendingPlay();
    }
  };

  osc.start(t0);
  osc.stop(tEnd + 0.02);

  await ended;
}

export async function closeInstrumentToneContext(): Promise<void> {
  stopInstrumentTone();
  waveCache = new Map();
  if (sharedContext) {
    await sharedContext.close();
    sharedContext = null;
  }
}
