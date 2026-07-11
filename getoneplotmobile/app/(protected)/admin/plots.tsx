import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
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
import { DEVELOPMENTS } from '../../../src/constants/developments';
import { supabase } from '../../../src/lib/supabase';

const weights = fontWeight as Record<keyof typeof fontWeight, TextStyle['fontWeight']>;

type SiteStat = {
  slug: string;
  title: string;
  subtitle: string;
  table: string;
  interestTable: string;
  available: number;
  sold: number;
  reserved: number;
  onHold: number;
  total: number;
  interested: number;
};

type Totals = {
  plots: number;
  available: number;
  sold: number;
  reserved: number;
  interested: number;
};

export default function AdminPlotsScreen() {
  const router = useRouter();
  const [stats, setStats] = useState<SiteStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadStats = useCallback(async (silent = false) => {
    if (silent) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      // Count-only (head:true) queries instead of fetching every row and filtering
      // client-side: Supabase caps unbounded selects at 1000 rows, which was silently
      // under-counting any site with more plots than that (e.g. Trabuom Sector 1 has
      // ~2,943). These return just a count header, no row payload.
      const results = await Promise.all(
        DEVELOPMENTS.map(async (dev) => {
          const base = () => supabase.from(dev.table).select('*', { count: 'exact', head: true });
          const [totalRes, availableRes, soldRes, reservedRes, interestedRes] = await Promise.all([
            base(),
            base().or('status.eq.Available,status.is.null'),
            base().eq('status', 'Sold'),
            base().eq('status', 'Reserved'),
            supabase.from(dev.interestTable).select('*', { count: 'exact', head: true }),
          ]);

          if (totalRes.error) throw totalRes.error;

          const total = totalRes.count ?? 0;
          const available = availableRes.count ?? 0;
          const sold = soldRes.count ?? 0;
          const reserved = reservedRes.count ?? 0;
          return {
            slug: dev.slug,
            title: dev.title,
            subtitle: dev.subtitle,
            table: dev.table,
            interestTable: dev.interestTable,
            total,
            available,
            sold,
            reserved,
            onHold: Math.max(0, total - available - sold - reserved),
            interested: interestedRes.count || 0,
          };
        })
      );
      setStats(results);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load land site dashboard');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  const totals = useMemo<Totals>(() => {
    return stats.reduce(
      (acc, item) => ({
        plots: acc.plots + item.total,
        available: acc.available + item.available,
        sold: acc.sold + item.sold,
        reserved: acc.reserved + item.reserved,
        interested: acc.interested + item.interested,
      }),
      { plots: 0, available: 0, sold: 0, reserved: 0, interested: 0 }
    );
  }, [stats]);

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={text.loadingText}>Loading land sites...</Text>
      </View>
    );
  }

  return (
    <FlatList
      style={styles.container}
      data={stats}
      keyExtractor={(item) => item.slug}
      refreshing={refreshing}
      onRefresh={() => loadStats(true)}
      contentContainerStyle={styles.list}
      showsVerticalScrollIndicator={false}
      ListHeaderComponent={
        <>
          <View style={styles.header}>
            <Text style={text.title}>Land Sites Dashboard</Text>
            <Text style={text.subtitle}>Plot totals, availability, sales, and interested clients</Text>
          </View>

          <View style={styles.statsGrid}>
            <SummaryCard label="Total plots" value={totals.plots} icon="grid-outline" />
            <SummaryCard label="Available" value={totals.available} icon="leaf-outline" color={colors.success} />
            <SummaryCard label="Sold" value={totals.sold} icon="checkmark-done-outline" color={colors.error} />
            <SummaryCard label="Interests" value={totals.interested} icon="people-outline" color={colors.info} />
          </View>

          {error ? <Text style={text.errorText}>{error}</Text> : null}
        </>
      }
      renderItem={({ item }) => (
        <Pressable
          style={({ pressed }) => [styles.siteCard, pressed && styles.pressed]}
          onPress={() =>
            router.push({
              pathname: '/admin/site/[slug]',
              params: { slug: item.slug },
            })
          }
          android_ripple={{ color: 'rgba(15, 23, 42, 0.06)' }}
        >
          <View style={styles.siteTop}>
            <View style={styles.siteIcon}>
              <Ionicons name="map-outline" size={22} color={colors.primary} />
            </View>
            <View style={styles.siteCopy}>
              <Text style={text.siteTitle}>{item.title}</Text>
              <Text style={text.siteSubtitle}>{item.subtitle}</Text>
            </View>
            <View style={styles.totalBadge}>
              <Text style={text.totalBadge}>{item.total.toLocaleString()}</Text>
            </View>
          </View>

          <View style={styles.statusGrid}>
            <StatusPill label="Available" value={item.available} color={colors.plotAvailable} />
            <StatusPill label="Reserved" value={item.reserved} color={colors.plotReserved} />
            <StatusPill label="Sold" value={item.sold} color={colors.plotSold} />
            <StatusPill label="On hold" value={item.onHold} color={colors.plotOnHold} />
          </View>

          <View style={styles.siteFooter}>
            <View style={styles.interestPill}>
              <Ionicons name="people-outline" size={15} color={colors.info} />
              <Text style={text.interestText}>{item.interested.toLocaleString()} interested</Text>
            </View>
            <View style={styles.mapLink}>
              <Text style={text.mapLink}>Manage plots</Text>
              <Ionicons name="chevron-forward" size={17} color={colors.primary} />
            </View>
          </View>
        </Pressable>
      )}
    />
  );
}

