import React, { useMemo, useState } from "react";
import { useRouter } from "expo-router";
<<<<<<< HEAD
import { FlatList, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { DEVELOPMENTS } from "../../../src/constants/developments";
import { colors, fontSize, spacing } from "../../../src/constants/theme";
=======
import {
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  type TextStyle,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { DEVELOPMENTS } from "../../../src/constants/developments";
import { useTheme } from "../../../src/constants/theme";
>>>>>>> mobile
import { useSafeAreaInsets } from "react-native-safe-area-context";

function getInitials(title: string) {
  return title
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

<<<<<<< HEAD
const COLOR_PALETTE = [
  colors.primaryAccent,
  colors.accentBlue,
  colors.success,
  "#F97316",
  "#06B6D4",
];

export default function SitesScreen() {
=======
export default function SitesScreen() {
  const { colors, spacing, fontSize, fontWeight, borderRadius, isDark } = useTheme();
>>>>>>> mobile
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState("");
  const [region, setRegion] = useState("All");

<<<<<<< HEAD
=======
  const COLOR_PALETTE = [
    colors.primaryAccent,
    colors.accentBlue,
    colors.success,
    "#F97316",
    "#06B6D4",
  ];

>>>>>>> mobile
  const regions = useMemo(
    () => ["All", ...Array.from(new Set(DEVELOPMENTS.map((d) => d.subtitle)))],
    [],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return DEVELOPMENTS.filter((d) => {
      const matchRegion = region === "All" || d.subtitle === region;
      if (!q) return matchRegion;
      const matchText = d.title.toLowerCase().includes(q) || d.subtitle.toLowerCase().includes(q);
      return matchRegion && matchText;
    });
  }, [query, region]);

  const ListHeader = () => (
    <View
<<<<<<< HEAD
      style={{ paddingTop: insets.top, paddingBottom: spacing.sm, backgroundColor: colors.surface }}
    >
      <View style={styles.headerWrap}>
        <Text style={styles.pageHeading}>Explore our sites</Text>
      </View>

      <View style={styles.searchRow}>
=======
      style={{
        paddingTop: insets.top + spacing.md,
        paddingBottom: spacing.sm,
        backgroundColor: colors.background,
      }}
    >
      <View style={styles.headerWrap}>
        <Text
          style={[
            styles.pageHeading,
            {
              color: colors.text,
              fontSize: fontSize.xl,
              fontWeight: fontWeight.extrabold as TextStyle["fontWeight"],
            },
          ]}
        >
          Explore our sites
        </Text>
      </View>

      <View
        style={[
          styles.searchRow,
          { backgroundColor: colors.surface, borderColor: colors.border, marginTop: 12 },
        ]}
      >
>>>>>>> mobile
        <Ionicons name="search" size={18} color={colors.textMuted} style={{ marginRight: 10 }} />
        <TextInput
          placeholder="Search sites or locations"
          placeholderTextColor={colors.textMuted}
          value={query}
          onChangeText={setQuery}
<<<<<<< HEAD
          style={styles.searchInput}
=======
          style={[styles.searchInput, { color: colors.text, fontSize: fontSize.md }]}
>>>>>>> mobile
          returnKeyType="search"
        />
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipsContent}
        style={{ marginTop: spacing.sm }}
      >
        {regions.map((r) => (
          <Pressable
            key={r}
            onPress={() => setRegion(r)}
<<<<<<< HEAD
            style={[styles.chip, region === r ? styles.chipActive : null]}
          >
            <Text style={[styles.chipText, region === r ? styles.chipTextActive : null]}>
=======
            style={[
              styles.chip,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
                borderRadius: borderRadius.full,
              },
              region === r
                ? { backgroundColor: colors.primary, borderColor: colors.primary }
                : null,
            ]}
          >
            <Text
              style={[
                styles.chipText,
                { color: colors.text, fontSize: fontSize.sm },
                region === r
                  ? { color: colors.white, fontWeight: fontWeight.bold as TextStyle["fontWeight"] }
                  : null,
              ]}
            >
>>>>>>> mobile
              {r === "All" ? "All regions" : r}
            </Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );

  return (
    <FlatList
      data={filtered}
      keyExtractor={(item) => item.slug}
<<<<<<< HEAD
      contentContainerStyle={{ paddingHorizontal: spacing.md, paddingBottom: 120 }}
      ListHeaderComponent={ListHeader}
      stickyHeaderIndices={[0]}
      ItemSeparatorComponent={() => <View style={{ height: spacing.sm }} />}
=======
      contentContainerStyle={{
        paddingHorizontal: spacing.lg,
        paddingBottom: 120,
        backgroundColor: colors.background,
      }}
      style={{ backgroundColor: colors.background }}
      ListHeaderComponent={ListHeader}
      stickyHeaderIndices={[0]}
      ItemSeparatorComponent={() => <View style={{ height: spacing.md }} />}
>>>>>>> mobile
      renderItem={({ item, index }) => {
        const bg = COLOR_PALETTE[index % COLOR_PALETTE.length];
        return (
          <Pressable
<<<<<<< HEAD
            style={({ pressed }) => [styles.card, pressed ? styles.cardPressed : null]}
            onPress={() => router.push(`/(tabs)/sites/${item.slug}`)}
            android_ripple={{ color: "#00000006" }}
          >
            <View style={[styles.thumb, { backgroundColor: bg }]}>
              <Text style={styles.thumbText}>{getInitials(item.title)}</Text>
            </View>

            <View style={styles.cardBody}>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.subtitle}>{item.subtitle}</Text>

              <View style={styles.metaRow}>
                <View style={styles.metaPill}>
                  <Ionicons name="map" size={12} color={colors.primary} />
                  <Text style={styles.metaText}>Open map</Text>
                </View>

                <View style={styles.metaPillOutline}>
                  <Ionicons name="people" size={12} color={colors.primary} />
                  <Text style={styles.metaText}>Contact agent</Text>
=======
            style={({ pressed }) => [
              styles.card,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
                borderRadius: borderRadius.lg,
              },
              pressed && { opacity: 0.9, transform: [{ scale: 0.98 }] },
            ]}
            onPress={() => router.push(`/(tabs)/sites/${item.slug}`)}
          >
            <View style={[styles.thumb, { backgroundColor: bg, borderRadius: borderRadius.md }]}>
              <Text
                style={[
                  styles.thumbText,
                  { fontWeight: fontWeight.extrabold as TextStyle["fontWeight"] },
                ]}
              >
                {getInitials(item.title)}
              </Text>
            </View>

            <View style={styles.cardBody}>
              <Text
                style={[
                  styles.title,
                  {
                    color: colors.text,
                    fontSize: fontSize.md,
                    fontWeight: fontWeight.bold as TextStyle["fontWeight"],
                  },
                ]}
              >
                {item.title}
              </Text>
              <Text style={[styles.subtitle, { color: colors.textMuted, fontSize: fontSize.sm }]}>
                {item.subtitle}
              </Text>

              <View style={styles.metaRow}>
                <View style={[styles.metaPill, { backgroundColor: colors.surfaceAlt }]}>
                  <Ionicons name="map-outline" size={12} color={colors.primaryAccent} />
                  <Text style={[styles.metaText, { color: colors.textSecondary }]}>
                    Explore Site
                  </Text>
                </View>

                <View style={[styles.metaPillOutline, { borderColor: colors.border }]}>
                  <Ionicons name="shield-checkmark-outline" size={12} color={colors.success} />
                  <Text style={[styles.metaText, { color: colors.textSecondary }]}>Verified</Text>
>>>>>>> mobile
                </View>
              </View>
            </View>

<<<<<<< HEAD
            <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
=======
            <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
>>>>>>> mobile
          </Pressable>
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
<<<<<<< HEAD
  headerWrap: { paddingHorizontal: spacing.md, paddingBottom: spacing.xs },
  pageHeading: { fontSize: fontSize.lg, fontWeight: "800", color: colors.text },

  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.white,
    marginTop: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchInput: { flex: 1, fontSize: fontSize.md, color: colors.text, padding: 0 },

  chipsContent: { paddingVertical: 8 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.surface,
    marginRight: 10,
    borderWidth: 1,
    borderColor: colors.border,
    minWidth: 88,
    alignItems: "center",
    justifyContent: "center",
  },
  chipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 2,
  },
  chipText: { color: colors.text, fontSize: fontSize.sm },
  chipTextActive: { color: colors.white, fontWeight: "700" },

  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.white,
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: spacing.md,
    shadowColor: "#000",
    shadowOpacity: 0.03,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 1,
  },
  cardPressed: { opacity: 0.98 },

  thumb: { width: 48, height: 48, borderRadius: 8, alignItems: "center", justifyContent: "center" },
  thumbText: { color: colors.white, fontWeight: "800", fontSize: 16 },

  cardBody: { flex: 1, marginLeft: 12 },
  title: { fontSize: fontSize.md, fontWeight: "700", color: colors.text },
  subtitle: { color: colors.textMuted, marginTop: 2, fontSize: fontSize.sm },
  metaRow: { flexDirection: "row", marginTop: 8 },
  metaPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surfaceAlt,
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: 10,
    marginRight: 8,
=======
  headerWrap: {},
  pageHeading: {},
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 1,
  },
  searchInput: { flex: 1, padding: 0 },
  chipsContent: { paddingVertical: 12 },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 10,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  chipText: {},
  card: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderWidth: 1,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  thumb: { width: 50, height: 50, alignItems: "center", justifyContent: "center" },
  thumbText: { color: "#fff", fontSize: 18 },
  cardBody: { flex: 1, marginLeft: 16 },
  title: {},
  subtitle: { marginTop: 2 },
  metaRow: { flexDirection: "row", marginTop: 12, gap: 8 },
  metaPill: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
>>>>>>> mobile
  },
  metaPillOutline: {
    flexDirection: "row",
    alignItems: "center",
<<<<<<< HEAD
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: 10,
    marginRight: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  metaText: { marginLeft: 6, fontSize: 11, color: colors.textMuted },
=======
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
  },
  metaText: { marginLeft: 6, fontSize: 10, fontWeight: "600" },
>>>>>>> mobile
});
