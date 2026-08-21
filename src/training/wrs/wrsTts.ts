import * as Speech from "expo-speech";

/** 단음절이 너무 빠르지 않게. 기기·엔진마다 체감은 다를 수 있음. */
const WRS_SPEECH_RATE = 0.85;

export async function stopWrsSpeech(): Promise<void> {
  await Speech.stop();
}

/**
 * 빈 목록을 만났을 때 다시 물어보기 전 대기(ms). 앱 시작 직후 첫 진입이면
 * 안드로이드 TTS 엔진이 아직 깨지 않아 목록이 빈 배열로 온다 — 그때 곧바로
 * "모르겠다"로 판단하면, 정작 한국어가 없는 기기가 안내 없이 통과해 버린다.
 * 정상 기기는 첫 번째 조회에서 바로 답이 오므로 이 대기를 겪지 않는다.
 */
const VOICE_PROBE_WAITS_MS = [0, 250, 500] as const;

function isKorean(language: unknown): boolean {
  return String(language ?? "")
    .toLowerCase()
    .startsWith("ko");
}

/**
 * 기기에 한국어 음성이 깔려 있는지. 엔진과 언어 데이터는 따로 설치되므로,
 * 엔진이 있어도 한국어가 없으면 `speakWrsWord`가 매번 즉시 `onError`로 실패한다
 * (실기기에서 확인 — 일본어·영어만 있고 한국어 0개, 2026-08-21).
 *
 * **캐시하지 않는다.** 사용자가 설정에서 음성을 깔고 돌아와 다시 확인할 수 있어야 한다.
 *
 * 끝까지 목록이 비거나 조회가 실패하면 `true`를 준다 — 멀쩡한 기기의 연습을
 * 막는 쪽이 더 나쁘다. 그 경우에도 세션 안의 "단어를 읽지 못했어요"는 그대로 뜬다.
 */
export async function hasKoreanVoice(): Promise<boolean> {
  for (const wait of VOICE_PROBE_WAITS_MS) {
    if (wait > 0) {
      await new Promise((resolve) => setTimeout(resolve, wait));
    }
    try {
      const voices = await Speech.getAvailableVoicesAsync();
      if (voices.length > 0) {
        return voices.some((voice) => isKorean(voice.language));
      }
    } catch {
      return true;
    }
  }
  return true;
}

/**
 * 한국어 TTS로 단음절을 읽는다. 끝나면 resolve.
 * 중지(`stopWrsSpeech`)면 onStopped로 resolve — 오류로 보지 않음.
 */
export async function speakWrsWord(word: string): Promise<void> {
  await Speech.stop();
  return new Promise((resolve, reject) => {
    let settled = false;
    const finish = (): void => {
      if (settled) {
        return;
      }
      settled = true;
      resolve();
    };
    Speech.speak(word, {
      language: "ko-KR",
      pitch: 1,
      rate: WRS_SPEECH_RATE,
      onDone: finish,
      onStopped: finish,
      onError: (error) => {
        if (settled) {
          return;
        }
        settled = true;
        reject(error);
      },
    });
  });
}
