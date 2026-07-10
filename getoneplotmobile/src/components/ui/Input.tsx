import {
  StyleSheet,
  Text,
  TextInput,
  View,
  type TextInputProps,
  type TextStyle,
  type ViewStyle,
} from "react-native";
import type { ReactNode } from "react";
import { useTheme } from "../../constants/theme";

type Props = TextInputProps & {
  label?: string;
  error?: string;
  hint?: string;
  icon?: ReactNode;
  containerStyle?: ViewStyle;
};

export function Input({ label, error, hint, icon, containerStyle, style, ...rest }: Props) {
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
      <View
        style={[
          styles.inputWrap,
          {
            backgroundColor: colors.surface,
            borderColor: error ? colors.error : colors.border,
            borderRadius: borderRadius.md,
          },
        ]}
      >
        {icon ? <View style={styles.icon}>{icon}</View> : null}
        <TextInput
          style={[
            styles.input,
            {
              color: colors.text,
              paddingVertical: spacing.md,
              paddingRight: spacing.md,
              paddingLeft: icon ? spacing.xs : spacing.md,
              fontSize: fontSize.base,
            },
            style,
          ]}
          placeholderTextColor={colors.textMuted}
          {...rest}
        />
      </View>
      {(error || hint) && (
        <Text
          style={[
            styles.error,
            {
              color: error ? colors.error : colors.textMuted,
              marginTop: spacing.xs,
              fontSize: fontSize.xs,
            },
          ]}
        >
          {error || hint}
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
  inputWrap: {
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  icon: {
    paddingLeft: 12,
  },
  input: {
    flex: 1,
  },
  error: {},
});
