import { useUser } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
<<<<<<< HEAD
import { FlatList, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { PropertyCard } from "../../src/components/PropertyCard";
import { Badge } from "../../src/components/ui/Badge";
import { Card } from "../../src/components/ui/Card";
import { Loading } from "../../src/components/ui/Loading";
import { colors, fontSize, spacing, fontWeight, borderRadius } from "../../src/constants/theme";
import { usePropertyStore } from "../../src/stores/propertyStore";
=======
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
>>>>>>> mobile

const SORT_OPTIONS = [
  { id: "newest", label: "Newest", emoji: "✨" },
  { id: "price-low", label: "Price ↑", emoji: "💰" },
  { id: "price-high", label: "Price ↓", emoji: "💎" },
];

export default function MarketplaceScreen() {
<<<<<<< HEAD
  const router = useRouter();
  const { user } = useUser();
=======
  const { colors, spacing, borderRadius, fontWeight, fontSize } = useTheme();
  const router = useRouter();
  const { user } = useUser();
  const [filterModalVisible, setFilterModalVisible] = useState(false);
>>>>>>> mobile
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

<<<<<<< HEAD
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Marketplace</Text>
        <Text style={styles.subtitle}>Find your perfect property</Text>
      </View>

      {/* Sort Filters */}
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
=======
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
>>>>>>> mobile

      {/* Properties List */}
      {loading && !filteredProperties.length ? (
        <View style={styles.loadingContainer}>
          <Loading />
        </View>
      ) : (
        <FlatList
          data={filteredProperties}
          keyExtractor={(item) => item.id}
<<<<<<< HEAD
          contentContainerStyle={styles.list}
=======
          contentContainerStyle={[styles.list, { padding: spacing.lg }]}
>>>>>>> mobile
          renderItem={({ item, index }) => (
            <View
              style={[
                styles.itemWrapper,
<<<<<<< HEAD
                index === filteredProperties.length - 1 && styles.lastItem,
=======
                { marginBottom: spacing.md },
                index === filteredProperties.length - 1 && { marginBottom: spacing.xl },
>>>>>>> mobile
              ]}
            >
              <PropertyCard
                property={item}
                onPress={() => router.push(`/property/${item.id}`)}
<<<<<<< HEAD
                favorited={favorites?.includes(item.id)}
                onFavoritPress={() => {
                  // Toggle favorite logic here
                  console.log("Toggle favorite for:", item.id);
                }}
=======
                favorited={favorites?.some((f) => f.id === item.id)}
                onFavoritPress={() => handleToggleFavorite(item.id)}
>>>>>>> mobile
              />
            </View>
          )}
          ListEmptyComponent={
<<<<<<< HEAD
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyEmoji}>🔍</Text>
              <Text style={styles.emptyText}>No properties match your filters.</Text>
              <Text style={styles.emptySubText}>Try adjusting your search</Text>
=======
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
>>>>>>> mobile
            </View>
          }
          ListFooterComponent={
            totalPages > 1 ? (
<<<<<<< HEAD
              <View style={styles.pagination}>
                <Pressable
                  disabled={currentPage <= 1}
                  style={[styles.pageBtn, currentPage <= 1 && styles.pageBtnDisabled]}
=======
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
>>>>>>> mobile
                  onPress={() => {
                    setPage(currentPage - 1);
                    fetchProperties(currentPage - 1);
                  }}
                >
                  <Text
<<<<<<< HEAD
                    style={[styles.pageBtnText, currentPage <= 1 && styles.pageBtnTextDisabled]}
=======
                    style={[
                      styles.pageBtnText,
                      {
                        color: colors.textInverse,
                        fontWeight: fontWeight.semibold as TextStyle["fontWeight"],
                        fontSize: fontSize.sm,
                      },
                      currentPage <= 1 && { color: colors.textMuted },
                    ]}
>>>>>>> mobile
                  >
                    ← Previous
                  </Text>
                </Pressable>
<<<<<<< HEAD
                <View style={styles.pageInfo}>
                  <Text style={styles.pageInfoText}>
=======
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
>>>>>>> mobile
                    Page {currentPage} of {totalPages}
                  </Text>
                </View>
                <Pressable
                  disabled={currentPage >= totalPages}
<<<<<<< HEAD
                  style={[styles.pageBtn, currentPage >= totalPages && styles.pageBtnDisabled]}
=======
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
>>>>>>> mobile
                  onPress={() => {
                    setPage(currentPage + 1);
                    fetchProperties(currentPage + 1);
                  }}
                >
                  <Text
                    style={[
                      styles.pageBtnText,
<<<<<<< HEAD
                      currentPage >= totalPages && styles.pageBtnTextDisabled,
=======
                      {
                        color: colors.textInverse,
                        fontWeight: fontWeight.semibold as TextStyle["fontWeight"],
                        fontSize: fontSize.sm,
                      },
                      currentPage >= totalPages && { color: colors.textMuted },
>>>>>>> mobile
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
<<<<<<< HEAD
=======

      <FilterModal
        visible={filterModalVisible}
        onClose={() => setFilterModalVisible(false)}
        onApply={handleApplyFilters}
        initialFilters={filters}
      />
>>>>>>> mobile
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
<<<<<<< HEAD
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

  // Filters
  filters: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  filtersContent: {
    gap: spacing.sm,
    paddingRight: spacing.lg,
  },
=======
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
>>>>>>> mobile
  chip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 8,
<<<<<<< HEAD
    borderRadius: borderRadius.full,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.xs,
  },
  chipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
=======
    borderWidth: 1,
>>>>>>> mobile
  },
  chipEmoji: {
    fontSize: 16,
  },
<<<<<<< HEAD
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
=======
  chipText: {},
  list: {},
  itemWrapper: {},
>>>>>>> mobile
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
<<<<<<< HEAD

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
=======
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
>>>>>>> mobile
  pagination: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
<<<<<<< HEAD
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
=======
    borderTopWidth: 1,
  },
  pageBtn: {},
  pageBtnText: {},
  pageInfo: {},
  pageInfoText: {},
>>>>>>> mobile
});
