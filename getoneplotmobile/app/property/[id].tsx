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
  Animated,
} from "react-native";
import { Button } from "../../src/components/ui/Button";
import { Input } from "../../src/components/ui/Input";
import { Loading } from "../../src/components/ui/Loading";
import { Badge } from "../../src/components/ui/Badge";
import { colors, fontSize, spacing, borderRadius, fontWeight } from "../../src/constants/theme";
import { resolveImageUrl } from "../../src/lib/images";
import { formatGhs } from "../../src/lib/plotService";
import { notifyPropertyInterest } from "../../src/lib/api";
import { usePropertyStore } from "../../src/stores/propertyStore";

const { width } = Dimensions.get("window");

export default function PropertyDetailScreen() {
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
      <View style={styles.center}>
        <Text style={styles.errorText}>Property not found</Text>
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
    <View style={styles.container}>
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
                  style={{ width, height: 320 }}
                  contentFit="cover"
                />
              );
            })}
          </ScrollView>

          {/* Favorite Button */}
          <Pressable style={styles.favBtn} onPress={onFavorite}>
            <Ionicons name={fav ? "heart" : "heart-outline"} size={24} color={colors.error} />
          </Pressable>
          {/* Pagination Dots */}
          {propertyImages.length > 1 && (
            <View style={styles.pagination}>
              {propertyImages.map((_, i) => (
                <View key={i} style={[styles.dot, activeImageIndex === i && styles.activeDot]} />
              ))}
            </View>
          )}
        </View>

        <View style={styles.content}>
          {/* Header Info */}
          <View style={styles.headerInfo}>
            <View style={styles.typeRow}>
              <Badge content={property.type} variant="secondary" />
              {property.listing_type && (
                <Badge
                  content={property.listing_type === "sale" ? "For Sale" : "For Rent"}
                  variant="primary"
                />
              )}
            </View>
            <Text style={styles.title}>{property.title}</Text>
            <View style={styles.locationRow}>
              <Ionicons name="location-outline" size={16} color={colors.textMuted} />
              <Text style={styles.locationText}>{property.location}</Text>
            </View>
            <Text style={styles.priceText}>{formatGhs(price || 0)}</Text>
          </View>

          {/* Quick Stats */}
          {property.type !== "land" && (
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Ionicons name="bed-outline" size={20} color={colors.primary} />
                <Text style={styles.statLabel}>{property.bedrooms} Beds</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.statItem}>
                <Ionicons name="water-outline" size={20} color={colors.primary} />
                <Text style={styles.statLabel}>{property.bathrooms} Baths</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.statItem}>
                <Ionicons name="resize-outline" size={20} color={colors.primary} />
                <Text style={styles.statLabel}>{property.size} sqft</Text>
              </View>
            </View>
          )}

          {/* Description */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.descriptionText}>
              {property.description || "No description provided for this property."}
            </Text>
          </View>

          {/* Features Grid */}
          {property.features?.length ? (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Key Features</Text>
              <View style={styles.featuresGrid}>
                {property.features.map((feature, i) => (
                  <View key={i} style={styles.featureItem}>
                    <Ionicons name="checkmark-circle" size={18} color={colors.success} />
                    <Text style={styles.featureText}>{feature}</Text>
                  </View>
                ))}
              </View>
            </View>
          ) : null}

          {/* Owner Actions */}
          {isOwner && (
            <View style={styles.ownerSection}>
              <Text style={styles.ownerSectionTitle}>Listing Management</Text>
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
            <View style={styles.inquiryCard}>
              <Text style={styles.inquiryTitle}>Interested in this property?</Text>
              <Text style={styles.inquirySubtitle}>Send a message to the owner</Text>

              <View style={styles.form}>
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
  container: { flex: 1, backgroundColor: colors.white },
  center: { flex: 1, justifyContent: "center", alignItems: "center", padding: spacing.xl },
  errorText: { marginBottom: spacing.lg, color: colors.textMuted, textAlign: "center" },

  galleryContainer: { position: "relative" },
  backBtn: {
    position: "absolute",
    top: 50,
    left: 20,
    backgroundColor: colors.white,
    borderRadius: 20,
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
  favBtn: {
    position: "absolute",
    top: 50,
    right: 20,
    backgroundColor: colors.white,
    borderRadius: 20,
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
    bottom: 20,
    flexDirection: "row",
    alignSelf: "center",
    gap: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(255,255,255,0.5)",
  },
  activeDot: {
    backgroundColor: colors.white,
    width: 20,
  },

  content: { padding: spacing.lg },
  headerInfo: { marginBottom: spacing.xl },
  typeRow: { flexDirection: "row", gap: spacing.sm, marginBottom: spacing.sm },
  title: {
    fontSize: 24,
    fontWeight: fontWeight.bold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  locationRow: { flexDirection: "row", alignItems: "center", gap: 4, marginBottom: spacing.md },
  locationText: { color: colors.textMuted, fontSize: fontSize.sm },
  priceText: {
    fontSize: 28,
    fontWeight: fontWeight.bold,
    color: colors.primary,
  },

  statsContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.xl,
  },
  statItem: { flex: 1, alignItems: "center", gap: 4 },
  statLabel: { fontSize: 12, fontWeight: fontWeight.semibold, color: colors.text },
  divider: { width: 1, height: 30, backgroundColor: colors.border, marginHorizontal: spacing.sm },

  section: { marginBottom: spacing.xl },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.text,
    marginBottom: spacing.md,
  },
  descriptionText: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    lineHeight: 24,
  },

  featuresGrid: { flexDirection: "row", flexWrap: "wrap", gap: spacing.md },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    width: (width - 60) / 2,
  },
  featureText: { fontSize: fontSize.sm, color: colors.textSecondary },

  ownerSection: {
    padding: spacing.lg,
    backgroundColor: "#f8fafc",
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.xl,
  },
  ownerSectionTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
    color: colors.text,
    marginBottom: spacing.md,
  },
  ownerActionsRow: { flexDirection: "row" },

  inquiryCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  inquiryTitle: { fontSize: fontSize.lg, fontWeight: fontWeight.bold, color: colors.text },
  inquirySubtitle: { fontSize: fontSize.sm, color: colors.textMuted, marginBottom: spacing.xl },
  form: { gap: spacing.sm },
});
