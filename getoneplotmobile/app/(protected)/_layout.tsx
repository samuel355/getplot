import { Ionicons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, type TextStyle, type ViewStyle } from "react-native";
import { RequireAuth } from "../../src/components/auth/RequireAuth";
import { useTheme } from "../../src/constants/theme";

/**
 * Routes that require sign-in (checkout, buy/reserve plot, admin).
 * Public browsing stays on (tabs).
 */
export default function ProtectedLayout() {
  const { colors, borderRadius, spacing, fontSize, fontWeight } = useTheme();
  const router = useRouter();

  const backButton = (title: string) => (
    <Pressable
      onPress={() => router.back()}
      style={{
        marginLeft: -spacing.sm,
        padding: spacing.sm,
        flexDirection: "row",
        alignItems: "center",
      }}
    >
      <Ionicons name="chevron-back" size={24} color={colors.primary} />
    </Pressable>
  );

  const profileButton = (
    <Pressable
      style={[
        styles.profileButton,
        {
          backgroundColor: colors.surfaceAlt,
          borderRadius: borderRadius.full,
          paddingHorizontal: spacing.sm,
        },
      ]}
      onPress={() => router.replace("/(tabs)/profile")}
    >
      <Ionicons name="person-outline" size={16} color={colors.primary} />
      <Text
        style={[
          styles.profileButtonText,
          {
            color: colors.primary,
            fontSize: fontSize.sm,
            fontWeight: fontWeight.semibold as TextStyle["fontWeight"],
          },
        ]}
      >
        Profile
      </Text>
    </Pressable>
  );

  return (
    <RequireAuth>
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text,
          headerTitleStyle: { fontWeight: "700" },
          contentStyle: { flex: 1, backgroundColor: colors.background },
        }}
      >
        <Stack.Screen
          name="checkout"
          options={{
            title: "Checkout",
            headerLeft: () => backButton("Cart"),
          }}
        />
        <Stack.Screen
          name="plot/buy"
          options={{
            title: "Buy Plot",
            headerLeft: () => backButton("Back"),
          }}
        />
        <Stack.Screen
          name="plot/reserve"
          options={{
            title: "Reserve Plot",
            headerLeft: () => backButton("Back"),
          }}
        />
        <Stack.Screen
          name="admin/index"
          options={{
            title: "Admin",
            headerRight: () => profileButton,
          }}
        />
        <Stack.Screen
          name="admin/properties"
          options={{
            title: "Properties Dashboard",
            headerBackTitle: "Admin",
            headerRight: () => profileButton,
          }}
        />
        <Stack.Screen
          name="admin/plots"
          options={{
            title: "Land Sites Dashboard",
            headerBackTitle: "Admin",
            headerRight: () => profileButton,
          }}
        />
        <Stack.Screen
          name="admin/site/[slug]"
          options={{
            title: "Site Plots",
            headerBackTitle: "Sites",
            headerRight: () => profileButton,
          }}
        />
      </Stack>
    </RequireAuth>
  );
}

const styles = StyleSheet.create({
  profileButton: {
    minHeight: 34,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  profileButtonText: {},
});
