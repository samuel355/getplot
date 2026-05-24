import { useUser } from '@clerk/clerk-expo';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { PaystackCheckout } from '../../../src/components/PaystackCheckout';
import { Button } from '../../../src/components/ui/Button';
import { Input } from '../../../src/components/ui/Input';
import { Loading } from '../../../src/components/ui/Loading';
import { colors, fontSize, spacing } from '../../../src/constants/theme';
import { formatGhs, getPlotById, updatePlotOnHold } from '../../../src/lib/plotService';
import type { BuyerInfo, PlotFeature } from '../../../src/types/plot';

export default function BuyPlotScreen() {
  const { id, table } = useLocalSearchParams<{ id: string; table: string; slug: string }>();
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
  });

  useEffect(() => {
    if (!id || !table) return;
    getPlotById(table, id).then((p) => {
      if (p) {
        setPlot(p);
        setBuyer((b) => ({ ...b, plotTotalAmount: p.plotTotalAmount || 0 }));
      }
      setLoading(false);
    });
  }, [id, table]);

  const validate = () => {
    if (!buyer.firstname.trim()) return 'Enter first name';
    if (!buyer.lastname.trim()) return 'Enter last name';
    if (!buyer.email.trim()) return 'Enter email';
    if (!buyer.phone.trim()) return 'Enter phone';
    if (!buyer.residentialAddress.trim()) return 'Enter address';
    if (!buyer.plotTotalAmount) return 'Plot price not set. Contact admin: 0322008282';
    return null;
  };

  const onPay = () => {
    const err = validate();
    if (err) {
      Alert.alert('Validation', err);
      return;
    }
    setPayVisible(true);
  };

  const onPaymentSuccess = async () => {
    setPayVisible(false);
    if (!plot || !table || !id) return;
    await updatePlotOnHold(table, id, buyer);
    router.replace('/payment-success');
  };

  if (loading) return <Loading />;
  if (!plot) {
    return (
      <View style={styles.center}>
        <Text>Plot not found</Text>
        <Button title="Go Back" onPress={() => router.back()} />
      </View>
    );
  }

  const reference = `buy_${id}_${Date.now()}`;

  return (
    <>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.heading}>Buy Plot {plot.properties?.Plot_No}</Text>
        <Text style={styles.amount}>{formatGhs(buyer.plotTotalAmount)}</Text>

        <Input label="First name" value={buyer.firstname} onChangeText={(v) => setBuyer({ ...buyer, firstname: v })} />
        <Input label="Last name" value={buyer.lastname} onChangeText={(v) => setBuyer({ ...buyer, lastname: v })} />
        <Input label="Email" value={buyer.email} onChangeText={(v) => setBuyer({ ...buyer, email: v })} keyboardType="email-address" autoCapitalize="none" />
        <Input label="Phone" value={buyer.phone} onChangeText={(v) => setBuyer({ ...buyer, phone: v })} keyboardType="phone-pad" />
        <Input label="Country" value={buyer.country} onChangeText={(v) => setBuyer({ ...buyer, country: v })} />
        <Input label="Residential address" value={buyer.residentialAddress} onChangeText={(v) => setBuyer({ ...buyer, residentialAddress: v })} multiline />

        <Button title="Pay with Paystack" onPress={onPay} />
      </ScrollView>

      <PaystackCheckout
        visible={payVisible}
        email={buyer.email}
        amount={buyer.plotTotalAmount}
        reference={reference}
        onSuccess={onPaymentSuccess}
        onClose={() => setPayVisible(false)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: { padding: spacing.lg },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.lg },
  heading: { fontSize: fontSize.xl, fontWeight: '800', color: colors.primary },
  amount: { fontSize: fontSize.lg, fontWeight: '700', marginVertical: spacing.md },
});
