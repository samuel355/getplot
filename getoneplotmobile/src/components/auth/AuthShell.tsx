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
import { colors, fontSize, spacing, borderRadius } from '../../constants/theme';

type Props = {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  footer?: ReactNode;
  headerExtra?: ReactNode;
  /** Hide guest link — use on profile tab where user is already browsing */
  embedded?: boolean;
  /** Smaller brand header for in-tab layout */
  compact?: boolean;
};

export function AuthShell({
  children,
  title,
  subtitle,
  footer,
  headerExtra,
  embedded = false,
  compact = false,
}: Props) {
  const insets = useSafeAreaInsets();

  return (
    <View style={viewStyles.root}>
      <View style={viewStyles.blobTop} />
      <View style={viewStyles.blobBottom} />

      <KeyboardAvoidingView
        style={viewStyles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={[
            viewStyles.scroll,
            {
              paddingTop: insets.top + (embedded ? spacing.xl : spacing.lg),
              paddingBottom: insets.bottom + spacing.xl,
            },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View
            style={[
              viewStyles.brandBlock,
              compact && viewStyles.brandBlockCompact,
              embedded && viewStyles.brandBlockEmbedded,
            ]}
          >
            <View style={[viewStyles.logoRing, compact && viewStyles.logoRingCompact]}>
              <Image
                source={require('../../../assets/icon.png')}
                style={compact ? viewStyles.logoCompact : viewStyles.logo}
                contentFit="contain"
              />
            </View>
            {!compact ? (
              <>
                <Text style={textStyles.brand}>Get One Plot</Text>
                <Text style={textStyles.tagline}>
                  Where listing of properties and land purchase is made easy
                </Text>
              </>
            ) : null}
          </View>

          <View style={[viewStyles.card, cardShadow]}>
            {headerExtra}
            {title ? <Text style={textStyles.title}>{title}</Text> : null}
            {subtitle ? <Text style={textStyles.subtitle}>{subtitle}</Text> : null}
            {children}
            {footer}
            {!embedded ? (
              <Link href="/(tabs)">
                <Text style={textStyles.guestText}>Continue browsing as guest →</Text>
              </Link>
            ) : null}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const cardShadow = Platform.select({
  ios: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.2,
    shadowRadius: 24,
  },
  android: { elevation: 12 },
});

const viewStyles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.primaryDark,
  },
  flex: { flex: 1 },
  blobTop: {
    position: 'absolute',
    top: -80,
    right: -60,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: colors.primaryAccent,
    opacity: 0.35,
  },
  blobBottom: {
    position: 'absolute',
    bottom: 120,
    left: -90,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: colors.primaryLight,
    opacity: 0.25,
  },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
  },
  brandBlock: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  brandBlockCompact: {
    marginBottom: spacing.lg,
  },
  brandBlockEmbedded: {
    marginTop: spacing.md,
    marginBottom: spacing.xl,
  },
  logoRing: {
    width: 72,
    height: 72,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  logo: { width: 48, height: 48 },
  logoRingCompact: {
    width: 56,
    height: 56,
    borderRadius: 16,
    marginBottom: 0,
  },
  logoCompact: { width: 36, height: 36 },
  card: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
  },
});

const textStyles = StyleSheet.create({
  brand: {
    fontSize: fontSize.xxl,
    fontWeight: '800',
    color: colors.white,
    letterSpacing: -0.5,
  },
  tagline: {
    marginTop: spacing.sm,
    fontSize: fontSize.sm,
    color: 'rgba(255,255,255,0.75)',
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 280,
  },
  title: {
    fontSize: fontSize.xxl,
    fontWeight: '800',
    color: colors.primary,
    marginBottom: spacing.xs,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: fontSize.base,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
    lineHeight: 22,
  },
  guestText: {
    marginTop: spacing.xl,
    textAlign: 'center',
    color: colors.textMuted,
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
});
