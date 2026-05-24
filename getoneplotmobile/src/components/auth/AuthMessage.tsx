import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, fontSize, spacing, borderRadius } from '../../constants/theme';

type Variant = 'error' | 'success' | 'info';

type Props = {
  message: string;
  variant?: Variant;
};

const config: Record<
  Variant,
  { bg: string; border: string; text: string; icon: keyof typeof Ionicons.glyphMap }
> = {
  error: { bg: '#fef2f2', border: '#fecaca', text: colors.error, icon: 'alert-circle' },
  success: { bg: '#f0fdf4', border: '#bbf7d0', text: '#166534', icon: 'checkmark-circle' },
  info: { bg: '#eff6ff', border: '#bfdbfe', text: colors.info, icon: 'information-circle' },
};

export function AuthMessage({ message, variant = 'error' }: Props) {
  const c = config[variant];
  return (
    <View style={[styles.wrap, { backgroundColor: c.bg, borderColor: c.border }]}>
      <Ionicons name={c.icon} size={18} color={c.text} />
      <Text style={[styles.text, { color: c.text }]}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    marginBottom: spacing.lg,
  },
  text: { flex: 1, fontSize: fontSize.sm, lineHeight: 20 },
});
