import { useAuth } from '@clerk/clerk-expo';
import { useRouter } from 'expo-router';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { Button } from '../../src/components/ui/Button';
import { colors, fontSize, spacing } from '../../src/constants/theme';
import { formatGhs } from '../../src/lib/plotService';
import { useCartStore } from '../../src/stores/cartStore';

export default function CartScreen() {
  const router = useRouter();
  const { isSignedIn } = useAuth();
  const { plots, removePlot, getTotal, clearCart } = useCartStore();
  const total = getTotal();

  if (!plots.length) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyTitle}>Your cart is empty</Text>
        <Text style={styles.emptySub}>Visit our sites to add plots to your cart</Text>
        <Button title="Browse Sites" onPress={() => router.push('/(tabs)/sites')} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={plots}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <View style={styles.itemBody}>
              <Text style={styles.plotNo}>
                Plot {item.properties?.Plot_No ?? item.id.slice(0, 8)}
              </Text>
              <Text style={styles.amount}>{formatGhs(item.plotTotalAmount || 0)}</Text>
            </View>
            <Button
              title="Remove"
              variant="ghost"
              size="sm"
              onPress={() => removePlot(item.id)}
            />
          </View>
        )}
      />
      <View style={styles.summary}>
        <Text style={styles.totalLabel}>Total ({plots.length} plots)</Text>
        <Text style={styles.total}>{formatGhs(total)}</Text>
        <Button
          title="Proceed to Checkout"
          onPress={() =>
            isSignedIn
              ? router.push('/checkout')
              : router.push('/(auth)/sign-in')
          }
        />
        <Button title="Clear Cart" variant="outline" onPress={clearCart} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface },
  list: { padding: spacing.md },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  itemBody: { flex: 1 },
  plotNo: { fontWeight: '700', fontSize: fontSize.md },
  amount: { color: colors.primary, fontWeight: '600', marginTop: 4 },
  summary: {
    padding: spacing.lg,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  totalLabel: { color: colors.textMuted },
  total: {
    fontSize: fontSize.xl,
    fontWeight: '800',
    color: colors.primary,
    marginVertical: spacing.md,
  },
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
    gap: spacing.md,
  },
  emptyTitle: { fontSize: fontSize.xl, fontWeight: '700' },
  emptySub: { color: colors.textMuted, textAlign: 'center', marginBottom: spacing.md },
});
