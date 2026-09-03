import { useRouter, useLocalSearchParams } from "expo-router";
import { StyleSheet, Text, View, type TextStyle, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Button } from "../src/components/ui/Button";
import { useTheme } from "../src/constants/theme";
import { formatGhs } from "../src/lib/plotService";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function PaymentSuccessScreen() {
  const { colors, spacing, borderRadius, fontWeight, fontSize, isDark } = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{
    type: "buy" | "reserve";
    amount: string;
    plotNo: string;
    streetName?: string;
    site: string;
  }>();

  const isReserve = params.type === "reserve";
  const amount = Number(params.amount || 0);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + 60, paddingBottom: insets.bottom + 40 },
        ]}
      >
        <View style={[styles.iconContainer, { backgroundColor: colors.success + "15" }]}>
          <Ionicons name="checkmark-circle" size={100} color={colors.success} />
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
          {isReserve ? "Reservation Received" : "Purchase Request Received"}
        </Text>

        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          {isReserve
            ? "Your reservation request has been received. Bank deposit instructions have been sent to your email and phone."
            : "Your purchase request has been received. Bank payment instructions have been sent to your email and phone."}
        </Text>

        <View
          style={[
            styles.receiptCard,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
              borderRadius: borderRadius.xl,
              padding: spacing.xl,
            },
          ]}
        >
          <View style={styles.receiptHeader}>
            <Text style={[styles.receiptLabel, { color: colors.textMuted }]}>
              {isReserve ? "Deposit Required" : "Amount Due"}
            </Text>
            <Text
              style={[
                styles.receiptValue,
                {
                  color: colors.primary,
                  fontWeight: fontWeight.extrabold as TextStyle["fontWeight"],
                },
              ]}
            >
              {formatGhs(amount)}
            </Text>
          </View>

          <View style={[styles.divider, { backgroundColor: colors.borderLight }]} />

          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: colors.textMuted }]}>Plot Number</Text>
            <Text style={[styles.detailValue, { color: colors.text }]}>
              {params.plotNo || "N/A"}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: colors.textMuted }]}>Development</Text>
            <Text style={[styles.detailValue, { color: colors.text }]} numberOfLines={1}>
              {params.site || "Standard Site"}
            </Text>
          </View>

          {params.streetName ? (
            <View style={styles.detailRow}>
              <Text style={[styles.detailLabel, { color: colors.textMuted }]}>Street</Text>
              <Text style={[styles.detailValue, { color: colors.text }]} numberOfLines={2}>
                {params.streetName}
              </Text>
            </View>
          ) : null}

          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: colors.textMuted }]}>Status</Text>
            <View style={[styles.statusBadge, { backgroundColor: colors.success + "15" }]}>
              <Text style={[styles.statusText, { color: colors.success }]}>
                {isReserve ? "REQUEST RECEIVED" : "ON HOLD"}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.infoBox}>
          <Ionicons name="information-circle-outline" size={20} color={colors.textSecondary} />
          <Text style={[styles.infoText, { color: colors.textSecondary }]}>
            Check your email for bank details. Make payment at the bank and bring your receipt
            to our Kumasi Dichemso office to finalize the plot sale or reservation.
          </Text>
        </View>

        <View style={[styles.footer, { gap: spacing.md }]}>
          <Button
            title="View All Sites"
            onPress={() => router.replace("/(tabs)/sites")}
            size="lg"
            fullWidth
          />
          <Button
            title="Back to Dashboard"
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
  },
  receiptCard: {
    width: "100%",
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.05,
    shadowRadius: 20,
    elevation: 4,
    marginBottom: 32,
  },
  receiptHeader: {
    alignItems: "center",
    marginBottom: 20,
  },
  receiptLabel: {
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 4,
  },
  receiptValue: {
    fontSize: 32,
  },
  divider: {
    height: 1,
    width: "100%",
    marginBottom: 20,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  detailLabel: {
    fontSize: 14,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: "600",
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 10,
    fontWeight: "800",
  },
  infoBox: {
    flexDirection: "row",
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 40,
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
