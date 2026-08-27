import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { BackHandler } from "react-native";

import { AmSessionScreen } from "@/training/am/AmSessionScreen";
import { ListeningCheckScreen } from "@/training/ListeningCheckScreen";
import { StatsScreen } from "@/training/StatsScreen";
import {
  DEFAULT_SESSION_MODE,
  type SessionMode,
} from "@/training/sessionMode";

/**
 * 떨림 탭 — 링 6처럼 탭이 곧 그 연습.
 * 듣기 준비·통계는 헤더 아이콘으로 화면을 갈아끼움(오버레이 아님).
 */
export function AmTabScreen() {
  const [showStats, setShowStats] = useState(false);
  const [showCheck, setShowCheck] = useState(false);
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

  const openCheck = useCallback(() => {
    setShowCheck(true);
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
      <ListeningCheckScreen trackIcon="headphones" onBack={closeCheck} />
    );
  }

  return (
    <AmSessionScreen
      onOpenStats={openStats}
      onOpenListeningCheck={openCheck}
      initialMode={mode}
      onModeChange={setMode}
    />
  );
}
