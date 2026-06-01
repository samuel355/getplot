import { Ionicons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, type TextStyle, type ViewStyle, Alert } from "react-native";
import { RequireAuth } from "../../src/components/auth/RequireAuth";
import { useTheme } from "../../src/constants/theme";
import { useUser } from "@clerk/clerk-expo";
import { useRef } from "react";

/**
 * Routes that require sign-in (checkout, buy/reserve plot, admin).
 * Public browsing stays on (tabs).
 */
export default function ProtectedLayout() {
  const { colors, borderRadius, spacing, fontSize, fontWeight } = useTheme();
  const router = useRouter();
  const { user } = useUser();
  const role = (user?.publicMetadata?.role as string) || "guest";
  const isAdmin = ["admin", "sysadmin", "chief", "chief_asst"].includes(role);
  const refreshRef = useRef<() => void>(() => {});

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

  const refreshButton = (
    <Pressable
      onPress={() => refreshRef.current?.()}
      style={{ padding: spacing.sm }}
    >
      <Ionicons name="refresh" size={20} color={colors.primary} />
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
            headerShown: isAdmin,
          }}
        />
        <Stack.Screen
          name="admin/properties"
          options={{
            title: "Properties Dashboard",
            headerBackTitle: "Admin",
            headerRight: () => profileButton,
            headerShown: isAdmin,
          }}
        />
        <Stack.Screen
          name="admin/plots"
          options={{
            title: "Land Sites Dashboard",
            headerBackTitle: "Admin",
            headerRight: () => profileButton,
            headerShown: isAdmin,
          }}
        />
        <Stack.Screen
          name="admin/site/[slug]"
          options={{
            title: "Site Plots",
            headerBackTitle: "Sites",
            headerRight: () => profileButton,
            headerShown: isAdmin,
          }}
        />
        <Stack.Screen
          name="admin/users"
          options={{
            title: "User Management",
            headerLeft: () => backButton("Admin"),
            headerRight: () => refreshButton,
            headerShown: isAdmin,
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
