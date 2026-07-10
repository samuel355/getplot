import { useAuth } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { useApprovalStatus } from "../../src/hooks/useApprovalStatus";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type TextStyle,
  Dimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { PropertyCard } from "../../src/components/PropertyCard";
import { Button } from "../../src/components/ui/Button";
import { Loading } from "../../src/components/ui/Loading";
import { DEVELOPMENTS } from "../../src/constants/developments";
import { useTheme } from "../../src/constants/theme";
import { normalizePropertyImages } from "../../src/lib/images";
import { supabase } from "../../src/lib/supabase";
import type { Property } from "../../src/types/property";

const { width } = Dimensions.get("window");

const FEATURED_SITE_SLUGS = [
  "royal-court-estate",
  "legon-hills",
  "trabuom-sector-1",
  "yabi",
  "berekuso",
  "asokore-mampong",
] as const;

const heroSites = FEATURED_SITE_SLUGS.map((slug) =>
  DEVELOPMENTS.find((d) => d.slug === slug),
).filter(Boolean);

const servicedLandImage = require("../../assets/images/trabuom-lt.jpg");

const TRUST_METRICS = [
  { value: "Verified", label: "Land locations" },
  { value: "Mapped", label: "Plot boundaries" },
  { value: "Guided", label: "Every enquiry" },
];

const PLOT_STATUS_LEGEND = [
  { label: "Available", color: "#22c55e" },
  { label: "Reserved", color: "#171717" },
  { label: "Sold", color: "#ef4444" },
  { label: "Hold", color: "#9ca3af" },
];

const CAPABILITIES = [
  {
    icon: "map-outline" as const,
    title: "Interactive maps",
    desc: "See real plot boundaries and live status on Google Maps.",
  },
  {
    icon: "shield-checkmark-outline" as const,
    title: "Verified listings",
    desc: "Every site and property is checked before it's published.",
  },
  {
    icon: "headset-outline" as const,
    title: "Guided support",
    desc: "Reserve, buy, or ask a question — the team follows up fast.",
  },
  {
    icon: "cash-outline" as const,
    title: "Flexible plans",
    desc: "Talk through payment options before you commit.",
  },
];

