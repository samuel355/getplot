import { useEffect } from "react";
import * as SplashScreen from "expo-splash-screen";
import { ClerkLoaded, ClerkProvider } from "@clerk/clerk-expo";
import { tokenCache } from "@clerk/clerk-expo/token-cache";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { colors, useTheme } from "../src/constants/theme";

// Keep the splash screen visible until we're done with app setup
SplashScreen.preventAutoHideAsync().catch(() => {
  // It's ok if this fails, the splash screen might already be hidden
});

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!;

/**
 * Mirrors web ClerkProvider (app/layout.jsx):
 * sign-in → /approval after auth; sign-out → home.
 */
function InnerLayout() {
  const { colors, isDark } = useTheme();

  // Hide the splash screen as soon as this actually mounts, i.e. right after
  // ClerkLoaded resolves — event-driven instead of a fixed timer, so we never wait
  // longer than necessary and never hide early onto a blank screen if auth is slow.
  useEffect(() => {
    SplashScreen.hideAsync().catch(() => {});
  }, []);

  return (
    <>
      <StatusBar style={isDark ? "light" : "dark"} />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text,
          headerTitleStyle: { fontWeight: "700" },
          headerShadowVisible: false,
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(protected)" options={{ headerShown: false }} />
        <Stack.Screen name="approval" options={{ title: "Approval", headerShown: false }} />
        <Stack.Screen
          name="plot/interest"
          options={{ title: "Express Interest", headerBackTitle: "Back" }}
        />
        <Stack.Screen
          name="property/[id]"
          options={{ title: "Property", headerBackTitle: "Back" }}
        />
        <Stack.Screen
          name="property/manage"
          options={{ title: "Manage Property", headerBackTitle: "Back" }}
        />
        <Stack.Screen
          name="property/my-listings"
          options={{ title: "My Listings", headerBackTitle: "Back" }}
        />
        <Stack.Screen name="contact" options={{ title: "Contact Us", headerBackTitle: "Back" }} />
        <Stack.Screen name="payment-success" options={{ title: "Success", headerShown: false }} />
        <Stack.Screen name="payment-error" options={{ title: "Error", headerShown: false }} />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  if (!publishableKey) {
    console.warn("Missing EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY");
  }

  return (
    <ClerkProvider publishableKey={publishableKey || ""} tokenCache={tokenCache}>
      <ClerkLoaded>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <SafeAreaProvider>
            <InnerLayout />
          </SafeAreaProvider>
        </GestureHandlerRootView>
      </ClerkLoaded>
    </ClerkProvider>
  );
}
