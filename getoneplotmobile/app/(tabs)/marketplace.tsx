import { useUser } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type TextStyle,
} from "react-native";
import { PropertyCard } from "../../src/components/PropertyCard";
import { FilterModal } from "../../src/components/FilterModal";
import { Button } from "../../src/components/ui/Button";
import { Loading } from "../../src/components/ui/Loading";
import { useTheme } from "../../src/constants/theme";
import { usePropertyStore } from "../../src/stores/propertyStore";
import { Ionicons } from "@expo/vector-icons";

const SORT_OPTIONS = [
  { id: "newest", label: "Newest", emoji: "✨" },
  { id: "price-low", label: "Price ↑", emoji: "💰" },
  { id: "price-high", label: "Price ↓", emoji: "💎" },
];

export default function MarketplaceScreen() {
  const { colors, spacing, borderRadius, fontWeight, fontSize } = useTheme();
  const router = useRouter();
  const { user } = useUser();
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const {
    filteredProperties,
    loading,
    filters,
    setFilters,
    fetchProperties,
    currentPage,
    totalPages,
    setPage,
    fetchFavorites,
    favorites,
  } = usePropertyStore();

  useEffect(() => {
    fetchProperties(1);
    if (user?.id) fetchFavorites(user.id);
  }, [user?.id]);

  const handleApplyFilters = (newFilters: any) => {
    setFilters(newFilters);
    fetchProperties(1);
  };

  const handleToggleFavorite = async (propertyId: string) => {
    await usePropertyStore.getState().toggleFavorite(propertyId, user?.id);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.surface }]}>
      {/* Header */}
      <View
        style={[
          styles.header,
          {
            backgroundColor: colors.background,
            borderBottomColor: colors.border,
            paddingHorizontal: spacing.lg,
            paddingTop: spacing.lg,
            paddingBottom: spacing.md,
          },
        ]}
      >
        <View style={styles.headerTop}>
          <View>
            <Text
              style={[
                styles.title,
                {
                  fontSize: fontSize.xl,
                  fontWeight: fontWeight.bold as TextStyle["fontWeight"],
                  color: colors.text,
                  marginBottom: spacing.xs,
                },
              ]}
            >
              Marketplace
            </Text>
            <Text style={[styles.subtitle, { fontSize: fontSize.sm, color: colors.textMuted }]}>
              Find your perfect property
            </Text>
          </View>
          <Pressable
            style={[
              styles.filterBtn,
              {
                backgroundColor: colors.primary,
                paddingHorizontal: spacing.md,
                paddingVertical: spacing.sm,
                borderRadius: borderRadius.md,
                gap: spacing.xs,
              },
            ]}
            onPress={() => setFilterModalVisible(true)}
          >
            <Ionicons name="filter" size={20} color={colors.textInverse} />
            <Text
              style={[
                styles.filterBtnText,
                {
                  color: colors.textInverse,
                  fontWeight: fontWeight.semibold as TextStyle["fontWeight"],
                  fontSize: fontSize.sm,
                },
              ]}
            >
              Filters
            </Text>
          </Pressable>
        </View>
      </View>

      {/* Sort Filters */}
      <View
        style={[
          styles.filtersWrapper,
          { backgroundColor: colors.background, borderBottomColor: colors.border },
        ]}
      >
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={[styles.filters, { paddingVertical: spacing.md }]}
          contentContainerStyle={[
            styles.filtersContent,
            { gap: spacing.sm, paddingHorizontal: spacing.lg },
          ]}
        >
          {SORT_OPTIONS.map((opt) => (
            <Pressable
              key={opt.id}
              style={[
                styles.chip,
                {
                  borderRadius: borderRadius.full,
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                  gap: spacing.xs,
                },
                filters.sortBy === opt.id && {
                  backgroundColor: colors.primary,
                  borderColor: colors.primary,
                },
              ]}
              onPress={() => {
                setFilters({ sortBy: opt.id });
                fetchProperties(1);
              }}
            >
              <Text style={styles.chipEmoji}>{opt.emoji}</Text>
              <Text
                style={[
                  styles.chipText,
                  {
                    fontSize: fontSize.sm,
                    color: colors.text,
                    fontWeight: fontWeight.medium as TextStyle["fontWeight"],
                  },
                  filters.sortBy === opt.id && {
                    color: colors.textInverse,
                    fontWeight: fontWeight.semibold as TextStyle["fontWeight"],
                  },
                ]}
              >
                {opt.label}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      {/* Properties List */}
      {loading && !filteredProperties.length ? (
        <View style={styles.loadingContainer}>
          <Loading />
        </View>
      ) : (
        <FlatList
          data={filteredProperties}
          keyExtractor={(item) => item.id}
          contentContainerStyle={[styles.list, { padding: spacing.lg }]}
          renderItem={({ item, index }) => (
            <View
              style={[
                styles.itemWrapper,
                { marginBottom: spacing.md },
                index === filteredProperties.length - 1 && { marginBottom: spacing.xl },
              ]}
            >
              <PropertyCard
                property={item}
                onPress={() => router.push(`/property/${item.id}`)}
                favorited={favorites?.some((f) => f.id === item.id)}
                onFavoritPress={() => handleToggleFavorite(item.id)}
              />
            </View>
          )}
          ListEmptyComponent={
            <View
              style={[
                styles.emptyContainer,
                { paddingVertical: spacing.xxxl, marginTop: spacing.xxl },
              ]}
            >
              <Text style={styles.emptyEmoji}>🔍</Text>
              <Text
                style={[
                  styles.emptyText,
                  {
                    fontSize: fontSize.lg,
                    fontWeight: fontWeight.bold as TextStyle["fontWeight"],
                    color: colors.text,
                    marginBottom: spacing.sm,
                  },
                ]}
              >
                No properties match your filters.
              </Text>
              <Text
                style={[styles.emptySubText, { fontSize: fontSize.md, color: colors.textMuted }]}
              >
                Try adjusting your search
              </Text>
              <Button
                title="Clear All Filters"
                onPress={() => {
                  setFilters({
                    propertyType: "all",
                    property_type: "all",
                    location: "all",
                    bedrooms: "any",
                    bathrooms: "any",
                    priceRange: [0, 10000000],
                  });
                  fetchProperties(1);
                }}
                variant="outline"
                style={{ marginTop: spacing.lg }}
              />
            </View>
          }
          ListFooterComponent={
            totalPages > 1 ? (
              <View
                style={[
                  styles.pagination,
                  {
                    paddingVertical: spacing.xl,
                    paddingHorizontal: spacing.lg,
                    gap: spacing.md,
                    backgroundColor: colors.background,
                    borderTopColor: colors.border,
                    marginTop: spacing.lg,
                  },
                ]}
              >
                <Pressable
                  disabled={currentPage <= 1}
                  style={[
                    styles.pageBtn,
                    {
                      flex: 1,
                      paddingVertical: spacing.md,
                      borderRadius: borderRadius.lg,
                      backgroundColor: colors.primary,
                      alignItems: "center",
                    },
                    currentPage <= 1 && { backgroundColor: colors.surface, opacity: 0.5 },
                  ]}
                  onPress={() => {
                    setPage(currentPage - 1);
                    fetchProperties(currentPage - 1);
                  }}
                >
                  <Text
                    style={[
                      styles.pageBtnText,
                      {
                        color: colors.textInverse,
                        fontWeight: fontWeight.semibold as TextStyle["fontWeight"],
                        fontSize: fontSize.sm,
                      },
                      currentPage <= 1 && { color: colors.textMuted },
                    ]}
                  >
                    ← Previous
                  </Text>
                </Pressable>
                <View style={[styles.pageInfo, { flex: 1, alignItems: "center" }]}>
                  <Text
                    style={[
                      styles.pageInfoText,
                      {
                        fontSize: fontSize.sm,
                        color: colors.textMuted,
                        fontWeight: fontWeight.medium as TextStyle["fontWeight"],
                      },
                    ]}
                  >
                    Page {currentPage} of {totalPages}
                  </Text>
                </View>
                <Pressable
                  disabled={currentPage >= totalPages}
                  style={[
                    styles.pageBtn,
                    {
                      flex: 1,
                      paddingVertical: spacing.md,
                      borderRadius: borderRadius.lg,
                      backgroundColor: colors.primary,
                      alignItems: "center",
                    },
                    currentPage >= totalPages && { backgroundColor: colors.surface, opacity: 0.5 },
                  ]}
                  onPress={() => {
                    setPage(currentPage + 1);
                    fetchProperties(currentPage + 1);
                  }}
                >
                  <Text
                    style={[
                      styles.pageBtnText,
                      {
                        color: colors.textInverse,
                        fontWeight: fontWeight.semibold as TextStyle["fontWeight"],
                        fontSize: fontSize.sm,
                      },
                      currentPage >= totalPages && { color: colors.textMuted },
                    ]}
                  >
                    Next →
                  </Text>
                </Pressable>
              </View>
            ) : null
          }
        />
      )}

      <FilterModal
        visible={filterModalVisible}
        onClose={() => setFilterModalVisible(false)}
        onApply={handleApplyFilters}
        initialFilters={filters}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    borderBottomWidth: 1,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {},
  subtitle: {},
  filterBtn: {
    flexDirection: "row",
    alignItems: "center",
  },
  filterBtnText: {},
  filtersWrapper: {
    borderBottomWidth: 1,
  },
  filters: {},
  filtersContent: {},
  chip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
  },
  chipEmoji: {
    fontSize: 16,
  },
  chipText: {},
  list: {},
  itemWrapper: {},
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyContainer: {
    alignItems: "center",
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    textAlign: "center",
  },
  emptySubText: {},
  pagination: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
  },
  pageBtn: {},
  pageBtnText: {},
  pageInfo: {},
  pageInfoText: {},
});
