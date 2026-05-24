import { Image } from "expo-image";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors, fontSize, spacing, fontWeight, borderRadius, shadows } from "../constants/theme";
import { resolveImageUrl } from "../lib/images";
import { formatGhs } from "../lib/plotService";
import { Badge } from "./ui/Badge";
import type { Property } from "../types/property";

type Props = {
  property: Property;
  onPress: () => void;
  compact?: boolean;
  favorited?: boolean;
  onFavoritPress?: () => void;
};

export function PropertyCard({ property, onPress, compact, favorited, onFavoritPress }: Props) {
  const image = resolveImageUrl(property.images?.[0]);
  const price =
    property.listing_type === "rent" || property.listing_type === "airbnb"
      ? property.rental_price
      : property.price;

  const listingTypeLabel =
    property.listing_type === "sale"
      ? "For Sale"
      : property.listing_type === "rent"
        ? "For Rent"
        : property.listing_type === "airbnb"
          ? "Short-term"
          : "Available";

  return (
    <Pressable
      style={[styles.card, compact && styles.compact]}
      onPress={onPress}
      android_ripple={{ color: "rgba(0,0,0,0.05)" }}
    >
      {/* Image Container */}
      <View style={[styles.imageContainer, compact && styles.imageContainerCompact]}>
        <Image
          source={image ? { uri: image } : undefined}
          style={styles.image}
          contentFit="cover"
          placeholder="$7Dv.}"
        />
        {/* Type Badge */}
        <View style={styles.badgeContainer}>
          <Badge label={property.type} variant="info" size="sm" />
        </View>

        {/* Favorite Button */}
        {onFavoritPress && (
          <Pressable
            style={styles.favoriteBtn}
            onPress={(e) => {
              e.stopPropagation();
              onFavoritPress();
            }}
          >
            <Text style={styles.favIcon}>{favorited ? "❤️" : "🤍"}</Text>
          </Pressable>
        )}
      </View>

      {/* Content */}
      <View style={styles.body}>
        <Text style={styles.title} numberOfLines={2}>
          {property.title}
        </Text>

        <Text style={styles.location} numberOfLines={1}>
          📍 {property.location}
        </Text>

        {/* Price */}
        <View style={styles.priceRow}>
          <Text style={styles.price}>{formatGhs(price || 0)}</Text>
          <Badge label={listingTypeLabel} variant="success" size="sm" />
        </View>

        {/* Features */}
        {!compact && (property.bedrooms || property.bathrooms) ? (
          <View style={styles.features}>
            {property.bedrooms ? (
              <View style={styles.featureItem}>
                <Text style={styles.featureIcon}>🛏️</Text>
                <Text style={styles.featureText}>{property.bedrooms} bed</Text>
              </View>
            ) : null}
            {property.bathrooms ? (
              <View style={styles.featureItem}>
                <Text style={styles.featureIcon}>🚿</Text>
                <Text style={styles.featureText}>{property.bathrooms} bath</Text>
              </View>
            ) : null}
          </View>
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
    shadowColor: colors.shadow,
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 2,
  },
  compact: {
    width: 280,
    marginRight: spacing.md,
    marginBottom: 0,
  },
  imageContainer: {
    position: "relative",
    height: 180,
    overflow: "hidden",
  },
  imageContainerCompact: {
    height: 140,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  badgeContainer: {
    position: "absolute",
    top: spacing.md,
    left: spacing.md,
  },
  favoriteBtn: {
    position: "absolute",
    top: spacing.md,
    right: spacing.md,
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
    backgroundColor: colors.white,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: colors.shadow,
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  favIcon: {
    fontSize: 20,
  },
  body: {
    padding: spacing.md,
  },
  title: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  location: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    marginBottom: spacing.md,
  },
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  price: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.primary,
  },
  features: {
    flexDirection: "row",
    gap: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  featureIcon: {
    fontSize: 16,
  },
  featureText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    fontWeight: fontWeight.medium,
  },
});
