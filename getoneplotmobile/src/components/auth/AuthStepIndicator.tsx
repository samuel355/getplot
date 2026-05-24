import { StyleSheet, Text, View } from 'react-native';
import { colors, fontSize, spacing, borderRadius } from '../../constants/theme';

type Props = {
  steps: string[];
  current: number;
};

export function AuthStepIndicator({ steps, current }: Props) {
  return (
    <View style={styles.wrap}>
      {steps.map((label, index) => {
        const active = index === current;
        const done = index < current;
        return (
          <View key={label} style={styles.step}>
            <View
              style={[
                styles.dot,
                active && styles.dotActive,
                done && styles.dotDone,
              ]}
            >
              <Text style={[styles.dotText, (active || done) && styles.dotTextActive]}>
                {done ? '✓' : index + 1}
              </Text>
            </View>
            <Text style={[styles.label, active && styles.labelActive]} numberOfLines={1}>
              {label}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
    gap: spacing.xs,
  },
  step: { flex: 1, alignItems: 'center' },
  dot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  dotActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  dotDone: {
    backgroundColor: colors.success,
    borderColor: colors.success,
  },
  dotText: { fontSize: fontSize.xs, fontWeight: '700', color: colors.textMuted },
  dotTextActive: { color: colors.white },
  label: {
    fontSize: 10,
    color: colors.textMuted,
    textAlign: 'center',
    fontWeight: '500',
  },
  labelActive: { color: colors.primary, fontWeight: '700' },
});
