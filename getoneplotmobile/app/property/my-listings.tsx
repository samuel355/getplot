import { useUser } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
  Image,
  type TextStyle,
} from "react-native";
import { useTheme } from "../../src/constants/theme";
import { Button } from "../../src/components/ui/Button";
import { fetchUserProperties, deleteProperty } from "../../src/lib/propertyService";
import { formatGhs } from "../../src/lib/plotService";
import type { Property } from "../../src/types/property";

export default function MyListingsScreen() {
  const { colors, spacing, borderRadius, fontWeight, fontSize } = useTheme();
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
      const data = await fetchUserProperties(user?.id || "");
      setProperties(data);
    } catch (e) {
      Alert.alert("Error", "Failed to load your listings.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (id: string) => {
    Alert.alert("Delete Listing", "Are you sure you want to delete this listing?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteProperty(id);
            setProperties(properties.filter((p) => p.id !== id));
          } catch (e) {
            Alert.alert("Error", "Failed to delete listing.");
          }
        },
      },
    ]);
  };

  const renderItem = ({ item }: { item: Property }) => (
    <Pressable
      style={[
        styles.card,
        {
          backgroundColor: colors.surface,
          borderRadius: borderRadius.lg,
          padding: spacing.md,
          borderColor: colors.border,
        },
      ]}
      onPress={() => router.push(`/property/${item.id}`)}
    >
      <View style={[styles.row, { gap: spacing.md }]}>
        <Image
          source={item.images?.[0] ? { uri: item.images[0] } : undefined}
          style={[
            styles.thumbnail,
            {
              width: 80,
              height: 80,
              borderRadius: borderRadius.md,
              backgroundColor: colors.surfaceAlt,
            },
          ]}
        />
        <View style={styles.info}>
          <Text
            style={[
              styles.title,
              {
                fontSize: fontSize.md,
                fontWeight: fontWeight.bold as TextStyle["fontWeight"],
                color: colors.text,
              },
            ]}
            numberOfLines={1}
          >
            {item.title}
          </Text>
          <Text style={[styles.location, { fontSize: fontSize.sm, color: colors.textMuted }]}>
            {item.location}
          </Text>
          <Text
            style={[
              styles.price,
              {
                fontSize: fontSize.md,
                fontWeight: fontWeight.bold as TextStyle["fontWeight"],
                color: colors.primary,
                marginTop: 4,
              },
            ]}
          >
            {formatGhs(item.price || item.rental_price || 0)}
          </Text>
          <View
            style={[
              styles.statusBadge,
              {
                alignSelf: "flex-start",
                paddingHorizontal: 8,
                paddingVertical: 2,
                borderRadius: borderRadius.full,
                marginTop: 4,
                backgroundColor: getStatusColor(item.status),
              },
            ]}
          >
            <Text
              style={[
                styles.statusText,
                {
                  fontSize: 10,
                  color: colors.white,
                  fontWeight: fontWeight.bold as TextStyle["fontWeight"],
                  textTransform: "uppercase",
                },
              ]}
            >
              {item.status || "pending"}
            </Text>
          </View>
        </View>
      </View>
      <View
        style={[
          styles.actions,
          {
            borderTopWidth: 1,
            borderTopColor: colors.borderLight,
            marginTop: spacing.md,
            paddingTop: spacing.sm,
            gap: spacing.md,
          },
        ]}
      >
        <Pressable style={styles.actionBtn} onPress={() => router.push(`/property/${item.id}`)}>
          <Ionicons name="eye-outline" size={18} color={colors.primaryAccent} />
          <Text
            style={[
              styles.viewBtnText,
              {
                color: colors.primaryAccent,
                fontWeight: fontWeight.medium as TextStyle["fontWeight"],
              },
            ]}
          >
            View
          </Text>
        </Pressable>
        <Pressable
          style={styles.actionBtn}
          onPress={(e) => {
            e.stopPropagation();
            router.push({ pathname: "/property/manage", params: { id: item.id } });
          }}
        >
          <Ionicons name="create-outline" size={18} color={colors.primary} />
          <Text
            style={[
              styles.editBtnText,
              { color: colors.primary, fontWeight: fontWeight.medium as TextStyle["fontWeight"] },
            ]}
          >
            Edit
          </Text>
        </Pressable>
        <Pressable
          style={styles.actionBtn}
          onPress={(e) => {
            e.stopPropagation();
            handleDelete(item.id);
          }}
        >
          <Ionicons name="trash-outline" size={18} color={colors.error} />
          <Text
            style={[
              styles.deleteBtnText,
              { color: colors.error, fontWeight: fontWeight.medium as TextStyle["fontWeight"] },
            ]}
          >
            Delete
          </Text>
        </Pressable>
      </View>
    </Pressable>
  );

  const getStatusColor = (status?: string) => {
    switch (status) {
      case "approved":
        return colors.success;
      case "rejected":
        return colors.error;
      default:
        return colors.warning;
    }
  };

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View
        style={[
          styles.header,
          {
            padding: spacing.lg,
            backgroundColor: colors.background,
            borderBottomColor: colors.border,
          },
        ]}
      >
        <Text
          style={[
            styles.headerTitle,
            {
              fontSize: fontSize.xl,
              fontWeight: fontWeight.bold as TextStyle["fontWeight"],
              color: colors.text,
            },
          ]}
        >
          My Listings
        </Text>
        <Pressable
          style={[
            styles.addBtn,
            {
              backgroundColor: colors.primary,
              paddingHorizontal: spacing.md,
              paddingVertical: spacing.sm,
              borderRadius: borderRadius.md,
              gap: spacing.xs,
            },
          ]}
          onPress={() => router.push("/property/manage")}
        >
          <Ionicons name="add" size={20} color={colors.white} />
          <Text
            style={[
              styles.addBtnText,
              {
                color: colors.white,
                fontWeight: fontWeight.semibold as TextStyle["fontWeight"],
                fontSize: fontSize.sm,
              },
            ]}
          >
            Add New
          </Text>
        </Pressable>
      </View>

      <FlatList
        data={properties}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={[styles.list, { padding: spacing.lg }]}
        ListEmptyComponent={
          <View style={[styles.empty, { paddingVertical: spacing.xxxl, marginTop: spacing.xxl }]}>
            <Ionicons name="business-outline" size={48} color={colors.textMuted} />
            <Text
              style={[
                styles.emptyText,
                { color: colors.textMuted, marginTop: spacing.md, textAlign: "center" },
              ]}
            >
              You haven't listed any properties yet.
            </Text>
            <Button
              title="Add Your First Listing"
              onPress={() => router.push("/property/manage")}
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
  container: { flex: 1 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
  },
  headerTitle: {},
  addBtn: {
    flexDirection: "row",
    alignItems: "center",
  },
  addBtnText: {},
  list: {},
  card: {
    marginBottom: 16,
    borderWidth: 1,
  },
  row: { flexDirection: "row" },
  thumbnail: {},
  info: { flex: 1, gap: 2 },
  title: {},
  location: {},
  price: {},
  statusBadge: {},
  statusText: {},
  actions: {
    flexDirection: "row",
  },
  actionBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    paddingVertical: 8,
  },
  editBtnText: {},
  viewBtnText: {},
  deleteBtnText: {},
  empty: { alignItems: "center" },
  emptyText: {},
});
