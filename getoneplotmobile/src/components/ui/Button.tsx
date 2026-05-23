import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  type PressableProps,
  type ViewStyle,
} from "react-native";
import { colors, fontSize, spacing, fontWeight, borderRadius } from "../../constants/theme";

type Props = Omit<PressableProps, "style"> & {
  title: string;
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  loading?: boolean;
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
  style?: ViewStyle;
};

export function Button({
  title,
  variant = "primary",
  loading,
  size = "md",
  disabled,
  fullWidth = false,
  style,
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
        style,
      ]}
      disabled={isDisabled}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator
          color={
            variant === "outline"
              ? colors.primary
              : variant === "ghost"
                ? colors.primary
                : colors.white
          }
          size="small"
        />
      ) : (
        <Text
          style={[
            styles.text,
            variant === "primary" && styles.primaryText,
            variant === "secondary" && styles.secondaryText,
            variant === "outline" && styles.outlineText,
            variant === "ghost" && styles.ghostText,
            variant === "danger" && styles.dangerText,
          ]}
        >
          {title}
        </Text>
      )}
    </Pressable>
  );
}

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
