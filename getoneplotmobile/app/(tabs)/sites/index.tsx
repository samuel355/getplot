import React, { useMemo, useState } from "react";
import { useRouter } from "expo-router";
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
import { useSafeAreaInsets } from "react-native-safe-area-context";

function getInitials(title: string) {
  return title
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export default function SitesScreen() {
  const { colors, spacing, fontSize, fontWeight, borderRadius, isDark } = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState("");
  const [region, setRegion] = useState("All");

  const COLOR_PALETTE = [
    colors.primaryAccent,
    colors.accentBlue,
    colors.success,
    "#F97316",
    "#06B6D4",
  ];

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
        <Ionicons name="search" size={18} color={colors.textMuted} style={{ marginRight: 10 }} />
        <TextInput
          placeholder="Search sites or locations"
          placeholderTextColor={colors.textMuted}
          value={query}
          onChangeText={setQuery}
          style={[styles.searchInput, { color: colors.text, fontSize: fontSize.md }]}
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
      contentContainerStyle={{
        paddingHorizontal: spacing.lg,
        paddingBottom: 120,
        backgroundColor: colors.background,
      }}
      style={{ backgroundColor: colors.background }}
      ListHeaderComponent={ListHeader}
      stickyHeaderIndices={[0]}
      ItemSeparatorComponent={() => <View style={{ height: spacing.md }} />}
      renderItem={({ item, index }) => {
        const bg = COLOR_PALETTE[index % COLOR_PALETTE.length];
        return (
          <Pressable
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
                </View>
              </View>
            </View>

            <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
          </Pressable>
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
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
  },
  metaPillOutline: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
  },
  metaText: { marginLeft: 6, fontSize: 10, fontWeight: "600" },
});
