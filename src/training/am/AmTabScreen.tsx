import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { BackHandler } from "react-native";

import { DEFAULT_CARRIER_HZ } from "@/audio/amTone";
import { AmSessionScreen } from "@/training/am/AmSessionScreen";
import { ListeningCheckScreen } from "@/training/ListeningCheckScreen";
import { StatsScreen } from "@/training/StatsScreen";
import {
  DEFAULT_SESSION_MODE,
  type SessionMode,
} from "@/training/sessionMode";

/**
 * 떨림 탭 — 링 6처럼 탭이 곧 그 연습.
 * 듣기 준비는 첫 시작 전에만, 소리 높낮이처럼 화면을 갈아끼움(오버레이 아님).
 * 통계는 헤더 버튼.
 */
export function AmTabScreen() {
  const [showStats, setShowStats] = useState(false);
  const [showCheck, setShowCheck] = useState(false);
  const [checked, setChecked] = useState(false);
  const [autoStart, setAutoStart] = useState(false);
  const [mode, setMode] = useState<SessionMode>(DEFAULT_SESSION_MODE);

  const closeStats = useCallback(() => {
    setShowStats(false);
  }, []);

  const closeCheck = useCallback(() => {
    setShowCheck(false);
  }, []);

  const openStats = useCallback(() => {
    setShowStats(true);
  }, []);

  const onBeforeStart = useCallback(() => {
    if (checked) {
      return true;
    }
    setShowCheck(true);
    return false;
  }, [checked]);

  const passCheck = useCallback(() => {
    setChecked(true);
    setShowCheck(false);
    setAutoStart(true);
  }, []);

  const consumeAutoStart = useCallback(() => {
    setAutoStart(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      if (!showStats && !showCheck) {
        return;
      }
      const sub = BackHandler.addEventListener("hardwareBackPress", () => {
        if (showStats) {
          closeStats();
          return true;
        }
        closeCheck();
        return true;
      });
      return () => sub.remove();
    }, [showStats, showCheck, closeStats, closeCheck]),
  );

  if (showStats) {
    return <StatsScreen initialKind="am" onBack={closeStats} />;
  }

  if (showCheck) {
    return (
      <ListeningCheckScreen
        trackTitle="떨림 찾기"
        trackIcon="vibrate"
        sampleHz={DEFAULT_CARRIER_HZ}
        onStart={passCheck}
        onBack={closeCheck}
      />
    );
  }

  return (
    <AmSessionScreen
      onOpenStats={openStats}
      onBeforeStart={onBeforeStart}
      autoStart={autoStart}
      onAutoStartConsumed={consumeAutoStart}
      initialMode={mode}
      onModeChange={setMode}
    />
  );
}
