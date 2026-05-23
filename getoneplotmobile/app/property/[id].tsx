import { useUser } from '@clerk/clerk-expo';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Alert,
  Dimensions,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Button } from '../../src/components/ui/Button';
import { Input } from '../../src/components/ui/Input';
import { Loading } from '../../src/components/ui/Loading';
import { colors, fontSize, spacing } from '../../src/constants/theme';
import { resolveImageUrl } from '../../src/lib/images';
import { formatGhs } from '../../src/lib/plotService';
import { notifyPropertyInterest } from '../../src/lib/api';
import { usePropertyStore } from '../../src/stores/propertyStore';

export default function PropertyDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useUser();
  const router = useRouter();
  const { selectedProperty, fetchPropertyById, toggleFavorite, isFavorite, loading } =
    usePropertyStore();
  const [inquiry, setInquiry] = useState({ name: '', email: '', phone: '', message: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (id) fetchPropertyById(id);
  }, [id]);

  if (loading && !selectedProperty) return <Loading />;
  const property = selectedProperty;
  if (!property) {
    return (
      <View style={styles.center}>
        <Text>Property not found</Text>
        <Button title="Back" onPress={() => router.back()} />
      </View>
    );
  }

  const fav = isFavorite(property.id);
  const price =
    property.listing_type === 'rent' || property.listing_type === 'airbnb'
      ? property.rental_price
      : property.price;
  const width = Dimensions.get('window').width;

  const onFavorite = async () => {
    const result = await toggleFavorite(property.id, user?.id);
    if (!result.success && result.message) Alert.alert('Favorites', result.message);
  };

  const onInquiry = async () => {
    if (!inquiry.name || !inquiry.email || !inquiry.message) {
      Alert.alert('Validation', 'Fill name, email, and message');
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
      Alert.alert('Sent', 'Your inquiry has been sent to the owner.');
      setInquiry({ name: '', email: '', phone: '', message: '' });
    } catch {
      Alert.alert('Error', 'Could not send inquiry. Try again later.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false}>
        {(property.images?.length ? property.images : [null]).map((img, i) => {
          const uri = resolveImageUrl(img);
          return (
          <Image
            key={i}
            source={uri ? { uri } : undefined}
            style={{ width, height: 260 }}
            contentFit="cover"
          />
          );
        })}
      </ScrollView>

      <Pressable style={styles.favBtn} onPress={onFavorite}>
        <Ionicons name={fav ? 'heart' : 'heart-outline'} size={28} color={colors.error} />
      </Pressable>

      <View style={styles.body}>
        <Text style={styles.type}>{property.type}</Text>
        <Text style={styles.title}>{property.title}</Text>
        <Text style={styles.location}>{property.location}</Text>
        <Text style={styles.price}>{formatGhs(price || 0)}</Text>

        {(property.bedrooms || property.bathrooms) && (
          <Text style={styles.meta}>
            {property.bedrooms} bed · {property.bathrooms} bath · {property.size} sqft
          </Text>
        )}

        <Text style={styles.section}>Description</Text>
        <Text style={styles.desc}>{property.description || 'No description'}</Text>

        {property.features?.length ? (
          <>
            <Text style={styles.section}>Features</Text>
            {property.features.map((f, i) => (
              <Text key={i} style={styles.feature}>
                • {f}
              </Text>
            ))}
          </>
        ) : null}

        <Text style={styles.section}>Send Inquiry</Text>
        <Input label="Name" value={inquiry.name} onChangeText={(v) => setInquiry({ ...inquiry, name: v })} />
        <Input label="Email" value={inquiry.email} onChangeText={(v) => setInquiry({ ...inquiry, email: v })} />
        <Input label="Phone" value={inquiry.phone} onChangeText={(v) => setInquiry({ ...inquiry, phone: v })} />
        <Input label="Message" value={inquiry.message} onChangeText={(v) => setInquiry({ ...inquiry, message: v })} multiline />
        <Button title="Send Inquiry" onPress={onInquiry} loading={submitting} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.white },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  favBtn: { position: 'absolute', top: 16, right: 16, backgroundColor: colors.white, borderRadius: 24, padding: 8 },
  body: { padding: spacing.lg },
  type: { color: colors.textMuted, textTransform: 'capitalize' },
  title: { fontSize: fontSize.xxl, fontWeight: '800', color: colors.primary, marginTop: 4 },
  location: { color: colors.textMuted, marginTop: 4 },
  price: { fontSize: fontSize.xl, fontWeight: '700', color: colors.primary, marginVertical: spacing.md },
  meta: { color: colors.textMuted },
  section: { fontWeight: '700', fontSize: fontSize.lg, marginTop: spacing.lg, marginBottom: spacing.sm },
  desc: { lineHeight: 22, color: colors.text },
  feature: { color: colors.text, marginBottom: 4 },
});
