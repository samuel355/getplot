import { useUser } from "@clerk/clerk-expo";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, View, type TextStyle } from "react-native";
import { Button } from "../../../src/components/ui/Button";
import { Input } from "../../../src/components/ui/Input";
import { Loading } from "../../../src/components/ui/Loading";
import { useTheme, spacing } from "../../../src/constants/theme";
import {
  formatGhs,
  getPlotById,
  updatePlotOnHold,
  formatStreet,
  validateBuyerInfo,
} from "../../../src/lib/plotService";
import {
  notifyPlotPurchaseSuccess,
  sendPlotRequestEmail,
} from "../../../src/lib/notificationService";
import type { BuyerInfo, PlotFeature } from "../../../src/types/plot";
import { Ionicons } from "@expo/vector-icons";
import { getDevelopment } from "../../../src/constants/developments";
import { formatCoordinatePlotSize } from "../../../src/lib/plotGeometry";

const DEPOSIT_RATE = 0.25;

export default function ReservePlotScreen() {
  const { colors, spacing, borderRadius, fontWeight, fontSize, isDark } = useTheme();
  const { id, table, slug } = useLocalSearchParams<{ id: string; table: string; slug: string }>();
  const { user } = useUser();
  const router = useRouter();

  const development = getDevelopment(slug || "");
  const siteName = development?.title || "Standard Development";

  const [plot, setPlot] = useState<PlotFeature | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [buyer, setBuyer] = useState<BuyerInfo>({
    firstname: user?.firstName || "",
    lastname: user?.lastName || "",
    email: user?.primaryEmailAddress?.emailAddress || "",
    phone: "",
    country: "Ghana",
    residentialAddress: "",
    plotTotalAmount: 0,
    paidAmount: 0,
    remainingAmount: 0,
  });

  useEffect(() => {
    if (!id || !table) return;
    getPlotById(table, id).then((p) => {
      if (p) {
        const total = p.plotTotalAmount || 0;
        const paid = Number((total * DEPOSIT_RATE).toFixed(2));
        setPlot(p);
        setBuyer((b) => ({
          ...b,
          plotTotalAmount: total,
          paidAmount: paid,
          remainingAmount: total - paid,
        }));
      }
      setLoading(false);
    });
  }, [id, table]);

  const submitReservationRequest = async () => {
    const minimumDeposit = Number((buyer.plotTotalAmount * DEPOSIT_RATE).toFixed(2));
    const err = validateBuyerInfo(buyer) ||
      (!buyer.plotTotalAmount ? "Plot price not set. Please contact support." : null) ||
      (!Number.isFinite(buyer.paidAmount) || buyer.paidAmount == null || buyer.paidAmount < minimumDeposit
        ? `Minimum deposit is ${formatGhs(minimumDeposit)}`
        : null) ||
      (buyer.paidAmount > buyer.plotTotalAmount
        ? "Deposit cannot exceed plot amount"
        : null);
    if (err) {
      Alert.alert("Required Fields", err);
      return;
    }
    if (!plot || !table || !id) return;

    Alert.alert(
      "Confirm reservation request",
      [
        `Plot ${plot.properties?.Plot_No ?? "N/A"}${formatStreet(plot.properties?.Street_Nam) ? ` · ${formatStreet(plot.properties?.Street_Nam)}` : ""}`,
        siteName,
        `Full price: ${formatGhs(buyer.plotTotalAmount)}`,
        `Deposit required: ${formatGhs(buyer.paidAmount || 0)}`,
        `Client: ${buyer.firstname} ${buyer.lastname}`,
        `Email: ${buyer.email}`,
        `Phone: ${buyer.phone}`,
        `Country: ${buyer.country}`,
        `Address: ${buyer.residentialAddress}`,
      ].join("\n"),
      [
        { text: "Review details", style: "cancel" },
        { text: "Confirm and send", onPress: () => void submitConfirmedRequest() },
      ],
    );
  };

  const submitConfirmedRequest = async () => {
    setProcessing(true);
    try {
      const requestDetails = {
        phone: buyer.phone,
        email: buyer.email,
        firstname: buyer.firstname,
        lastname: buyer.lastname,
        country: buyer.country,
        residentialAddress: buyer.residentialAddress,
        plotNo: plot.properties?.Plot_No ?? "N/A",
        streetName: formatStreet(plot.properties?.Street_Nam),
        siteName: siteName,
        amount: buyer.paidAmount || 0,
        isFullPayment: false,
        areaAcres: formatCoordinatePlotSize(plot),
      };

      await sendPlotRequestEmail(requestDetails);
      // Paystack is intentionally disabled. Buyers receive bank details and bring receipt to the office.
      await updatePlotOnHold(table!, id!, buyer);
      void notifyPlotPurchaseSuccess(requestDetails);

      setProcessing(false);
      router.replace({
        pathname: "/payment-success",
        params: {
          type: "reserve",
          amount: String(buyer.paidAmount),
          plotNo: plot.properties?.Plot_No ?? "N/A",
          streetName: formatStreet(plot.properties?.Street_Nam),
          site: siteName,
        },
      });
    } catch (e) {
      console.error("Reservation request error:", e);
      setProcessing(false);
      router.replace({
        pathname: "/payment-error",
        params: {
          message:
            "We couldn't submit your reservation request. Please try again or contact support.",
        },
      });
    }
  };

  if (loading) return <Loading />;

  if (processing) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <Loading />
        <Text
          style={{
            marginTop: 20,
            color: colors.textSecondary,
            fontWeight: "600",
            textAlign: "center",
          }}
        >
          Submitting your reservation request...{"\n"}Please do not close the app.
        </Text>
      </View>
    );
  }
  if (!plot) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <Ionicons name="alert-circle-outline" size={64} color={colors.textMuted} />
        <Text style={[styles.errorText, { color: colors.text }]}>
          Plot details could not be found.
        </Text>
        <Button title="Go Back" onPress={() => router.back()} variant="outline" />
      </View>
    );
  }

  const deposit = buyer.paidAmount || 0;
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        <View style={[styles.instructionCard, { backgroundColor: colors.primaryAccent + "16", borderColor: colors.primaryAccent + "45" }]}>
          <Ionicons name="mail-unread-outline" size={22} color={colors.primary} />
          <View style={{ flex: 1 }}>
            <Text style={[styles.instructionTitle, { color: colors.primary }]}>What happens after you submit?</Text>
            <Text style={[styles.instructionText, { color: colors.textSecondary }]}>We&apos;ll send our bank details and payment instructions to your email address or phone number.</Text>
          </View>
        </View>
        {/* Plot Info Card */}
        <View
          style={[
            styles.card,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
              borderRadius: borderRadius.xl,
            },
          ]}
        >
          <View style={styles.cardHeader}>
            <View style={[styles.plotBadge, { backgroundColor: colors.primaryAccent + "20" }]}>
              <Ionicons name="bookmark" size={24} color={colors.primaryAccent} />
            </View>
            <View style={{ flex: 1 }}>
              <Text
                style={[
                  styles.cardTitle,
                  { color: colors.text, fontWeight: fontWeight.bold as TextStyle["fontWeight"] },
                ]}
              >
                Plot {plot.properties?.Plot_No ?? "N/A"}
              </Text>
              <Text style={[styles.siteName, { color: colors.textMuted, fontSize: fontSize.sm }]}>
                {siteName}
              </Text>
              {plot.properties?.Street_Nam ? (
                <Text style={[styles.siteName, { color: colors.textMuted, fontSize: fontSize.xs }]}>
                  {formatStreet(plot.properties.Street_Nam)}
                </Text>
              ) : null}
            </View>
          </View>

          <View
            style={[
              styles.statsRow,
              {
                marginTop: spacing.lg,
                borderTopWidth: 1,
                borderTopColor: colors.borderLight,
                paddingTop: spacing.md,
              },
            ]}
          >
            <View style={styles.stat}>
              <Text style={[styles.statLabel, { color: colors.textMuted }]}>Area Size</Text>
              <Text style={[styles.statValue, { color: colors.text }]}>
                {formatCoordinatePlotSize(plot)}
              </Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: colors.borderLight }]} />
            <View style={styles.stat}>
              <Text style={[styles.statLabel, { color: colors.textMuted }]}>Category</Text>
              <Text style={[styles.statValue, { color: colors.text }]}>Residential</Text>
            </View>
          </View>

          <View
            style={[
              styles.priceRow,
              {
                marginTop: spacing.md,
                backgroundColor: colors.primary + "05",
                padding: spacing.md,
                borderRadius: borderRadius.md,
              },
            ]}
          >
            <View style={styles.priceLine}>
              <Text style={[styles.totalLabel, { color: colors.textSecondary }]}>
                Full Purchase Price
              </Text>
              <Text style={[styles.totalLabel, { color: colors.textSecondary }]}>
                {formatGhs(buyer.plotTotalAmount)}
              </Text>
            </View>

            <View
              style={[
                styles.priceLine,
                {
                  marginTop: spacing.xs,
                  paddingTop: spacing.xs,
                  borderTopWidth: 1,
                  borderTopColor: colors.borderLight,
                },
              ]}
            >
              <Text style={[styles.totalLabel, { color: colors.primary, fontWeight: "800" }]}>
                Chosen Deposit
              </Text>
              <Text
                style={[
                  styles.depositValue,
                  {
                    color: colors.primaryAccent,
                    fontSize: fontSize.xl,
                    fontWeight: fontWeight.extrabold as TextStyle["fontWeight"],
                  },
                ]}
              >
                {formatGhs(deposit)}
              </Text>
            </View>
          </View>
          <Input
            label={`Initial Deposit (GHS) — minimum ${formatGhs(Number((buyer.plotTotalAmount * DEPOSIT_RATE).toFixed(2)))}`}
            keyboardType="decimal-pad"
            value={String(buyer.paidAmount ?? "")}
            onChangeText={(value) => {
              const parsedAmount = value.trim() ? Number(value) : 0;
              const paidAmount = Number.isFinite(parsedAmount) ? parsedAmount : 0;
              setBuyer((current) => ({
                ...current,
                paidAmount,
                remainingAmount: Math.max(current.plotTotalAmount - paidAmount, 0),
              }));
            }}
            containerStyle={{ marginTop: spacing.md }}
          />
        </View>

        {/* Reserver Form */}
        <Text
          style={[
            styles.sectionHeader,
            { color: colors.text, fontWeight: fontWeight.bold as TextStyle["fontWeight"] },
          ]}
        >
          Reserver Registration
        </Text>

        <View
          style={[
            styles.formCard,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
              borderRadius: borderRadius.xl,
            },
          ]}
        >
          <View style={styles.row}>
            <Input
              label="First Name"
              value={buyer.firstname}
              onChangeText={(v) => setBuyer({ ...buyer, firstname: v })}
              containerStyle={{ flex: 1, marginRight: 8 }}
            />
            <Input
              label="Last Name"
              value={buyer.lastname}
              onChangeText={(v) => setBuyer({ ...buyer, lastname: v })}
              containerStyle={{ flex: 1 }}
            />
          </View>

          <Input
            label="Email Address"
            keyboardType="email-address"
            autoCapitalize="none"
            value={buyer.email}
            onChangeText={(v) => setBuyer({ ...buyer, email: v })}
            containerStyle={styles.inputSpacing}
          />

          <Input
            label="Phone Number"
            keyboardType="phone-pad"
            placeholder="024 XXX XXXX"
            value={buyer.phone}
            onChangeText={(v) => setBuyer({ ...buyer, phone: v })}
            containerStyle={styles.inputSpacing}
          />

          <Input
            label="Country"
            value={buyer.country}
            onChangeText={(v) => setBuyer({ ...buyer, country: v })}
            containerStyle={styles.inputSpacing}
          />

          <Input
            label="Residential Address"
            placeholder="e.g. Plot 45, Kumasi"
            multiline
            value={buyer.residentialAddress}
            onChangeText={(v) => setBuyer({ ...buyer, residentialAddress: v })}
            containerStyle={styles.inputSpacing}
          />
        </View>

        <View style={styles.secureBadge}>
          <Ionicons name="mail" size={14} color={colors.success} />
          <Text style={[styles.secureText, { color: colors.textMuted }]}>
            Bank deposit instructions will be sent by email and SMS
          </Text>
        </View>
      </ScrollView>

      {/* Reservation Action */}
      <View
        style={[
          styles.footer,
          {
            backgroundColor: isDark ? colors.surface : colors.white,
            borderTopColor: colors.border,
            padding: spacing.lg,
          },
        ]}
      >
        <Button title={`Send Bank Details • ${formatGhs(deposit)}`} onPress={submitReservationRequest} size="lg" fullWidth />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: "center", alignItems: "center", padding: 40 },
  errorText: { marginBottom: 20, textAlign: "center" },
  instructionCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    marginHorizontal: 20,
    marginTop: 20,
    padding: 16,
    borderWidth: 1,
    borderRadius: 14,
  },
  instructionTitle: { fontSize: 14, fontWeight: "800" },
  instructionText: { marginTop: 4, fontSize: 12, lineHeight: 18 },
  card: {
    margin: 20,
    padding: 20,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  plotBadge: {
    width: 50,
    height: 50,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  cardTitle: {
    fontSize: 20,
  },
  siteName: {
    marginTop: 2,
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  stat: {
    flex: 1,
  },
  statLabel: {
    fontSize: 10,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 14,
    fontWeight: "700",
  },
  statDivider: {
    width: 1,
    height: 30,
    marginHorizontal: 16,
  },
  priceRow: {
    padding: spacing.md,
    borderRadius: 8,
  },
  priceLine: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: "600",
  },
  depositValue: {},
  sectionHeader: {
    marginHorizontal: 20,
    marginBottom: 12,
    fontSize: 16,
  },
  formCard: {
    marginHorizontal: 20,
    padding: 20,
    borderWidth: 1,
  },
  row: {
    flexDirection: "row",
    marginBottom: 16,
  },
  inputSpacing: {
    marginBottom: 16,
  },
  secureBadge: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    marginTop: 24,
  },
  secureText: {
    fontSize: 11,
  },
  footer: {
    borderTopWidth: 1,
    paddingBottom: 34,
  },
});
