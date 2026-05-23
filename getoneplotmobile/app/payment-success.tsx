import { useRouter } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '../src/components/ui/Button';
import { colors, fontSize, spacing } from '../src/constants/theme';

export default function PaymentSuccessScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Ionicons name="checkmark-circle" size={80} color={colors.success} />
      <Text style={styles.title}>Payment Successful</Text>
      <Text style={styles.body}>
        Thank you! Present your receipt at our Kumasi Dichemso office or call
        0322008282 / +233 54 855 4216. Check your email for plot details.
      </Text>
      <Button title="Go Home" onPress={() => router.replace('/(tabs)')} />
      <Button title="View Cart" variant="outline" onPress={() => router.replace('/(tabs)/cart')} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
    backgroundColor: colors.background,
  },
  title: {
    fontSize: fontSize.xxl,
    fontWeight: '800',
    color: colors.primary,
    marginTop: spacing.lg,
  },
  body: {
    textAlign: 'center',
    color: colors.textMuted,
    lineHeight: 24,
    marginVertical: spacing.lg,
  },
});
