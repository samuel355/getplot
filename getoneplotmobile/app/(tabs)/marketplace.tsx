import { useUser } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { FlatList, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { PropertyCard } from "../../src/components/PropertyCard";
import { FilterModal } from "../../src/components/FilterModal";
import { Badge } from "../../src/components/ui/Badge";
import { Button } from "../../src/components/ui/Button";
import { Loading } from "../../src/components/ui/Loading";
import { colors, fontSize, spacing, fontWeight, borderRadius } from "../../src/constants/theme";
import { usePropertyStore } from "../../src/stores/propertyStore";
import { Ionicons } from "@expo/vector-icons";

const SORT_OPTIONS = [
  { id: "newest", label: "Newest", emoji: "✨" },
  { id: "price-low", label: "Price ↑", emoji: "💰" },
  { id: "price-high", label: "Price ↓", emoji: "💎" },
];

export default function MarketplaceScreen() {
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
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.title}>Marketplace</Text>
            <Text style={styles.subtitle}>Find your perfect property</Text>
          </View>
          <Pressable style={styles.filterBtn} onPress={() => setFilterModalVisible(true)}>
            <Ionicons name="filter" size={20} color={colors.white} />
            <Text style={styles.filterBtnText}>Filters</Text>
          </Pressable>
        </View>
      </View>

      {/* Sort Filters */}
      <View style={styles.filtersWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filters}
          contentContainerStyle={styles.filtersContent}
        >
          {SORT_OPTIONS.map((opt) => (
            <Pressable
              key={opt.id}
              style={[styles.chip, filters.sortBy === opt.id && styles.chipActive]}
              onPress={() => {
                setFilters({ sortBy: opt.id });
                fetchProperties(1);
              }}
            >
              <Text style={styles.chipEmoji}>{opt.emoji}</Text>
              <Text style={[styles.chipText, filters.sortBy === opt.id && styles.chipTextActive]}>
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
          contentContainerStyle={styles.list}
          renderItem={({ item, index }) => (
            <View
              style={[
                styles.itemWrapper,
                index === filteredProperties.length - 1 && styles.lastItem,
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
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyEmoji}>🔍</Text>
              <Text style={styles.emptyText}>No properties match your filters.</Text>
              <Text style={styles.emptySubText}>Try adjusting your search</Text>
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
              <View style={styles.pagination}>
                <Pressable
                  disabled={currentPage <= 1}
                  style={[styles.pageBtn, currentPage <= 1 && styles.pageBtnDisabled]}
                  onPress={() => {
                    setPage(currentPage - 1);
                    fetchProperties(currentPage - 1);
                  }}
                >
                  <Text
                    style={[styles.pageBtnText, currentPage <= 1 && styles.pageBtnTextDisabled]}
                  >
                    ← Previous
                  </Text>
                </Pressable>
                <View style={styles.pageInfo}>
                  <Text style={styles.pageInfoText}>
                    Page {currentPage} of {totalPages}
                  </Text>
                </View>
                <Pressable
                  disabled={currentPage >= totalPages}
                  style={[styles.pageBtn, currentPage >= totalPages && styles.pageBtnDisabled]}
                  onPress={() => {
                    setPage(currentPage + 1);
                    fetchProperties(currentPage + 1);
                  }}
                >
                  <Text
                    style={[
                      styles.pageBtnText,
                      currentPage >= totalPages && styles.pageBtnTextDisabled,
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
    backgroundColor: colors.surface,
  },

  // Header
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
  },
  filterBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    gap: spacing.xs,
  },
  filterBtnText: {
    color: colors.white,
    fontWeight: fontWeight.semibold,
    fontSize: fontSize.sm,
  },

  // Filters
  filtersWrapper: {
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  filters: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  filtersContent: {
    gap: spacing.sm,
    paddingRight: spacing.lg,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.xs,
  },
  chipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipEmoji: {
    fontSize: 16,
  },
  chipText: {
    fontSize: fontSize.sm,
    color: colors.text,
    fontWeight: fontWeight.medium,
  },
  chipTextActive: {
    color: colors.white,
    fontWeight: fontWeight.semibold,
  },

  // Properties List
  list: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  itemWrapper: {
    marginBottom: spacing.md,
  },
  lastItem: {
    marginBottom: spacing.xl,
  },

  // Loading State
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  // Empty State
  emptyContainer: {
    alignItems: "center",
    paddingVertical: spacing.xxxl,
    marginTop: spacing.xxl,
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: spacing.md,
  },
  emptyText: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  emptySubText: {
    fontSize: fontSize.md,
    color: colors.textMuted,
  },

  // Pagination
  pagination: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    marginTop: spacing.lg,
  },
  pageBtn: {
    flex: 1,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.primary,
    alignItems: "center",
  },
  pageBtnDisabled: {
    backgroundColor: colors.surface,
    opacity: 0.5,
  },
  pageBtnText: {
    color: colors.white,
    fontWeight: fontWeight.semibold,
    fontSize: fontSize.sm,
  },
  pageBtnTextDisabled: {
    color: colors.textMuted,
  },
  pageInfo: {
    flex: 1,
    alignItems: "center",
    paddingVertical: spacing.md,
  },
  pageInfoText: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    fontWeight: fontWeight.medium,
  },
});
