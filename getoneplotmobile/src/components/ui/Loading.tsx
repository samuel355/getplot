import { Image, StyleSheet, Text, View } from "react-native";
import { useEffect, useRef } from "react";
import { Animated, Easing } from "react-native";
import { useTheme } from "../../constants/theme";

type LoadingProps = {
  fullScreen?: boolean;
};

export function Loading({ fullScreen = true }: LoadingProps) {
  const { colors } = useTheme();
  const rotation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.timing(rotation, {
        toValue: 1,
        duration: 2200,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    );
    animation.start();
    return () => animation.stop();
  }, [rotation]);

  const spin = rotation.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "360deg"] });

  return (
    <View
      style={[
        fullScreen ? styles.container : styles.inlineContainer,
        { backgroundColor: colors.background },
      ]}
    >
      <View style={styles.loader}>
        <Animated.View style={[styles.orbit, { borderColor: colors.primaryAccent + "55", transform: [{ rotate: spin }] }]}>
          <View style={[styles.orbitDot, { backgroundColor: colors.primaryAccent }]} />
        </Animated.View>
        <Image source={require("../../../assets/icon.png")} style={styles.logo} resizeMode="contain" />
        <Text style={[styles.label, { color: colors.textMuted }]}>Loading your experience...</Text>
        <View style={styles.dots}>
          {[0, 1, 2].map((dot) => <View key={dot} style={[styles.dot, { backgroundColor: colors.primaryAccent }]} />)}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  inlineContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  loader: { alignItems: "center", justifyContent: "center" },
  orbit: {
    position: "absolute",
    width: 142,
    height: 142,
    borderWidth: 1,
    borderRadius: 71,
  },
  orbitDot: { position: "absolute", top: -4, left: 66, width: 8, height: 8, borderRadius: 4 },
  logo: { width: 72, height: 72 },
  label: { marginTop: 24, fontSize: 13, fontWeight: "600", letterSpacing: 0.2 },
  dots: { flexDirection: "row", gap: 5, marginTop: 10 },
  dot: { width: 5, height: 5, borderRadius: 3 },
});
