import { useUser } from "@clerk/clerk-expo";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, View, type TextStyle } from "react-native";
import { PaystackCheckout } from "../../../src/components/PaystackCheckout";
import { Button } from "../../../src/components/ui/Button";
import { Input } from "../../../src/components/ui/Input";
import { Loading } from "../../../src/components/ui/Loading";
import { useTheme } from "../../../src/constants/theme";
import {
  formatGhs,
  getPlotById,
  updatePlotOnHold,
  formatAreaSize,
  formatStreet,
} from "../../../src/lib/plotService";
import { notifyPlotPurchaseSuccess } from "../../../src/lib/notificationService";
import type { BuyerInfo, PlotFeature } from "../../../src/types/plot";
import { Ionicons } from "@expo/vector-icons";

export default function BuyPlotScreen() {
  const { colors, spacing, borderRadius, fontWeight, fontSize, isDark } = useTheme();
  const { id, table, slug } = useLocalSearchParams<{ id: string; table: string; slug: string }>();
  const { user } = useUser();
  const router = useRouter();

  const [plot, setPlot] = useState<PlotFeature | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [payVisible, setPayVisible] = useState(false);
  const [buyer, setBuyer] = useState<BuyerInfo>({
    firstname: user?.firstName || "",
    lastname: user?.lastName || "",
    email: user?.primaryEmailAddress?.emailAddress || "",
    phone: "",
    country: "Ghana",
    residentialAddress: "",
    plotTotalAmount: 0,
  });

  useEffect(() => {
    if (!id || !table) return;
    getPlotById(table, id).then((p) => {
      if (p) {
        setPlot(p);
        setBuyer((b) => ({ ...b, plotTotalAmount: p.plotTotalAmount || 0 }));
      }
      setLoading(false);
    });
  }, [id, table]);

  const validate = () => {
    if (!buyer.firstname.trim()) return "Enter first name";
    if (!buyer.lastname.trim()) return "Enter last name";
    if (!buyer.email.trim()) return "Enter email";
    if (!buyer.phone.trim()) return "Enter phone";
    if (!buyer.residentialAddress.trim()) return "Enter residential address";
    if (!buyer.plotTotalAmount) return "Plot price not set. Please contact support.";
    return null;
  };

  const onPay = () => {
    const err = validate();
    if (err) {
      Alert.alert("Required Fields", err);
      return;
    }
    setPayVisible(true);
  };

  const onPaymentSuccess = async () => {
    setPayVisible(false);
    if (!plot || !table || !id) return;

    setProcessing(true);
    try {
      // 1. Update Plot Status (Critical)
      await updatePlotOnHold(table, id, buyer);

      // 2. Trigger Notifications (Non-blocking for UI speed)
      notifyPlotPurchaseSuccess({
        phone: buyer.phone,
        email: buyer.email,
        firstname: buyer.firstname,
        lastname: buyer.lastname,
        plotNo: plot.properties?.Plot_No ?? "N/A",
        siteName: plot.properties?.Site ?? "Standard Development",
        amount: buyer.plotTotalAmount,
        isFullPayment: true,
        areaAcres: plot.properties?.Area,
      }).catch((err) => console.error("Notification background error:", err));

      // 3. Move to success screen immediately
      setProcessing(false);
      router.replace({
        pathname: "/payment-success",
        params: {
          type: "buy",
          amount: String(buyer.plotTotalAmount),
          plotNo: plot.properties?.Plot_No ?? "N/A",
          site: plot.properties?.Site ?? "Standard Development",
        },
      });
    } catch (e) {
      console.error("Post-payment error:", e);
      setProcessing(false);
      router.replace({
        pathname: "/payment-error",
        params: {
          message:
            "Payment was successful, but we couldn't update the plot status. Please contact support.",
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
          Finalizing your purchase...{"\n"}Please do not close the app.
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

  const reference = `buy_${id}_${Date.now()}`;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
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
              <Ionicons name="map" size={24} color={colors.primaryAccent} />
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
                {plot.properties?.Site ?? "Standard Development"}
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
                {formatAreaSize(plot.properties?.Area) || "Unknown"}
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
            <Text style={[styles.totalLabel, { color: colors.textSecondary }]}>Purchase Price</Text>
            <Text
              style={[
                styles.totalValue,
                {
                  color: colors.primaryAccent,
                  fontSize: fontSize.xl,
                  fontWeight: fontWeight.extrabold as TextStyle["fontWeight"],
                },
              ]}
            >
              {formatGhs(buyer.plotTotalAmount)}
            </Text>
          </View>
        </View>

        {/* Buyer Form */}
        <Text
          style={[
            styles.sectionHeader,
            { color: colors.text, fontWeight: fontWeight.bold as TextStyle["fontWeight"] },
          ]}
        >
          Buyer Registration
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
            label="Residential Address"
            placeholder="e.g. Plot 45, Kumasi"
            multiline
            value={buyer.residentialAddress}
            onChangeText={(v) => setBuyer({ ...buyer, residentialAddress: v })}
            containerStyle={styles.inputSpacing}
          />
        </View>

        <View style={styles.secureBadge}>
          <Ionicons name="lock-closed" size={12} color={colors.textMuted} />
          <Text style={[styles.secureText, { color: colors.textMuted }]}>
            Encrypted and Secure Payment
          </Text>
        </View>
      </ScrollView>

      {/* Payment Action */}
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
        <Button
          title={`Secure Checkout • ${formatGhs(buyer.plotTotalAmount)}`}
          onPress={onPay}
          size="lg"
          fullWidth
        />
      </View>

      <PaystackCheckout
        visible={payVisible}
        email={buyer.email}
        amount={buyer.plotTotalAmount}
        reference={reference}
        onSuccess={onPaymentSuccess}
        onClose={() => {
          setPayVisible(false);
          router.push({
            pathname: "/payment-error",
            params: { message: "Payment was cancelled. You can try again whenever you're ready." },
          });
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: "center", alignItems: "center", padding: 40 },
  errorText: { marginBottom: 20, textAlign: "center" },
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: "600",
  },
  totalValue: {},
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
