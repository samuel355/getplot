import { useUser } from '@clerk/clerk-expo';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
  Image,
} from 'react-native';
import { colors, fontSize, spacing, borderRadius, fontWeight } from '../../src/constants/theme';
import { fetchUserProperties, deleteProperty } from '../../src/lib/propertyService';
import { formatGhs } from '../../src/lib/plotService';
import type { Property } from '../../src/types/property';

export default function MyListingsScreen() {
  const { user } = useUser();
  const router = useRouter();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      loadProperties();
    }
  }, [user?.id]);

  const loadProperties = async () => {
    setLoading(true);
    try {
      const data = await fetchUserProperties(user?.id || '');
      setProperties(data);
    } catch (e) {
      Alert.alert('Error', 'Failed to load your listings.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (id: string) => {
    Alert.alert('Delete Listing', 'Are you sure you want to delete this listing?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteProperty(id);
            setProperties(properties.filter((p) => p.id !== id));
          } catch (e) {
            Alert.alert('Error', 'Failed to delete listing.');
          }
        },
      },
    ]);
  };

  const renderItem = ({ item }: { item: Property }) => (
    <View style={styles.card}>
      <View style={styles.row}>
        <Image
          source={item.images?.[0] ? { uri: item.images[0] } : undefined}
          style={styles.thumbnail}
        />
        <View style={styles.info}>
          <Text style={styles.title} numberOfLines={1}>{item.title}</Text>
          <Text style={styles.location}>{item.location}</Text>
          <Text style={styles.price}>
            {formatGhs(item.price || item.rental_price || 0)}
          </Text>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
            <Text style={styles.statusText}>{item.status || 'pending'}</Text>
          </View>
        </View>
      </View>
      <View style={styles.actions}>
        <Pressable
          style={[styles.actionBtn, styles.editBtn]}
          onPress={() => router.push({ pathname: '/property/manage', params: { id: item.id } })}
        >
          <Ionicons name="create-outline" size={18} color={colors.primary} />
          <Text style={styles.editBtnText}>Edit</Text>
        </Pressable>
        <Pressable
          style={[styles.actionBtn, styles.deleteBtn]}
          onPress={() => handleDelete(item.id)}
        >
          <Ionicons name="trash-outline" size={18} color={colors.error} />
          <Text style={styles.deleteBtnText}>Delete</Text>
        </Pressable>
      </View>
    </View>
  );

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'approved': return colors.success;
      case 'rejected': return colors.error;
      default: return colors.warning;
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Listings</Text>
        <Pressable
          style={styles.addBtn}
          onPress={() => router.push('/property/manage')}
        >
          <Ionicons name="add" size={20} color={colors.white} />
          <Text style={styles.addBtnText}>Add New</Text>
        </Pressable>
      </View>

      <FlatList
        data={properties}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="business-outline" size={48} color={colors.textMuted} />
            <Text style={styles.emptyText}>You haven't listed any properties yet.</Text>
            <Button
              title="Add Your First Listing"
              onPress={() => router.push('/property/manage')}
              style={{ marginTop: spacing.lg }}
            />
          </View>
        }
        onRefresh={loadProperties}
        refreshing={loading}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: { fontSize: fontSize.xl, fontWeight: fontWeight.bold, color: colors.text },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    gap: spacing.xs,
  },
  addBtnText: { color: colors.white, fontWeight: fontWeight.semibold, fontSize: fontSize.sm },
  list: { padding: spacing.lg },
  card: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  row: { flexDirection: 'row', gap: spacing.md },
  thumbnail: { width: 80, height: 80, borderRadius: borderRadius.md, backgroundColor: colors.surfaceAlt },
  info: { flex: 1, gap: 2 },
  title: { fontSize: fontSize.md, fontWeight: fontWeight.bold, color: colors.text },
  location: { fontSize: fontSize.sm, color: colors.textMuted },
  price: { fontSize: fontSize.md, fontWeight: fontWeight.bold, color: colors.primary, marginTop: 4 },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: borderRadius.full,
    marginTop: 4,
  },
  statusText: { fontSize: 10, color: colors.white, fontWeight: fontWeight.bold, textTransform: 'uppercase' },
  actions: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    marginTop: spacing.md,
    paddingTop: spacing.sm,
    gap: spacing.md,
  },
  actionBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, paddingVertical: 8 },
  editBtn: {},
  deleteBtn: {},
  editBtnText: { color: colors.primary, fontWeight: fontWeight.medium },
  deleteBtnText: { color: colors.error, fontWeight: fontWeight.medium },
  empty: { alignItems: 'center', paddingVertical: spacing.xxxl, marginTop: spacing.xxl },
  emptyText: { color: colors.textMuted, marginTop: spacing.md, textAlign: 'center' },
});
