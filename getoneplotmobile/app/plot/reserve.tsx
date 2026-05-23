import { useUser } from '@clerk/clerk-expo';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text } from 'react-native';
import { PaystackCheckout } from '../../src/components/PaystackCheckout';
import { Button } from '../../src/components/ui/Button';
import { Input } from '../../src/components/ui/Input';
import { Loading } from '../../src/components/ui/Loading';
import { colors, fontSize, spacing } from '../../src/constants/theme';
import { formatGhs, getPlotById, updatePlotOnHold } from '../../src/lib/plotService';
import type { BuyerInfo, PlotFeature } from '../../src/types/plot';

const DEPOSIT_RATE = 0.1;

export default function ReservePlotScreen() {
  const { id, table } = useLocalSearchParams<{ id: string; table: string }>();
  const { user } = useUser();
  const router = useRouter();
  const [plot, setPlot] = useState<PlotFeature | null>(null);
  const [loading, setLoading] = useState(true);
  const [payVisible, setPayVisible] = useState(false);
  const [buyer, setBuyer] = useState<BuyerInfo>({
    firstname: user?.firstName || '',
    lastname: user?.lastName || '',
    email: user?.primaryEmailAddress?.emailAddress || '',
    phone: '',
    country: 'Ghana',
    residentialAddress: '',
    plotTotalAmount: 0,
    paidAmount: 0,
    remainingAmount: 0,
  });

  useEffect(() => {
    if (!id || !table) return;
    getPlotById(table, id).then((p) => {
      if (p) {
        const total = p.plotTotalAmount || 0;
        const paid = Math.round(total * DEPOSIT_RATE);
        setPlot(p);
        setBuyer((b) => ({
          ...b,
          plotTotalAmount: total,
          paidAmount: paid,
          remainingAmount: total - paid,
        }));
      }
      setLoading(false);
    });
  }, [id, table]);

  if (loading) return <Loading />;
  if (!plot) return null;

  const deposit = buyer.paidAmount || 0;
  const reference = `reserve_${id}_${Date.now()}`;

  return (
    <>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.heading}>Reserve Plot {plot.properties?.Plot_No}</Text>
        <Text style={styles.line}>Full price: {formatGhs(buyer.plotTotalAmount)}</Text>
        <Text style={styles.deposit}>Deposit (10%): {formatGhs(deposit)}</Text>

        <Input label="First name" value={buyer.firstname} onChangeText={(v) => setBuyer({ ...buyer, firstname: v })} />
        <Input label="Last name" value={buyer.lastname} onChangeText={(v) => setBuyer({ ...buyer, lastname: v })} />
        <Input label="Email" value={buyer.email} onChangeText={(v) => setBuyer({ ...buyer, email: v })} autoCapitalize="none" />
        <Input label="Phone" value={buyer.phone} onChangeText={(v) => setBuyer({ ...buyer, phone: v })} />
        <Input label="Address" value={buyer.residentialAddress} onChangeText={(v) => setBuyer({ ...buyer, residentialAddress: v })} />

        <Button
          title={`Pay Deposit ${formatGhs(deposit)}`}
          onPress={() => {
            if (!buyer.phone) {
              Alert.alert('Validation', 'Enter phone number');
              return;
            }
            setPayVisible(true);
          }}
        />
      </ScrollView>

      <PaystackCheckout
        visible={payVisible}
        email={buyer.email}
        amount={deposit}
        reference={reference}
        onSuccess={async () => {
          setPayVisible(false);
          if (table && id) await updatePlotOnHold(table, id, buyer);
          router.replace('/payment-success');
        }}
        onClose={() => setPayVisible(false)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: { padding: spacing.lg },
  heading: { fontSize: fontSize.xl, fontWeight: '800', color: colors.primary },
  line: { marginTop: spacing.sm, color: colors.textMuted },
  deposit: { fontSize: fontSize.lg, fontWeight: '700', color: colors.primary, marginVertical: spacing.md },
});
