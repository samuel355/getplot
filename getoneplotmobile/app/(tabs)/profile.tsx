import { useAuth, useUser } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRouter } from "expo-router";
import { useLayoutEffect } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type TextStyle,
  type ViewStyle,
  Dimensions,
} from "react-native";
import { ProfileGuestAuth } from "../../src/components/auth/ProfileGuestAuth";
import { useTheme } from "../../src/constants/theme";
import { formatGhs } from "../../src/lib/plotService";
import { usePropertyStore } from "../../src/stores/propertyStore";
import { useAppStore } from "../../src/stores/appStore";
import type { Property } from "../../src/types/property";
import { Button } from "../../src/components/ui/Button";

const { width } = Dimensions.get("window");

type ActionRowProps = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  detail?: string;
  tone?: "default" | "danger" | "accent";
  onPress: () => void;
  isLast?: boolean;
  rightElement?: React.ReactNode;
};

function formatRole(role: string) {
  return role.replace(/_/g, " ").toUpperCase();
}

export default function ProfileScreen() {
  const { colors, spacing, borderRadius, fontWeight, fontSize, isDark, themePreference } =
    useTheme();
  const { setTheme } = useAppStore();
  const { isSignedIn, signOut } = useAuth();
  const { user } = useUser();
  const router = useRouter();
  const navigation = useNavigation();
  const favorites = usePropertyStore((s) => s.favorites);

  const role = (user?.publicMetadata?.role as string) || "guest";
  const area = (user?.publicMetadata?.area as string) || "Not assigned";
  const email = user?.primaryEmailAddress?.emailAddress || user?.emailAddresses?.[0]?.emailAddress;
  const displayName = user?.fullName || user?.firstName || "Account Holder";
  const isAdmin = ["admin", "sysadmin", "chief", "chief_asst"].includes(role);
  const visibleFavorites = favorites.slice(0, 3);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
  }, [isSignedIn, navigation]);

  if (!isSignedIn) {
    return <ProfileGuestAuth />;
  }

  const getInitial = () => {
    return (
      user?.firstName?.[0] ||
      user?.lastName?.[0] ||
      user?.primaryEmailAddress?.emailAddress?.[0] ||
      "U"
    ).toUpperCase();
  };

  const getPropertyPrice = (property: Property) => {
    const amount =
      property.listing_type === "rent" || property.listing_type === "airbnb"
        ? property.rental_price
        : property.price;
    return formatGhs(amount || 0);
  };

  const ActionRow = ({
    icon,
    label,
    detail,
    tone = "default",
    onPress,
    isLast,
    rightElement,
  }: ActionRowProps) => {
    const iconColor =
      tone === "danger" ? colors.error : tone === "accent" ? colors.primaryAccent : colors.primary;

    return (
      <Pressable
        style={({ pressed }) => [
          styles.actionRow,
          { borderBottomColor: colors.border, borderBottomWidth: isLast ? 0 : 1 },
          pressed && { backgroundColor: colors.surfaceAlt },
        ]}
        onPress={onPress}
      >
        <View
          style={[
            styles.actionIconBox,
            { backgroundColor: tone === "danger" ? "rgba(239, 68, 68, 0.1)" : colors.surfaceAlt },
          ]}
        >
          <Ionicons name={icon} size={20} color={iconColor} />
        </View>
        <View style={styles.actionCopy}>
          <Text
            style={[
              styles.actionLabel,
              {
                color: tone === "danger" ? colors.error : colors.text,
                fontWeight: fontWeight.semibold as TextStyle["fontWeight"],
              },
            ]}
          >
            {label}
          </Text>
          {detail && (
            <Text style={[styles.actionDetail, { color: colors.textMuted }]}>{detail}</Text>
          )}
        </View>
        {rightElement || <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />}
      </Pressable>
    );
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 40 }}
    >
      {/* Premium Header */}
      <View style={[styles.header, { backgroundColor: isDark ? colors.background : colors.white }]}>
        <View style={[styles.headerTop, { paddingTop: 60 }]}>
          <View
            style={[
              styles.avatar,
              { backgroundColor: colors.primary, borderColor: colors.background },
            ]}
          >
            <Text
              style={[
                styles.avatarText,
                { fontWeight: fontWeight.bold as TextStyle["fontWeight"], color: colors.white },
              ]}
            >
              {getInitial()}
            </Text>
          </View>
          <View style={styles.identity}>
            <Text
              style={[
                styles.name,
                { color: colors.text, fontWeight: fontWeight.extrabold as TextStyle["fontWeight"] },
              ]}
            >
              {displayName}
            </Text>
            <Text style={[styles.email, { color: colors.textMuted }]}>{email}</Text>

            <View style={{ flexDirection: "row", gap: 8, marginTop: 4 }}>
              <View style={[styles.roleBadge, { backgroundColor: colors.primaryAccent }]}>
                <Text style={styles.roleText}>{formatRole(role)}</Text>
              </View>
              <View
                style={[
                  styles.areaBadge,
                  { backgroundColor: colors.surfaceAlt, borderColor: colors.border },
                ]}
              >
                <Ionicons name="location-outline" size={12} color={colors.primary} />
                <Text style={[styles.areaText, { color: colors.textSecondary }]}>{area}</Text>
              </View>
            </View>
          </View>
        </View>

        <View
          style={[
            styles.statsRow,
            { marginTop: 24, borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 16 },
          ]}
        >
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: colors.text }]}>{favorites.length}</Text>
            <Text style={[styles.statLabel, { color: colors.textMuted }]}>Saved</Text>
          </View>
          <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: colors.text }]}>{isAdmin ? "YES" : "NO"}</Text>
            <Text style={[styles.statLabel, { color: colors.textMuted }]}>Admin</Text>
          </View>
          <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: colors.text }]}>0</Text>
            <Text style={[styles.statLabel, { color: colors.textMuted }]}>Listings</Text>
          </View>
        </View>
      </View>

      {/* Content Sections */}
      <View style={[styles.content, { padding: spacing.lg }]}>
        {/* Saved Properties Section */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>My Favorites</Text>
          {favorites.length > 0 && (
            <Pressable onPress={() => router.push("/(tabs)/marketplace")}>
              <Text style={{ color: colors.primaryAccent, fontSize: 12 }}>View Marketplace</Text>
            </Pressable>
          )}
        </View>

        <View
          style={[
            styles.groupedCard,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
              borderRadius: borderRadius.xl,
            },
          ]}
        >
          {visibleFavorites.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="heart-outline" size={32} color={colors.textMuted} />
              <Text style={[styles.emptyText, { color: colors.textMuted }]}>
                No saved properties yet
              </Text>
              <Button
                title="Explore Marketplace"
                onPress={() => router.push("/(tabs)/marketplace")}
                variant="outline"
                size="sm"
                style={{ marginTop: 12 }}
              />
            </View>
          ) : (
            visibleFavorites.map((property, index) => (
              <Pressable
                key={property.id}
                style={({ pressed }) => [
                  styles.propertyItem,
                  {
                    borderBottomWidth: index === visibleFavorites.length - 1 ? 0 : 1,
                    borderBottomColor: colors.borderLight,
                  },
                  pressed && { opacity: 0.7 },
                ]}
                onPress={() => router.push(`/property/${property.id}`)}
              >
                <View style={[styles.propertyIcon, { backgroundColor: colors.background }]}>
                  <Ionicons name="business" size={18} color={colors.primary} />
                </View>
                <View style={styles.propertyInfo}>
                  <Text style={[styles.propertyTitle, { color: colors.text }]} numberOfLines={1}>
                    {property.title}
                  </Text>
                  <Text style={[styles.propertyMeta, { color: colors.textMuted }]}>
                    {property.location} • {getPropertyPrice(property)}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
              </Pressable>
            ))
          )}
        </View>

        {/* Theme Preference Section */}
        <Text
          style={[styles.sectionTitle, { color: colors.text, marginTop: 24, marginBottom: 12 }]}
        >
          Appearance
        </Text>
        <View
          style={[
            styles.groupedCard,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
              borderRadius: borderRadius.xl,
            },
          ]}
        >
          <View style={styles.themeToggleRow}>
            {[
              { id: "light", icon: "sunny-outline", label: "Light" },
              { id: "dark", icon: "moon-outline", label: "Dark" },
              { id: "system", icon: "phone-portrait-outline", label: "System" },
            ].map((item, index) => (
              <Pressable
                key={item.id}
                onPress={() => setTheme(item.id as any)}
                style={[
                  styles.themeTab,
                  themePreference === item.id && {
                    backgroundColor: colors.primary,
                    borderColor: colors.primary,
                  },
                  { borderRightWidth: index === 2 ? 0 : 1, borderRightColor: colors.border },
                ]}
              >
                <Ionicons
                  name={item.icon as any}
                  size={18}
                  color={themePreference === item.id ? colors.white : colors.textMuted}
                />
                <Text
                  style={[
                    styles.themeTabText,
                    { color: themePreference === item.id ? colors.white : colors.textSecondary },
                  ]}
                >
                  {item.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Account Actions Section */}
        <Text
          style={[styles.sectionTitle, { color: colors.text, marginTop: 24, marginBottom: 12 }]}
        >
          Account & Management
        </Text>

        <View
          style={[
            styles.groupedCard,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
              borderRadius: borderRadius.xl,
            },
          ]}
        >
          <ActionRow
            icon="list-outline"
            label="My Listings"
            detail="Properties you've listed"
            onPress={() => router.push("/property/my-listings")}
          />
          <ActionRow
            icon="add-circle-outline"
            label="Add New Property"
            detail="List a property for sale or rent"
            onPress={() => router.push("/property/manage")}
          />
          {isAdmin && (
            <ActionRow
              icon="shield-outline"
              label="Admin Dashboard"
              detail="Manage listings and approvals"
              tone="accent"
              onPress={() => router.push("/admin")}
            />
          )}
          <ActionRow
            icon="chatbubble-outline"
            label="Help & Support"
            detail="Contact our support team"
            onPress={() => router.push("/contact")}
          />
          <ActionRow
            icon="log-out-outline"
            label="Sign Out"
            detail="Safely log out of your account"
            tone="danger"
            onPress={async () => {
              await signOut();
              router.replace("/(tabs)");
            }}
            isLast
          />
        </View>

        <View style={styles.footerInfo}>
          <Text style={[styles.versionText, { color: colors.textMuted }]}>
            GetOnePlot Mobile v1.0.0
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: 24,
    paddingBottom: 24,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
  },
  headerTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 4,
  },
  avatarText: {
    fontSize: 28,
  },
  identity: {
    flex: 1,
    gap: 4,
  },
  name: {
    fontSize: 22,
  },
  email: {
    fontSize: 14,
  },
  roleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  roleText: {
    color: "#fff",
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  areaBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    gap: 4,
  },
  areaText: {
    fontSize: 10,
    fontWeight: "600",
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  statItem: {
    flex: 1,
    alignItems: "center",
    gap: 2,
  },
  statValue: {
    fontSize: 18,
    fontWeight: "800",
  },
  statLabel: {
    fontSize: 11,
    fontWeight: "500",
  },
  statDivider: {
    width: 1,
    height: 24,
  },
  content: {
    marginTop: 8,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
  },
  groupedCard: {
    borderWidth: 1,
    overflow: "hidden",
  },
  emptyState: {
    padding: 32,
    alignItems: "center",
    gap: 8,
  },
  emptyText: {
    fontSize: 14,
    textAlign: "center",
  },
  propertyItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    gap: 12,
  },
  propertyIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  propertyInfo: {
    flex: 1,
    gap: 2,
  },
  propertyTitle: {
    fontSize: 14,
    fontWeight: "700",
  },
  propertyMeta: {
    fontSize: 12,
  },
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    gap: 16,
  },
  actionIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  actionCopy: {
    flex: 1,
    gap: 2,
  },
  actionLabel: {
    fontSize: 15,
  },
  actionDetail: {
    fontSize: 11,
  },
  themeToggleRow: {
    flexDirection: "row",
    height: 50,
  },
  themeTab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  themeTabText: {
    fontSize: 12,
    fontWeight: "600",
  },
  footerInfo: {
    marginTop: 32,
    alignItems: "center",
  },
  versionText: {
    fontSize: 12,
    fontWeight: "500",
  },
});
