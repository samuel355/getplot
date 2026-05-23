import { useAuth } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { FlatList, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { PropertyCard } from "../../src/components/PropertyCard";
import { Button } from "../../src/components/ui/Button";
import { Card } from "../../src/components/ui/Card";
import { Loading } from "../../src/components/ui/Loading";
import { DEVELOPMENTS } from "../../src/constants/developments";
import { colors, fontSize, spacing, fontWeight, borderRadius } from "../../src/constants/theme";
import { normalizePropertyImages } from "../../src/lib/images";
import { supabase } from "../../src/lib/supabase";
import type { Property } from "../../src/types/property";

export default function HomeScreen() {
  const router = useRouter();
  const { isLoaded, isSignedIn } = useAuth();
  const [featured, setFeatured] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  // Same as web middleware: signed-in users on home go to approval
  useEffect(() => {
    if (isLoaded && isSignedIn) {
      router.replace("/approval");
    }
  }, [isLoaded, isSignedIn, router]);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("properties")
        .select(
          "id, title, type, price, location, images, bedrooms, bathrooms, listing_type, rental_price",
        )
        .eq("status", "approved")
        .order("created_at", { ascending: false })
        .limit(6);
      const rows = (data || []).map((row) => ({
        ...(row as Property),
        images: normalizePropertyImages((row as Property).images),
      }));
      setFeatured(rows);
      setLoading(false);
    })();
  }, []);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Hero Section */}
      <View style={styles.hero}>
        <Text style={styles.heroTitle}>Get One Plot</Text>
        <Text style={styles.heroSub}>Find and invest in properties effortlessly</Text>

        <View style={styles.heroActions}>
          <Button
            title="Browse Properties"
            onPress={() => router.push("/(tabs)/marketplace")}
            fullWidth
          />
          <Button
            title="Explore Sites"
            variant="outline"
            onPress={() => router.push("/(tabs)/sites")}
            fullWidth
          />
        </View>
      </View>

      {/* Quick Stats */}
      <View style={styles.statsGrid}>
        <Card variant="outlined" style={styles.statCard}>
          <Text style={styles.statNumber}>500+</Text>
          <Text style={styles.statLabel}>Properties</Text>
        </Card>
        <Card variant="outlined" style={styles.statCard}>
          <Text style={styles.statNumber}>50K+</Text>
          <Text style={styles.statLabel}>Happy Clients</Text>
        </Card>
      </View>

      {/* Developments */}
      <View>
        <Text style={styles.section}>Our Developments</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.hScroll}
          contentContainerStyle={styles.hScrollContent}
        >
          {DEVELOPMENTS.slice(0, 5).map((d) => (
            <Pressable
              key={d.slug}
              style={styles.devCard}
              onPress={() => router.push(`/(tabs)/sites/${d.slug}`)}
            >
              <Text style={styles.devTitle}>{d.title}</Text>
              <Text style={styles.devSub}>{d.subtitle}</Text>
              <View style={styles.devFooter}>
                <Text style={styles.devFooterText}>Explore →</Text>
              </View>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      {/* Featured Properties */}
      <View>
        <View style={styles.sectionRow}>
          <Text style={styles.section}>Featured Properties</Text>
          <Pressable onPress={() => router.push("/(tabs)/marketplace")}>
            <Text style={styles.seeAll}>View all →</Text>
          </Pressable>
        </View>

        {loading ? (
          <Loading fullScreen={false} size="large" />
        ) : featured.length > 0 ? (
          <FlatList
            data={featured}
            horizontal
            keyExtractor={(item) => item.id}
            showsHorizontalScrollIndicator={false}
            renderItem={({ item }) => (
              <PropertyCard
                property={item}
                compact
                onPress={() => router.push(`/property/${item.id}`)}
              />
            )}
            contentContainerStyle={styles.propertyList}
            scrollEnabled={false}
          />
        ) : (
          <Card variant="outlined" style={styles.emptyState}>
            <Text style={styles.empty}>No featured properties yet.</Text>
          </Card>
        )}
      </View>

      {/* CTA for Non-Signed Users */}
      {!isSignedIn && (
        <Card variant="elevated" style={styles.cta}>
          <Text style={styles.ctaTitle}>Ready to invest?</Text>
          <Text style={styles.ctaText}>Sign in to save favorites and make purchases</Text>
          <View style={styles.ctaActions}>
            <Button
              title="Sign In"
              onPress={() => router.push("/(auth)/sign-in")}
              fullWidth
              size="md"
            />
            <Button
              title="Create Account"
              variant="outline"
              onPress={() => router.push("/(auth)/sign-up")}
              fullWidth
              size="md"
            />
          </View>
        </Card>
      )}

      {/* Footer Spacing */}
      <View style={styles.footer} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface,
  },

  // Hero Section
  hero: {
    backgroundColor: colors.primary,
    padding: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xxl,
    borderBottomLeftRadius: borderRadius.xl,
    borderBottomRightRadius: borderRadius.xl,
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: fontWeight.extrabold,
    color: colors.white,
    marginBottom: spacing.sm,
  },
  heroSub: {
    fontSize: fontSize.md,
    color: "rgba(255,255,255,0.90)",
    marginBottom: spacing.lg,
    lineHeight: 22,
  },
  heroActions: {
    gap: spacing.md,
  },

  // Stats Grid
  statsGrid: {
    flexDirection: "row",
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    marginTop: -32,
    marginBottom: spacing.xl,
    zIndex: 10,
  },
  statCard: {
    flex: 1,
    alignItems: "center",
    paddingVertical: spacing.md,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: fontWeight.extrabold,
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  statLabel: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    fontWeight: fontWeight.medium,
  },

  // Sections
  section: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.text,
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },
  sectionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },
  seeAll: {
    color: colors.primary,
    fontWeight: fontWeight.semibold,
    fontSize: fontSize.sm,
  },

  // Horizontal Scroll
  hScroll: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  hScrollContent: {
    gap: spacing.md,
  },
  devCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginRight: spacing.md,
    width: 160,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.shadow,
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 1,
  },
  devTitle: {
    fontWeight: fontWeight.bold,
    color: colors.primary,
    fontSize: fontSize.md,
    marginBottom: spacing.xs,
  },
  devSub: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    marginBottom: spacing.sm,
    lineHeight: 16,
  },
  devFooter: {
    marginTop: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  devFooterText: {
    color: colors.primary,
    fontWeight: fontWeight.semibold,
    fontSize: fontSize.xs,
  },

  // Properties List
  propertyList: {
    paddingHorizontal: spacing.lg,
  },

  // Empty State
  empty: {
    padding: spacing.lg,
    color: colors.textMuted,
    textAlign: "center",
    fontSize: fontSize.md,
  },
  emptyState: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },

  // CTA Section
  cta: {
    marginHorizontal: spacing.lg,
    marginVertical: spacing.xl,
  },
  ctaTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  ctaText: {
    color: colors.textMuted,
    marginBottom: spacing.lg,
    fontSize: fontSize.md,
    lineHeight: 20,
  },
  ctaActions: {
    gap: spacing.md,
  },

  footer: {
    height: spacing.xl,
  },
});
