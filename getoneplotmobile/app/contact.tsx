import { useState } from 'react';
import { Alert, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '../src/components/ui/Button';
import { Input } from '../src/components/ui/Input';
import { sendContactEmail } from '../src/lib/api';
import { useTheme } from '../src/constants/theme';

export default function ContactScreen() {
  const { colors, fontSize, spacing, borderRadius } = useTheme();
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
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
    if (!form.message.trim()) {
      Alert.alert('Validation', 'Enter your message');
      return;
    }
    setLoading(true);
    try {
      await sendContactEmail(form);
      setForm({ fullname: '', email: '', phone: '', subject: '', message: '' });
      setSent(true);
    } catch (error) {
      Alert.alert(
        'Message not sent',
        error instanceof Error ? error.message : 'Please try again or call us directly.',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
    <ScrollView contentContainerStyle={[styles.container, { padding: spacing.lg, backgroundColor: colors.background }]}>
      <View style={[styles.hero, { backgroundColor: colors.primary, borderRadius: borderRadius.xl }]}>
        <View style={[styles.heroIcon, { backgroundColor: colors.white + '18' }]}>
          <Ionicons name="chatbubble-ellipses-outline" size={24} color={colors.white} />
        </View>
        <Text style={[styles.title, { color: colors.white, fontSize: fontSize.xxl }]}>Contact Us</Text>
        <Text style={[styles.sub, { color: colors.white + 'B8' }]}>
          Have a question about land or a property? Our team is ready to help.
        </Text>
      </View>
      <View style={[styles.formCard, { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: borderRadius.xl }]}>
      <Text style={[styles.formTitle, { color: colors.text }]}>Send us a message</Text>
      <Text style={[styles.formSub, { color: colors.textMuted }]}>Land & Homes Consult · Kumasi Dichemso · 0322008282</Text>

      <Input label="Full name *" value={form.fullname} onChangeText={(v) => setForm({ ...form, fullname: v })} />
      <Input label="Email *" value={form.email} onChangeText={(v) => setForm({ ...form, email: v })} autoCapitalize="none" keyboardType="email-address" />
      <Input label="Phone" value={form.phone} onChangeText={(v) => setForm({ ...form, phone: v })} keyboardType="phone-pad" />
      <Input label="Subject" value={form.subject} onChangeText={(v) => setForm({ ...form, subject: v })} />
      <Input label="Message *" value={form.message} onChangeText={(v) => setForm({ ...form, message: v })} multiline numberOfLines={5} />

      <Button title="Send Message" onPress={submit} loading={loading} fullWidth style={styles.sendButton} />
      </View>
    </ScrollView>

    <Modal visible={sent} transparent animationType="fade" onRequestClose={() => setSent(false)}>
      <Pressable style={styles.modalBackdrop} onPress={() => setSent(false)}>
        <Pressable style={[styles.modalCard, { backgroundColor: colors.surface, borderRadius: borderRadius.xl }]} onPress={() => {}}>
          <View style={[styles.successIcon, { backgroundColor: colors.success + '18' }]}>
            <Ionicons name="checkmark-circle" size={42} color={colors.success} />
          </View>
          <Text style={[styles.modalEyebrow, { color: colors.success }]}>MESSAGE RECEIVED</Text>
          <Text style={[styles.modalTitle, { color: colors.primary }]}>Thank you for contacting us!</Text>
          <Text style={[styles.modalText, { color: colors.textMuted }]}>Your message has reached the GetOnePlot team. We&apos;ll review your enquiry and respond to you as soon as possible.</Text>
          <Button title="Done" onPress={() => setSent(false)} fullWidth style={styles.doneButton} />
        </Pressable>
      </Pressable>
    </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, paddingBottom: 48 },
  hero: { padding: 22, marginBottom: 16 },
  heroIcon: { width: 46, height: 46, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginBottom: 18 },
  title: { fontWeight: '800' },
  sub: { marginTop: 8, lineHeight: 22 },
  formCard: { borderWidth: 1, padding: 18, gap: 4 },
  formTitle: { fontSize: 18, fontWeight: '800' },
  formSub: { fontSize: 12, lineHeight: 18, marginBottom: 10 },
  sendButton: { marginTop: 10 },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(6, 0, 83, 0.58)', alignItems: 'center', justifyContent: 'center', padding: 22 },
  modalCard: { width: '100%', maxWidth: 420, padding: 28, alignItems: 'center' },
  successIcon: { width: 76, height: 76, borderRadius: 38, alignItems: 'center', justifyContent: 'center', marginBottom: 18 },
  modalEyebrow: { fontSize: 11, fontWeight: '800', letterSpacing: 1.2 },
  modalTitle: { marginTop: 8, fontSize: 23, lineHeight: 29, fontWeight: '800', textAlign: 'center' },
  modalText: { marginTop: 12, fontSize: 14, lineHeight: 22, textAlign: 'center' },
  doneButton: { marginTop: 24 },
});
