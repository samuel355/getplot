import { Stack } from "expo-router";
<<<<<<< HEAD
import { colors } from "../../../src/constants/theme";

export default function SitesStackLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.white },
        headerTintColor: colors.primary,
        headerTitleStyle: { fontWeight: "700" },
        contentStyle: { flex: 1 },
=======
import { useTheme } from "../../../src/constants/theme";

export default function SitesStackLayout() {
  const { colors } = useTheme();

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.text,
        headerTitleStyle: { fontWeight: "700" },
        contentStyle: { flex: 1, backgroundColor: colors.background },
>>>>>>> mobile
      }}
    >
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen
        name="[slug]"
        options={{
          title: "Site Map",
          headerBackTitle: "Sites",
        }}
      />
    </Stack>
  );
}
