import { ActivityIndicator, StyleSheet, View } from "react-native";
import { colors } from "../../constants/theme";

type Props = {
  fullScreen?: boolean;
  size?: "small" | "large";
};

export function Loading({ fullScreen = true, size = "large" }: Props) {
  return (
    <View style={[styles.container, fullScreen && styles.full]}>
      <ActivityIndicator size={size} color={colors.primary} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  full: { flex: 1 },
});
