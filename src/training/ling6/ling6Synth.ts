import {
  AudioBufferSourceNode,
  AudioContext,
  BiquadFilterNode,
  GainNode,
  OscillatorNode,
} from "react-native-audio-api";

import { DEFAULT_GAIN, DEFAULT_RAMP_SEC } from "@/audio/pureTone";
import type { Ling6Choice, Ling6SoundId } from "@/training/ling6/sounds";

/** 말소리 한 토막 길이. 순음 확인용(0.5초)보다 조금 김. 확정 스펙 아님. */
export const LING6_DURATION_SEC = 0.8;

type FormantPatch = {
  f1: number;
  f2: number;
  /** 피크 게인 배율(기본 1). /m/은 조금 낮춤. */
  gainScale?: number;
};

/**
 * 2포먼트 근사. 무손실 음소 WAV가 아님.
 * 상대 비교(어떤 소리인지)용이지 dB·역치용이 아니다.
 */
const VOWEL_PATCH: Record<Exclude<Ling6SoundId, "s" | "sh">, FormantPatch> = {
  m: { f1: 250, f2: 1175, gainScale: 0.7 },
  u: { f1: 300, f2: 870 },
  a: { f1: 730, f2: 1090 },
  i: { f1: 270, f2: 2290 },
};

let sharedContext: AudioContext | null = null;
let playGen = 0;
let silenceTimer: ReturnType<typeof setTimeout> | null = null;
let activeOscillators: OscillatorNode[] = [];
let activeGains: GainNode[] = [];
let activeFilter: BiquadFilterNode | null = null;
let activeBufferSource: AudioBufferSourceNode | null = null;
let pendingResolve: (() => void) | null = null;

function getContext(): AudioContext {
  if (!sharedContext) {
    sharedContext = new AudioContext();
  }
  return sharedContext;
}

async function ensureRunning(ctx: AudioContext): Promise<void> {
  if (ctx.state !== "running") {
    await ctx.resume();
  }
}

function resolvePending(): void {
  const resolve = pendingResolve;
  pendingResolve = null;
  resolve?.();
}

function clearSilenceTimer(): void {
  if (silenceTimer !== null) {
    clearTimeout(silenceTimer);
    silenceTimer = null;
  }
}

function disconnectAll(): void {
  const ctx = sharedContext;
  const now = ctx?.currentTime ?? 0;

  for (const gain of activeGains) {
    try {
      gain.gain.cancelScheduledValues(now);
      gain.gain.setValueAtTime(gain.gain.value, now);
      gain.gain.linearRampToValueAtTime(0, now + 0.01);
    } catch {
      // already stopped
    }
  }

  for (const osc of activeOscillators) {
    try {
      osc.stop(now + 0.015);
    } catch {
      // already stopped
    }
    try {
      osc.disconnect();
    } catch {
      // already disconnected
    }
  }

  if (activeBufferSource) {
    try {
      activeBufferSource.stop(now + 0.015);
    } catch {
      // already stopped
    }
    try {
      activeBufferSource.disconnect();
    } catch {
      // already disconnected
    }
  }

  if (activeFilter) {
    try {
      activeFilter.disconnect();
    } catch {
      // already disconnected
    }
  }

  for (const gain of activeGains) {
    try {
      gain.disconnect();
    } catch {
      // already disconnected
    }
  }

  activeOscillators = [];
  activeGains = [];
  activeFilter = null;
  activeBufferSource = null;
}

/** 진행 중인 재생·무음 대기를 끊는다. */
export function stopLing6Playback(): void {
  playGen += 1;
  clearSilenceTimer();
  disconnectAll();
  resolvePending();
}

function waitSilence(durationSec: number, gen: number): Promise<void> {
  const ended = new Promise<void>((resolve) => {
    pendingResolve = resolve;
  });
  silenceTimer = setTimeout(() => {
    silenceTimer = null;
    if (gen === playGen) {
      resolvePending();
    }
  }, durationSec * 1000);
  return ended;
}

function fillWhiteNoise(length: number): Float32Array<ArrayBuffer> {
  const data = new Float32Array(length);
  for (let i = 0; i < length; i += 1) {
    data[i] = Math.random() * 2 - 1;
  }
  return data;
}

