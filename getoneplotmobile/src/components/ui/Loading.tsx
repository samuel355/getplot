import { ActivityIndicator, StyleSheet, View } from "react-native";
<<<<<<< HEAD
import { colors } from "../../constants/theme";

type Props = {
  fullScreen?: boolean;
  size?: "small" | "large";
};

export function Loading({ fullScreen = true, size = "large" }: Props) {
  return (
    <View style={[styles.container, fullScreen && styles.full]}>
      <ActivityIndicator size={size} color={colors.primary} />
=======
import { useTheme } from "../../constants/theme";

export function Loading() {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ActivityIndicator size="large" color={colors.primary} />
>>>>>>> mobile
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
<<<<<<< HEAD
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  full: { flex: 1 },
=======
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
>>>>>>> mobile
});
