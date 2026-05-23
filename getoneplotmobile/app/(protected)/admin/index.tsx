import { useUser } from '@clerk/clerk-expo';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { Button } from '../../../src/components/ui/Button';
import { Loading } from '../../../src/components/ui/Loading';
import { DEVELOPMENTS } from '../../../src/constants/developments';
import { colors, fontSize, spacing } from '../../../src/constants/theme';
import { supabase } from '../../../src/lib/supabase';

type SiteStat = { slug: string; title: string; available: number; sold: number; total: number };

export default function AdminScreen() {
  const { user } = useUser();
  const router = useRouter();
  const role = (user?.publicMetadata?.role as string) || '';
  const [stats, setStats] = useState<SiteStat[]>([]);
  const [loading, setLoading] = useState(true);

  const allowed = ['admin', 'sysadmin', 'chief', 'chief_asst'].includes(role);

  useEffect(() => {
    if (!allowed) return;
    (async () => {
      const results: SiteStat[] = [];
      for (const dev of DEVELOPMENTS) {
        const { data } = await supabase.from(dev.table).select('status');
        const rows = data || [];
        results.push({
          slug: dev.slug,
          title: dev.title,
          total: rows.length,
          sold: rows.filter((r) => r.status === 'Sold').length,
          available: rows.filter(
            (r) => !r.status || r.status === 'Available'
          ).length,
        });
      }
      setStats(results);
      setLoading(false);
    })();
  }, [allowed]);

  if (!allowed) {
    return (
      <View style={styles.denied}>
        <Text style={styles.deniedText}>Admin access required</Text>
        <Button title="Go Home" onPress={() => router.replace('/(tabs)')} />
      </View>
    );
  }

  if (loading) return <Loading />;

  return (
    <View style={styles.container}>
      <Text style={styles.welcome}>Dashboard — {role}</Text>
      <Text style={styles.hint}>
        Plot overview by development. Full editing available on web dashboard.
      </Text>

      <FlatList
        data={stats}
        keyExtractor={(item) => item.slug}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{item.title}</Text>
            <Text style={styles.stat}>Total: {item.total}</Text>
            <Text style={styles.stat}>Available: {item.available}</Text>
            <Text style={styles.stat}>Sold: {item.sold}</Text>
            <Button
              title="View Map"
              variant="outline"
              size="sm"
              onPress={() => router.push(`/(tabs)/sites/${item.slug}`)}
            />
          </View>
        )}
      />

      <Button title="Detailed Plot Stats" onPress={() => router.push('/admin/plots')} />
      <Button title="Back to App" variant="ghost" onPress={() => router.replace('/(tabs)')} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface },
  welcome: {
    fontSize: fontSize.xl,
    fontWeight: '800',
    color: colors.primary,
    padding: spacing.lg,
    paddingBottom: 0,
  },
  hint: { paddingHorizontal: spacing.lg, color: colors.textMuted, marginBottom: spacing.md },
  list: { padding: spacing.md },
  card: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardTitle: { fontWeight: '700', fontSize: fontSize.lg, marginBottom: spacing.sm },
  stat: { color: colors.textMuted, marginBottom: 4 },
  denied: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.lg },
  deniedText: { fontSize: fontSize.lg, marginBottom: spacing.lg },
});
