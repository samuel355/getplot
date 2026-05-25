import { useUser } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  Dimensions,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type TextStyle,
} from "react-native";
import { Button } from "../../src/components/ui/Button";
import { Input } from "../../src/components/ui/Input";
import { Loading } from "../../src/components/ui/Loading";
import { Badge } from "../../src/components/ui/Badge";
import { useTheme } from "../../src/constants/theme";
import { resolveImageUrl } from "../../src/lib/images";
import { formatGhs } from "../../src/lib/plotService";
import { notifyPropertyInterest } from "../../src/lib/api";
import { usePropertyStore } from "../../src/stores/propertyStore";

const { width } = Dimensions.get("window");

export default function PropertyDetailScreen() {
  const { colors, spacing, borderRadius, fontWeight, fontSize } = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useUser();
  const router = useRouter();
  const { selectedProperty, fetchPropertyById, toggleFavorite, isFavorite, loading } =
    usePropertyStore();

  const [inquiry, setInquiry] = useState({ name: "", email: "", phone: "", message: "" });
  const [submitting, setSubmitting] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  useEffect(() => {
    if (id) fetchPropertyById(id);
  }, [id]);

  if (loading && !selectedProperty) return <Loading />;
  const property = selectedProperty;
  if (!property) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorText, { color: colors.textMuted }]}>Property not found</Text>
        <Button title="Go Back" onPress={() => router.back()} variant="outline" />
      </View>
    );
  }

  const fav = isFavorite(property.id);
  const isOwner = user?.id === property.user_id;
  const price =
    property.listing_type === "rent" || property.listing_type === "airbnb"
      ? property.rental_price
      : property.price;

  const onFavorite = async () => {
    const result = await toggleFavorite(property.id, user?.id);
    if (!result.success && result.message) Alert.alert("Favorites", result.message);
  };

  const onEdit = () => {
    router.push({ pathname: "/property/manage", params: { id: property.id } });
  };

  const onDelete = () => {
    Alert.alert("Delete Listing", "Are you sure you want to delete this listing?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            const { deleteProperty } = await import("../../src/lib/propertyService");
            await deleteProperty(property.id);
            Alert.alert("Deleted", "Property listing removed.");
            router.back();
          } catch {
            Alert.alert("Error", "Failed to delete property.");
          }
        },
      },
    ]);
  };

  const onInquiry = async () => {
    if (!inquiry.name || !inquiry.email || !inquiry.message) {
      Alert.alert("Validation", "Please fill in your name, email, and message.");
      return;
    }
    setSubmitting(true);
    try {
      await notifyPropertyInterest({
        propertyId: property.id,
        name: inquiry.name,
        email: inquiry.email,
        phone: inquiry.phone,
        message: inquiry.message,
      });
      Alert.alert("Sent", "Your inquiry has been sent to the owner. They will contact you soon.");
      setInquiry({ name: "", email: "", phone: "", message: "" });
    } catch {
      Alert.alert("Error", "Could not send inquiry. Please try again later.");
    } finally {
      setSubmitting(false);
    }
  };

  const propertyImages = property.images?.length ? property.images : [null];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Image Gallery */}
        <View style={styles.galleryContainer}>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={(e) => {
              const x = e.nativeEvent.contentOffset.x;
              setActiveImageIndex(Math.round(x / width));
            }}
            scrollEventThrottle={16}
          >
            {propertyImages.map((img, i) => {
              const uri = resolveImageUrl(img);
              return (
                <Image
                  key={i}
                  source={uri ? { uri } : require("../../assets/images/placeholder.png")}
                  style={{ width, height: 320, backgroundColor: colors.surfaceAlt }}
                  contentFit="cover"
                />
              );
            })}
          </ScrollView>

          {/* Favorite Button */}
          <Pressable
            style={[
              styles.favBtn,
              { backgroundColor: colors.white, borderRadius: 20, padding: spacing.sm },
            ]}
            onPress={onFavorite}
          >
            <Ionicons name={fav ? "heart" : "heart-outline"} size={24} color={colors.error} />
          </Pressable>

          {/* Pagination Dots */}
          {propertyImages.length > 1 && (
            <View style={[styles.pagination, { bottom: 20, gap: 6 }]}>
              {propertyImages.map((_, i) => (
                <View
                  key={i}
                  style={[
                    styles.dot,
                    { backgroundColor: "rgba(255,255,255,0.5)" },
                    activeImageIndex === i && { backgroundColor: colors.white, width: 20 },
                  ]}
                />
              ))}
            </View>
          )}
        </View>

        <View style={[styles.content, { padding: spacing.lg }]}>
          {/* Header Info */}
          <View style={[styles.headerInfo, { marginBottom: spacing.xl }]}>
            <View style={[styles.typeRow, { gap: spacing.sm, marginBottom: spacing.sm }]}>
              <Badge content={property.type} variant="secondary" />
              {property.listing_type && (
                <Badge
                  content={property.listing_type === "sale" ? "For Sale" : "For Rent"}
                  variant="primary"
                />
              )}
            </View>
            <Text
              style={[
                styles.title,
                {
                  fontSize: 24,
                  fontWeight: fontWeight.bold as TextStyle["fontWeight"],
                  color: colors.text,
                  marginBottom: spacing.xs,
                },
              ]}
            >
              {property.title}
            </Text>
            <View style={[styles.locationRow, { gap: 4, marginBottom: spacing.md }]}>
              <Ionicons name="location-outline" size={16} color={colors.textMuted} />
              <Text
                style={[styles.locationText, { color: colors.textMuted, fontSize: fontSize.sm }]}
              >
                {property.location}
              </Text>
            </View>
            <Text
              style={[
                styles.priceText,
                {
                  fontSize: 28,
                  fontWeight: fontWeight.bold as TextStyle["fontWeight"],
                  color: colors.primary,
                },
              ]}
            >
              {formatGhs(price || 0)}
            </Text>
          </View>

          {/* Quick Stats */}
          {property.type !== "land" && (
            <View
              style={[
                styles.statsContainer,
                {
                  backgroundColor: colors.surface,
                  padding: spacing.md,
                  borderRadius: borderRadius.lg,
                  marginBottom: spacing.xl,
                },
              ]}
            >
              <View style={styles.statItem}>
                <Ionicons name="bed-outline" size={20} color={colors.primaryAccent} />
                <Text
                  style={[
                    styles.statLabel,
                    {
                      fontSize: 12,
                      fontWeight: fontWeight.semibold as TextStyle["fontWeight"],
                      color: colors.text,
                    },
                  ]}
                >
                  {property.bedrooms} Beds
                </Text>
              </View>
              <View
                style={[
                  styles.divider,
                  { backgroundColor: colors.border, marginHorizontal: spacing.sm },
                ]}
              />
              <View style={styles.statItem}>
                <Ionicons name="water-outline" size={20} color={colors.primaryAccent} />
                <Text
                  style={[
                    styles.statLabel,
                    {
                      fontSize: 12,
                      fontWeight: fontWeight.semibold as TextStyle["fontWeight"],
                      color: colors.text,
                    },
                  ]}
                >
                  {property.bathrooms} Baths
                </Text>
              </View>
              <View
                style={[
                  styles.divider,
                  { backgroundColor: colors.border, marginHorizontal: spacing.sm },
                ]}
              />
              <View style={styles.statItem}>
                <Ionicons name="resize-outline" size={20} color={colors.primaryAccent} />
                <Text
                  style={[
                    styles.statLabel,
                    {
                      fontSize: 12,
                      fontWeight: fontWeight.semibold as TextStyle["fontWeight"],
                      color: colors.text,
                    },
                  ]}
                >
                  {property.size} sqft
                </Text>
              </View>
            </View>
          )}

          {/* Description */}
          <View style={[styles.section, { marginBottom: spacing.xl }]}>
            <Text
              style={[
                styles.sectionTitle,
                {
                  fontSize: fontSize.lg,
                  fontWeight: fontWeight.bold as TextStyle["fontWeight"],
                  color: colors.text,
                  marginBottom: spacing.md,
                },
              ]}
            >
              Description
            </Text>
            <Text
              style={[
                styles.descriptionText,
                { fontSize: fontSize.md, color: colors.textSecondary, lineHeight: 24 },
              ]}
            >
              {property.description || "No description provided for this property."}
            </Text>
          </View>

          {/* Features Grid */}
          {property.features?.length ? (
            <View style={[styles.section, { marginBottom: spacing.xl }]}>
              <Text
                style={[
                  styles.sectionTitle,
                  {
                    fontSize: fontSize.lg,
                    fontWeight: fontWeight.bold as TextStyle["fontWeight"],
                    color: colors.text,
                    marginBottom: spacing.md,
                  },
                ]}
              >
                Key Features
              </Text>
              <View style={[styles.featuresGrid, { gap: spacing.md }]}>
                {property.features.map((feature, i) => (
                  <View key={i} style={[styles.featureItem, { gap: 6, width: (width - 60) / 2 }]}>
                    <Ionicons name="checkmark-circle" size={18} color={colors.success} />
                    <Text
                      style={[
                        styles.featureText,
                        { fontSize: fontSize.sm, color: colors.textSecondary },
                      ]}
                    >
                      {feature}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          ) : null}

          {/* Owner Actions */}
          {isOwner && (
            <View
              style={[
                styles.ownerSection,
                {
                  padding: spacing.lg,
                  backgroundColor: colors.surface,
                  borderRadius: borderRadius.lg,
                  borderColor: colors.border,
                  marginBottom: spacing.xl,
                },
              ]}
            >
              <Text
                style={[
                  styles.ownerSectionTitle,
                  {
                    fontSize: fontSize.md,
                    fontWeight: fontWeight.bold as TextStyle["fontWeight"],
                    color: colors.text,
                    marginBottom: spacing.md,
                  },
                ]}
              >
                Listing Management
              </Text>
              <View style={styles.ownerActionsRow}>
                <Button
                  title="Edit Property"
                  variant="outline"
                  onPress={onEdit}
                  style={{ flex: 1, marginRight: spacing.sm }}
                  size="md"
                />
                <Button
                  title="Delete"
                  variant="danger"
                  onPress={onDelete}
                  style={{ flex: 1 }}
                  size="md"
                />
              </View>
            </View>
          )}

          {/* Contact Form */}
          {!isOwner && (
            <View
              style={[
                styles.inquiryCard,
                {
                  backgroundColor: colors.surface,
                  borderRadius: borderRadius.xl,
                  padding: spacing.xl,
                  borderColor: colors.border,
                },
              ]}
            >
              <Text
                style={[
                  styles.inquiryTitle,
                  {
                    fontSize: fontSize.lg,
                    fontWeight: fontWeight.bold as TextStyle["fontWeight"],
                    color: colors.text,
                  },
                ]}
              >
                Interested in this property?
              </Text>
              <Text
                style={[
                  styles.inquirySubtitle,
                  { fontSize: fontSize.sm, color: colors.textMuted, marginBottom: spacing.xl },
                ]}
              >
                Send a message to the owner
              </Text>

              <View style={[styles.form, { gap: spacing.sm }]}>
                <Input
                  label="Full Name"
                  placeholder="John Doe"
                  value={inquiry.name}
                  onChangeText={(v) => setInquiry({ ...inquiry, name: v })}
                />
                <Input
                  label="Email Address"
                  placeholder="john@example.com"
                  keyboardType="email-address"
                  value={inquiry.email}
                  onChangeText={(v) => setInquiry({ ...inquiry, email: v })}
                />
                <Input
                  label="Phone Number"
                  placeholder="024 XXX XXXX"
                  keyboardType="phone-pad"
                  value={inquiry.phone}
                  onChangeText={(v) => setInquiry({ ...inquiry, phone: v })}
                />
                <Input
                  label="Message"
                  placeholder="I'm interested in this property..."
                  multiline
                  numberOfLines={4}
                  value={inquiry.message}
                  onChangeText={(v) => setInquiry({ ...inquiry, message: v })}
                  style={{ minHeight: 100 }}
                />
                <Button title="Send Message" onPress={onInquiry} loading={submitting} fullWidth />
              </View>
            </View>
          )}

          <View style={{ height: spacing.xxl }} />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  errorText: {},
  galleryContainer: { position: "relative" },
  favBtn: {
    position: "absolute",
    top: 50,
    right: 20,
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  pagination: {
    position: "absolute",
    flexDirection: "row",
    alignSelf: "center",
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  content: {},
  headerInfo: {},
  typeRow: { flexDirection: "row" },
  title: {},
  locationRow: { flexDirection: "row", alignItems: "center" },
  locationText: {},
  priceText: {},
  statsContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  statItem: { flex: 1, alignItems: "center", gap: 4 },
  statLabel: {},
  divider: { width: 1, height: 30 },
  section: {},
  sectionTitle: {},
  descriptionText: {},
  featuresGrid: { flexDirection: "row", flexWrap: "wrap" },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  featureText: {},
  ownerSection: {
    borderWidth: 1,
  },
  ownerSectionTitle: {},
  ownerActionsRow: { flexDirection: "row" },
  inquiryCard: {
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  inquiryTitle: {},
  inquirySubtitle: {},
  form: {},
});
