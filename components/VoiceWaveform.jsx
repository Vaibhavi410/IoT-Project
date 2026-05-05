import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { COLORS } from '../constants/colors';

const BAR_COUNT = 5;
const MIN_H = 6;
const MAX_H = 44;

/**
 * Five animated bars that bounce while `active` is true (simulates a live waveform).
 * Stops when recording ends — no audio analysis, purely visual feedback for demos.
 */
export default function VoiceWaveform({ active }) {
  const anims = useRef(
    Array.from({ length: BAR_COUNT }, () => new Animated.Value(MIN_H))
  ).current;
  const loopsRef = useRef([]);

  useEffect(() => {
    if (!active) {
      loopsRef.current.forEach((l) => l?.stop?.());
      loopsRef.current = [];
      Animated.parallel(
        anims.map((a) =>
          Animated.timing(a, {
            toValue: MIN_H,
            duration: 200,
            useNativeDriver: false,
          })
        )
      ).start();
      return;
    }

    const startBarLoop = (anim, delayMs) => {
      const levels = [0.35, 0.8, 0.55, 0.95, 0.45];
      const run = (step) => {
        const level = levels[(i + step) % levels.length];
        const up = Animated.timing(anim, {
          toValue: MIN_H + level * (MAX_H - MIN_H),
          duration: 220,
          useNativeDriver: false,
        });
        const down = Animated.timing(anim, {
          toValue: MIN_H + level * (MAX_H - MIN_H) * 0.35,
          duration: 180,
          useNativeDriver: false,
        });
        return Animated.sequence([up, down]);
      };
      const loop = Animated.loop(
        Animated.sequence([Animated.delay(delayMs), run(0), run(1), run(2)])
      );
      loop.start();
      return loop;
    };

    loopsRef.current = anims.map((anim, i) => startBarLoop(anim, i * 80));

    return () => {
      loopsRef.current.forEach((l) => l?.stop?.());
      loopsRef.current = [];
    };
  }, [active, anims]);

  return (
    <View style={styles.row} accessibilityRole="none">
      {anims.map((heightAnim, i) => (
        <Animated.View
          key={i}
          style={[
            styles.bar,
            i > 0 && styles.barGap,
            {
              height: heightAnim,
            },
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    height: MAX_H + 4,
    marginVertical: 8,
  },
  bar: {
    width: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
    opacity: 0.85,
  },
  barGap: {
    marginLeft: 6,
  },
});
