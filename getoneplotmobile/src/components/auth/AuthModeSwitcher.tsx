import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, fontSize, spacing, borderRadius, fontWeight } from '../../constants/theme';

export type AuthMode = 'sign-in' | 'sign-up';

type Props = {
  mode: AuthMode;
  onChange: (mode: AuthMode) => void;
};

export function AuthModeSwitcher({ mode, onChange }: Props) {
  return (
    <View style={styles.wrap}>
      <Pressable
        style={[styles.tab, mode === 'sign-in' && styles.tabActive]}
        onPress={() => onChange('sign-in')}
      >
        <Text style={[styles.tabText, mode === 'sign-in' && styles.tabTextActive]}>Sign in</Text>
      </Pressable>
      <Pressable
        style={[styles.tab, mode === 'sign-up' && styles.tabActive]}
        onPress={() => onChange('sign-up')}
      >
        <Text style={[styles.tabText, mode === 'sign-up' && styles.tabTextActive]}>Register</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: 4,
    marginBottom: spacing.lg,
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.sm + 2,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  tabActive: {
    backgroundColor: colors.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  tabText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.textMuted,
  },
  tabTextActive: {
    color: colors.primary,
    fontWeight: fontWeight.bold,
  },
});
