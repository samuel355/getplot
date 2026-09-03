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
        return { backgroundColor: colors.primary + "14", borderColor: colors.primary + "24" };
      case "secondary":
        return { backgroundColor: colors.primaryAccent + "20", borderColor: colors.primaryAccent + "35" };
      case "outline":
        return {
          backgroundColor: "transparent",
          borderWidth: 1,
          borderColor: colors.border,
        };
      case "success":
        return { backgroundColor: colors.success + "18", borderColor: colors.success + "30" };
      case "warning":
        return { backgroundColor: colors.warning + "18", borderColor: colors.warning + "30" };
      case "error":
        return { backgroundColor: colors.error + "18", borderColor: colors.error + "30" };
      default:
        return { backgroundColor: colors.primary };
    }
  };

  const getTextStyle = () => {
    if (variant === "outline") return { color: colors.textSecondary };
    if (variant === "secondary") return { color: colors.primary };
    if (variant === "success") return { color: colors.success };
    if (variant === "warning") return { color: colors.warning };
    if (variant === "error") return { color: colors.error };
    return { color: colors.primary };
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
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    alignSelf: "flex-start",
    borderWidth: 1,
  },
  text: {
    textTransform: "uppercase",
  },
});
