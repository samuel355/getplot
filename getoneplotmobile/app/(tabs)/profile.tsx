import { useAuth, useUser } from '@clerk/clerk-expo';
import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Button } from '../../src/components/ui/Button';
import { colors, fontSize, spacing } from '../../src/constants/theme';
import { usePropertyStore } from '../../src/stores/propertyStore';

export default function ProfileScreen() {
  const { isSignedIn, signOut } = useAuth();
  const { user } = useUser();
  const router = useRouter();
  const favorites = usePropertyStore((s) => s.favorites);

  const role = (user?.publicMetadata?.role as string) || 'guest';
  const isAdmin = ['admin', 'sysadmin', 'chief', 'chief_asst'].includes(role);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {isSignedIn ? (
        <>
          <View style={styles.card}>
            <Text style={styles.name}>
              {user?.fullName || user?.firstName || 'User'}
            </Text>
            <Text style={styles.email}>
              {user?.primaryEmailAddress?.emailAddress}
            </Text>
            <Text style={styles.role}>Role: {role}</Text>
          </View>

          <Text style={styles.section}>Saved Properties ({favorites.length})</Text>
          {favorites.length === 0 ? (
            <Text style={styles.muted}>No saved properties yet</Text>
          ) : (
            favorites.slice(0, 5).map((p) => (
              <Button
                key={p.id}
                title={p.title}
                variant="ghost"
                onPress={() => router.push(`/property/${p.id}`)}
              />
            ))
          )}

          {isAdmin && (
            <Button title="Admin Dashboard" onPress={() => router.push('/admin')} />
          )}

          <Button title="Contact Us" variant="outline" onPress={() => router.push('/contact')} />
          <Button
            title="Sign Out"
            variant="outline"
            onPress={() => signOut()}
          />
        </>
      ) : (
        <>
          <Text style={styles.guestTitle}>Guest</Text>
          <Text style={styles.muted}>Sign in to buy plots, save favorites, and more.</Text>
          <Button title="Sign In" onPress={() => router.push('/(auth)/sign-in')} />
          <Button title="Sign Up" variant="outline" onPress={() => router.push('/(auth)/sign-up')} />
          <Button title="Contact Us" variant="ghost" onPress={() => router.push('/contact')} />
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface },
  content: { padding: spacing.lg },
  card: {
    backgroundColor: colors.primary,
    borderRadius: 16,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  name: { fontSize: fontSize.xl, fontWeight: '800', color: colors.white },
  email: { color: 'rgba(255,255,255,0.85)', marginTop: 4 },
  role: { color: 'rgba(255,255,255,0.7)', marginTop: 8, fontSize: fontSize.sm },
  section: { fontWeight: '700', fontSize: fontSize.lg, marginBottom: spacing.sm },
  muted: { color: colors.textMuted, marginBottom: spacing.lg },
  guestTitle: { fontSize: fontSize.xxl, fontWeight: '800', color: colors.primary },
});
