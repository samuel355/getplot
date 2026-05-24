import { useUser } from '@clerk/clerk-expo';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text } from 'react-native';
import { Button } from '../../src/components/ui/Button';
import { Input } from '../../src/components/ui/Input';
import { colors, fontSize, spacing } from '../../src/constants/theme';
import { submitPlotInterest } from '../../src/lib/plotService';

export default function ExpressInterestScreen() {
  const { id, table, interestTable } = useLocalSearchParams<{
    id: string;
    table: string;
    interestTable: string;
  }>();
  const { user } = useUser();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    firstname: user?.firstName || '',
    lastname: user?.lastName || '',
    email: user?.primaryEmailAddress?.emailAddress || '',
    phone: '',
    country: 'Ghana',
    message: '',
  });

  const submit = async () => {
    if (!form.firstname || !form.email || !form.phone || !form.message) {
      Alert.alert('Validation', 'Please fill all required fields');
      return;
    }
    setLoading(true);
    try {
      await submitPlotInterest(interestTable!, table!, id!, form);
      Alert.alert('Success', 'Your interest has been submitted. We will contact you soon.', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (e) {
      Alert.alert('Error', e instanceof Error ? e.message : 'Failed to submit');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Express Interest</Text>
      <Text style={styles.sub}>Tell us about your interest in this plot</Text>

      <Input label="First name *" value={form.firstname} onChangeText={(v) => setForm({ ...form, firstname: v })} />
      <Input label="Last name" value={form.lastname} onChangeText={(v) => setForm({ ...form, lastname: v })} />
      <Input label="Email *" value={form.email} onChangeText={(v) => setForm({ ...form, email: v })} autoCapitalize="none" />
      <Input label="Phone *" value={form.phone} onChangeText={(v) => setForm({ ...form, phone: v })} />
      <Input label="Country" value={form.country} onChangeText={(v) => setForm({ ...form, country: v })} />
      <Input
        label="Message *"
        value={form.message}
        onChangeText={(v) => setForm({ ...form, message: v })}
        multiline
        numberOfLines={4}
      />

      <Button title="Submit" onPress={submit} loading={loading} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: spacing.lg },
  title: { fontSize: fontSize.xl, fontWeight: '800', color: colors.primary },
  sub: { color: colors.textMuted, marginBottom: spacing.lg },
});
