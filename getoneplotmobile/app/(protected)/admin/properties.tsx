import { useUser } from '@clerk/clerk-expo';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  type ImageStyle,
  type TextStyle,
  type ViewStyle,
} from 'react-native';
import {
  borderRadius,
  colors,
  fontSize,
  fontWeight,
  spacing,
} from '../../../src/constants/theme';
import { formatGhs } from '../../../src/lib/plotService';
import { normalizePropertyImages } from '../../../src/lib/images';
import { supabase } from '../../../src/lib/supabase';
import type { Property } from '../../../src/types/property';

const weights = fontWeight as Record<keyof typeof fontWeight, TextStyle['fontWeight']>;

type PropertyStatus = 'all' | 'pending' | 'approved' | 'rejected';
type SortOrder = 'newest' | 'oldest' | 'price-high' | 'price-low';

type AdminProperty = Property & {
  user_id?: string;
  rejection_reason?: string;
  updated_at?: string;
};

type Stats = {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
};

const TABS: { id: PropertyStatus; label: string; icon?: keyof typeof Ionicons.glyphMap }[] = [
  { id: 'all', label: 'All' },
  { id: 'pending', label: 'Pending', icon: 'time-outline' },
  { id: 'approved', label: 'Approved', icon: 'checkmark-circle-outline' },
  { id: 'rejected', label: 'Rejected', icon: 'close-circle-outline' },
];

const SORT_OPTIONS: { id: SortOrder; label: string }[] = [
  { id: 'newest', label: 'Newest' },
  { id: 'oldest', label: 'Oldest' },
  { id: 'price-high', label: 'Price high' },
  { id: 'price-low', label: 'Price low' },
];

