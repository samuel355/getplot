import { Image } from "expo-image";
import { memo } from "react";
import { Pressable, StyleSheet, Text, View, type TextStyle } from "react-native";
import { useTheme } from "../constants/theme";
import { resolveImageUrl } from "../lib/images";
import { formatGhs } from "../lib/plotService";
import type { Property } from "../types/property";
import { Badge } from "./ui/Badge";
import { Ionicons } from "@expo/vector-icons";

type Props = {
  property: Property;
  onPress: () => void;
  favorited?: boolean;
  onFavoritPress?: () => void;
};

export const PropertyCard = memo(function PropertyCard({
  property,
  onPress,
  favorited,
  onFavoritPress,
}: Props) {
  const { colors, spacing, borderRadius, fontWeight, fontSize } = useTheme();
  const image = property.images?.[0];
  const price =
    property.listing_type === "rent" || property.listing_type === "airbnb"
      ? property.rental_price
      : property.price;

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
      </View>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  card: {
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
  },
  image: {
    width: "100%",
    height: "100%",
  },
  badgeContainer: {
    position: "absolute",
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
});
