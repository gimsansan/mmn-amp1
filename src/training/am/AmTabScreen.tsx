import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { BackHandler, StyleSheet, View } from "react-native";

import { DEFAULT_CARRIER_HZ } from "@/audio/amTone";
import { AmSessionScreen } from "@/training/am/AmSessionScreen";
import { ListeningCheckScreen } from "@/training/ListeningCheckScreen";
import { SessionHistoryScreen } from "@/training/SessionHistoryScreen";

/**
 * 떨림 탭 — 링 6·단어인지도처럼 탭이 곧 그 연습.
 * 듣기 준비는 첫 시작 전에만. 통계는 헤더 버튼.
 */
export function AmTabScreen() {
  const [showStats, setShowStats] = useState(false);
  const [showCheck, setShowCheck] = useState(false);
  const [checked, setChecked] = useState(false);
  const [autoStart, setAutoStart] = useState(false);

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
    return <SessionHistoryScreen onBack={closeStats} clearTracks={["am"]} />;
  }

  return (
    <View style={styles.fill}>
      <AmSessionScreen
        onOpenStats={openStats}
        onBeforeStart={onBeforeStart}
        autoStart={autoStart}
        onAutoStartConsumed={consumeAutoStart}
      />
      {showCheck ? (
        <View style={styles.cover}>
          <ListeningCheckScreen
            trackTitle="떨림 찾기"
            trackIcon="vibrate"
            sampleHz={DEFAULT_CARRIER_HZ}
            onStart={passCheck}
            onBack={closeCheck}
          />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  fill: {
    flex: 1,
  },
  cover: {
    ...StyleSheet.absoluteFillObject,
  },
});