async function playFricative(
  ctx: AudioContext,
  kind: "s" | "sh",
  durationSec: number,
  peakGain: number,
  rampSec: number,
  gen: number,
): Promise<void> {
  const length = Math.max(1, Math.floor(ctx.sampleRate * durationSec));
  const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
  buffer.copyToChannel(fillWhiteNoise(length), 0);

  const source = ctx.createBufferSource();
  source.buffer = buffer;

  const filter = ctx.createBiquadFilter();
  if (kind === "s") {
    filter.type = "highpass";
    filter.frequency.value = 4000;
    filter.Q.value = 0.7;
  } else {
    filter.type = "bandpass";
    filter.frequency.value = 2500;
    filter.Q.value = 1;
  }

  const master = ctx.createGain();
  const t0 = ctx.currentTime;
  const maxRamp = Math.min(rampSec, durationSec / 3);
  const tPeak = t0 + maxRamp;
  const tRelease = t0 + Math.max(durationSec - maxRamp, maxRamp);
  const tEnd = t0 + durationSec;

  master.gain.setValueAtTime(0, t0);
  master.gain.linearRampToValueAtTime(peakGain, tPeak);
  master.gain.setValueAtTime(peakGain, tRelease);
  master.gain.linearRampToValueAtTime(0, tEnd);

  source.connect(filter);
  filter.connect(master);
  master.connect(ctx.destination);

  activeBufferSource = source;
  activeFilter = filter;
  activeGains = [master];

  const ended = new Promise<void>((resolve) => {
    pendingResolve = resolve;
  });

  source.onEnded = () => {
    if (gen !== playGen) {
      return;
    }
    const isCurrent = activeBufferSource === source;
    if (isCurrent) {
      disconnectAll();
      resolvePending();
    }
  };

  source.start(t0);
  source.stop(tEnd + 0.02);

  await ended;
}

async function playVowel(
  ctx: AudioContext,
  patch: FormantPatch,
  durationSec: number,
  peakGain: number,
  rampSec: number,
  gen: number,
): Promise<void> {
  const osc1 = ctx.createOscillator();
  const osc2 = ctx.createOscillator();
  osc1.type = "sine";
  osc2.type = "sine";
  osc1.frequency.value = patch.f1;
  osc2.frequency.value = patch.f2;

  const mix1 = ctx.createGain();
  const mix2 = ctx.createGain();
  mix1.gain.value = 0.65;
  mix2.gain.value = 0.45;

  const master = ctx.createGain();
  const scaledPeak = peakGain * (patch.gainScale ?? 1);
  const t0 = ctx.currentTime;
  const maxRamp = Math.min(rampSec, durationSec / 3);
  const tPeak = t0 + maxRamp;
  const tRelease = t0 + Math.max(durationSec - maxRamp, maxRamp);
  const tEnd = t0 + durationSec;

  master.gain.setValueAtTime(0, t0);
  master.gain.linearRampToValueAtTime(scaledPeak, tPeak);
  master.gain.setValueAtTime(scaledPeak, tRelease);
  master.gain.linearRampToValueAtTime(0, tEnd);

  osc1.connect(mix1);
  osc2.connect(mix2);
  mix1.connect(master);
  mix2.connect(master);
  master.connect(ctx.destination);

  activeOscillators = [osc1, osc2];
  activeGains = [mix1, mix2, master];

  const ended = new Promise<void>((resolve) => {
    pendingResolve = resolve;
  });

  osc1.onEnded = () => {
    if (gen !== playGen) {
      return;
    }
    const isCurrent = activeOscillators[0] === osc1;
    if (isCurrent) {
      disconnectAll();
      resolvePending();
    }
  };

  osc1.start(t0);
  osc2.start(t0);
  osc1.stop(tEnd + 0.02);
  osc2.stop(tEnd + 0.02);

  await ended;
}

/**
 * 링 6 한 시행 재생. `silence`는 같은 길이만큼 기다린다.
 * `주의`: 합성 근사. 임상 음소 WAV가 아니다.
 */
export async function playLing6Target(
  target: Ling6Choice,
  options: { durationSec?: number; gain?: number; rampSec?: number } = {},
): Promise<void> {
  const durationSec = options.durationSec ?? LING6_DURATION_SEC;
  const peakGain = options.gain ?? DEFAULT_GAIN;
  const rampSec = options.rampSec ?? DEFAULT_RAMP_SEC;

  stopLing6Playback();
  const gen = playGen;

  if (target === "silence") {
    await waitSilence(durationSec, gen);
    return;
  }

  const ctx = getContext();
  await ensureRunning(ctx);
  if (gen !== playGen) {
    return;
  }

  if (target === "s" || target === "sh") {
    await playFricative(ctx, target, durationSec, peakGain, rampSec, gen);
    return;
  }

  await playVowel(ctx, VOWEL_PATCH[target], durationSec, peakGain, rampSec, gen);
}
