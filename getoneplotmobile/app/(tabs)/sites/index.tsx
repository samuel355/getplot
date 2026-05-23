import { useRouter } from 'expo-router';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { DEVELOPMENTS } from '../../../src/constants/developments';
import { colors, fontSize, spacing } from '../../../src/constants/theme';

export default function SitesScreen() {
  const router = useRouter();

  return (
    <FlatList
      data={DEVELOPMENTS}
      keyExtractor={(item) => item.slug}
      contentContainerStyle={styles.list}
      renderItem={({ item }) => (
        <Pressable
          style={styles.card}
          onPress={() => router.push(`/(tabs)/sites/${item.slug}`)}
        >
          <View style={styles.iconWrap}>
            <Ionicons name="map" size={28} color={colors.primary} />
          </View>
          <View style={styles.textWrap}>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.sub}>{item.subtitle}</Text>
          </View>
          <Ionicons name="chevron-forward" size={22} color={colors.textMuted} />
        </Pressable>
      )}
    />
  );
}

const styles = StyleSheet.create({
  list: { padding: spacing.md },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: 10,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  textWrap: { flex: 1 },
  title: { fontSize: fontSize.lg, fontWeight: '700', color: colors.text },
  sub: { fontSize: fontSize.sm, color: colors.textMuted, marginTop: 2 },
});
