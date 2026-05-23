import { StyleSheet, Text, View, type ViewProps } from 'react-native';
import { colors, fontSize, spacing, borderRadius, fontWeight } from '../../constants/theme';

type Props = ViewProps & {
  label: string;
  variant?: 'default' | 'success' | 'error' | 'warning' | 'info';
  size?: 'sm' | 'md';
};

export function Badge({ label, variant = 'default', size = 'sm', style, ...rest }: Props) {
  return (
    <View style={[styles.base, styles[variant], styles[size], style]} {...rest}>
      <Text style={[styles.text, styles[`${variant}Text`], styles[`text${size}`]]}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: borderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sm: {
    paddingVertical: 4,
    paddingHorizontal: spacing.sm,
  },
  md: {
    paddingVertical: 6,
    paddingHorizontal: spacing.md,
  },
  default: {
    backgroundColor: colors.surface,
  },
  success: {
    backgroundColor: `${colors.success}20`,
  },
  error: {
    backgroundColor: `${colors.error}20`,
  },
  warning: {
    backgroundColor: `${colors.warning}20`,
  },
  info: {
    backgroundColor: `${colors.info}20`,
  },
  text: {
    fontWeight: fontWeight.semibold,
    textAlign: 'center',
  },
  textsm: { fontSize: fontSize.xs },
  textmd: { fontSize: fontSize.sm },
  defaultText: { color: colors.textMuted },
  successText: { color: colors.success },
  errorText: { color: colors.error },
  warningText: { color: colors.warning },
  infoText: { color: colors.info },
});
