import { useAuth, useUser } from '@clerk/clerk-expo';
import { useNavigation, useRouter } from 'expo-router';
import { useLayoutEffect } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { ProfileGuestAuth } from '../../src/components/auth/ProfileGuestAuth';
import { Button } from '../../src/components/ui/Button';
import { colors, fontSize, spacing, borderRadius } from '../../src/constants/theme';
import { usePropertyStore } from '../../src/stores/propertyStore';

export default function ProfileScreen() {
  const { isSignedIn, signOut } = useAuth();
  const { user } = useUser();
  const router = useRouter();
  const navigation = useNavigation();
  const favorites = usePropertyStore((s) => s.favorites);

  const role = (user?.publicMetadata?.role as string) || 'guest';
  const isAdmin = ['admin', 'sysadmin', 'chief', 'chief_asst'].includes(role);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: isSignedIn,
      title: 'Profile',
    });
  }, [isSignedIn, navigation]);

  if (!isSignedIn) {
    return <ProfileGuestAuth />;
  }

  return (
    <ScrollView style={viewStyles.container} contentContainerStyle={viewStyles.content}>
      <View style={viewStyles.card}>
        <View style={viewStyles.avatar}>
          <Text style={textStyles.avatarText}>
            {(user?.firstName?.[0] || user?.emailAddresses?.[0]?.emailAddress?.[0] || 'U').toUpperCase()}
          </Text>
        </View>
        <Text style={textStyles.name}>{user?.fullName || user?.firstName || 'User'}</Text>
        <Text style={textStyles.email}>{user?.primaryEmailAddress?.emailAddress}</Text>
        <View style={viewStyles.rolePill}>
          <Text style={textStyles.role}>{role.replace(/_/g, ' ')}</Text>
        </View>
      </View>

      <Text style={textStyles.section}>Saved properties ({favorites.length})</Text>
      {favorites.length === 0 ? (
        <Text style={textStyles.muted}>No saved properties yet</Text>
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

      {isAdmin ? (
        <Button title="Admin dashboard" onPress={() => router.push('/admin')} />
      ) : null}

      <Button title="Contact us" variant="outline" onPress={() => router.push('/contact')} />
      <Button
        title="Sign out"
        variant="outline"
        onPress={async () => {
          await signOut();
        }}
      />
    </ScrollView>
  );
}

const viewStyles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface },
  content: { padding: spacing.lg, paddingBottom: spacing.xxxl },
  card: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    marginBottom: spacing.lg,
    alignItems: 'center',
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  rolePill: {
    marginTop: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
});

const textStyles = StyleSheet.create({
  avatarText: { fontSize: fontSize.xxl, fontWeight: '800', color: colors.white },
  name: { fontSize: fontSize.xl, fontWeight: '800', color: colors.white },
  email: { color: 'rgba(255,255,255,0.85)', marginTop: 4, fontSize: fontSize.sm },
  role: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: fontSize.xs,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  section: { fontWeight: '700', fontSize: fontSize.lg, marginBottom: spacing.sm, color: colors.text },
  muted: { color: colors.textMuted, marginBottom: spacing.lg },
});
