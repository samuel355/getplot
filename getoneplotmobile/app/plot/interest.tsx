import { useUser } from "@clerk/clerk-expo";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, View, type TextStyle } from "react-native";
import { Button } from "../../src/components/ui/Button";
import { Input } from "../../src/components/ui/Input";
import { Loading } from "../../src/components/ui/Loading";
import {
  useTheme,
  colors,
  fontSize,
  spacing,
  borderRadius,
  fontWeight,
} from "../../src/constants/theme";
import {
  formatGhs,
  getPlotById,
  submitPlotInterest,
  formatStreet,
} from "../../src/lib/plotService";
import { fetchMobileApi } from "../../src/lib/api";
import { sendCompanyAlert } from "../../src/lib/notificationService";
import type { PlotFeature } from "../../src/types/plot";
import { Ionicons } from "@expo/vector-icons";
import { formatCoordinatePlotSize } from "../../src/lib/plotGeometry";

export default function ExpressInterestScreen() {
  const { colors, spacing, borderRadius, fontWeight, fontSize, isDark } = useTheme();
  const { id, table, interestTable } = useLocalSearchParams<{
    id: string;
    table: string;
    interestTable: string;
  }>();
  const { user } = useUser();
  const router = useRouter();

  const [plot, setPlot] = useState<PlotFeature | null>(null);
  const [loadingPlot, setLoadingPlot] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    firstname: user?.firstName || "",
    lastname: user?.lastName || "",
    email: user?.primaryEmailAddress?.emailAddress || "",
    phone: "",
    country: "Ghana",
    message: "",
  });

  useEffect(() => {
    if (!id || !table) return;
    getPlotById(table, id).then((p) => {
      if (p) setPlot(p);
      setLoadingPlot(false);
    });
  }, [id, table]);

  const validate = () => {
    if (!form.firstname.trim()) return "Enter first name";
    if (!form.lastname.trim()) return "Enter last name";
    if (!form.email.trim()) return "Enter email address";
    if (!form.phone.trim()) return "Enter phone number";
    if (form.phone.trim().length !== 10) return "Phone number must be 10 digits";
    if (!form.message.trim()) return "Please add a message";
    if (form.message.trim().length < 5) return "Message is too short";
    return null;
  };

  const submit = async () => {
    const err = validate();
    if (err) {
      Alert.alert("Validation", err);
      return;
    }

    setSubmitting(true);
    try {
      await submitPlotInterest(interestTable!, table!, id!, form);

      // Notify admin of interest via mobile API
      try {
        await fetchMobileApi("/api/receive-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            from: form.email,
            fullname: `${form.firstname} ${form.lastname}`,
            phone: form.phone,
            subject: `Plot Interest — Plot ${plot?.properties?.Plot_No ?? ""}`,
            message: `${form.message}\n\nPlot: ${plot?.properties?.Street_Nam ?? ""} | Amount: GHS ${plot?.plotTotalAmount ?? ""}`,
          }),
        });
      } catch (mailErr) {
        console.log("Interest email error:", mailErr);
      }

      sendCompanyAlert({
        subject: `New plot interest — Plot ${plot?.properties?.Plot_No ?? id}`,
        message: [
          "New plot interest",
          `Client: ${form.firstname} ${form.lastname}`,
          `Phone: ${form.phone}`,
          `Email: ${form.email}`,
          `Plot: ${plot?.properties?.Plot_No ?? id}`,
          `Street: ${formatStreet(plot?.properties?.Street_Nam) || "N/A"}`,
          `Amount: ${formatGhs(plot?.plotTotalAmount || 0)}`,
          `Size: ${formatCoordinatePlotSize(plot)}`,
          `Message: ${form.message}`,
        ].join("\n"),
      }).catch((alertErr) => console.log("Company interest alert error:", alertErr));

      Alert.alert(
        "Message Sent",
        "Thank you for your interest! We will get in touch with you soon.",
        [{ text: "OK", onPress: () => router.back() }],
      );
    } catch (e) {
      Alert.alert("Error", e instanceof Error ? e.message : "Failed to submit interest");
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingPlot) return <Loading />;

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
            <View style={[styles.plotBadge, { backgroundColor: colors.info + "20" }]}>
              <Ionicons name="information-circle" size={24} color={colors.info} />
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
                {plot.properties?.Site ? String(plot.properties.Site) : "Standard Development"}
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
              <Text style={[styles.statLabel, { color: colors.textMuted }]}>Market Price</Text>
              <Text style={[styles.statValue, { color: colors.primary, fontWeight: "800" }]}>
                {formatGhs(plot.plotTotalAmount || 0)}
              </Text>
            </View>
          </View>
        </View>

        {/* Inquiry Form */}
        <Text
          style={[
            styles.sectionHeader,
            { color: colors.text, fontWeight: fontWeight.bold as TextStyle["fontWeight"] },
          ]}
        >
          Your Contact Information
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
              label="First Name *"
              value={form.firstname}
              onChangeText={(v) => setForm({ ...form, firstname: v })}
              containerStyle={{ flex: 1, marginRight: 8 }}
            />
            <Input
              label="Last Name *"
              value={form.lastname}
              onChangeText={(v) => setForm({ ...form, lastname: v })}
              containerStyle={{ flex: 1 }}
            />
          </View>

          <Input
            label="Email Address *"
            keyboardType="email-address"
            autoCapitalize="none"
            value={form.email}
            onChangeText={(v) => setForm({ ...form, email: v })}
            containerStyle={styles.inputSpacing}
          />

          <Input
            label="Phone Number *"
            keyboardType="phone-pad"
            placeholder="024 XXX XXXX"
            value={form.phone}
            onChangeText={(v) => setForm({ ...form, phone: v })}
            containerStyle={styles.inputSpacing}
          />

          <Input
            label="Country"
            value={form.country}
            onChangeText={(v) => setForm({ ...form, country: v })}
            containerStyle={styles.inputSpacing}
          />

          <Input
            label="Message *"
            placeholder="I'm interested in this plot. Please provide more details."
            multiline
            numberOfLines={4}
            value={form.message}
            onChangeText={(v) => setForm({ ...form, message: v })}
            style={{ minHeight: 100 }}
          />
        </View>

        <View style={styles.infoBadge}>
          <Ionicons name="mail-outline" size={14} color={colors.textSecondary} />
          <Text style={[styles.infoText, { color: colors.textMuted }]}>
            We'll respond to your inquiry within 24 hours.
          </Text>
        </View>
      </ScrollView>

      {/* Action Footer */}
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
          title="Send Interest Message"
          onPress={submit}
          loading={submitting}
          size="lg"
          fullWidth
        />
      </View>
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
  infoBadge: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    marginTop: 24,
  },
  infoText: {
    fontSize: 11,
  },
  footer: {
    borderTopWidth: 1,
    paddingBottom: 34,
  },
});
