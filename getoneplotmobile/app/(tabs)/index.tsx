import { useAuth } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { useApprovalStatus } from "../../src/hooks/useApprovalStatus";
import { FlatList, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { PropertyCard } from "../../src/components/PropertyCard";
import { Button } from "../../src/components/ui/Button";
import { Loading } from "../../src/components/ui/Loading";
import { DEVELOPMENTS } from "../../src/constants/developments";
import { borderRadius, colors, fontSize, fontWeight, spacing } from "../../src/constants/theme";
import { normalizePropertyImages } from "../../src/lib/images";
import { supabase } from "../../src/lib/supabase";
import type { Property } from "../../src/types/property";

const HERO_FEATURES = [
  "Verified land sites",
  "Affordable prices",
  "Flexible payment plans",
  "Expert consultation",
] as const;

const FEATURED_SITE_SLUGS = [
  "royal-court-estate",
  "legon-hills",
  "trabuom",
  "yabi",
  "berekuso",
  "asokore-mampong",
] as const;

const heroSites = FEATURED_SITE_SLUGS.map((slug) =>
  DEVELOPMENTS.find((d) => d.slug === slug),
).filter(Boolean);

const siteImageBase =
  process.env.EXPO_PUBLIC_API_URL?.replace(/\/$/, "") || "https://www.getoneplot.com";

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isLoaded, isSignedIn } = useAuth();
  const { status, initialLoading } = useApprovalStatus({
    enabled: isLoaded && isSignedIn,
    poll: false,
  });
  const [featured, setFeatured] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const sentToApproval = useRef(false);

  // Only unapproved signed-in users go to approval (avoids loop with post-approval redirect)
  useEffect(() => {
    if (!isLoaded || !isSignedIn || initialLoading || !status) return;
    if (!status.isApproved && !sentToApproval.current) {
      sentToApproval.current = true;
      router.replace("/approval");
    }
  }, [isLoaded, isSignedIn, initialLoading, status, router]);

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
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: insets.bottom + spacing.xl }}
    >
      {/* Hero — mirrors getoneplot.com Hero-section */}
      <View style={[styles.hero, { paddingTop: insets.top + spacing.lg }]}>
        <View style={styles.heroGlowBlue} />
        <View style={styles.heroGlowPrimary} />

        <View style={styles.badge}>
          <View style={styles.badgeDot} />
          <Text style={styles.badgeText}>Premier Land Marketplace</Text>
        </View>

        <Text style={styles.heroTitle}>
          Find Your Perfect{"\n"}
          <Text style={styles.heroTitleAccent}>Land in Ghana</Text>
        </Text>

        <View style={styles.quoteBlock}>
          <Text style={styles.heroSub}>
            Explore verified listings across all regions. Whether you are seeking residential,
            commercial, or investment land, we connect you with the right plot to build your dreams.
          </Text>
        </View>

        <Button
          title="Browse Listed Properties"
          onPress={() => router.push("/(tabs)/marketplace")}
          fullWidth
          size="lg"
        />

        <View style={styles.featuresGrid}>
          {HERO_FEATURES.map((label) => (
            <View key={label} style={styles.featureRow}>
              <View style={styles.featureIcon}>
                <Ionicons name="checkmark" size={12} color={colors.success} />
              </View>
              <Text style={styles.featureText}>{label}</Text>
            </View>
          ))}
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>
              12k<Text style={styles.statPlus}>+</Text>
            </Text>
            <Text style={styles.statLabel}>Satisfied clients</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>
              5k<Text style={styles.statPlus}>+</Text>
            </Text>
            <Text style={styles.statLabel}>Available lands</Text>
          </View>
        </View>
      </View>

      {/* Hero image card */}
      <View style={styles.imageSection}>
        <View style={styles.imageCard}>
          <Image
            source={{ uri: `${siteImageBase}/images/trabuom-lt.jpg` }}
            style={styles.heroImage}
            contentFit="cover"
            transition={300}
            cachePolicy="memory-disk"
          />
          <View style={styles.imageOverlay}>
            <View>
              <Text style={styles.imageTitle}>Serviced lands</Text>
              <Text style={styles.imageLocation}>Kumasi — Ghana</Text>
            </View>
            <View style={styles.priceTag}>
              <Text style={styles.priceTagText}>From GHS 30,000</Text>
            </View>
          </View>
          <View style={styles.verifiedFloat}>
            <View style={styles.verifiedIcon}>
              <Ionicons name="shield-checkmark" size={14} color={colors.success} />
            </View>
            <View>
              <Text style={styles.verifiedTitle}>Verified</Text>
              <Text style={styles.verifiedSub}>Land sites</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Land locations */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Browse our land locations</Text>
          <Ionicons name="chevron-down" size={18} color={colors.primary} />
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipsScroll}
        >
          {heroSites.map((d) =>
            d ? (
              <Pressable
                key={d.slug}
                style={styles.chip}
                onPress={() => router.push(`/(tabs)/sites/${d.slug}`)}
              >
                <Text style={styles.chipTitle}>{d.title}</Text>
                <Text style={styles.chipSub}>{d.subtitle}</Text>
              </Pressable>
            ) : null,
          )}
          <Pressable
            style={[styles.chip, styles.chipOutline]}
            onPress={() => router.push("/(tabs)/sites")}
          >
            <Text style={styles.chipTitle}>All sites</Text>
            <Text style={styles.chipSub}>View full list →</Text>
          </Pressable>
        </ScrollView>
      </View>

      {/* Developments grid */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Our developments</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.devScroll}
        >
          {DEVELOPMENTS.map((d) => (
            <Pressable
              key={d.slug}
              style={styles.devCard}
              onPress={() => router.push(`/(tabs)/sites/${d.slug}`)}
            >
              <View style={styles.devIcon}>
                <Ionicons name="map-outline" size={20} color={colors.primary} />
              </View>
              <Text style={styles.devTitle}>{d.title}</Text>
              <Text style={styles.devSub}>{d.subtitle}</Text>
              <Text style={styles.devLink}>Explore map →</Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      {/* Featured properties */}
      <View style={styles.section}>
        <View style={styles.sectionRow}>
          <Text style={styles.sectionTitle}>Featured properties</Text>
          <Pressable onPress={() => router.push("/(tabs)/marketplace")}>
            <Text style={styles.seeAll}>View all</Text>
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
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>No featured properties yet.</Text>
          </View>
        )}
      </View>

      {!isSignedIn && (
        <View style={styles.cta}>
          <Text style={styles.ctaTitle}>Ready to invest?</Text>
          <Text style={styles.ctaText}>
            Sign in to save favorites, buy plots, and manage your account.
          </Text>
          <Button title="Sign In" onPress={() => router.push("/(auth)/sign-in")} fullWidth />
          <Button
            title="Create Account"
            variant="outline"
            onPress={() => router.push("/(auth)/sign-up")}
            fullWidth
          />
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  hero: {
    backgroundColor: colors.white,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
    overflow: "hidden",
  },
  heroGlowBlue: {
    position: "absolute",
    top: -40,
    right: -20,
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: "rgba(4, 167, 255, 0.18)",
  },
  heroGlowPrimary: {
    position: "absolute",
    bottom: 20,
    left: -30,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(5, 1, 76, 0.08)",
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: "rgba(4, 167, 255, 0.1)",
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: borderRadius.full,
    marginBottom: spacing.md,
    gap: 8,
  },
  badgeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
  },
  badgeText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.primary,
  },
  heroTitle: {
    fontSize: 30,
    fontWeight: fontWeight.extrabold,
    color: colors.text,
    lineHeight: 38,
    marginBottom: spacing.md,
  },
  heroTitleAccent: {
    color: colors.primary,
  },
  quoteBlock: {
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
    paddingLeft: spacing.md,
    marginBottom: spacing.lg,
  },
  heroSub: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    lineHeight: 24,
  },
  featuresGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: spacing.lg,
    gap: spacing.sm,
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "center",
    width: "48%",
    gap: 8,
  },
  featureIcon: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "rgba(16, 185, 129, 0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  featureText: {
    flex: 1,
    fontSize: fontSize.sm,
    color: colors.text,
    fontWeight: fontWeight.medium,
  },
  statsRow: {
    flexDirection: "row",
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 2,
  },
  statNumber: {
    fontSize: 22,
    fontWeight: fontWeight.extrabold,
    color: colors.text,
  },
  statPlus: {
    color: colors.primary,
  },
  statLabel: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    marginTop: 4,
  },
  imageSection: {
    paddingHorizontal: spacing.lg,
    marginTop: -spacing.md,
    marginBottom: spacing.lg,
  },
  imageCard: {
    borderRadius: borderRadius.xl,
    overflow: "hidden",
    backgroundColor: colors.primary,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 16,
    elevation: 6,
  },
  heroImage: {
    width: "100%",
    aspectRatio: 16 / 10,
  },
  imageOverlay: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    padding: spacing.md,
    backgroundColor: "rgba(0,0,0,0.55)",
  },
  imageTitle: {
    color: colors.white,
    fontWeight: fontWeight.bold,
    fontSize: fontSize.lg,
  },
  imageLocation: {
    color: "rgba(255,255,255,0.85)",
    fontSize: fontSize.sm,
    marginTop: 2,
  },
  priceTag: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: borderRadius.md,
  },
  priceTagText: {
    color: colors.white,
    fontWeight: fontWeight.bold,
    fontSize: fontSize.sm,
  },
  verifiedFloat: {
    position: "absolute",
    top: spacing.md,
    right: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: colors.white,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.lg,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  verifiedIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(16, 185, 129, 0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  verifiedTitle: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
    color: colors.text,
  },
  verifiedSub: {
    fontSize: 10,
    color: colors.textMuted,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  sectionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.text,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  seeAll: {
    color: colors.primary,
    fontWeight: fontWeight.semibold,
    fontSize: fontSize.sm,
    paddingRight: spacing.lg,
  },
  chipsScroll: {
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  chip: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    minWidth: 140,
    borderWidth: 1,
    borderColor: "rgba(4, 167, 255, 0.25)",
    marginRight: spacing.sm,
  },
  chipOutline: {
    borderColor: colors.border,
    borderStyle: "dashed",
  },
  chipTitle: {
    fontWeight: fontWeight.bold,
    color: colors.primary,
    fontSize: fontSize.sm,
  },
  chipSub: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    marginTop: 4,
  },
  devScroll: {
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  devCard: {
    width: 168,
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginRight: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  devIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: "rgba(5, 1, 76, 0.06)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.sm,
  },
  devTitle: {
    fontWeight: fontWeight.bold,
    color: colors.primary,
    fontSize: fontSize.md,
  },
  devSub: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    marginTop: 2,
    marginBottom: spacing.sm,
  },
  devLink: {
    fontSize: fontSize.xs,
    color: colors.accentBlue,
    fontWeight: fontWeight.semibold,
  },
  propertyList: {
    paddingHorizontal: spacing.lg,
  },
  emptyCard: {
    marginHorizontal: spacing.lg,
    padding: spacing.lg,
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  emptyText: {
    textAlign: "center",
    color: colors.textMuted,
  },
  cta: {
    marginHorizontal: spacing.lg,
    padding: spacing.lg,
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.md,
  },
  ctaTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.text,
  },
  ctaText: {
    color: colors.textMuted,
    fontSize: fontSize.md,
    lineHeight: 22,
    marginBottom: spacing.xs,
  },
});
