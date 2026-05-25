import { useUser } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  type TextStyle,
} from "react-native";
import { Button } from "../../src/components/ui/Button";
import { Input } from "../../src/components/ui/Input";
import { useTheme } from "../../src/constants/theme";
import { saveProperty, uploadPropertyImages } from "../../src/lib/propertyService";
import { usePropertyStore } from "../../src/stores/propertyStore";
import type { Property } from "../../src/types/property";

const PROPERTY_CATEGORIES = [
  { label: "House", value: "house" },
  { label: "Land", value: "land" },
];

const HOUSE_SUB_TYPES = [
  { label: "Chamber & Hall", value: "chamber_and_hall" },
  { label: "Single Room", value: "single_room" },
  { label: "Self Contained", value: "self_contained" },
  { label: "Apartment", value: "apartment" },
  { label: "Duplex", value: "duplex" },
  { label: "Mansion", value: "mansion" },
];

const LISTING_TYPES = [
  { label: "For Sale", value: "sale" },
  { label: "For Rent", value: "rent" },
  { label: "Airbnb", value: "airbnb" },
];

const REGIONS = [
  "Ahafo",
  "Ashanti",
  "Bono",
  "Bono East",
  "Central",
  "Eastern",
  "Greater Accra",
  "North East",
  "Northern",
  "Oti",
  "Savannah",
  "Upper East",
  "Upper West",
  "Volta",
  "Western",
  "Western North",
];