function SummaryCard({
  label,
  value,
  icon,
  color = colors.primary,
}: {
  label: string;
  value: number;
  icon: keyof typeof Ionicons.glyphMap;
  color?: string;
}) {
  return (
    <View style={styles.summaryCard}>
      <Ionicons name={icon} size={18} color={color} />
      <Text style={text.summaryValue}>{value.toLocaleString()}</Text>
      <Text style={text.summaryLabel}>{label}</Text>
    </View>
  );
}

function StatusPill({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <View style={styles.statusPill}>
      <View style={[styles.statusDot, { backgroundColor: color }]} />
      <Text style={text.statusPillText}>
        {label}: {value.toLocaleString()}
      </Text>
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
  summaryCard: {
    width: '48.5%',
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
  },
  siteCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
  },
  siteTop: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  siteIcon: {
    width: 46,
    height: 46,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  siteCopy: { flex: 1 },
  totalBadge: {
    minWidth: 46,
    minHeight: 34,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.sm,
  },
  statusGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
  },
  statusDot: { width: 7, height: 7, borderRadius: 4 },
  siteFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  interestPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  mapLink: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  pressed: { opacity: 0.72 },
});

const text = StyleSheet.create<Record<string, TextStyle>>({
  title: { color: colors.text, fontSize: fontSize.xxl, fontWeight: weights.extrabold },
  subtitle: { color: colors.textMuted, fontSize: fontSize.sm, marginTop: spacing.xs },
  loadingText: { color: colors.textMuted, fontSize: fontSize.sm },
  summaryValue: {
    color: colors.text,
    fontSize: fontSize.xl,
    fontWeight: weights.extrabold,
    marginTop: spacing.sm,
  },
  summaryLabel: { color: colors.textMuted, fontSize: fontSize.xs, marginTop: spacing.xs },
  siteTitle: { color: colors.text, fontSize: fontSize.md, fontWeight: weights.bold },
  siteSubtitle: { color: colors.textMuted, fontSize: fontSize.sm, marginTop: spacing.xs },
  totalBadge: { color: colors.white, fontSize: fontSize.sm, fontWeight: weights.bold },
  statusPillText: { color: colors.textSecondary, fontSize: fontSize.xs, fontWeight: weights.semibold },
  interestText: { color: colors.info, fontSize: fontSize.xs, fontWeight: weights.semibold },
  mapLink: { color: colors.primary, fontSize: fontSize.sm, fontWeight: weights.semibold },
  errorText: { color: colors.error, fontSize: fontSize.sm, marginBottom: spacing.md },
});
