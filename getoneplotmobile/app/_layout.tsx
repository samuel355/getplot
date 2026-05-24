import { useEffect } from "react";
import * as SplashScreen from "expo-splash-screen";
import { ClerkLoaded, ClerkProvider } from "@clerk/clerk-expo";
import { tokenCache } from "@clerk/clerk-expo/token-cache";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { colors } from "../src/constants/theme";

// Keep the splash screen visible until we're done with app setup
SplashScreen.preventAutoHideAsync().catch(() => {
  // It's ok if this fails, the splash screen might already be hidden
});

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!;

/**
 * Mirrors web ClerkProvider (app/layout.jsx):
 * sign-in → /approval after auth; sign-out → home.
 */
export default function RootLayout() {
  if (!publishableKey) {
    console.warn("Missing EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY");
  }

  useEffect(() => {
    // Hide the splash screen once the app is ready
    // Add a small delay to ensure the app is actually ready
    const timer = setTimeout(() => {
      SplashScreen.hideAsync().catch(() => {
        // It's ok if this fails
      });
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <ClerkProvider publishableKey={publishableKey || ""} tokenCache={tokenCache}>
      <ClerkLoaded>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <SafeAreaProvider>
            <StatusBar style="dark" />
            <Stack
              screenOptions={{
                headerStyle: { backgroundColor: colors.white },
                headerTintColor: colors.primary,
                headerTitleStyle: { fontWeight: "700" },
                contentStyle: { backgroundColor: colors.background },
              }}
            >
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen name="(auth)" options={{ headerShown: false }} />
              <Stack.Screen name="(protected)" options={{ headerShown: false }} />
              <Stack.Screen name="approval" options={{ title: "Approval", headerShown: false }} />
              <Stack.Screen name="plot/interest" options={{ title: "Express Interest" }} />
              <Stack.Screen
                name="property/[id]"
                options={{ title: "Property", headerBackTitle: "Back" }}
              />
              <Stack.Screen name="contact" options={{ title: "Contact Us" }} />
              <Stack.Screen
                name="payment-success"
                options={{ title: "Success", headerShown: false }}
              />
            </Stack>
          </SafeAreaProvider>
        </GestureHandlerRootView>
      </ClerkLoaded>
    </ClerkProvider>
  );
}
