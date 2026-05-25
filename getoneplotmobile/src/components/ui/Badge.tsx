<<<<<<< HEAD
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
=======
import { StyleSheet, Text, View, type ViewStyle, type TextStyle } from "react-native";
import { useTheme } from "../../constants/theme";

type Props = {
  content: string;
  variant?: "primary" | "secondary" | "outline" | "success" | "warning" | "error";
  style?: ViewStyle;
};

export function Badge({ content, variant = "primary", style }: Props) {
  const { colors, spacing, borderRadius, fontSize, fontWeight } = useTheme();

  const getVariantStyle = () => {
    switch (variant) {
      case "primary":
        return { backgroundColor: colors.primary };
      case "secondary":
        return { backgroundColor: colors.primaryAccent };
      case "outline":
        return {
          backgroundColor: "transparent",
          borderWidth: 1,
          borderColor: colors.border,
        };
      case "success":
        return { backgroundColor: colors.success };
      case "warning":
        return { backgroundColor: colors.warning };
      case "error":
        return { backgroundColor: colors.error };
      default:
        return { backgroundColor: colors.primary };
    }
  };

  const getTextStyle = () => {
    if (variant === "outline") return { color: colors.textSecondary };
    return { color: colors.white };
  };

  return (
    <View
      style={[
        styles.base,
        {
          borderRadius: borderRadius.full,
          paddingHorizontal: spacing.sm,
          paddingVertical: 2,
        },
        getVariantStyle(),
        style,
      ]}
    >
      <Text
        style={[
          styles.text,
          {
            fontSize: fontSize.xs,
            fontWeight: fontWeight.bold as TextStyle["fontWeight"],
          },
          getTextStyle(),
        ]}
      >
        {content}
>>>>>>> mobile
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
<<<<<<< HEAD
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
=======
    alignSelf: "flex-start",
  },
  text: {
    textTransform: "uppercase",
  },
>>>>>>> mobile
});
