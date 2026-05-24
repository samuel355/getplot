import { useUser } from '@clerk/clerk-expo';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
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
} from 'react-native';
import { Button } from '../../src/components/ui/Button';
import { Input } from '../../src/components/ui/Input';
import { colors, fontSize, spacing, borderRadius, fontWeight } from '../../src/constants/theme';
import { saveProperty, uploadPropertyImages } from '../../src/lib/propertyService';
import { usePropertyStore } from '../../src/stores/propertyStore';
import type { Property } from '../../src/types/property';

const PROPERTY_TYPES = ['house', 'land', 'apartment', 'store'];
const LISTING_TYPES = [
  { label: 'For Sale', value: 'sale' },
  { label: 'For Rent', value: 'rent' },
  { label: 'Short-term', value: 'airbnb' },
];

const REGIONS = [
  'Greater Accra',
  'Ashanti',
  'Central',
  'Eastern',
  'Western',
  'Northern',
  'Volta',
];

export default function ManagePropertyScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useUser();
  const router = useRouter();
  const { fetchPropertyById } = usePropertyStore();

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [images, setImages] = useState<{ uri: string }[]>([]);
  const [formData, setFormData] = useState<Partial<Property>>({
    title: '',
    type: 'house',
    listing_type: 'sale',
    price: 0,
    rental_price: 0,
    location: '',
    address: '',
    region: 'Greater Accra',
    size: '',
    bedrooms: 0,
    bathrooms: 0,
    description: '',
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
    if (!formData.title || !formData.location || (formData.listing_type === 'sale' && !formData.price) || (formData.listing_type !== 'sale' && !formData.rental_price)) {
      Alert.alert('Error', 'Please fill in all required fields.');
      return;
    }

    if (images.length === 0) {
      Alert.alert('Error', 'Please add at least one image.');
      return;
    }

    setLoading(true);
    try {
      // 1. Upload Images
      const uploadedUrls = await uploadPropertyImages(images);

      // 2. Save Property
      const propertyToSave = {
        ...formData,
        images: uploadedUrls,
      };

      await saveProperty(propertyToSave, user?.id || '');
      Alert.alert('Success', 'Property saved successfully.', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (e) {
      Alert.alert('Error', e instanceof Error ? e.message : 'Failed to save property.');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.header}>{id ? 'Edit Property' : 'Add New Property'}</Text>

      {/* Basic Info */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Basic Information</Text>
        <Input
          label="Title"
          placeholder="e.g. Modern 3 Bedroom House"
          value={formData.title}
          onChangeText={(v) => setFormData({ ...formData, title: v })}
        />

        <Text style={styles.label}>Property Category</Text>
        <View style={styles.chipRow}>
          {PROPERTY_TYPES.map((type) => (
            <TouchableOpacity
              key={type}
              style={[styles.chip, formData.type === type && styles.chipActive]}
              onPress={() => setFormData({ ...formData, type })}
            >
              <Text style={[styles.chipText, formData.type === type && styles.chipTextActive]}>
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Listing Type</Text>
        <View style={styles.chipRow}>
          {LISTING_TYPES.map((item) => (
            <TouchableOpacity
              key={item.value}
              style={[styles.chip, formData.listing_type === item.value && styles.chipActive]}
              onPress={() => setFormData({ ...formData, listing_type: item.value })}
            >
              <Text style={[styles.chipText, formData.listing_type === item.value && styles.chipTextActive]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Pricing */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Pricing (GHS)</Text>
        {formData.listing_type === 'sale' ? (
          <Input
            label="Sale Price"
            placeholder="0.00"
            keyboardType="numeric"
            value={formData.price?.toString()}
            onChangeText={(v) => setFormData({ ...formData, price: Number(v) })}
          />
        ) : (
          <Input
            label="Rental Price (per month/day)"
            placeholder="0.00"
            keyboardType="numeric"
            value={formData.rental_price?.toString()}
            onChangeText={(v) => setFormData({ ...formData, rental_price: Number(v) })}
          />
        )}
      </View>

      {/* Location */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Location</Text>
        <Text style={styles.label}>Region</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalChips}>
          {REGIONS.map((region) => (
            <TouchableOpacity
              key={region}
              style={[styles.chip, formData.region === region && styles.chipActive, { marginRight: spacing.sm }]}
              onPress={() => setFormData({ ...formData, region })}
            >
              <Text style={[styles.chipText, formData.region === region && styles.chipTextActive]}>
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
      {formData.type !== 'land' && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Property Details</Text>
          <View style={styles.row}>
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
          <Input
            label="Size (Sq.ft)"
            keyboardType="numeric"
            value={formData.size?.toString()}
            onChangeText={(v) => setFormData({ ...formData, size: v })}
          />
        </View>
      )}

      {/* Description */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Description</Text>
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
      <View style={styles.section}>
        <View style={styles.rowBetween}>
          <Text style={styles.sectionTitle}>Images</Text>
          <TouchableOpacity onPress={pickImage}>
            <Text style={styles.addText}>+ Add More</Text>
          </TouchableOpacity>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imageList}>
          {images.map((img, i) => (
            <View key={i} style={styles.imageWrapper}>
              <Image source={{ uri: img.uri }} style={styles.previewImage} />
              <TouchableOpacity style={styles.deleteImgBtn} onPress={() => removeImage(i)}>
                <Ionicons name="close-circle" size={20} color={colors.error} />
              </TouchableOpacity>
            </View>
          ))}
          {images.length === 0 && (
            <TouchableOpacity style={styles.uploadPlaceholder} onPress={pickImage}>
              <Ionicons name="camera-outline" size={32} color={colors.textMuted} />
              <Text style={styles.placeholderText}>Tap to add images</Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      </View>

      <Button title={id ? "Update Property" : "Publish Property"} onPress={handleSave} loading={loading} />
      <View style={{ height: spacing.xxl }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.white },
  content: { padding: spacing.lg },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { fontSize: fontSize.xxl, fontWeight: fontWeight.bold, color: colors.primary, marginBottom: spacing.xl },
  section: { marginBottom: spacing.xl },
  sectionTitle: { fontSize: fontSize.lg, fontWeight: fontWeight.bold, color: colors.text, marginBottom: spacing.md },
  label: { fontSize: fontSize.sm, fontWeight: fontWeight.medium, color: colors.textSecondary, marginBottom: spacing.sm },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.md },
  horizontalChips: { marginBottom: spacing.md },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { fontSize: fontSize.sm, color: colors.textSecondary, fontWeight: fontWeight.medium },
  chipTextActive: { color: colors.white, fontWeight: fontWeight.semibold },
  row: { flexDirection: 'row' },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  addText: { color: colors.primary, fontWeight: fontWeight.bold },
  imageList: { flexDirection: 'row', marginTop: spacing.md },
  imageWrapper: { position: 'relative', marginRight: spacing.md },
  previewImage: { width: 100, height: 100, borderRadius: borderRadius.md },
  deleteImgBtn: { position: 'absolute', top: -5, right: -5, backgroundColor: colors.white, borderRadius: 10 },
  uploadPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: { fontSize: 10, color: colors.textMuted, marginTop: 4 },
});
