<<<<<<< HEAD
import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, type TextStyle, type ViewStyle } from 'react-native';
import { RequireAuth } from '../../src/components/auth/RequireAuth';
import { borderRadius, colors, fontSize, fontWeight, spacing } from '../../src/constants/theme';

const weights = fontWeight as Record<keyof typeof fontWeight, TextStyle['fontWeight']>;
=======
import { Ionicons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, type TextStyle, type ViewStyle } from "react-native";
import { RequireAuth } from "../../src/components/auth/RequireAuth";
import { useTheme } from "../../src/constants/theme";
>>>>>>> mobile

/**
 * Routes that require sign-in (checkout, buy/reserve plot, admin).
 * Public browsing stays on (tabs).
 */
export default function ProtectedLayout() {
<<<<<<< HEAD
  const router = useRouter();

  const profileButton = (
    <Pressable
      style={viewStyles.profileButton}
      onPress={() => router.replace('/(tabs)/profile')}
      android_ripple={{ color: 'rgba(15,23,42,0.08)', borderless: true }}
    >
      <Ionicons name="person-outline" size={16} color={colors.primary} />
      <Text style={textStyles.profileButtonText}>Profile</Text>
=======
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
>>>>>>> mobile
    </Pressable>
  );

  return (
    <RequireAuth>
      <Stack
        screenOptions={{
<<<<<<< HEAD
          headerStyle: { backgroundColor: colors.white },
          headerTintColor: colors.primary,
          headerTitleStyle: { fontWeight: '700' },
          contentStyle: { flex: 1, backgroundColor: colors.background },
        }}
      >
        <Stack.Screen name="checkout" options={{ title: 'Checkout' }} />
        <Stack.Screen name="plot/buy" options={{ title: 'Buy Plot' }} />
        <Stack.Screen name="plot/reserve" options={{ title: 'Reserve Plot' }} />
        <Stack.Screen
          name="admin/index"
          options={{
            title: 'Admin',
=======
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
>>>>>>> mobile
            headerRight: () => profileButton,
          }}
        />
        <Stack.Screen
          name="admin/properties"
          options={{
<<<<<<< HEAD
            title: 'Properties Dashboard',
            headerBackTitle: 'Admin',
=======
            title: "Properties Dashboard",
            headerBackTitle: "Admin",
>>>>>>> mobile
            headerRight: () => profileButton,
          }}
        />
        <Stack.Screen
          name="admin/plots"
          options={{
<<<<<<< HEAD
            title: 'Land Sites Dashboard',
            headerBackTitle: 'Admin',
=======
            title: "Land Sites Dashboard",
            headerBackTitle: "Admin",
>>>>>>> mobile
            headerRight: () => profileButton,
          }}
        />
      </Stack>
    </RequireAuth>
  );
}

<<<<<<< HEAD
const viewStyles = StyleSheet.create<Record<string, ViewStyle>>({
  profileButton: {
    minHeight: 34,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.surface,
  },
});

const textStyles = StyleSheet.create<Record<string, TextStyle>>({
  profileButtonText: {
    color: colors.primary,
    fontSize: fontSize.sm,
    fontWeight: weights.semibold,
  },
=======
const styles = StyleSheet.create({
  profileButton: {
    minHeight: 34,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  profileButtonText: {},
>>>>>>> mobile
});