export default function ManagePropertyScreen() {
  const { colors, spacing, borderRadius, fontWeight, fontSize } = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useUser();
  const router = useRouter();
  const { fetchPropertyById } = usePropertyStore();

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [images, setImages] = useState<{ uri: string }[]>([]);
  const [formData, setFormData] = useState<Partial<Property>>({
    title: "",
    type: "house",
    property_type: "",
    listing_type: "sale",
    price: 0,
    rental_price: 0,
    location: "",
    address: "",
    region: "Greater Accra",
    size: "",
    bedrooms: 0,
    bathrooms: 0,
    description: "",
    features: [],
  });

  useEffect(() => {
    if (id) {
      loadProperty(id);
    }
  }, [id]);

  const loadProperty = async (propId: string) => {
    setFetching(true);
    const prop = await fetchPropertyById(propId);
    if (prop) {
      setFormData(prop);
      if (prop.images) {
        setImages(prop.images.map((img) => ({ uri: img })));
      }
    }
    setFetching(false);
  };

  const updateType = (type: string) => {
    if (type === "land") {
      setFormData({
        ...formData,
        type,
        property_type: "sale",
        listing_type: "sale",
      });
    } else {
      setFormData({ ...formData, type, property_type: "" });
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.8,
    });

    if (!result.canceled) {
      const newImages = result.assets.map((asset) => ({ uri: asset.uri }));
      setImages([...images, ...newImages]);
    }
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    const isLand = formData.type === "land";
    const isRent = formData.listing_type === "rent" || formData.listing_type === "airbnb";

    if (!formData.title || !formData.location || (!isLand && !formData.property_type)) {
      Alert.alert("Error", "Please fill in all required fields.");
      return;
    }

    const priceToCheck = isRent ? formData.rental_price : formData.price;
    if (!priceToCheck) {
      Alert.alert("Error", "Please enter a valid price.");
      return;
    }

    if (images.length === 0) {
      Alert.alert("Error", "Please add at least one image.");
      return;
    }

    setLoading(true);
    try {
      const uploadedUrls = await uploadPropertyImages(images);
      const propertyToSave = {
        ...formData,
        images: uploadedUrls,
      };

      await saveProperty(propertyToSave, user?.id || "");

      // Refresh global store data
      usePropertyStore.getState().fetchProperties(1);
      if (user?.id) usePropertyStore.getState().fetchFavorites(user.id);

      Alert.alert("Success", "Property saved successfully.", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (e) {
      Alert.alert("Error", e instanceof Error ? e.message : "Failed to save property.");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const isHouse = formData.type === "house";
  const isRent = formData.listing_type === "rent" || formData.listing_type === "airbnb";

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={[styles.content, { padding: spacing.lg }]}
    >
      <Text
        style={[
          styles.header,
          {
            fontSize: fontSize.xxl,
            fontWeight: fontWeight.bold as TextStyle["fontWeight"],
            color: colors.primary,
            marginBottom: spacing.xl,
          },
        ]}
      >
        {id ? "Edit Property" : "Add New Property"}
      </Text>

      {/* Basic Info */}
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
          Property Category
        </Text>
        <View style={[styles.chipRow, { gap: spacing.sm, marginBottom: spacing.md }]}>
          {PROPERTY_CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat.value}
              style={[
                styles.chip,
                {
                  paddingHorizontal: 16,
                  paddingVertical: 8,
                  borderRadius: borderRadius.full,
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                },
                formData.type === cat.value && {
                  backgroundColor: colors.primary,
                  borderColor: colors.primary,
                },
              ]}
              onPress={() => updateType(cat.value)}
            >
              <Text
                style={[
                  styles.chipText,
                  {
                    fontSize: fontSize.sm,
                    color: colors.textSecondary,
                    fontWeight: fontWeight.medium as TextStyle["fontWeight"],
                  },
                  formData.type === cat.value && {
                    color: colors.white,
                    fontWeight: fontWeight.semibold as TextStyle["fontWeight"],
                  },
                ]}
              >
                {cat.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {isHouse && (
          <>
            <Text
              style={[
                styles.label,
                {
                  fontSize: fontSize.sm,
                  fontWeight: fontWeight.medium as TextStyle["fontWeight"],
                  color: colors.textSecondary,
                  marginBottom: spacing.sm,
                },
              ]}
            >
              House Sub-Type
            </Text>
            <View style={[styles.chipRow, { gap: spacing.sm, marginBottom: spacing.md }]}>
              {HOUSE_SUB_TYPES.map((sub) => (
                <TouchableOpacity
                  key={sub.value}
                  style={[
                    styles.chip,
                    {
                      paddingHorizontal: 16,
                      paddingVertical: 8,
                      borderRadius: borderRadius.full,
                      backgroundColor: colors.surface,
                      borderColor: colors.border,
                    },
                    formData.property_type === sub.value && {
                      backgroundColor: colors.primary,
                      borderColor: colors.primary,
                    },
                  ]}
                  onPress={() => setFormData({ ...formData, property_type: sub.value })}
                >
                  <Text
                    style={[
                      styles.chipText,
                      {
                        fontSize: fontSize.sm,
                        color: colors.textSecondary,
                        fontWeight: fontWeight.medium as TextStyle["fontWeight"],
                      },
                      formData.property_type === sub.value && {
                        color: colors.white,
                        fontWeight: fontWeight.semibold as TextStyle["fontWeight"],
                      },
                    ]}
                  >
                    {sub.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text
              style={[
                styles.label,
                {
                  fontSize: fontSize.sm,
                  fontWeight: fontWeight.medium as TextStyle["fontWeight"],
                  color: colors.textSecondary,
                  marginBottom: spacing.sm,
                },
              ]}
            >
              Listing Type
            </Text>
            <View style={[styles.chipRow, { gap: spacing.sm, marginBottom: spacing.md }]}>
              {LISTING_TYPES.map((item) => (
                <TouchableOpacity
                  key={item.value}
                  style={[
                    styles.chip,
                    {
                      paddingHorizontal: 16,
                      paddingVertical: 8,
                      borderRadius: borderRadius.full,
                      backgroundColor: colors.surface,
                      borderColor: colors.border,
                    },
                    formData.listing_type === item.value && {
                      backgroundColor: colors.primary,
                      borderColor: colors.primary,
                    },
                  ]}
                  onPress={() => setFormData({ ...formData, listing_type: item.value })}
                >
                  <Text
                    style={[
                      styles.chipText,
                      {
                        fontSize: fontSize.sm,
                        color: colors.textSecondary,
                        fontWeight: fontWeight.medium as TextStyle["fontWeight"],
                      },
                      formData.listing_type === item.value && {
                        color: colors.white,
                        fontWeight: fontWeight.semibold as TextStyle["fontWeight"],
                      },
                    ]}
                  >
                    {item.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}

        <Input
          label="Title"
          placeholder={
            isHouse ? "e.g. Modern 3-Bedroom House in East Legon" : "e.g. Prime Residential Plot"
          }
          value={formData.title}
          onChangeText={(v) => setFormData({ ...formData, title: v })}
        />
      </View>

      {/* Pricing */}
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
          Pricing (GHS)
        </Text>
        {!isRent ? (
          <Input
            label="Sale Price"
            placeholder="0.00"
            keyboardType="numeric"
            value={formData.price?.toString()}
            onChangeText={(v) => setFormData({ ...formData, price: Number(v) })}
          />
        ) : (
          <Input
            label="Rental Price"
            placeholder="0.00"
            keyboardType="numeric"
            value={formData.rental_price?.toString()}
            onChangeText={(v) => setFormData({ ...formData, rental_price: Number(v) })}
          />
        )}
      </View>

      {/* Location */}
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
          Location
        </Text>
        <Text
          style={[
            styles.label,
            {
              fontSize: fontSize.sm,
              fontWeight: fontWeight.medium as TextStyle["fontWeight"],
              color: colors.textSecondary,
              marginBottom: spacing.sm,
            },
          ]}
        >
          Region
        </Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={[styles.horizontalChips, { marginBottom: spacing.md }]}
        >
          {REGIONS.map((region) => (
            <TouchableOpacity
              key={region}
              style={[
                styles.chip,
                {
                  paddingHorizontal: 16,
                  paddingVertical: 8,
                  borderRadius: borderRadius.full,
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                  marginRight: spacing.sm,
                },
                formData.region === region && {
                  backgroundColor: colors.primary,
                  borderColor: colors.primary,
                },
              ]}
              onPress={() => setFormData({ ...formData, region })}
            >
              <Text
                style={[
                  styles.chipText,
                  {
                    fontSize: fontSize.sm,
                    color: colors.textSecondary,
                    fontWeight: fontWeight.medium as TextStyle["fontWeight"],
                  },
                  formData.region === region && {
                    color: colors.white,
                    fontWeight: fontWeight.semibold as TextStyle["fontWeight"],
                  },
                ]}
              >
                {region}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        <Input
          label="City / Area"
          placeholder="e.g. East Legon"
          value={formData.location}
          onChangeText={(v) => setFormData({ ...formData, location: v })}
        />
        <Input
          label="Detailed Address"
          placeholder="e.g. 123 Street Name"
          value={formData.address}
          onChangeText={(v) => setFormData({ ...formData, address: v })}
        />
      </View>

      {/* Details */}
      {isHouse && (
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
            Property Details
          </Text>
          <View style={{ flexDirection: "row" }}>
            <View style={{ flex: 1 }}>
              <Input
                label="Bedrooms"
                keyboardType="numeric"
                value={formData.bedrooms?.toString()}
                onChangeText={(v) => setFormData({ ...formData, bedrooms: Number(v) })}
              />
            </View>
            <View style={{ flex: 1, marginLeft: spacing.md }}>
              <Input
                label="Bathrooms"
                keyboardType="numeric"
                value={formData.bathrooms?.toString()}
                onChangeText={(v) => setFormData({ ...formData, bathrooms: Number(v) })}
              />
            </View>
          </View>
        </View>
      )}

      <View style={[styles.section, { marginBottom: spacing.xl }]}>
        <Input
          label="Size (Sq.ft / Acres)"
          placeholder={isHouse ? "e.g. 1500 sq ft" : "e.g. 2 acres"}
          value={formData.size?.toString()}
          onChangeText={(v) => setFormData({ ...formData, size: v })}
        />
      </View>

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
        <Input
          label="Property Description"
          multiline
          numberOfLines={4}
          placeholder="Describe your property..."
          value={formData.description}
          onChangeText={(v) => setFormData({ ...formData, description: v })}
        />
      </View>

      {/* Images */}
      <View style={[styles.section, { marginBottom: spacing.xl }]}>
        <View
          style={[
            styles.rowBetween,
            { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
          ]}
        >
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
            Images
          </Text>
          <TouchableOpacity onPress={pickImage}>
            <Text
              style={[
                styles.addText,
                { color: colors.primary, fontWeight: fontWeight.bold as TextStyle["fontWeight"] },
              ]}
            >
              + Add More
            </Text>
          </TouchableOpacity>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={[styles.imageList, { flexDirection: "row", marginTop: spacing.md }]}
        >
          {images.map((img, i) => (
            <View
              key={i}
              style={[styles.imageWrapper, { position: "relative", marginRight: spacing.md }]}
            >
              <Image
                source={{ uri: img.uri }}
                style={[
                  styles.previewImage,
                  { width: 100, height: 100, borderRadius: borderRadius.md },
                ]}
              />
              <TouchableOpacity
                style={[
                  styles.deleteImgBtn,
                  {
                    position: "absolute",
                    top: -5,
                    right: -5,
                    backgroundColor: colors.white,
                    borderRadius: 10,
                  },
                ]}
                onPress={() => removeImage(i)}
              >
                <Ionicons name="close-circle" size={20} color={colors.error} />
              </TouchableOpacity>
            </View>
          ))}
          {images.length === 0 && (
            <TouchableOpacity
              style={[
                styles.uploadPlaceholder,
                {
                  width: 100,
                  height: 100,
                  borderRadius: borderRadius.md,
                  borderWidth: 1,
                  borderColor: colors.border,
                  borderStyle: "dashed",
                  justifyContent: "center",
                  alignItems: "center",
                },
              ]}
              onPress={pickImage}
            >
              <Ionicons name="camera-outline" size={32} color={colors.textMuted} />
              <Text
                style={[
                  styles.placeholderText,
                  { fontSize: 10, color: colors.textMuted, marginTop: 4 },
                ]}
              >
                Tap to add images
              </Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      </View>

      <Button
        title={id ? "Update Property" : "Publish Property"}
        onPress={handleSave}
        loading={loading}
      />
      <View style={{ height: spacing.xxl }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: {},
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: {},
  section: {},
  sectionTitle: {},
  label: {},
  chipRow: { flexDirection: "row", flexWrap: "wrap" },
  horizontalChips: {},
  chip: {
    borderWidth: 1,
  },
  chipText: {},
  rowBetween: {},
  addText: {},
  imageList: {},
  imageWrapper: {},
  previewImage: {},
  deleteImgBtn: {},
  uploadPlaceholder: {},
  placeholderText: {},
});
