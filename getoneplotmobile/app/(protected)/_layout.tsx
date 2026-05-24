import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, type TextStyle, type ViewStyle } from 'react-native';
import { RequireAuth } from '../../src/components/auth/RequireAuth';
import { borderRadius, colors, fontSize, fontWeight, spacing } from '../../src/constants/theme';

const weights = fontWeight as Record<keyof typeof fontWeight, TextStyle['fontWeight']>;

/**
 * Routes that require sign-in (checkout, buy/reserve plot, admin).
 * Public browsing stays on (tabs).
 */
export default function ProtectedLayout() {
  const router = useRouter();

  const profileButton = (
    <Pressable
      style={viewStyles.profileButton}
      onPress={() => router.replace('/(tabs)/profile')}
      android_ripple={{ color: 'rgba(15,23,42,0.08)', borderless: true }}
    >
      <Ionicons name="person-outline" size={16} color={colors.primary} />
      <Text style={textStyles.profileButtonText}>Profile</Text>
    </Pressable>
  );

  return (
    <RequireAuth>
      <Stack
        screenOptions={{
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
            headerRight: () => profileButton,
          }}
        />
        <Stack.Screen
          name="admin/properties"
          options={{
            title: 'Properties Dashboard',
            headerBackTitle: 'Admin',
            headerRight: () => profileButton,
          }}
        />
        <Stack.Screen
          name="admin/plots"
          options={{
            title: 'Land Sites Dashboard',
            headerBackTitle: 'Admin',
            headerRight: () => profileButton,
          }}
        />
      </Stack>
    </RequireAuth>
  );
}

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
});
