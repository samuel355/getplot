import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { useTheme } from "../../src/constants/theme";
import { useCartStore } from "../../src/stores/cartStore";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function TabsLayout() {
  const { colors } = useTheme();
  const cartCount = useCartStore((state) => state.plots.length);
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primaryAccent,
        tabBarInactiveTintColor: colors.textMuted,
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.text,
        headerTitleStyle: { fontWeight: "700" },
        headerShadowVisible: false,
        tabBarLabelStyle: { fontSize: 10, fontWeight: "600", marginTop: 2 },
        tabBarItemStyle: { paddingTop: 7 },
        tabBarStyle: {
          position: "absolute",
          left: 12,
          right: 12,
          bottom: 8,
          height: 62 + insets.bottom,
          paddingBottom: Math.max(insets.bottom, 8),
          backgroundColor: colors.surface,
          borderTopWidth: 0,
          borderRadius: 22,
          shadowColor: colors.shadow,
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.18,
          shadowRadius: 18,
          elevation: 12,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name={color === colors.primaryAccent ? "home" : "home-outline"} size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="sites"
        options={{
          title: "Our Sites",
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name={color === colors.primaryAccent ? "map" : "map-outline"} size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="marketplace"
        options={{
          title: "Marketplace",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name={color === colors.primaryAccent ? "business" : "business-outline"} size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="cart"
        options={{
          title: "Cart",
          tabBarBadge: cartCount > 0 ? cartCount : undefined,
          tabBarBadgeStyle: {
            backgroundColor: colors.primaryAccent,
            color: colors.white,
            fontSize: 10,
          },
          tabBarIcon: ({ color, size }) => (
            <Ionicons name={color === colors.primaryAccent ? "cart" : "cart-outline"} size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name={color === colors.primaryAccent ? "person" : "person-outline"} size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
