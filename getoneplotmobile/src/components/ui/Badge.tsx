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
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    alignSelf: "flex-start",
  },
  text: {
    textTransform: "uppercase",
  },
});
