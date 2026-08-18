/**
 * 세 트랙 공통 — 연습/측정 모드.
 *
 * 연습(반전 4): 가볍게. 기록은 남기되 통계·추세 제외.
 * 측정(반전 8): 반전을 더 쌓아 수렴. 기록 + 통계 포함.
 *
 * 스텝은 가변 하나(트랙별 스케줄)로 두고 **반전 횟수로만** 두 모드를 구분한다.
 * 엔진은 2-down-1-up 그대로.
 */
import type { SessionMode } from "@/training/sessionStore";

export type { SessionMode };

/** 연습 종료 반전 수. */
export const PRACTICE_TARGET_REVERSALS = 4;

/** 측정 종료 반전 수. */
export const MEASURE_TARGET_REVERSALS = 8;

/** idle 기본 모드 — 연습(가볍게 시작). */
export const DEFAULT_SESSION_MODE: SessionMode = "practice";

/** 모드별 종료 반전 수. */
export function targetReversalsFor(mode: SessionMode): number {
  return mode === "measure"
    ? MEASURE_TARGET_REVERSALS
    : PRACTICE_TARGET_REVERSALS;
}

/** 토글·배지용 짧은 라벨. */
export function sessionModeLabel(mode: SessionMode): string {
  return mode === "measure" ? "연습" : "귀풀기";
}
