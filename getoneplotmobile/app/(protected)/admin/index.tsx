import { useUser } from '@clerk/clerk-expo';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '../../../src/components/ui/Button';
import { DEVELOPMENTS } from '../../../src/constants/developments';
import {
  borderRadius,
  colors,
  fontSize,
  spacing,
} from '../../../src/constants/theme';
import { supabase } from '../../../src/lib/supabase';

type SiteStat = {
  slug: string;
  title: string;
  subtitle: string;
  available: number;
  sold: number;
  reserved: number;
  total: number;
};

export default function AdminScreen() {
  const { user } = useUser();
  const router = useRouter();
  const role = (user?.publicMetadata?.role as string) || '';
  const area = (user?.publicMetadata?.area as string) || '';
  const [stats, setStats] = useState<SiteStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [totals, setTotals] = useState({ plots: 0, available: 0, sold: 0 });

  const allowed = ['admin', 'sysadmin', 'chief', 'chief_asst'].includes(role);

  useEffect(() => {
    if (!allowed) return;
    (async () => {
      const results: SiteStat[] = [];
      let plots = 0;
      let available = 0;
      let sold = 0;

      for (const dev of DEVELOPMENTS) {
        const { data } = await supabase.from(dev.table).select('status');
        const rows = data || [];
        const siteAvailable = rows.filter((r) => !r.status || r.status === 'Available').length;
        const siteSold = rows.filter((r) => r.status === 'Sold').length;
        const siteReserved = rows.filter((r) => r.status === 'Reserved').length;

        plots += rows.length;
        available += siteAvailable;
        sold += siteSold;

        results.push({
          slug: dev.slug,
          title: dev.title,
          subtitle: dev.subtitle,
          total: rows.length,
          sold: siteSold,
          available: siteAvailable,
          reserved: siteReserved,
        });
      }

      setStats(results);
      setTotals({ plots, available, sold });
      setLoading(false);
    })();
  }, [allowed]);

  if (!allowed) {
    return (
      <View style={viewStyles.denied}>
        <Ionicons name="lock-closed-outline" size={48} color={colors.textMuted} />
        <Text style={textStyles.deniedTitle}>Admin access required</Text>
        <Text style={textStyles.deniedHint}>Your role does not include dashboard access.</Text>
        <Button title="Go home" onPress={() => router.replace('/(tabs)')} />
      </View>
    );
  }

  if (loading) {
    return (
      <View style={viewStyles.loading}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={textStyles.loadingText}>Loading dashboard…</Text>
      </View>
    );
  }

  return (
    <View style={[viewStyles.container, { paddingTop: spacing.sm }]}>
      <View style={viewStyles.header}>
        <Text style={textStyles.welcome}>Dashboard</Text>
        <Text style={textStyles.role}>
          {role.replace(/_/g, ' ')}
          {area ? ` · ${area}` : ''}
        </Text>
        <Text style={textStyles.hint}>
          Plot overview by development — full editing on web dashboard.
        </Text>
      </View>

      <View style={viewStyles.summaryRow}>
        <SummaryCard label="Total plots" value={totals.plots} icon="grid-outline" />
        <SummaryCard label="Available" value={totals.available} icon="leaf-outline" accent={colors.success} />
        <SummaryCard label="Sold" value={totals.sold} icon="checkmark-done-outline" accent={colors.error} />
      </View>

      <FlatList
        data={stats}
        keyExtractor={(item) => item.slug}
        contentContainerStyle={viewStyles.list}
        showsVerticalScrollIndicator={false}
        ListFooterComponent={
          <View style={viewStyles.footer}>
            <Button title="Detailed plot stats" onPress={() => router.push('/admin/plots')} />
            <Button title="Back to app" variant="ghost" onPress={() => router.replace('/(tabs)')} />
          </View>
        }
        renderItem={({ item }) => (
          <Pressable
            style={({ pressed }) => [viewStyles.card, pressed && viewStyles.cardPressed]}
            onPress={() => router.push(`/(tabs)/sites/${item.slug}`)}
          >
            <View style={viewStyles.cardTop}>
              <View>
                <Text style={textStyles.cardTitle}>{item.title}</Text>
                <Text style={textStyles.cardSubtitle}>{item.subtitle}</Text>
              </View>
              <Text style={textStyles.cardTotal}>{item.total}</Text>
            </View>
            <View style={viewStyles.statRow}>
              <StatPill label="Available" value={item.available} color={colors.plotAvailable} />
              <StatPill label="Reserved" value={item.reserved} color={colors.plotReserved} />
              <StatPill label="Sold" value={item.sold} color={colors.plotSold} />
            </View>
            <Text style={textStyles.viewMap}>View map →</Text>
          </Pressable>
        )}
      />
    </View>
  );
}

function SummaryCard({
  label,
  value,
  icon,
  accent,
}: {
  label: string;
  value: number;
  icon: keyof typeof Ionicons.glyphMap;
  accent?: string;
}) {
  return (
    <View style={viewStyles.summaryCard}>
      <Ionicons name={icon} size={20} color={accent || colors.primary} />
      <Text style={textStyles.summaryValue}>{value.toLocaleString()}</Text>
      <Text style={textStyles.summaryLabel}>{label}</Text>
    </View>
  );
}

function StatPill({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <View style={viewStyles.statPill}>
      <View style={[viewStyles.statDot, { backgroundColor: color }]} />
      <Text style={textStyles.statPillText}>
        {label}: {value}
      </Text>
    </View>
  );
}

const viewStyles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.md },
  header: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  summaryRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    gap: spacing.xs,
  },
  list: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxxl },
  card: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardPressed: { opacity: 0.92 },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  statRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  statPill: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  statDot: { width: 8, height: 8, borderRadius: 4 },
  footer: { gap: spacing.sm, marginTop: spacing.sm },
  denied: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
    gap: spacing.md,
  },
});

const textStyles = StyleSheet.create({
  welcome: {
    fontSize: fontSize.xxl,
    fontWeight: '800',
    color: colors.primary,
  },
  role: {
    fontSize: fontSize.sm,
    color: colors.primaryAccent,
    fontWeight: '600',
    textTransform: 'capitalize',
    marginTop: 2,
  },
  hint: { color: colors.textMuted, marginTop: spacing.sm, fontSize: fontSize.sm, lineHeight: 20 },
  loadingText: { color: colors.textMuted, fontSize: fontSize.sm },
  summaryValue: {
    fontSize: fontSize.xl,
    fontWeight: '800',
    color: colors.primary,
  },
  summaryLabel: {
    fontSize: 10,
    color: colors.textMuted,
    textAlign: 'center',
    fontWeight: '600',
  },
  cardTitle: { fontWeight: '700', fontSize: fontSize.md, color: colors.text },
  cardSubtitle: { fontSize: fontSize.xs, color: colors.textMuted, marginTop: 2 },
  cardTotal: { fontSize: fontSize.xxl, fontWeight: '800', color: colors.primary },
  statPillText: { fontSize: fontSize.xs, color: colors.textSecondary },
  viewMap: {
    marginTop: spacing.md,
    fontSize: fontSize.sm,
    color: colors.primaryAccent,
    fontWeight: '600',
  },
  deniedTitle: { fontSize: fontSize.lg, fontWeight: '700', color: colors.primary },
  deniedHint: { color: colors.textMuted, textAlign: 'center', marginBottom: spacing.md },
});
