import { Image } from "expo-image";
<<<<<<< HEAD
import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors, fontSize, spacing, fontWeight, borderRadius, shadows } from "../constants/theme";
import { resolveImageUrl } from "../lib/images";
import { formatGhs } from "../lib/plotService";
import { Badge } from "./ui/Badge";
import type { Property } from "../types/property";
=======
import { Pressable, StyleSheet, Text, View, type TextStyle } from "react-native";
import { useTheme } from "../constants/theme";
import { resolveImageUrl } from "../lib/images";
import { formatGhs } from "../lib/plotService";
import type { Property } from "../types/property";
import { Badge } from "./ui/Badge";
import { Ionicons } from "@expo/vector-icons";
>>>>>>> mobile

type Props = {
  property: Property;
  onPress: () => void;
<<<<<<< HEAD
  compact?: boolean;
=======
>>>>>>> mobile
  favorited?: boolean;
  onFavoritPress?: () => void;
};

<<<<<<< HEAD
export function PropertyCard({ property, onPress, compact, favorited, onFavoritPress }: Props) {
  const image = resolveImageUrl(property.images?.[0]);
=======
export function PropertyCard({ property, onPress, favorited, onFavoritPress }: Props) {
  const { colors, spacing, borderRadius, fontWeight, fontSize } = useTheme();
  const image = property.images?.[0];
>>>>>>> mobile
  const price =
    property.listing_type === "rent" || property.listing_type === "airbnb"
      ? property.rental_price
      : property.price;

<<<<<<< HEAD
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
=======
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: colors.surface,
          borderRadius: borderRadius.lg,
          borderColor: colors.border,
        },
        pressed && { opacity: 0.95, transform: [{ scale: 0.98 }] },
      ]}
    >
      <View style={styles.imageContainer}>
        <Image
          source={
            image ? { uri: resolveImageUrl(image) } : require("../../assets/images/placeholder.png")
          }
          style={[
            styles.image,
            {
              borderTopLeftRadius: borderRadius.lg,
              borderTopRightRadius: borderRadius.lg,
              backgroundColor: colors.surfaceAlt,
            },
          ]}
          contentFit="cover"
          transition={200}
        />
        <View
          style={[styles.badgeContainer, { top: spacing.sm, left: spacing.sm, gap: spacing.xs }]}
        >
          <Badge content={property.type} variant="secondary" />
          {property.listing_type && (
            <Badge
              content={property.listing_type === "sale" ? "For Sale" : "For Rent"}
              variant="primary"
            />
          )}
        </View>
        <Pressable
          style={[
            styles.favoriteBtn,
            {
              top: spacing.sm,
              right: spacing.sm,
              backgroundColor: "rgba(255,255,255,0.85)",
              borderRadius: borderRadius.full,
              padding: spacing.xs,
            },
          ]}
          onPress={(e) => {
            e.stopPropagation();
            onFavoritPress?.();
          }}
        >
          <Ionicons
            name={favorited ? "heart" : "heart-outline"}
            size={20}
            color={favorited ? colors.error : colors.textSecondary}
          />
        </Pressable>
      </View>

      <View style={[styles.content, { padding: spacing.md, gap: spacing.xs }]}>
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
          {property.title}
        </Text>
        <View style={styles.locationContainer}>
          <Ionicons name="location-outline" size={14} color={colors.textMuted} />
          <Text
            style={[styles.location, { fontSize: fontSize.sm, color: colors.textMuted }]}
            numberOfLines={1}
          >
            {property.location}
          </Text>
        </View>

        <View
          style={[
            styles.footer,
            {
              marginTop: spacing.xs,
              paddingTop: spacing.sm,
              borderTopWidth: 1,
              borderTopColor: colors.borderLight,
            },
          ]}
        >
          <Text
            style={[
              styles.price,
              {
                fontSize: fontSize.lg,
                fontWeight: fontWeight.extrabold as TextStyle["fontWeight"],
                color: colors.primary,
              },
            ]}
          >
            {formatGhs(price || 0)}
          </Text>
          {property.type !== "land" && (
            <View style={[styles.features, { gap: spacing.md }]}>
              {property.bedrooms ? (
                <View style={[styles.feature, { gap: spacing.xs }]}>
                  <Ionicons name="bed-outline" size={14} color={colors.textSecondary} />
                  <Text
                    style={[
                      styles.featureText,
                      {
                        fontSize: fontSize.sm,
                        color: colors.textSecondary,
                        fontWeight: fontWeight.medium as TextStyle["fontWeight"],
                      },
                    ]}
                  >
                    {property.bedrooms}
                  </Text>
                </View>
              ) : null}
              {property.bathrooms ? (
                <View style={[styles.feature, { gap: spacing.xs }]}>
                  <Ionicons name="water-outline" size={14} color={colors.textSecondary} />
                  <Text
                    style={[
                      styles.featureText,
                      {
                        fontSize: fontSize.sm,
                        color: colors.textSecondary,
                        fontWeight: fontWeight.medium as TextStyle["fontWeight"],
                      },
                    ]}
                  >
                    {property.bathrooms}
                  </Text>
                </View>
              ) : null}
            </View>
          )}
        </View>
>>>>>>> mobile
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
<<<<<<< HEAD
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
=======
    borderWidth: 1,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  imageContainer: {
    position: "relative",
    height: 180,
    width: "100%",
>>>>>>> mobile
  },
  image: {
    width: "100%",
    height: "100%",
  },
  badgeContainer: {
    position: "absolute",
<<<<<<< HEAD
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
=======
    flexDirection: "row",
  },
  favoriteBtn: {
    position: "absolute",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  content: {},
  title: {},
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  location: {
    flex: 1,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  price: {},
  features: {
    flexDirection: "row",
    alignItems: "center",
  },
  feature: {
    flexDirection: "row",
    alignItems: "center",
  },
  featureText: {},
>>>>>>> mobile
});
