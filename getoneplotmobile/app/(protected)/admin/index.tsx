import { useUser } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type TextStyle,
  type ViewStyle,
} from "react-native";
import { borderRadius, colors, fontSize, fontWeight, spacing } from "../../../src/constants/theme";

const weights = fontWeight as Record<keyof typeof fontWeight, TextStyle["fontWeight"]>;

type DashboardCardProps = {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
  meta: string;
  onPress: () => void;
};

export default function AdminScreen() {
  const { user } = useUser();
  const router = useRouter();
  const role = (user?.publicMetadata?.role as string) || "";
  const area = (user?.publicMetadata?.area as string) || "";
  const allowed = ["admin", "sysadmin", "chief", "chief_asst"].includes(role);
  const canManageProperties = role === "admin" || role === "sysadmin";

  if (!allowed) {
    return (
      <View style={styles.denied}>
        <Ionicons name="lock-closed-outline" size={48} color={colors.textMuted} />
        <Text style={text.deniedTitle}>Admin access required</Text>
        <Text style={text.deniedHint}>Your role does not include dashboard access.</Text>
        <Pressable style={styles.primaryButton} onPress={() => router.replace("/(tabs)")}>
          <Text style={text.primaryButton}>Go home</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.hero}>
        <View style={styles.heroIcon}>
          <Ionicons name="speedometer-outline" size={26} color={colors.white} />
        </View>
        <Text style={text.kicker}>Admin console</Text>
        <Text style={text.title}>Dashboards</Text>
        <Text style={text.subtitle}>
          {role.replace(/_/g, " ")}
          {area ? ` - ${area}` : ""}
        </Text>
      </View>

      <View style={styles.grid}>
        {canManageProperties ? (
          <DashboardCard
            icon="business-outline"
            title="Properties Dashboard"
            description="Review marketplace listings, filter by approval status, and approve or reject submissions."
            meta="Matches web /properties/all-properties"
            onPress={() => router.push("/admin/properties")}
          />
        ) : null}
        <DashboardCard
          icon="map-outline"
          title="Land Sites Dashboard"
          description="Review development sites, plot counts, status totals, and open each site map."
          meta="Matches web /dashboard"
          onPress={() => router.push("/admin/plots")}
        />
        {canManageProperties ? (
          <DashboardCard
            icon="people-outline"
            title="User Management"
            description="View and manage user roles, permissions, and account status."
            meta="Matches web /properties/users"
            onPress={() => router.push("/admin/users")}
          />
        ) : null}
      </View>

      <Pressable style={styles.secondaryButton} onPress={() => router.replace("/(tabs)/profile")}>
        <Ionicons name="arrow-back" size={18} color={colors.primary} />
        <Text style={text.secondaryButton}>Back to profile</Text>
      </Pressable>
    </ScrollView>
  );
}

function DashboardCard({ icon, title, description, meta, onPress }: DashboardCardProps) {
  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
      onPress={onPress}
      android_ripple={{ color: "rgba(15, 23, 42, 0.06)" }}
    >
      <View style={styles.cardTop}>
        <View style={styles.cardIcon}>
          <Ionicons name={icon} size={22} color={colors.primary} />
        </View>
        <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
      </View>
      <Text style={text.cardTitle}>{title}</Text>
      <Text style={text.cardDescription}>{description}</Text>
      <Text style={text.cardMeta}>{meta}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create<Record<string, ViewStyle>>({
  container: { flex: 1, backgroundColor: colors.surface },
  content: { padding: spacing.lg, paddingBottom: spacing.xxxl, gap: spacing.lg },
  hero: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    shadowColor: colors.primaryDark,
    shadowOpacity: 0.18,
    shadowOffset: { width: 0, height: 10 },
    shadowRadius: 18,
    elevation: 5,
  },
  heroIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.15)",
    marginBottom: spacing.lg,
  },
  grid: { gap: spacing.md },
  card: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
  },
  cardTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.lg,
  },
  cardIcon: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.md,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surfaceAlt,
  },
  primaryButton: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
  },
  secondaryButton: {
    minHeight: 50,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
  },
  denied: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.lg,
    gap: spacing.md,
    backgroundColor: colors.surface,
  },
  pressed: { opacity: 0.72 },
});

const text = StyleSheet.create<Record<string, TextStyle>>({
  kicker: {
    color: "rgba(255,255,255,0.7)",
    fontSize: fontSize.sm,
    fontWeight: weights.semibold,
    textTransform: "uppercase",
  },
  title: {
    color: colors.white,
    fontSize: fontSize.display,
    fontWeight: weights.extrabold,
    marginTop: spacing.xs,
  },
  subtitle: {
    color: "rgba(255,255,255,0.8)",
    fontSize: fontSize.sm,
    marginTop: spacing.xs,
    textTransform: "capitalize",
  },
  cardTitle: {
    color: colors.text,
    fontSize: fontSize.lg,
    fontWeight: weights.bold,
  },
  cardDescription: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
    lineHeight: 20,
    marginTop: spacing.sm,
  },
  cardMeta: {
    color: colors.primaryAccent,
    fontSize: fontSize.xs,
    fontWeight: weights.semibold,
    marginTop: spacing.lg,
  },
  primaryButton: {
    color: colors.white,
    fontSize: fontSize.md,
    fontWeight: weights.semibold,
  },
  secondaryButton: {
    color: colors.primary,
    fontSize: fontSize.md,
    fontWeight: weights.semibold,
  },
  deniedTitle: {
    color: colors.text,
    fontSize: fontSize.xl,
    fontWeight: weights.bold,
  },
  deniedHint: {
    color: colors.textMuted,
    fontSize: fontSize.sm,
    textAlign: "center",
  },
});
