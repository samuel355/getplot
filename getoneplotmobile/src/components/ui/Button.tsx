import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  type PressableProps,
  type ViewStyle,
  type TextStyle,
} from "react-native";
import { useTheme } from "../../constants/theme";

type Props = Omit<PressableProps, "style"> & {
  title: string;
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  loading?: boolean;
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
};

export function Button({
  title,
  variant = "primary",
  loading,
  size = "md",
  disabled,
  fullWidth = false,
  style,
  textStyle,
  ...rest
}: Props) {
  const { colors, spacing, borderRadius, fontWeight, fontSize, isDark } = useTheme();
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
      case "secondary":
        return { color: colors.primary };
      case "primary":
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
          minHeight: size === "sm" ? 42 : size === "lg" ? 56 : 50,
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "row",
          shadowColor: colors.shadow,
          shadowOffset: { width: 0, height: 7 },
          shadowOpacity: variant === "primary" && !isDark ? 0.2 : 0,
          shadowRadius: 12,
          elevation: variant === "primary" ? 3 : 0,
        },
        size === "sm" && { paddingVertical: spacing.sm, paddingHorizontal: spacing.md },
        size === "md" && { paddingVertical: 12, paddingHorizontal: spacing.lg },
        size === "lg" && { paddingVertical: 14, paddingHorizontal: spacing.xl },
        getVariantStyle() as ViewStyle,
        pressed && !isDisabled && { opacity: 0.9, transform: [{ scale: 0.975 }] },
        isDisabled && { opacity: 0.5 },
        fullWidth && { width: "100%" },
        style,
      ]}
      disabled={isDisabled}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator
          color={
            variant === "outline" || variant === "ghost" || variant === "secondary"
              ? colors.primary
              : colors.white
          }
          size="small"
        />
      ) : (
        <Text
          style={[
            { fontWeight: fontWeight.semibold as TextStyle["fontWeight"], fontSize: fontSize.md },
            getTextStyle(),
            textStyle,
          ]}
        >
          {title}
        </Text>
      )}
    </Pressable>
  );
}
