import { Stack } from "expo-router";
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
