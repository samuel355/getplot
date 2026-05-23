import { Image } from 'expo-image';
import { Link } from 'expo-router';
import type { ReactNode } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, fontSize, spacing } from '../../constants/theme';

type Props = {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  footer?: ReactNode;
};

export function AuthShell({ children, title, subtitle, footer }: Props) {
  const insets = useSafeAreaInsets();

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingTop: insets.top + spacing.md, paddingBottom: insets.bottom + spacing.lg },
        ]}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.hero}>
          <Image
            source={require('../../../assets/splash-icon.png')}
            style={styles.heroImage}
            contentFit="cover"
          />
          <View style={styles.heroOverlay}>
            <Text style={styles.heroBrand}>Get One Plot</Text>
            <Text style={styles.heroTagline}>
              Where listing of properties and land purchase is made easy
            </Text>
          </View>
        </View>

        <View style={styles.card}>
          {title ? <Text style={styles.title}>{title}</Text> : null}
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
          {children}
          {footer}
          <Link href="/(tabs)" style={styles.guestLink}>
            <Text style={styles.guestText}>Continue browsing as guest</Text>
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.surface },
  scroll: { flexGrow: 1 },
  hero: {
    height: 200,
    marginHorizontal: spacing.md,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: colors.primary,
  },
  heroImage: { ...StyleSheet.absoluteFillObject, opacity: 0.35 },
  heroOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: spacing.lg,
    backgroundColor: 'rgba(5, 1, 76, 0.55)',
  },
  heroBrand: {
    fontSize: fontSize.xxl,
    fontWeight: '800',
    color: colors.white,
  },
  heroTagline: {
    marginTop: spacing.sm,
    fontSize: fontSize.sm,
    color: 'rgba(255,255,255,0.9)',
    lineHeight: 20,
  },
  card: {
    margin: spacing.md,
    marginTop: spacing.lg,
    padding: spacing.lg,
    backgroundColor: colors.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  title: {
    fontSize: fontSize.xl,
    fontWeight: '800',
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: fontSize.md,
    color: colors.textMuted,
    marginBottom: spacing.lg,
    lineHeight: 22,
  },
  guestLink: { marginTop: spacing.lg, alignSelf: 'center' },
  guestText: { color: colors.textMuted, fontSize: fontSize.sm },
});
