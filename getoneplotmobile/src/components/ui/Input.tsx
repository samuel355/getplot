<<<<<<< HEAD
import { StyleSheet, Text, TextInput, View, type TextInputProps } from "react-native";
import { colors, fontSize, spacing, fontWeight, borderRadius } from "../../constants/theme";
=======
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
>>>>>>> mobile

type Props = TextInputProps & {
  label?: string;
  error?: string;
<<<<<<< HEAD
  hint?: string;
  icon?: React.ReactNode;
};

export function Input({ label, error, hint, icon, style, ...rest }: Props) {
  return (
    <View style={styles.wrap}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View style={[styles.inputContainer, error && styles.inputContainerError]}>
        {icon && <View style={styles.iconLeft}>{icon}</View>}
        <TextInput
          style={[styles.input, icon && styles.inputWithIcon, style]}
          placeholderTextColor={colors.textMuted}
          {...rest}
        />
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      {hint ? <Text style={styles.hint}>{hint}</Text> : null}
=======
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
>>>>>>> mobile
    </View>
  );
}

const styles = StyleSheet.create({
<<<<<<< HEAD
  wrap: { marginBottom: spacing.lg },
  label: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.white,
    paddingHorizontal: spacing.md,
  },
  inputContainerError: {
    borderColor: colors.error,
  },
  iconLeft: {
    marginRight: spacing.sm,
    justifyContent: "center",
    alignItems: "center",
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: spacing.sm,
    fontSize: fontSize.md,
    color: colors.text,
  },
  inputWithIcon: {
    paddingHorizontal: spacing.md,
  },
  error: {
    color: colors.error,
    fontSize: fontSize.xs,
    marginTop: spacing.sm,
    fontWeight: fontWeight.medium,
  },
  hint: {
    color: colors.textMuted,
    fontSize: fontSize.xs,
    marginTop: spacing.sm,
  },
=======
  container: {
    width: "100%",
  },
  label: {},
  input: {
    borderWidth: 1,
  },
  error: {},
>>>>>>> mobile
});
