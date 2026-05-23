import { Stack } from 'expo-router';
import { colors } from '../../../src/constants/theme';

export default function SitesStackLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.white },
        headerTintColor: colors.primary,
        headerTitleStyle: { fontWeight: '700' },
        contentStyle: { flex: 1 },
      }}
    >
      <Stack.Screen name="index" options={{ title: 'Our Sites' }} />
      <Stack.Screen
        name="[slug]"
        options={{
          title: 'Site Map',
          headerBackTitle: 'Sites',
        }}
      />
    </Stack>
  );
}
