import { StyleSheet, Text, View } from "react-native";
import { useEffect, useRef } from "react";
import { Animated, Easing } from "react-native";
import { useTheme } from "../../constants/theme";

type LoadingProps = {
  fullScreen?: boolean;
  label?: string;
};

const GRID = 3;
const STEP = 140;

// A grid of "plots" that light up in a diagonal wave.
export function Loading({ fullScreen = true, label = "Loading" }: LoadingProps) {
  const { colors } = useTheme();
  const tiles = useRef(
    Array.from({ length: GRID * GRID }, () => new Animated.Value(0)),
  ).current;

  useEffect(() => {
    const animations = tiles.map((value, index) => {
      const delay = ((index % GRID) + Math.floor(index / GRID)) * STEP;
      const anim = Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(value, {
            toValue: 1,
            duration: 380,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(value, {
            toValue: 0,
            duration: 520,
            easing: Easing.in(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.delay((GRID * 2 - 2) * STEP - delay),
        ]),
      );
      anim.start();
      return anim;
    });
    return () => animations.forEach((a) => a.stop());
  }, [tiles]);

  return (
    <View
      style={[
        fullScreen ? styles.container : styles.inlineContainer,
        fullScreen ? { backgroundColor: colors.background } : null,
      ]}
    >
      <View style={styles.grid}>
        {tiles.map((value, index) => (
          <Animated.View
            key={index}
            style={[
              styles.tile,
              {
                backgroundColor: index % 2 === 0 ? colors.primaryAccent : colors.primary,
                opacity: value.interpolate({ inputRange: [0, 1], outputRange: [0.18, 1] }),
                transform: [
                  { scale: value.interpolate({ inputRange: [0, 1], outputRange: [0.85, 1] }) },
                ],
              },
            ]}
          />
        ))}
      </View>
      <Text style={[styles.label, { color: colors.textMuted }]}>{label}…</Text>
    </View>
  );
}

const TILE = 22;
const GAP = 6;

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
  inlineContainer: { alignItems: "center", justifyContent: "center" },
  grid: {
    width: TILE * GRID + GAP * (GRID - 1),
    flexDirection: "row",
    flexWrap: "wrap",
    gap: GAP,
  },
  tile: { width: TILE, height: TILE, borderRadius: 5 },
  label: { marginTop: 18, fontSize: 13, fontWeight: "600", letterSpacing: 0.3 },
});
