import {
  StyleSheet,
  Text,
  TextInput,
  View,
  type TextInputProps,
  type TextStyle,
  type ViewStyle,
} from "react-native";
import { useState, type ReactNode } from "react";
import { useTheme } from "../../constants/theme";

type Props = TextInputProps & {
  label?: string;
  error?: string;
  hint?: string;
  icon?: ReactNode;
  containerStyle?: ViewStyle;
};

export function Input({
  label,
  error,
  hint,
  icon,
  containerStyle,
  style,
  onFocus,
  onBlur,
  ...rest
}: Props) {
  const { colors, spacing, borderRadius, fontSize, fontWeight } = useTheme();
  const [focused, setFocused] = useState(false);

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
            borderColor: error ? colors.error : focused ? colors.primaryAccent : colors.border,
            borderRadius: borderRadius.lg,
            shadowColor: focused ? colors.primaryAccent : "transparent",
            shadowOpacity: focused ? 0.16 : 0,
            shadowRadius: 10,
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
          onFocus={(event) => {
            setFocused(true);
            onFocus?.(event);
          }}
          onBlur={(event) => {
            setFocused(false);
            onBlur?.(event);
          }}
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
    minHeight: 52,
  },
  icon: {
    paddingLeft: 12,
  },
  input: {
    flex: 1,
  },
  error: {},
});
