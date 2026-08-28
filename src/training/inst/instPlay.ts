import {
  playInstrumentTone,
  stopInstrumentTone,
} from "@/audio/instrumentTone";
import { instrumentOf } from "@/training/inst/instruments";
import type { InstTrial } from "@/training/inst/instSession";

/**
 * 악기 자극 재생 — 훈련 쪽 창구.
 *
 * 소리를 어떻게 만드는지는 `@/audio/instrumentTone`만 안다. 실물 녹음 wav로
 * 갈아탈 때 갈아 끼우는 곳이 **이 파일 하나**다(화면·세션은 그대로).
 */

/**
 * 첫 자극 앞 뜸(ms). 링 6·문장 듣기와 같은 이유 — 시작 직후 소리가 바로 나면
 * 들을 준비를 할 새가 없다. 두 번째부터는 「고르기 → 다음」 사이가 이미 있다.
 */
export const INST_FIRST_LEAD_MS = 700;

export async function waitInstLeadIn(): Promise<void> {
  await new Promise((resolve) => {
    setTimeout(resolve, INST_FIRST_LEAD_MS);
  });
}

/** 진행 중인 재생을 끊는다. 중지·이탈 경로이므로 오류가 아니다. */
export function stopInstPlayback(): void {
  stopInstrumentTone();
}

/** 한 시행 재생. 끝나거나 중지되면 resolve. */
export async function playInstTrial(trial: InstTrial): Promise<void> {
  const instrument = instrumentOf(trial.target);
  await playInstrumentTone({
    spectrum: instrument.spectrum,
    envelope: instrument.envelope,
    frequencyHz: trial.noteHz,
  });
}