export default function AdminPropertiesScreen() {
  const { user } = useUser();
  const router = useRouter();
  const role = (user?.publicMetadata?.role as string) || '';
  const allowed = role === 'admin' || role === 'sysadmin';
  const [properties, setProperties] = useState<AdminProperty[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentTab, setCurrentTab] = useState<PropertyStatus>('pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'house' | 'land'>('all');
  const [sortOrder, setSortOrder] = useState<SortOrder>('newest');
  const [rejectingProperty, setRejectingProperty] = useState<AdminProperty | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchProperties = useCallback(async (silent = false) => {
    if (silent) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from('properties')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (fetchError) throw fetchError;

      const rows = (data || []).map((property) => ({
        ...(property as AdminProperty),
        images: normalizePropertyImages((property as AdminProperty).images),
      }));
      setProperties(rows);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load properties');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (allowed) fetchProperties();
  }, [allowed, fetchProperties]);

  const stats = useMemo<Stats>(() => {
    return properties.reduce(
      (acc, property) => {
        const status = property.status || 'pending';
        acc.total += 1;
        if (status === 'pending') acc.pending += 1;
        if (status === 'approved') acc.approved += 1;
        if (status === 'rejected') acc.rejected += 1;
        return acc;
      },
      { total: 0, pending: 0, approved: 0, rejected: 0 }
    );
  }, [properties]);

  const filteredProperties = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    const sorted = properties
      .filter((property) => (currentTab === 'all' ? true : property.status === currentTab))
      .filter((property) => (filterType === 'all' ? true : property.type === filterType))
      .filter((property) => {
        if (!query) return true;
        return [property.title, property.location, property.description]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(query));
      })
      .sort((a, b) => {
        if (sortOrder === 'oldest') {
          return new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime();
        }
        if (sortOrder === 'price-high') return getPrice(b) - getPrice(a);
        if (sortOrder === 'price-low') return getPrice(a) - getPrice(b);
        return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
      });

    return sorted;
  }, [currentTab, filterType, properties, searchQuery, sortOrder]);

  const updateStatus = async (property: AdminProperty, status: 'approved' | 'rejected', reason?: string) => {
    setUpdatingId(property.id);
    try {
      const payload =
        status === 'rejected'
          ? { status, rejection_reason: reason, updated_at: new Date().toISOString() }
          : { status, updated_at: new Date().toISOString() };

      const { error: updateError } = await supabase
        .from('properties')
        .update(payload)
        .eq('id', property.id);

      if (updateError) throw updateError;

      setProperties((items) =>
        items.map((item) =>
          item.id === property.id
            ? { ...item, status, rejection_reason: reason, updated_at: payload.updated_at }
            : item
        )
      );
    } catch (e) {
      Alert.alert('Update failed', e instanceof Error ? e.message : 'Could not update property');
    } finally {
      setUpdatingId(null);
    }
  };

  const approveProperty = (property: AdminProperty) => {
    Alert.alert('Approve property', `Approve ${property.title}?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Approve', onPress: () => updateStatus(property, 'approved') },
    ]);
  };

  const openReject = (property: AdminProperty) => {
    setRejectingProperty(property);
    setRejectionReason('');
  };

  const confirmReject = async () => {
    if (!rejectingProperty) return;
    const reason = rejectionReason.trim() || 'Rejected from mobile dashboard';
    const property = rejectingProperty;
    setRejectingProperty(null);
    await updateStatus(property, 'rejected', reason);
  };

  if (!allowed) {
    return (
      <View style={styles.denied}>
        <Ionicons name="lock-closed-outline" size={48} color={colors.textMuted} />
        <Text style={text.emptyTitle}>Property admin access required</Text>
        <Text style={text.emptyMessage}>Only admin and sysadmin roles can manage property approvals.</Text>
        <Pressable style={styles.cancelButton} onPress={() => router.replace('/admin')}>
          <Text style={text.cancelButton}>Back to admin</Text>
        </Pressable>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={text.loadingText}>Loading properties...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={filteredProperties}
        keyExtractor={(item) => item.id}
        refreshing={refreshing}
        onRefresh={() => fetchProperties(true)}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <>
            <View style={styles.header}>
              <Text style={text.title}>Property Management</Text>
              <Text style={text.subtitle}>Review, approve, and manage property listings</Text>
            </View>

            <View style={styles.statsGrid}>
              <StatCard label="Total" value={stats.total} icon="business-outline" />
              <StatCard label="Pending" value={stats.pending} icon="time-outline" tone="warning" />
              <StatCard label="Approved" value={stats.approved} icon="checkmark-circle-outline" tone="success" />
              <StatCard label="Rejected" value={stats.rejected} icon="close-circle-outline" tone="error" />
            </View>

            {error ? <Text style={text.errorText}>{error}</Text> : null}

            <View style={styles.searchBox}>
              <Ionicons name="search" size={18} color={colors.textMuted} />
              <TextInput
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Search properties..."
                placeholderTextColor={colors.textMuted}
                style={inputStyles.searchInput}
              />
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.chipRow}
            >
              {TABS.map((tab) => (
                <Pressable
                  key={tab.id}
                  style={[styles.chip, currentTab === tab.id && styles.chipActive]}
                  onPress={() => setCurrentTab(tab.id)}
                >
                  {tab.icon ? (
                    <Ionicons
                      name={tab.icon}
                      size={15}
                      color={currentTab === tab.id ? colors.white : colors.primary}
                    />
                  ) : null}
                  <Text style={[text.chip, currentTab === tab.id && text.chipActive]}>
                    {tab.label} {stats[tab.id as keyof Stats] ?? stats.total}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.chipRow}
            >
              {(['all', 'house', 'land'] as const).map((type) => (
                <Pressable
                  key={type}
                  style={[styles.filterChip, filterType === type && styles.filterChipActive]}
                  onPress={() => setFilterType(type)}
                >
                  <Text style={[text.filterChip, filterType === type && text.filterChipActive]}>
                    {type === 'all' ? 'All types' : type}
                  </Text>
                </Pressable>
              ))}
              {SORT_OPTIONS.map((sort) => (
                <Pressable
                  key={sort.id}
                  style={[styles.filterChip, sortOrder === sort.id && styles.filterChipActive]}
                  onPress={() => setSortOrder(sort.id)}
                >
                  <Text style={[text.filterChip, sortOrder === sort.id && text.filterChipActive]}>
                    {sort.label}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          </>
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="alert-circle-outline" size={34} color={colors.textMuted} />
            <Text style={text.emptyTitle}>No properties found</Text>
            <Text style={text.emptyMessage}>No listings match the current filters.</Text>
          </View>
        }
        renderItem={({ item }) => (
          <PropertyRow
            property={item}
            updating={updatingId === item.id}
            onApprove={() => approveProperty(item)}
            onReject={() => openReject(item)}
          />
        )}
      />

      <Modal visible={!!rejectingProperty} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={text.modalTitle}>Reject property</Text>
            <Text style={text.modalHint}>Add a reason for the property owner.</Text>
            <TextInput
              value={rejectionReason}
              onChangeText={setRejectionReason}
              placeholder="Reason"
              placeholderTextColor={colors.textMuted}
              style={inputStyles.reasonInput}
              multiline
            />
            <View style={styles.modalActions}>
              <Pressable style={styles.cancelButton} onPress={() => setRejectingProperty(null)}>
                <Text style={text.cancelButton}>Cancel</Text>
              </Pressable>
              <Pressable style={styles.rejectButton} onPress={confirmReject}>
                <Text style={text.rejectButton}>Reject</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function getPrice(property: AdminProperty) {
  if (property.listing_type === 'rent' || property.listing_type === 'airbnb') {
    return Number(property.rental_price || 0);
  }
  return Number(property.price || 0);
}

function getPriceLabel(property: AdminProperty) {
  const suffix =
    property.listing_type === 'rent' ? '/month' : property.listing_type === 'airbnb' ? '/day' : '';
  return `${formatGhs(getPrice(property))}${suffix}`;
}

function getStatusTone(status?: string | null) {
  if (status === 'approved') return colors.success;
  if (status === 'rejected') return colors.error;
  if (status === 'sold') return colors.info;
  return colors.warning;
}

function StatCard({
  label,
  value,
  icon,
  tone,
}: {
  label: string;
  value: number;
  icon: keyof typeof Ionicons.glyphMap;
  tone?: 'success' | 'warning' | 'error';
}) {
  const color = tone === 'success' ? colors.success : tone === 'error' ? colors.error : tone === 'warning' ? colors.warning : colors.primary;
  return (
    <View style={styles.statCard}>
      <Ionicons name={icon} size={18} color={color} />
      <Text style={text.statValue}>{value.toLocaleString()}</Text>
      <Text style={text.statLabel}>{label}</Text>
    </View>
  );
}

function PropertyRow({
  property,
  updating,
  onApprove,
  onReject,
}: {
  property: AdminProperty;
  updating: boolean;
  onApprove: () => void;
  onReject: () => void;
}) {
  const image = property.images?.[0];
  const status = property.status || 'pending';
  const statusColor = getStatusTone(status);

  return (
    <View style={styles.propertyCard}>
      <View style={styles.propertyTop}>
        <View style={styles.thumbnail}>
          {image ? (
            <Image source={{ uri: image }} style={imageStyles.thumbnailImage} contentFit="cover" />
          ) : (
            <Ionicons name="business-outline" size={22} color={colors.textMuted} />
          )}
        </View>
        <View style={styles.propertyInfo}>
          <Text style={text.propertyTitle} numberOfLines={1}>
            {property.title}
          </Text>
          <Text style={text.propertyLocation} numberOfLines={1}>
            {property.location}
          </Text>
          <Text style={text.propertyPrice}>{getPriceLabel(property)}</Text>
        </View>
      </View>

      <View style={styles.propertyMeta}>
        <View style={[styles.statusPill, { backgroundColor: `${statusColor}18` }]}>
          <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
          <Text style={[text.statusText, { color: statusColor }]}>{status}</Text>
        </View>
        <Text style={text.typePill}>{property.type || 'property'}</Text>
      </View>

      {status === 'pending' || status === 'rejected' ? (
        <View style={styles.rowActions}>
          <Pressable
            style={[styles.actionButton, styles.approveButton]}
            onPress={onApprove}
            disabled={updating}
          >
            {updating ? (
              <ActivityIndicator color={colors.success} size="small" />
            ) : (
              <>
                <Ionicons name="checkmark-circle-outline" size={18} color={colors.success} />
                <Text style={text.approveText}>Approve</Text>
              </>
            )}
          </Pressable>
          <Pressable
            style={[styles.actionButton, styles.rejectOutlineButton]}
            onPress={onReject}
            disabled={updating}
          >
            <Ionicons name="close-circle-outline" size={18} color={colors.error} />
            <Text style={text.rejectOutlineText}>Reject</Text>
          </Pressable>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create<Record<string, ViewStyle>>({
  container: { flex: 1, backgroundColor: colors.surface },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.md },
  list: { padding: spacing.lg, paddingBottom: spacing.xxxl, gap: spacing.md },
  header: { marginBottom: spacing.md },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  statCard: {
    width: '48.5%',
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
  },
  searchBox: {
    minHeight: 48,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  chipRow: { gap: spacing.sm, paddingRight: spacing.lg, marginBottom: spacing.md },
  chip: {
    minHeight: 38,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  filterChip: {
    minHeight: 36,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterChipActive: { borderColor: colors.primaryAccent, backgroundColor: '#eef2ff' },
  propertyCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
  },
  propertyTop: { flexDirection: 'row', gap: spacing.md },
  thumbnail: {
    width: 64,
    height: 64,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
    backgroundColor: colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  propertyInfo: { flex: 1 },
  propertyMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  statusPill: {
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 5,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  statusDot: { width: 7, height: 7, borderRadius: 4 },
  rowActions: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md },
  actionButton: {
    flex: 1,
    minHeight: 42,
    borderRadius: borderRadius.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    borderWidth: 1,
  },
  approveButton: { backgroundColor: '#ecfdf5', borderColor: '#bbf7d0' },
  rejectOutlineButton: { backgroundColor: '#fef2f2', borderColor: '#fecaca' },
  empty: {
    minHeight: 260,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.xl,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15,23,42,0.45)',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  modalCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
  },
  modalActions: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.lg },
  cancelButton: {
    flex: 1,
    minHeight: 44,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceAlt,
  },
  rejectButton: {
    flex: 1,
    minHeight: 44,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.error,
  },
  denied: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    padding: spacing.lg,
    backgroundColor: colors.surface,
  },
});

const inputStyles = StyleSheet.create<Record<string, TextStyle>>({
  searchInput: { flex: 1, color: colors.text, fontSize: fontSize.md },
  reasonInput: {
    minHeight: 110,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    color: colors.text,
    textAlignVertical: 'top',
    marginTop: spacing.md,
  },
});

const imageStyles = StyleSheet.create<Record<string, ImageStyle>>({
  thumbnailImage: { width: '100%', height: '100%' },
});

const text = StyleSheet.create<Record<string, TextStyle>>({
  title: { color: colors.text, fontSize: fontSize.xxl, fontWeight: weights.extrabold },
  subtitle: { color: colors.textMuted, fontSize: fontSize.sm, marginTop: spacing.xs },
  loadingText: { color: colors.textMuted, fontSize: fontSize.sm },
  statValue: {
    color: colors.text,
    fontSize: fontSize.xl,
    fontWeight: weights.extrabold,
    marginTop: spacing.sm,
  },
  statLabel: { color: colors.textMuted, fontSize: fontSize.xs, marginTop: spacing.xs },
  chip: { color: colors.primary, fontSize: fontSize.sm, fontWeight: weights.semibold },
  chipActive: { color: colors.white },
  filterChip: { color: colors.textSecondary, fontSize: fontSize.sm, fontWeight: weights.medium },
  filterChipActive: { color: colors.primary, fontWeight: weights.semibold },
  propertyTitle: { color: colors.text, fontSize: fontSize.md, fontWeight: weights.bold },
  propertyLocation: { color: colors.textMuted, fontSize: fontSize.sm, marginTop: spacing.xs },
  propertyPrice: {
    color: colors.primary,
    fontSize: fontSize.sm,
    fontWeight: weights.bold,
    marginTop: spacing.xs,
  },
  statusText: { fontSize: fontSize.xs, fontWeight: weights.semibold, textTransform: 'capitalize' },
  typePill: {
    color: colors.textSecondary,
    fontSize: fontSize.xs,
    fontWeight: weights.semibold,
    textTransform: 'capitalize',
  },
  approveText: { color: colors.success, fontSize: fontSize.sm, fontWeight: weights.semibold },
  rejectOutlineText: { color: colors.error, fontSize: fontSize.sm, fontWeight: weights.semibold },
  emptyTitle: { color: colors.text, fontSize: fontSize.md, fontWeight: weights.bold },
  emptyMessage: { color: colors.textMuted, fontSize: fontSize.sm, textAlign: 'center' },
  errorText: { color: colors.error, fontSize: fontSize.sm, marginBottom: spacing.md },
  modalTitle: { color: colors.text, fontSize: fontSize.lg, fontWeight: weights.bold },
  modalHint: { color: colors.textMuted, fontSize: fontSize.sm, marginTop: spacing.xs },
  cancelButton: { color: colors.text, fontSize: fontSize.md, fontWeight: weights.semibold },
  rejectButton: { color: colors.white, fontSize: fontSize.md, fontWeight: weights.semibold },
});
