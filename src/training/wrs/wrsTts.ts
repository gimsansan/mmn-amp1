import * as Speech from "expo-speech";

/** 단음절이 너무 빠르지 않게. 기기·엔진마다 체감은 다를 수 있음. */
const WRS_SPEECH_RATE = 0.85;

export async function stopWrsSpeech(): Promise<void> {
  await Speech.stop();
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
