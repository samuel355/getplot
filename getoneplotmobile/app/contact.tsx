import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text } from 'react-native';
import { Button } from '../src/components/ui/Button';
import { Input } from '../src/components/ui/Input';
import { sendContactEmail } from '../src/lib/api';
import { colors, fontSize, spacing } from '../src/constants/theme';

export default function ContactScreen() {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    fullname: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });

  const submit = async () => {
    if (form.fullname.length < 5) {
      Alert.alert('Validation', 'Enter your full name');
      return;
    }
    if (!form.email.includes('@')) {
      Alert.alert('Validation', 'Enter a valid email');
      return;
    }
    setLoading(true);
    try {
      await sendContactEmail(form);
      Alert.alert('Success', 'Message sent successfully');
      setForm({ fullname: '', email: '', phone: '', subject: '', message: '' });
    } catch {
      Alert.alert('Error', 'Failed to send message. Check API URL configuration.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Contact Us</Text>
      <Text style={styles.sub}>
        Reach Land & Homes Consult — Kumasi Dichemso · 0322008282
      </Text>

      <Input label="Full name" value={form.fullname} onChangeText={(v) => setForm({ ...form, fullname: v })} />
      <Input label="Email" value={form.email} onChangeText={(v) => setForm({ ...form, email: v })} autoCapitalize="none" />
      <Input label="Phone" value={form.phone} onChangeText={(v) => setForm({ ...form, phone: v })} />
      <Input label="Subject" value={form.subject} onChangeText={(v) => setForm({ ...form, subject: v })} />
      <Input label="Message" value={form.message} onChangeText={(v) => setForm({ ...form, message: v })} multiline numberOfLines={5} />

      <Button title="Send Message" onPress={submit} loading={loading} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: spacing.lg },
  title: { fontSize: fontSize.xxl, fontWeight: '800', color: colors.primary },
  sub: { color: colors.textMuted, marginBottom: spacing.lg, lineHeight: 22 },
});
