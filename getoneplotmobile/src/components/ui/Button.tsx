import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  type PressableProps,
  type ViewStyle,
<<<<<<< HEAD
} from "react-native";
import { colors, fontSize, spacing, fontWeight, borderRadius } from "../../constants/theme";
=======
  type TextStyle,
} from "react-native";
import { useTheme } from "../../constants/theme";
>>>>>>> mobile

type Props = Omit<PressableProps, "style"> & {
  title: string;
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  loading?: boolean;
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
  style?: ViewStyle;
<<<<<<< HEAD
=======
  textStyle?: TextStyle;
>>>>>>> mobile
};

export function Button({
  title,
  variant = "primary",
  loading,
  size = "md",
  disabled,
  fullWidth = false,
  style,
<<<<<<< HEAD
  ...rest
}: Props) {
  const isDisabled = disabled || loading;
  return (
    <Pressable
      style={({ pressed }) => [
        styles.base,
        styles[size],
        styles[variant],
        pressed && !isDisabled && styles.pressed,
        isDisabled && styles.disabled,
        fullWidth && styles.fullWidth,
=======
  textStyle,
  ...rest
}: Props) {
  const { colors, spacing, borderRadius, fontWeight, fontSize } = useTheme();
  const isDisabled = disabled || loading;

  const getVariantStyle = () => {
    switch (variant) {
      case "primary":
        return { backgroundColor: colors.primary };
      case "secondary":
        return { backgroundColor: colors.primaryAccent };
      case "outline":
        return {
          backgroundColor: "transparent",
          borderWidth: 1.5,
          borderColor: colors.primary,
        };
      case "ghost":
        return { backgroundColor: colors.surface };
      case "danger":
        return { backgroundColor: colors.error };
      default:
        return { backgroundColor: colors.primary };
    }
  };

  const getTextStyle = () => {
    switch (variant) {
      case "outline":
      case "ghost":
        return { color: colors.primary };
      case "primary":
      case "secondary":
      case "danger":
      default:
        return { color: colors.textInverse };
    }
  };

  return (
    <Pressable
      style={({ pressed }) => [
        {
          borderRadius: borderRadius.lg,
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "row",
        },
        size === "sm" && { paddingVertical: spacing.sm, paddingHorizontal: spacing.md },
        size === "md" && { paddingVertical: 12, paddingHorizontal: spacing.lg },
        size === "lg" && { paddingVertical: 14, paddingHorizontal: spacing.xl },
        getVariantStyle() as ViewStyle,
        pressed && !isDisabled && { opacity: 0.85 },
        isDisabled && { opacity: 0.5 },
        fullWidth && { width: "100%" },
>>>>>>> mobile
        style,
      ]}
      disabled={isDisabled}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator
<<<<<<< HEAD
          color={
            variant === "outline"
              ? colors.primary
              : variant === "ghost"
                ? colors.primary
                : colors.white
          }
=======
          color={variant === "outline" || variant === "ghost" ? colors.primary : colors.white}
>>>>>>> mobile
          size="small"
        />
      ) : (
        <Text
          style={[
<<<<<<< HEAD
            styles.text,
            variant === "primary" && styles.primaryText,
            variant === "secondary" && styles.secondaryText,
            variant === "outline" && styles.outlineText,
            variant === "ghost" && styles.ghostText,
            variant === "danger" && styles.dangerText,
=======
            { fontWeight: fontWeight.semibold as TextStyle["fontWeight"], fontSize: fontSize.md },
            getTextStyle(),
            textStyle,
>>>>>>> mobile
          ]}
        >
          {title}
        </Text>
      )}
    </Pressable>
  );
}
<<<<<<< HEAD

const styles = StyleSheet.create({
  base: {
    borderRadius: borderRadius.lg,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },
  sm: { paddingVertical: spacing.sm, paddingHorizontal: spacing.md },
  md: { paddingVertical: 12, paddingHorizontal: spacing.lg },
  lg: { paddingVertical: 14, paddingHorizontal: spacing.xl },
  fullWidth: { width: "100%" },
  primary: { backgroundColor: colors.primary },
  secondary: { backgroundColor: colors.primaryAccent },
  outline: {
    backgroundColor: "transparent",
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
  ghost: { backgroundColor: colors.surface },
  danger: { backgroundColor: colors.error },
  pressed: { opacity: 0.85 },
  disabled: { opacity: 0.5 },
  text: { fontWeight: fontWeight.semibold, fontSize: fontSize.md },
  primaryText: { color: colors.white },
  secondaryText: { color: colors.white },
  outlineText: { color: colors.primary },
  ghostText: { color: colors.primary },
  dangerText: { color: colors.white },
});
=======
>>>>>>> mobile
