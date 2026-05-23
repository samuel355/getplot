import { FlatList, StyleSheet, Text, View } from 'react-native';
import { DEVELOPMENTS } from '../../../src/constants/developments';
import { colors, fontSize, spacing } from '../../../src/constants/theme';

export default function AdminPlotsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Development Sites</Text>
      <Text style={styles.sub}>
        Open any site map to review plots. Use the web dashboard at /dashboard for
        full table editing, interested clients, and user management.
      </Text>
      <FlatList
        data={DEVELOPMENTS}
        keyExtractor={(d) => d.slug}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <Text style={styles.name}>{item.title}</Text>
            <Text style={styles.table}>Table: {item.table}</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: spacing.lg, backgroundColor: colors.surface },
  title: { fontSize: fontSize.xl, fontWeight: '800', color: colors.primary },
  sub: { color: colors.textMuted, marginVertical: spacing.md, lineHeight: 22 },
  list: { paddingBottom: spacing.xl },
  row: {
    backgroundColor: colors.white,
    padding: spacing.md,
    borderRadius: 10,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  name: { fontWeight: '700' },
  table: { fontSize: fontSize.sm, color: colors.textMuted, marginTop: 4 },
});