export default function HomeScreen() {
  const { colors, spacing, borderRadius, fontWeight, fontSize, isDark } = useTheme();
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

  // Remove automatic redirect to approval screen so pending users can browse
  /*
  useEffect(() => {
    if (!isLoaded || !isSignedIn || initialLoading || !status) return;
    if (!status.isApproved && !sentToApproval.current) {
      sentToApproval.current = true;
      router.replace("/approval");
    }
  }, [isLoaded, isSignedIn, initialLoading, status, router]);
  */

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

  const sectionHeader = (title: string, onSeeAll?: () => void) => (
    <View style={styles.sectionHeader}>
      <Text
        style={[
          styles.sectionTitle,
          {
            color: colors.text,
            fontSize: fontSize.lg,
            fontWeight: fontWeight.bold as TextStyle["fontWeight"],
          },
        ]}
      >
        {title}
      </Text>
      {onSeeAll && (
        <Pressable onPress={onSeeAll} hitSlop={8}>
          <Text
            style={[
              styles.seeAll,
              {
                color: colors.primaryAccent,
                fontSize: fontSize.sm,
                fontWeight: fontWeight.semibold as TextStyle["fontWeight"],
              },
            ]}
          >
            See All
          </Text>
        </Pressable>
      )}
    </View>
  );

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: insets.bottom + spacing.xl }}
    >
      {/* Hero Section */}
      <View
        style={[
          styles.hero,
          {
            paddingTop: insets.top + spacing.xl,
            backgroundColor: isDark ? colors.background : colors.white,
          },
        ]}
      >
        <View
          style={[
            styles.heroGlow,
            { backgroundColor: colors.primaryAccent, opacity: isDark ? 0.12 : 0.08 },
          ]}
        />

        <View
          style={[
            styles.badge,
            {
              backgroundColor: isDark ? colors.surfaceAlt : `${colors.primaryAccent}1a`,
              borderRadius: borderRadius.full,
            },
          ]}
        >
          <Ionicons name="shield-checkmark" size={13} color={colors.primaryAccent} />
          <Text
            style={[
              styles.badgeText,
              {
                color: isDark ? colors.textSecondary : colors.primary,
                fontWeight: fontWeight.bold as TextStyle["fontWeight"],
              },
            ]}
          >
            LAND MANAGEMENT & MARKETPLACE
          </Text>
        </View>

        <Text
          style={[
            styles.heroTitle,
            { color: colors.text, fontWeight: fontWeight.extrabold as TextStyle["fontWeight"] },
          ]}
        >
          Find Your Perfect{"\n"}
          <Text style={{ color: colors.primaryAccent }}>Plot in Ghana</Text>
        </Text>

        <Text style={[styles.heroSub, { color: colors.textSecondary }]}>
          Verified land locations with mapped plot boundaries, plus a marketplace of homes,
          rentals, and investment listings.
        </Text>

        <View style={styles.heroActions}>
          <Button
            title="Browse Marketplace"
            onPress={() => router.push("/(tabs)/marketplace")}
            style={{ flex: 1 }}
          />
          <Pressable
            style={[
              styles.iconBtn,
              { borderColor: colors.border, backgroundColor: colors.surface },
            ]}
            onPress={() => router.push("/(tabs)/sites")}
          >
            <Ionicons name="map-outline" size={22} color={colors.text} />
          </Pressable>
        </View>

        <View
          style={[
            styles.trustRow,
            { borderColor: colors.border, backgroundColor: colors.surface },
          ]}
        >
          {TRUST_METRICS.map((item, index) => (
            <View
              key={item.label}
              style={[
                styles.trustItem,
                index < TRUST_METRICS.length - 1 && {
                  borderRightWidth: StyleSheet.hairlineWidth,
                  borderRightColor: colors.border,
                },
              ]}
            >
              <Text
                style={[
                  styles.trustValue,
                  { color: colors.primary, fontWeight: fontWeight.extrabold as TextStyle["fontWeight"] },
                ]}
              >
                {item.value}
              </Text>
              <Text style={[styles.trustLabel, { color: colors.textMuted }]}>{item.label}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Featured Image Card */}
      <View style={styles.imageSection}>
        <View
          style={[
            styles.imageCard,
            { borderRadius: borderRadius.xl, backgroundColor: colors.surface },
          ]}
        >
          <Image
            source={servicedLandImage}
            style={styles.heroImage}
            contentFit="cover"
            transition={300}
          />
          <View style={styles.imageOverlay}>
            <View
              style={[
                styles.glassCard,
                { backgroundColor: isDark ? "rgba(15, 23, 42, 0.8)" : "rgba(255, 255, 255, 0.85)" },
              ]}
            >
              <View>
                <Text style={[styles.imageTitle, { color: colors.text }]}>Trabuom Site</Text>
                <Text style={[styles.imageLocation, { color: colors.textSecondary }]}>
                  Kumasi, Ashanti Region
                </Text>
              </View>
              <View style={[styles.verifiedBadge, { backgroundColor: colors.success }]}>
                <Ionicons name="shield-checkmark" size={12} color={colors.white} />
                <Text style={styles.verifiedText}>Verified</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.legendRow}>
          {PLOT_STATUS_LEGEND.map((item) => (
            <View key={item.label} style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: item.color }]} />
              <Text style={[styles.legendLabel, { color: colors.textMuted }]}>{item.label}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Land Locations Horizontal */}
      <View style={styles.section}>
        {sectionHeader("Explore Locations", () => router.push("/(tabs)/sites"))}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.horizontalScroll}
        >
          {heroSites.map((d) =>
            d ? (
              <Pressable
                key={d.slug}
                style={[
                  styles.locationChip,
                  { backgroundColor: colors.surface, borderColor: colors.border },
                ]}
                onPress={() => router.push(`/(tabs)/sites/${d.slug}`)}
              >
                <Ionicons name="location" size={14} color={colors.primaryAccent} />
                <View>
                  <Text style={[styles.chipTitle, { color: colors.text }]}>{d.title}</Text>
                  <Text style={[styles.chipSub, { color: colors.textMuted }]}>{d.subtitle}</Text>
                </View>
              </Pressable>
            ) : null,
          )}
        </ScrollView>
      </View>

      {/* Why GetOnePlot */}
      <View style={styles.section}>
        {sectionHeader("Why GetOnePlot")}
        <View style={styles.capabilityGrid}>
          {CAPABILITIES.map((item) => (
            <View
              key={item.title}
              style={[
                styles.capabilityCard,
                { backgroundColor: colors.surface, borderColor: colors.border },
              ]}
            >
              <View style={[styles.capabilityIcon, { backgroundColor: colors.primary }]}>
                <Ionicons name={item.icon} size={18} color={colors.white} />
              </View>
              <Text style={[styles.capabilityTitle, { color: colors.text }]}>{item.title}</Text>
              <Text style={[styles.capabilityDesc, { color: colors.textMuted }]}>{item.desc}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Featured Properties */}
      <View style={styles.section}>
        {sectionHeader("Newest Listings", () => router.push("/(tabs)/marketplace"))}
        {loading ? (
          <View style={{ height: 200, justifyContent: "center" }}>
            <Loading />
          </View>
        ) : (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalScroll}
          >
            {featured.map((item) => (
              <View key={item.id} style={{ width: width * 0.75, marginRight: spacing.md }}>
                <PropertyCard property={item} onPress={() => router.push(`/property/${item.id}`)} />
              </View>
            ))}
          </ScrollView>
        )}
      </View>

      {/* Development Projects */}
      <View style={styles.section}>
        {sectionHeader("Our Developments")}
        <View style={styles.devGrid}>
          {DEVELOPMENTS.slice(0, 4).map((d) => (
            <Pressable
              key={d.slug}
              style={[
                styles.devCard,
                { backgroundColor: colors.surface, borderColor: colors.border },
              ]}
              onPress={() => router.push(`/(tabs)/sites/${d.slug}`)}
            >
              <View
                style={[
                  styles.devIcon,
                  { backgroundColor: isDark ? colors.surfaceAlt : colors.white },
                ]}
              >
                <Ionicons name="business-outline" size={20} color={colors.primaryAccent} />
              </View>
              <Text style={[styles.devTitle, { color: colors.text }]} numberOfLines={1}>
                {d.title}
              </Text>
              <Text style={[styles.devSub, { color: colors.textMuted }]} numberOfLines={1}>
                {d.subtitle}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      {!isSignedIn && (
        <View
          style={[styles.cta, { backgroundColor: colors.primary, borderRadius: borderRadius.xl }]}
        >
          <View style={[styles.ctaIcon, { backgroundColor: "rgba(255,255,255,0.12)" }]}>
            <Ionicons name="sparkles-outline" size={22} color={colors.white} />
          </View>
          <Text style={[styles.ctaTitle, { color: colors.white }]}>Ready to Invest?</Text>
          <Text style={[styles.ctaText, { color: "rgba(255,255,255,0.8)" }]}>
            Create a free account to reserve plots, save listings, and track your enquiries.
          </Text>
          <Button
            title="Create Free Account"
            onPress={() => router.push("/(auth)/sign-up")}
            variant="secondary"
            fullWidth
          />
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  // Hero
  hero: {
    paddingHorizontal: 20,
    paddingBottom: 24,
    position: "relative",
    overflow: "hidden",
  },
  heroGlow: {
    position: "absolute",
    top: -100,
    right: -100,
    width: 300,
    height: 300,
    borderRadius: 150,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginBottom: 20,
    gap: 6,
  },
  badgeText: {
    fontSize: 10,
    letterSpacing: 0.5,
  },
  heroTitle: {
    fontSize: 36,
    lineHeight: 42,
    marginBottom: 16,
  },
  heroSub: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 24,
    maxWidth: "92%",
  },
  heroActions: {
    flexDirection: "row",
    gap: 12,
  },
  iconBtn: {
    width: 52,
    height: 52,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  // Trust row
  trustRow: {
    flexDirection: "row",
    marginTop: 20,
    borderRadius: 16,
    borderWidth: 1,
    overflow: "hidden",
  },
  trustItem: {
    flex: 1,
    paddingVertical: 14,
    alignItems: "center",
  },
  trustValue: {
    fontSize: 15,
  },
  trustLabel: {
    fontSize: 10,
    marginTop: 2,
    textAlign: "center",
  },

  // Image Card
  imageSection: {
    paddingHorizontal: 20,
    marginTop: -6,
    marginBottom: 30,
  },
  imageCard: {
    height: 220,
    overflow: "hidden",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
  },
  heroImage: {
    width: "100%",
    height: "100%",
  },
  imageOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
  },
  glassCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 12,
    borderRadius: 16,
  },
  imageTitle: {
    fontSize: 16,
    fontWeight: "700",
  },
  imageLocation: {
    fontSize: 12,
    marginTop: 2,
  },
  verifiedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  verifiedText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "bold",
  },
  legendRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 14,
    marginTop: 14,
    paddingHorizontal: 4,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 2,
  },
  legendLabel: {
    fontSize: 11,
    fontWeight: "600",
  },

  // Sections
  section: {
    marginBottom: 30,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionTitle: {},
  seeAll: {},
  horizontalScroll: {
    paddingHorizontal: 20,
    gap: 12,
  },

  // Locations
  locationChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 1,
    minWidth: 150,
  },
  chipTitle: {
    fontSize: 14,
    fontWeight: "700",
  },
  chipSub: {
    fontSize: 11,
    marginTop: 2,
  },

  // Capabilities
  capabilityGrid: {
    paddingHorizontal: 20,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  capabilityCard: {
    width: (width - 52) / 2,
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
  },
  capabilityIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  capabilityTitle: {
    fontSize: 14,
    fontWeight: "700",
  },
  capabilityDesc: {
    fontSize: 11,
    lineHeight: 16,
    marginTop: 4,
  },

  // Dev Grid
  devGrid: {
    paddingHorizontal: 20,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  devCard: {
    width: (width - 52) / 2,
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
  },
  devIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  devTitle: {
    fontSize: 14,
    fontWeight: "700",
  },
  devSub: {
    fontSize: 11,
    marginTop: 4,
  },

  // CTA
  cta: {
    marginHorizontal: 20,
    padding: 24,
    gap: 12,
    alignItems: "center",
    textAlign: "center",
  },
  ctaIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  ctaTitle: {
    fontSize: 22,
    fontWeight: "800",
  },
  ctaText: {
    fontSize: 15,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 4,
  },
});
