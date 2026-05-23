import { Stack } from 'expo-router';
import { RequireAuth } from '../../src/components/auth/RequireAuth';
import { colors } from '../../src/constants/theme';

/**
 * Routes that require sign-in (checkout, buy/reserve plot, admin).
 * Public browsing stays on (tabs).
 */
export default function ProtectedLayout() {
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
        <Stack.Screen name="admin/index" options={{ title: 'Admin' }} />
        <Stack.Screen name="admin/plots" options={{ title: 'Plot Overview' }} />
      </Stack>
    </RequireAuth>
  );
}
