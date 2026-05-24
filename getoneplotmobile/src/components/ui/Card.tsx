import { StyleSheet, View, type ViewProps } from 'react-native';
import { colors, spacing, borderRadius, shadows } from '../../constants/theme';

type Props = ViewProps & {
  variant?: 'default' | 'elevated' | 'outlined';
};

export function Card({ variant = 'default', style, children, ...rest }: Props) {
  return (
    <View
      style={[
        styles.base,
        styles[variant],
        style,
      ]}
      {...rest}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
  },
  default: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
  },
  elevated: {
    backgroundColor: colors.white,
    shadowColor: colors.shadow,
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    elevation: 4,
  },
  outlined: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
});
