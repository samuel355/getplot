import { useUser } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, View, type TextStyle } from "react-native";
import { PaystackCheckout } from "../../src/components/PaystackCheckout";
import { Button } from "../../src/components/ui/Button";
import { Input } from "../../src/components/ui/Input";
import { useTheme } from "../../src/constants/theme";
import { formatGhs } from "../../src/lib/plotService";
import { useCartStore } from "../../src/stores/cartStore";
import { Ionicons } from "@expo/vector-icons";

export default function CheckoutScreen() {
  const { colors, spacing, borderRadius, fontWeight, fontSize, isDark } = useTheme();
  const { plots, getTotal, clearCart } = useCartStore();
  const { user } = useUser();
  const router = useRouter();

  const [payVisible, setPayVisible] = useState(false);
  const [buyer, setBuyer] = useState({
    firstname: user?.firstName || "",
    lastname: user?.lastName || "",
    email: user?.primaryEmailAddress?.emailAddress || "",
    phone: "",
    country: "Ghana",
    residentialAddress: "",
  });

  const total = getTotal();

  if (!plots.length) {
    return (
      <View style={[styles.empty, { backgroundColor: colors.background }]}>
        <Ionicons name="cart-outline" size={80} color={colors.textMuted} />
        <Text
          style={[
            styles.emptyTitle,
            {
              color: colors.text,
              fontSize: fontSize.xl,
              fontWeight: fontWeight.bold as TextStyle["fontWeight"],
            },
          ]}
        >
          Your cart is empty
        </Text>
        <Button
          title="Return to Marketplace"
          onPress={() => router.push("/(tabs)/marketplace")}
          variant="outline"
        />
      </View>
    );
  }

  const handlePay = () => {
    if (
      !buyer.firstname ||
      !buyer.lastname ||
      !buyer.email ||
      !buyer.phone ||
      !buyer.residentialAddress
    ) {
      Alert.alert("Required Fields", "Please complete all buyer information fields.");
      return;
    }
    setPayVisible(true);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* Order Summary Card */}
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
          <Text
            style={[
              styles.cardTitle,
              {
                color: colors.text,
                fontWeight: fontWeight.bold as TextStyle["fontWeight"],
                fontSize: fontSize.lg,
              },
            ]}
          >
            Order Summary
          </Text>
          <View style={styles.divider} />

          {plots.map((p, index) => (
            <View
              key={p.id}
              style={[
                styles.itemRow,
                index !== plots.length - 1 && {
                  borderBottomWidth: 1,
                  borderBottomColor: colors.borderLight,
                },
              ]}
            >
              <View style={[styles.plotBadge, { backgroundColor: colors.primaryAccent + "20" }]}>
                <Ionicons name="map" size={16} color={colors.primaryAccent} />
              </View>
              <View style={{ flex: 1 }}>
                <Text
                  style={[
                    styles.plotNo,
                    {
                      color: colors.text,
                      fontWeight: fontWeight.semibold as TextStyle["fontWeight"],
                    },
                  ]}
                >
                  Plot {p.properties?.Plot_No ?? "N/A"}
                </Text>
                <Text style={[styles.siteName, { color: colors.textMuted, fontSize: fontSize.xs }]}>
                  {p.properties?.Site ?? "Investment Plot"}
                </Text>
              </View>
              <Text
                style={[
                  styles.itemAmount,
                  { color: colors.text, fontWeight: fontWeight.bold as TextStyle["fontWeight"] },
                ]}
              >
                {formatGhs(p.plotTotalAmount || 0)}
              </Text>
            </View>
          ))}

          <View style={[styles.totalRow, { marginTop: spacing.md }]}>
            <Text style={[styles.totalLabel, { color: colors.textSecondary }]}>Grand Total</Text>
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
              {formatGhs(total)}
            </Text>
          </View>
        </View>

        {/* Buyer Information Section */}
        <Text
          style={[
            styles.sectionHeader,
            {
              color: colors.text,
              fontWeight: fontWeight.bold as TextStyle["fontWeight"],
              fontSize: fontSize.md,
            },
          ]}
        >
          Buyer Information
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
            placeholder="e.g. House No. 12, East Legon"
            multiline
            value={buyer.residentialAddress}
            onChangeText={(v) => setBuyer({ ...buyer, residentialAddress: v })}
            containerStyle={styles.inputSpacing}
          />
        </View>

        <View style={styles.secureSection}>
          <Ionicons name="shield-checkmark" size={16} color={colors.success} />
          <Text style={[styles.secureText, { color: colors.textMuted }]}>
            Encrypted and Secure Payment
          </Text>
        </View>
      </ScrollView>

      {/* Fixed Bottom Action */}
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
        <Button title={`Pay ${formatGhs(total)}`} onPress={handlePay} size="lg" fullWidth />
      </View>

      <PaystackCheckout
        visible={payVisible}
        email={buyer.email}
        amount={total}
        reference={`cart_${Date.now()}`}
        onSuccess={() => {
          setPayVisible(false);
          clearCart();
          router.replace("/payment-success");
        }}
        onClose={() => setPayVisible(false)}
      />
    </View>
  );
}

// Mock useUser hook if clerk import is tricky (but it's already used in the project)
function userUser() {
  const { user } = useUser();
  return { user };
}

const styles = StyleSheet.create({
  container: { flex: 1 },
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
  cardTitle: {
    marginBottom: 16,
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(0,0,0,0.05)",
    marginBottom: 16,
  },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    gap: 12,
  },
  plotBadge: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  plotNo: {
    fontSize: 14,
  },
  siteName: {
    marginTop: 2,
  },
  itemAmount: {
    fontSize: 14,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 16,
    borderTopWidth: 2,
    borderTopColor: "rgba(0,0,0,0.05)",
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: "600",
  },
  totalValue: {},
  sectionHeader: {
    marginHorizontal: 20,
    marginBottom: 12,
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
  secureSection: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 24,
  },
  secureText: {
    fontSize: 12,
  },
  footer: {
    borderTopWidth: 1,
    paddingBottom: 34, // Safe area space
  },
  empty: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 20,
    padding: 40,
  },
  emptyTitle: {
    textAlign: "center",
  },
});
