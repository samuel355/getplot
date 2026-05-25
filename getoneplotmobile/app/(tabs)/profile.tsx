<<<<<<< HEAD
import { useAuth, useUser } from '@clerk/clerk-expo';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRouter } from 'expo-router';
import { useLayoutEffect } from 'react';
=======
import { useAuth, useUser } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRouter } from "expo-router";
import { useLayoutEffect } from "react";
>>>>>>> mobile
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type TextStyle,
  type ViewStyle,
<<<<<<< HEAD
} from 'react-native';
import { ProfileGuestAuth } from '../../src/components/auth/ProfileGuestAuth';
import {
  colors,
  fontSize,
  spacing,
  borderRadius,
  fontWeight,
} from '../../src/constants/theme';
import { formatGhs } from '../../src/lib/plotService';
import { usePropertyStore } from '../../src/stores/propertyStore';
import type { Property } from '../../src/types/property';

const weights = fontWeight as Record<keyof typeof fontWeight, TextStyle['fontWeight']>;
=======
  Dimensions,
  Alert,
  Linking,
} from "react-native";
import * as WebBrowser from "expo-web-browser";
import { ProfileGuestAuth } from "../../src/components/auth/ProfileGuestAuth";
import { useTheme } from "../../src/constants/theme";
import { formatGhs } from "../../src/lib/plotService";
import { usePropertyStore } from "../../src/stores/propertyStore";
import { useAppStore } from "../../src/stores/appStore";
import type { Property } from "../../src/types/property";
import { Button } from "../../src/components/ui/Button";

const { width } = Dimensions.get("window");

const PRIVACY_POLICY_URL = "https://getoneplot.com/privacy";
const TERMS_URL = "https://getoneplot.com/terms";
>>>>>>> mobile

type ActionRowProps = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  detail?: string;
<<<<<<< HEAD
  tone?: 'default' | 'danger' | 'accent';
  onPress: () => void;
};

function formatRole(role: string) {
  return role.replace(/_/g, ' ');
}

function getInitial(user: ReturnType<typeof useUser>['user']) {
  return (
    user?.firstName?.[0] ||
    user?.lastName?.[0] ||
    user?.primaryEmailAddress?.emailAddress?.[0] ||
    user?.emailAddresses?.[0]?.emailAddress?.[0] ||
    'U'
  ).toUpperCase();
}

function getPropertyPrice(property: Property) {
  const amount =
    property.listing_type === 'rent' || property.listing_type === 'airbnb'
      ? property.rental_price
      : property.price;
  return formatGhs(amount || 0);
}

function ActionRow({ icon, label, detail, tone = 'default', onPress }: ActionRowProps) {
  const iconColor =
    tone === 'danger' ? colors.error : tone === 'accent' ? colors.primaryAccent : colors.primary;

  return (
    <Pressable
      style={({ pressed }) => [viewStyles.actionRow, pressed && viewStyles.pressed]}
      onPress={onPress}
      android_ripple={{ color: 'rgba(15, 23, 42, 0.06)' }}
    >
      <View style={[viewStyles.actionIcon, tone === 'danger' && viewStyles.actionIconDanger]}>
        <Ionicons name={icon} size={20} color={iconColor} />
      </View>
      <View style={viewStyles.actionCopy}>
        <Text style={[textStyles.actionLabel, tone === 'danger' && textStyles.dangerText]}>
          {label}
        </Text>
        {detail ? <Text style={textStyles.actionDetail}>{detail}</Text> : null}
      </View>
      <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
    </Pressable>
  );
}

export default function ProfileScreen() {
=======
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
>>>>>>> mobile
  const { isSignedIn, signOut } = useAuth();
  const { user } = useUser();
  const router = useRouter();
  const navigation = useNavigation();
  const favorites = usePropertyStore((s) => s.favorites);

<<<<<<< HEAD
  const role = (user?.publicMetadata?.role as string) || 'guest';
  const area = (user?.publicMetadata?.area as string) || 'Not assigned';
  const email = user?.primaryEmailAddress?.emailAddress || user?.emailAddresses?.[0]?.emailAddress;
  const displayName = user?.fullName || user?.firstName || 'Account holder';
  const isAdmin = ['admin', 'sysadmin', 'chief', 'chief_asst'].includes(role);
  const visibleFavorites = favorites.slice(0, 4);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: isSignedIn,
      title: 'Profile',
=======
  const role = (user?.publicMetadata?.role as string) || "guest";
  const area = (user?.publicMetadata?.area as string) || "Not assigned";
  const email = user?.primaryEmailAddress?.emailAddress || user?.emailAddresses?.[0]?.emailAddress;
  const displayName = user?.fullName || user?.firstName || "Account Holder";
  const isAdmin = ["admin", "sysadmin", "chief", "chief_asst"].includes(role);
  const visibleFavorites = favorites.slice(0, 3);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: false,
>>>>>>> mobile
    });
  }, [isSignedIn, navigation]);

  if (!isSignedIn) {
    return <ProfileGuestAuth />;
  }

