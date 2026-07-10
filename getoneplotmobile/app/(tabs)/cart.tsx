import { useAuth } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { FlatList, Pressable, StyleSheet, Text, View, type TextStyle } from "react-native";
import { Button } from "../../src/components/ui/Button";
import { useTheme } from "../../src/constants/theme";
import { formatGhs, formatStreet } from "../../src/lib/plotService";
import { useCartStore } from "../../src/stores/cartStore";

export default function CartScreen() {
  const { colors, spacing, borderRadius, fontWeight, fontSize, isDark } = useTheme();
  const router = useRouter();
  const { isSignedIn } = useAuth();
  const { plots, removePlot, getTotal, clearCart } = useCartStore();
  const total = getTotal();

  if (!plots.length) {
    return (
      <View style={[styles.empty, { backgroundColor: colors.background }]}>
        <View style={[styles.emptyIconContainer, { backgroundColor: colors.surfaceAlt }]}>
          <Ionicons name="cart-outline" size={64} color={colors.textMuted} />
        </View>
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
        <Text style={[styles.emptySub, { color: colors.textMuted }]}>
          Visit our sites to explore and add plots to your investment portfolio.
        </Text>
        <Button
          title="Browse Available Sites"
          onPress={() => router.push("/(tabs)/sites")}
          style={{ marginTop: spacing.lg }}
          size="lg"
        />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        data={plots}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[styles.list, { padding: spacing.lg }]}
        renderItem={({ item }) => (
          <View
            style={[
              styles.item,
              {
                backgroundColor: colors.surface,
                borderRadius: borderRadius.lg,
                padding: spacing.md,
                borderColor: colors.border,
              },
            ]}
          >
            <View style={[styles.plotIcon, { backgroundColor: colors.primaryAccent + "20" }]}>
              <Ionicons name="map" size={24} color={colors.primaryAccent} />
            </View>
            <View style={styles.itemBody}>
              <Text
                style={[
                  styles.plotNo,
                  {
                    color: colors.text,
                    fontSize: fontSize.md,
                    fontWeight: fontWeight.bold as TextStyle["fontWeight"],
                  },
                ]}
              >
                Plot {item.properties?.Plot_No ?? item.id.slice(0, 8)}
              </Text>
              <Text style={[styles.siteName, { color: colors.textMuted, fontSize: fontSize.sm }]}>
                {item.siteName || "Standard Plot"}
                {item.properties?.Street_Nam
                  ? ` • ${formatStreet(item.properties.Street_Nam)}`
                  : ""}
              </Text>
              <Text
                style={[
                  styles.amount,
                  {
                    color: colors.primaryAccent,
                    fontSize: fontSize.md,
                    fontWeight: fontWeight.bold as TextStyle["fontWeight"],
                  },
                ]}
              >
                {formatGhs(item.plotTotalAmount || 0)}
              </Text>
            </View>
            <Pressable
              style={[styles.removeBtn, { backgroundColor: colors.surfaceAlt }]}
              onPress={() => removePlot(item.id)}
            >
              <Ionicons name="trash-outline" size={20} color={colors.error} />
            </Pressable>
          </View>
        )}
        ListHeaderComponent={() => (
          <View style={styles.header}>
            <Text
              style={[
                styles.headerTitle,
                {
                  color: colors.text,
                  fontSize: fontSize.xxl,
                  fontWeight: fontWeight.extrabold as TextStyle["fontWeight"],
                },
              ]}
            >
              My Cart
            </Text>
            <Pressable onPress={clearCart}>
              <Text
                style={{
                  color: colors.error,
                  fontSize: fontSize.sm,
                  fontWeight: fontWeight.semibold as TextStyle["fontWeight"],
                }}
              >
                Clear All
              </Text>
            </Pressable>
          </View>
        )}
      />

      <View
        style={[
          styles.summary,
          {
            backgroundColor: isDark ? colors.surface : colors.white,
            borderTopColor: colors.border,
            padding: spacing.xl,
          },
        ]}
      >
        <View style={styles.summaryRow}>
          <Text style={[styles.summaryLabel, { color: colors.textMuted }]}>Total Items</Text>
          <Text style={[styles.summaryValue, { color: colors.text }]}>{plots.length} Plots</Text>
        </View>
        <View style={[styles.summaryRow, { marginTop: spacing.sm }]}>
          <Text style={[styles.summaryLabel, { color: colors.textMuted, fontSize: fontSize.lg }]}>
            Total Amount
          </Text>
          <Text
            style={[
              styles.totalAmount,
              {
                color: colors.primaryAccent,
                fontSize: fontSize.xxl,
                fontWeight: fontWeight.extrabold as TextStyle["fontWeight"],
              },
            ]}
          >
            {formatGhs(total)}
          </Text>
        </View>

        <Button
          title="Proceed to Checkout"
          onPress={() => (isSignedIn ? router.push("/checkout") : router.push("/(auth)/sign-in"))}
          style={{ marginTop: spacing.xl }}
          size="lg"
          fullWidth
        />
        <Text style={[styles.secureText, { color: colors.textMuted }]}>
          <Ionicons name="mail-outline" size={12} color={colors.textMuted} /> Bank details sent
          by email and SMS
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginBottom: 24,
  },
  headerTitle: {},
  list: { paddingBottom: 40 },
  item: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    borderWidth: 1,
  },
  plotIcon: {
    width: 50,
    height: 50,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  itemBody: { flex: 1, gap: 2 },
  plotNo: {},
  siteName: {},
  amount: { marginTop: 4 },
  removeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  summary: {
    borderTopWidth: 1,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    elevation: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.05,
    shadowRadius: 20,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  summaryLabel: {},
  summaryValue: { fontWeight: "600" },
  totalAmount: {},
  secureText: {
    textAlign: "center",
    marginTop: 16,
    fontSize: 10,
  },
  empty: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  emptyTitle: {
    textAlign: "center",
    marginBottom: 12,
  },
  emptySub: {
    textAlign: "center",
    lineHeight: 22,
  },
});
