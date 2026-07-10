import { useRouter, useLocalSearchParams } from "expo-router";
import { StyleSheet, Text, View, type TextStyle, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Button } from "../src/components/ui/Button";
import { useTheme } from "../src/constants/theme";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function PaymentErrorScreen() {
  const { colors, spacing, borderRadius, fontWeight, fontSize } = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ message?: string }>();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + 80, paddingBottom: insets.bottom + 40 },
        ]}
      >
        <View style={[styles.iconContainer, { backgroundColor: colors.error + "15" }]}>
          <Ionicons name="alert-circle" size={100} color={colors.error} />
        </View>

        <Text
          style={[
            styles.title,
            {
              color: colors.text,
              fontSize: fontSize.xxl,
              fontWeight: fontWeight.bold as TextStyle["fontWeight"],
            },
          ]}
        >
          Transaction Failed
        </Text>

        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          {params.message || "Something went wrong while processing your request. Please try again."}
        </Text>

        <View style={styles.infoBox}>
          <Ionicons name="help-circle-outline" size={20} color={colors.textSecondary} />
          <Text style={[styles.infoText, { color: colors.textSecondary }]}>
            If this continues, please contact our support team at 0322008282 / +233 54 855 4216.
          </Text>
        </View>

        <View style={[styles.footer, { gap: spacing.md }]}>
          <Button
            title="Try Again"
            onPress={() => router.back()}
            size="lg"
            fullWidth
          />
          <Button
            title="Return Home"
            variant="outline"
            onPress={() => router.replace("/(tabs)")}
            size="lg"
            fullWidth
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: {
    alignItems: "center",
    paddingHorizontal: 24,
  },
  iconContainer: {
    width: 140,
    height: 140,
    borderRadius: 70,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  title: {
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    textAlign: "center",
    fontSize: 16,
    marginBottom: 40,
    lineHeight: 24,
  },
  infoBox: {
    flexDirection: "row",
    padding: 20,
    gap: 12,
    marginBottom: 40,
    backgroundColor: "rgba(0,0,0,0.02)",
    borderRadius: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 20,
  },
  footer: {
    width: "100%",
  },
});