<<<<<<< HEAD
  return (
    <ScrollView
      style={viewStyles.container}
      contentContainerStyle={viewStyles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={viewStyles.headerCard}>
        <View style={viewStyles.headerTop}>
          <View style={viewStyles.avatar}>
            <Text style={textStyles.avatarText}>{getInitial(user)}</Text>
          </View>
          <View style={viewStyles.identity}>
            <Text style={textStyles.name} numberOfLines={1}>
              {displayName}
            </Text>
            <Text style={textStyles.email} numberOfLines={1}>
              {email}
            </Text>
          </View>
        </View>

        <View style={viewStyles.metaRow}>
          <View style={viewStyles.rolePill}>
            <Ionicons name="shield-checkmark" size={14} color={colors.white} />
            <Text style={textStyles.role}>{formatRole(role)}</Text>
          </View>
          <View style={viewStyles.areaPill}>
            <Ionicons name="location-outline" size={14} color={colors.primary} />
            <Text style={textStyles.area} numberOfLines={1}>
              {area}
            </Text>
          </View>
        </View>
      </View>

      <View style={viewStyles.statsRow}>
        <View style={viewStyles.statBox}>
          <Text style={textStyles.statValue}>{favorites.length}</Text>
          <Text style={textStyles.statLabel}>Saved</Text>
        </View>
        <View style={viewStyles.statBox}>
          <Text style={textStyles.statValue}>{isAdmin ? 'Yes' : 'No'}</Text>
          <Text style={textStyles.statLabel}>Admin access</Text>
        </View>
      </View>

      <View style={viewStyles.sectionHeader}>
        <Text style={textStyles.section}>Saved properties</Text>
        <Text style={textStyles.sectionCount}>{favorites.length}</Text>
      </View>

      <View style={viewStyles.sectionCard}>
        {visibleFavorites.length === 0 ? (
          <View style={viewStyles.emptyState}>
            <View style={viewStyles.emptyIcon}>
              <Ionicons name="heart-outline" size={24} color={colors.primaryAccent} />
            </View>
            <Text style={textStyles.emptyTitle}>No saved properties yet</Text>
            <Text style={textStyles.emptyMessage}>
              Save plots from the marketplace and they will appear here for quick review.
            </Text>
            <Pressable
              style={({ pressed }) => [viewStyles.marketplaceButton, pressed && viewStyles.pressed]}
              onPress={() => router.push('/(tabs)/marketplace')}
            >
              <Text style={textStyles.marketplaceButton}>Browse marketplace</Text>
            </Pressable>
          </View>
        ) : (
          visibleFavorites.map((property, index) => (
            <Pressable
              key={property.id}
              style={({ pressed }) => [
                viewStyles.propertyRow,
                index !== visibleFavorites.length - 1 && viewStyles.propertyRowBorder,
                pressed && viewStyles.pressed,
              ]}
              onPress={() => router.push(`/property/${property.id}`)}
            >
              <View style={viewStyles.propertyIcon}>
                <Ionicons name="business-outline" size={20} color={colors.primary} />
              </View>
              <View style={viewStyles.propertyCopy}>
                <Text style={textStyles.propertyTitle} numberOfLines={1}>
                  {property.title}
                </Text>
                <Text style={textStyles.propertyMeta} numberOfLines={1}>
                  {property.location} - {getPropertyPrice(property)}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
            </Pressable>
          ))
        )}
      </View>

      <View style={viewStyles.sectionHeader}>
        <Text style={textStyles.section}>Account</Text>
      </View>

      <View style={viewStyles.sectionCard}>
        {isAdmin ? (
          <ActionRow
            icon="speedometer-outline"
            label="Admin dashboard"
            detail="Review listings and manage operations"
            tone="accent"
            onPress={() => router.push('/admin')}
          />
        ) : null}
        <ActionRow
          icon="mail-outline"
          label="Contact support"
          detail="Questions about plots, payments, or approvals"
          onPress={() => router.push('/contact')}
        />
        <ActionRow
          icon="log-out-outline"
          label="Sign out"
          detail="End this session on your device"
          tone="danger"
          onPress={async () => {
            await signOut();
            router.replace('/(tabs)');
          }}
        />
=======
  const handleOpenLink = async (url: string) => {
    await WebBrowser.openBrowserAsync(url);
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      "Delete Account",
      "Are you sure you want to delete your account? This action is permanent and will remove all your data including saved properties and listings.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete My Account",
          style: "destructive",
          onPress: async () => {
            // Note: Clerk client-side SDK doesn't support direct deletion for security.
            // We direct the user to our support or a deletion request flow.
            const supportEmail = "support@getoneplot.com";
            const subject = "Account Deletion Request";
            const body = `I would like to request the deletion of my account associated with ${email}. User ID: ${user?.id}`;
            const mailUrl = `mailto:${supportEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

            Alert.alert(
              "Request Deletion",
              "To comply with security standards, account deletion must be verified. Would you like to send a deletion request to our support team?",
              [
                { text: "Not Now", style: "cancel" },
                {
                  text: "Send Request",
                  onPress: () => {
                    Linking.openURL(mailUrl);
                  },
                },
              ],
            );
          },
        },
      ],
    );
  };

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
          />
        </View>

        {/* Legal & Privacy Section */}
        <Text
          style={[styles.sectionTitle, { color: colors.text, marginTop: 24, marginBottom: 12 }]}
        >
          Legal & Safety
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
            icon="document-text-outline"
            label="Privacy Policy"
            detail="How we handle your data"
            onPress={() => handleOpenLink(PRIVACY_POLICY_URL)}
          />
          <ActionRow
            icon="shield-checkmark-outline"
            label="Terms of Service"
            detail="Our agreement with you"
            onPress={() => handleOpenLink(TERMS_URL)}
          />
          <ActionRow
            icon="trash-outline"
            label="Delete Account"
            detail="Permanently remove your data"
            tone="danger"
            onPress={handleDeleteAccount}
            isLast
          />
        </View>

        <View style={styles.footerInfo}>
          <Text style={[styles.versionText, { color: colors.textMuted }]}>
            GetOnePlot Mobile v1.0.0
          </Text>
        </View>
>>>>>>> mobile
      </View>
    </ScrollView>
  );
}

<<<<<<< HEAD
const viewStyles = StyleSheet.create<Record<string, ViewStyle>>({
  container: { flex: 1, backgroundColor: colors.surface },
  content: { padding: spacing.lg, paddingBottom: spacing.xxxl, gap: spacing.lg },
  headerCard: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    shadowColor: colors.primaryDark,
    shadowOpacity: 0.18,
    shadowOffset: { width: 0, height: 10 },
    shadowRadius: 18,
    elevation: 5,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  avatar: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: 'rgba(255,255,255,0.16)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.24)',
  },
  identity: { flex: 1 },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.xl,
  },
  rolePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: 7,
    borderRadius: borderRadius.full,
    backgroundColor: 'rgba(255,255,255,0.16)',
  },
  areaPill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: 7,
    borderRadius: borderRadius.full,
    backgroundColor: colors.white,
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  statBox: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.xs,
  },
  sectionCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  emptyState: {
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xxl,
  },
  emptyIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#eef2ff',
    marginBottom: spacing.md,
  },
  marketplaceButton: {
    marginTop: spacing.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary,
  },
  propertyRow: {
    minHeight: 74,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.md,
  },
  propertyRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  propertyIcon: {
    width: 42,
    height: 42,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceAlt,
  },
  propertyCopy: { flex: 1 },
  actionRow: {
    minHeight: 72,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  actionIcon: {
    width: 42,
    height: 42,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceAlt,
  },
  actionIconDanger: { backgroundColor: '#fef2f2' },
  actionCopy: { flex: 1 },
  pressed: { opacity: 0.72 },
});

const textStyles = StyleSheet.create<Record<string, TextStyle>>({
  avatarText: {
    fontSize: fontSize.xxl,
    fontWeight: weights.extrabold,
    color: colors.white,
  },
  name: {
    fontSize: fontSize.xl,
    fontWeight: weights.extrabold,
    color: colors.white,
  },
  email: {
    color: 'rgba(255,255,255,0.78)',
    marginTop: spacing.xs,
    fontSize: fontSize.sm,
  },
  role: {
    color: colors.white,
    fontSize: fontSize.xs,
    fontWeight: weights.semibold,
    textTransform: 'capitalize',
  },
  area: {
    flex: 1,
    color: colors.primary,
    fontSize: fontSize.xs,
    fontWeight: weights.semibold,
  },
  statValue: {
    color: colors.text,
    fontSize: fontSize.xxl,
    fontWeight: weights.extrabold,
    marginBottom: spacing.xs,
  },
  statLabel: {
    color: colors.textMuted,
    fontSize: fontSize.sm,
    fontWeight: weights.medium,
  },
  section: {
    fontWeight: weights.bold,
    fontSize: fontSize.lg,
    color: colors.text,
  },
  sectionCount: {
    color: colors.textMuted,
    fontSize: fontSize.sm,
    fontWeight: weights.semibold,
  },
  emptyTitle: {
    color: colors.text,
    fontSize: fontSize.md,
    fontWeight: weights.bold,
    marginBottom: spacing.xs,
  },
  emptyMessage: {
    color: colors.textMuted,
    fontSize: fontSize.sm,
    textAlign: 'center',
    lineHeight: 19,
  },
  marketplaceButton: {
    color: colors.white,
    fontSize: fontSize.sm,
    fontWeight: weights.semibold,
  },
  propertyTitle: {
    color: colors.text,
    fontSize: fontSize.md,
    fontWeight: weights.semibold,
    marginBottom: spacing.xs,
  },
  propertyMeta: {
    color: colors.textMuted,
    fontSize: fontSize.sm,
  },
  actionLabel: {
    color: colors.text,
    fontSize: fontSize.md,
    fontWeight: weights.semibold,
  },
  actionDetail: {
    color: colors.textMuted,
    fontSize: fontSize.sm,
    marginTop: spacing.xs,
  },
  dangerText: {
    color: colors.error,
=======
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
>>>>>>> mobile
  },
});
