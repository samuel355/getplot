import { ClerkLoaded, ClerkProvider } from '@clerk/clerk-expo';
import { tokenCache } from '@clerk/clerk-expo/token-cache';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { colors } from '../src/constants/theme';

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!;

export default function RootLayout() {
  if (!publishableKey) {
    console.warn('Missing EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY');
  }

  return (
    <ClerkProvider publishableKey={publishableKey || ''} tokenCache={tokenCache}>
      <ClerkLoaded>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <SafeAreaProvider>
            <StatusBar style="dark" />
            <Stack
              screenOptions={{
                headerStyle: { backgroundColor: colors.white },
                headerTintColor: colors.primary,
                headerTitleStyle: { fontWeight: '700' },
                contentStyle: { backgroundColor: colors.background },
              }}
            >
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen name="(auth)" options={{ headerShown: false }} />
              <Stack.Screen name="approval" options={{ title: 'Approval', headerShown: false }} />
              <Stack.Screen name="development/[slug]" options={{ title: 'Site Map' }} />
              <Stack.Screen name="plot/buy" options={{ title: 'Buy Plot' }} />
              <Stack.Screen name="plot/reserve" options={{ title: 'Reserve Plot' }} />
              <Stack.Screen name="plot/interest" options={{ title: 'Express Interest' }} />
              <Stack.Screen name="property/[id]" options={{ title: 'Property' }} />
              <Stack.Screen name="checkout" options={{ title: 'Checkout' }} />
              <Stack.Screen name="contact" options={{ title: 'Contact Us' }} />
              <Stack.Screen name="payment-success" options={{ title: 'Success', headerShown: false }} />
              <Stack.Screen name="admin/index" options={{ title: 'Admin' }} />
              <Stack.Screen name="admin/plots" options={{ title: 'Plot Overview' }} />
            </Stack>
          </SafeAreaProvider>
        </GestureHandlerRootView>
      </ClerkLoaded>
    </ClerkProvider>
  );
}
