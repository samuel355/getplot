import {
  StyleSheet,
  Text,
  TextInput,
  View,
  type TextInputProps,
  type TextStyle,
  type ViewStyle,
} from "react-native";
import { useTheme } from "../../constants/theme";

type Props = TextInputProps & {
  label?: string;
  error?: string;
  containerStyle?: ViewStyle;
};

export function Input({ label, error, containerStyle, style, ...rest }: Props) {
  const { colors, spacing, borderRadius, fontSize, fontWeight } = useTheme();

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <Text
          style={[
            styles.label,
            {
              color: colors.textSecondary,
              marginBottom: spacing.xs,
              fontSize: fontSize.sm,
              fontWeight: fontWeight.medium as TextStyle["fontWeight"],
            },
          ]}
        >
          {label}
        </Text>
      )}
      <TextInput
        style={[
          styles.input,
          {
            backgroundColor: colors.surface,
            borderColor: error ? colors.error : colors.border,
            color: colors.text,
            borderRadius: borderRadius.md,
            padding: spacing.md,
            fontSize: fontSize.base,
          },
          style,
        ]}
        placeholderTextColor={colors.textMuted}
        {...rest}
      />
      {error && (
        <Text
          style={[
            styles.error,
            { color: colors.error, marginTop: spacing.xs, fontSize: fontSize.xs },
          ]}
        >
          {error}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  label: {},
  input: {
    borderWidth: 1,
  },
  error: {},
});
