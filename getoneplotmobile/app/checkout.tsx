import { useUser } from '@clerk/clerk-expo';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text } from 'react-native';
import { PaystackCheckout } from '../src/components/PaystackCheckout';
import { Button } from '../src/components/ui/Button';
import { Input } from '../src/components/ui/Input';
import { colors, fontSize, spacing } from '../src/constants/theme';
import { formatGhs } from '../src/lib/plotService';
import { useCartStore } from '../src/stores/cartStore';

export default function CheckoutScreen() {
  const { plots, getTotal, clearCart } = useCartStore();
  const { user } = useUser();
  const router = useRouter();
  const [payVisible, setPayVisible] = useState(false);
  const [buyer, setBuyer] = useState({
    firstname: user?.firstName || '',
    lastname: user?.lastName || '',
    email: user?.primaryEmailAddress?.emailAddress || '',
    phone: '',
    country: 'Ghana',
    residentialAddress: '',
  });

  const total = getTotal();

  if (!plots.length) {
    return (
      <ScrollView contentContainerStyle={styles.empty}>
        <Text>Cart is empty</Text>
        <Button title="Browse Sites" onPress={() => router.push('/(tabs)/sites')} />
      </ScrollView>
    );
  }

  return (
    <>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Checkout ({plots.length} plots)</Text>
        <Text style={styles.total}>{formatGhs(total)}</Text>

        {plots.map((p) => (
          <Text key={p.id} style={styles.item}>
            Plot {p.properties?.Plot_No} — {formatGhs(p.plotTotalAmount || 0)}
          </Text>
        ))}

        <Input label="First name" value={buyer.firstname} onChangeText={(v) => setBuyer({ ...buyer, firstname: v })} />
        <Input label="Last name" value={buyer.lastname} onChangeText={(v) => setBuyer({ ...buyer, lastname: v })} />
        <Input label="Email" value={buyer.email} onChangeText={(v) => setBuyer({ ...buyer, email: v })} />
        <Input label="Phone" value={buyer.phone} onChangeText={(v) => setBuyer({ ...buyer, phone: v })} />
        <Input label="Address" value={buyer.residentialAddress} onChangeText={(v) => setBuyer({ ...buyer, residentialAddress: v })} />

        <Button title="Pay with Paystack" onPress={() => setPayVisible(true)} />
      </ScrollView>

      <PaystackCheckout
        visible={payVisible}
        email={buyer.email}
        amount={total}
        reference={`cart_${Date.now()}`}
        onSuccess={() => {
          setPayVisible(false);
          clearCart();
          router.replace('/payment-success');
        }}
        onClose={() => setPayVisible(false)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: { padding: spacing.lg },
  empty: { flex: 1, padding: spacing.lg, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: fontSize.xl, fontWeight: '800', color: colors.primary },
  total: { fontSize: fontSize.xxl, fontWeight: '800', marginVertical: spacing.md },
  item: { marginBottom: spacing.sm, color: colors.textMuted },
});
