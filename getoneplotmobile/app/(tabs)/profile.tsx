import { useAuth, useUser } from '@clerk/clerk-expo';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRouter } from 'expo-router';
import { useLayoutEffect } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type TextStyle,
  type ViewStyle,
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

type ActionRowProps = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  detail?: string;
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
  const { isSignedIn, signOut } = useAuth();
  const { user } = useUser();
  const router = useRouter();
  const navigation = useNavigation();
  const favorites = usePropertyStore((s) => s.favorites);

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
    });
  }, [isSignedIn, navigation]);

  if (!isSignedIn) {
    return <ProfileGuestAuth />;
  }

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
          }}
        />
      </View>
    </ScrollView>
  );
}

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
  },
});
