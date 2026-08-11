/**
 * 높낮이 비교(pitch 2AFC) 트랙 상수.
 *
 * HarmoniTune `src/constants/theme.ts`에서 이 트랙이 쓰는 값만 떼어 왔다(§4-3).
 * mnn UI 테마(`src/constants/theme.ts`)와 섞지 않는다 — 트랙별 상수는 분리 유지
 * (merge-plan-harmonitune.md §2-4).
 */

export const AUDIO = {
  /** 기본 기준음 주파수 (A4) */
  BASE_FREQ: 440,
  /** 재생 주파수 하한 (Hz) */
  FREQ_MIN_HZ: 200,
  /** 재생 주파수 상한 (Hz) */
  FREQ_MAX_HZ: 2000,
  /** 소리 A 재생 시간 (초) */
  TONE_DURATION: 1.0,
  /** A→B 사이 대기 시간 (초) */
  GAP_DURATION: 0.5,
  /** Gain Envelope 공격 시간 (초) */
  ATTACK_TIME: 0.05,
  /** Gain Envelope 릴리스 시간 (초) */
  RELEASE_TIME: 0.05,
  /** 순수 파형 모드 서스테인 게인 */
  PEAK_GAIN_WAVE: 0.4,
  /** 포먼트 합성 모드 서스테인 게인 */
  PEAK_GAIN_VOICE: 0.3,
  /** 포먼트 합성 F1 주파수 */
  FORMANT_F1: 800,
  /** 포먼트 합성 F2 주파수 */
  FORMANT_F2: 1200,
  /** 포먼트 합성 Q 값 */
  FORMANT_Q: 3.0,
} as const;

export const STAIRCASE = {
  /**
   * 초기 cent 격차.
   * 누구나 들리는 쉬운 값에서 시작해 하강한다.
   * (이전 50은 반음의 절반이라 초심자가 첫 문제부터 틀리는 원인이었음)
   */
  INITIAL_CENTS: 200,
  /** 최소 cent 격차 */
  MIN_CENTS: 10,
  /** 최대 cent 격차 (문헌 프록시 잠정값 · 파일럿 검증 대상) */
  MAX_CENTS: 300,
  /** 난이도 하강 트리거 (연속 정답 수) — 2-down-1-up */
  STREAK_THRESHOLD: 2,

  /**
   * 가변 스텝 표 — 반전이 쌓일수록 조정 폭을 좁힌다.
   *
   * 초반엔 크게 움직여 빨리 수렴시키고, 자기 수준 근처에서는 미세 조정한다.
   * `fromReversal` 이상의 반전 횟수에서 해당 `step`을 적용한다.
   */
  STEP_SCHEDULE: [
    { fromReversal: 0, step: 50 },
    { fromReversal: 2, step: 20 },
    { fromReversal: 4, step: 10 },
  ],

  /**
   * 역치 계산에서 버리는 초기 반전 수.
   * 수렴 전 구간이라 실제 능력보다 값이 크고 흔들린다.
   */
  THRESHOLD_DISCARD_REVERSALS: 2,
  /** 역치를 산출하기 위한 최소 반전 수 (이보다 적으면 역치 없음) */
  THRESHOLD_MIN_REVERSALS: 4,
} as const;

/**
 * 평가(Assessment) 세션 프로토콜.
 *
 * 훈련과 달리 **정해진 조건에서 자동 종료**한다.
 * 사용자가 임의로 멈추면 세션마다 조건이 달라져 측정값을 비교할 수 없다.
 */
export const ASSESSMENT = {
  /** 이 반전 수에 도달하면 자동 종료 (역치가 충분히 수렴한 시점) */
  TARGET_REVERSALS: 8,
  /** 반전이 쌓이지 않아도 이 시행 수에서 강제 종료 (피로 방지) */
  MAX_TRIALS: 30,
} as const;
