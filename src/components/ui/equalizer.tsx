import { useEffect, useState } from 'react';
import { AccessibilityInfo, Animated, StyleSheet, View } from 'react-native';

/** 막대별 최대 높이 비율 · 시작 지연(ms). 시안의 어긋난 리듬을 그대로 옮김. */
const BARS = [
  { ratio: 0.4, delay: 0 },
  { ratio: 1, delay: 200 },
  { ratio: 0.65, delay: 400 },
  { ratio: 0.85, delay: 100 },
] as const;

const HALF_CYCLE_MS = 550;
const MIN_SCALE = 0.35;

type EqualizerProps = {
  color: string;
  /** 가장 긴 막대의 높이(px). */
  height?: number;
  barWidth?: number;
};

function Bar({
  color,
  height,
  width,
  ratio,
  delay,
  animate,
}: Readonly<{
  color: string;
  height: number;
  width: number;
  ratio: number;
  delay: number;
  animate: boolean;
}>) {
  // useRef(...).current는 렌더 중 ref 접근이라 린트가 막는다.
  // 지연 초기화 useState가 Animated.Value를 한 번만 만드는 표준 방식.
  const [scale] = useState(() => new Animated.Value(MIN_SCALE));

  useEffect(() => {
    if (!animate) {
      // 모션 최소화 — 중간 높이로 멈춰 둔다(막대가 사라지지 않게).
      scale.setValue(0.7);
      return;
    }

    const loop = Animated.sequence([
      // 지연은 루프 밖에 한 번만 둔다. 안에 넣으면 막대마다 주기가 달라진다.
      Animated.delay(delay),
      Animated.loop(
        Animated.sequence([
          Animated.timing(scale, {
            toValue: 1,
            duration: HALF_CYCLE_MS,
            useNativeDriver: true,
          }),
          Animated.timing(scale, {
            toValue: MIN_SCALE,
            duration: HALF_CYCLE_MS,
            useNativeDriver: true,
          }),
        ])
      ),
    ]);

    loop.start();
    return () => {
      loop.stop();
    };
  }, [animate, delay, scale]);

  return (
    <Animated.View
      style={[
        styles.bar,
        {
          width,
          height: height * ratio,
          backgroundColor: color,
          transform: [{ scaleY: scale }],
        },
      ]}
    />
  );
}

/**
 * 재생 중을 알리는 막대 애니메이션(장식).
 * `주의`: 실제 소리의 파형이 아니다 — 자극의 세기·난이도와 연동하지 않는다.
 */
export function Equalizer({ color, height = 18, barWidth = 3.5 }: Readonly<EqualizerProps>) {
  const [animate, setAnimate] = useState(true);

  useEffect(() => {
    let alive = true;
    void AccessibilityInfo.isReduceMotionEnabled().then((reduced) => {
      if (alive) {
        setAnimate(!reduced);
      }
    });
    const sub = AccessibilityInfo.addEventListener('reduceMotionChanged', (reduced) => {
      setAnimate(!reduced);
    });
    return () => {
      alive = false;
      sub.remove();
    };
  }, []);

  return (
    <View style={[styles.row, { height }]} importantForAccessibility="no-hide-descendants">
      {BARS.map((bar, i) => (
        <Bar
          key={i}
          color={color}
          height={height}
          width={barWidth}
          ratio={bar.ratio}
          delay={bar.delay}
          animate={animate}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 3,
  },
  bar: {
    borderRadius: 2,
    // 아래를 바닥에 붙인 채 위로만 자라게 한다.
    transformOrigin: 'bottom',
  },
});
