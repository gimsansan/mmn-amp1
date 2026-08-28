import type { IconName } from "@/components/ui/icon";
import type {
  HarmonicSpectrum,
  ToneEnvelope,
} from "@/audio/instrumentSpectra";

/**
 * 악기 소리 식별 — 보기 넷.
 *
 * 건반 · 퉁기는 줄 · 활 켜는 줄 · 부는 관을 하나씩 골랐다. 같은 계열을 둘 넣으면
 * (예: 기타와 하프) 음색 차이가 너무 작아 「듣고 고르기」가 아니라 찍기가 된다.
 *
 * `주의`: 지금 소리는 **합성음**이다(`instrumentTone.ts`). 실물 녹음이 생기면
 * 이 표에 `audio: require(...)`를 더하고 `instPlay.ts`만 갈아 끼우면 된다 —
 * 세션·저장소·화면은 그대로 쓴다.
 */
export type InstrumentId = "piano" | "guitar" | "violin" | "flute";

export type Instrument = {
  id: InstrumentId;
  /** 보기 칸에 크게 뜨는 이름. */
  label: string;
  /** 이름 아래 한 줄 — 악기 이름을 몰라도 소리의 성격으로 고를 수 있게. */
  family: string;
  icon: IconName;
  spectrum: HarmonicSpectrum;
  envelope: ToneEnvelope;
};

/**
 * 보기 칸 고정 순서. 재생 순서는 세션이 섞고, **칸 위치는 바꾸지 않는다**
 * (링 6와 같은 규칙 — 매번 자리가 바뀌면 고령 사용자가 위치를 못 익힌다).
 */
export const INSTRUMENTS: readonly Instrument[] = [
  {
    id: "piano",
    label: "피아노",
    family: "두드리는 건반",
    icon: "pianoKeys",
    // 완만한 감쇠. 때리는 소리라 어택이 몇 ms고 서스테인이 거의 없다.
    spectrum: [1, 0.62, 0.4, 0.24, 0.15, 0.09, 0.05, 0.03],
    envelope: {
      attackSec: 0.006,
      decaySec: 1.5,
      sustainLevel: 0.02,
      releaseSec: 0.094,
    },
  },
  {
    id: "guitar",
    label: "기타",
    family: "퉁기는 줄",
    icon: "guitar",
    // 피아노보다 2차가 약하고 3차가 살아 있다 — 퉁김 특유의 속 빈 느낌.
    spectrum: [1, 0.45, 0.55, 0.22, 0.18, 0.1, 0.06, 0.03],
    envelope: {
      attackSec: 0.004,
      decaySec: 1.3,
      sustainLevel: 0.02,
      releaseSec: 0.296,
    },
  },
  {
    id: "violin",
    label: "바이올린",
    family: "활로 켜는 줄",
    icon: "violin",
    // 상부 하모닉이 오래 남아 톱니에 가깝다. 활이라 어택이 수십 ms.
    spectrum: [1, 0.85, 0.7, 0.62, 0.48, 0.38, 0.28, 0.2, 0.14, 0.1],
    envelope: {
      attackSec: 0.09,
      decaySec: 0.18,
      sustainLevel: 0.8,
      releaseSec: 0.12,
    },
  },
  {
    id: "flute",
    label: "플루트",
    family: "입으로 부는 관",
    icon: "flute",
    // 거의 순음. 넷 중 유일하게 「맑고 단순한」 쪽이라 기준점 노릇을 한다.
    spectrum: [1, 0.28, 0.1, 0.05, 0.02],
    envelope: {
      attackSec: 0.07,
      decaySec: 0.14,
      sustainLevel: 0.9,
      releaseSec: 0.1,
    },
  },
];

export const INSTRUMENT_IDS: readonly InstrumentId[] = INSTRUMENTS.map(
  (instrument) => instrument.id,
);

const INSTRUMENT_MAP: ReadonlyMap<InstrumentId, Instrument> = new Map(
  INSTRUMENTS.map((instrument) => [instrument.id, instrument]),
);

export function instrumentOf(id: InstrumentId): Instrument {
  const instrument = INSTRUMENT_MAP.get(id);
  if (!instrument) {
    throw new Error(`unknown instrument: ${id}`);
  }
  return instrument;
}

export function instrumentLabel(id: InstrumentId): string {
  return instrumentOf(id).label;
}
