<<<<<<< HEAD
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
=======
import { StyleSheet, View, type ViewStyle } from "react-native";
import { useTheme } from "../../constants/theme";

type Props = {
  children: React.ReactNode;
  style?: ViewStyle;
};

export function Card({ children, style }: Props) {
  const { colors, borderRadius, spacing } = useTheme();

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.surface,
          borderRadius: borderRadius.lg,
          padding: spacing.md,
          borderColor: colors.border,
        },
        style,
      ]}
>>>>>>> mobile
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
<<<<<<< HEAD
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
=======
  card: {
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
>>>>>>> mobile
  },
});
