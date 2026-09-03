import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "expo-router";
import {
  Pressable,
  SectionList,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  type TextStyle,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { DEVELOPMENTS, type Development } from "../../../src/constants/developments";
import { useTheme } from "../../../src/constants/theme";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { supabase } from "../../../src/lib/supabase";
import { SitesMap } from "../../../src/components/SitesMap";

type SiteView = "list" | "map";

function getInitials(title: string) {
  const words = title.match(/[A-Za-z0-9]+/g) ?? [];
  return words
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

type PlotCounts = { total: number; available: number; sold: number };

// Status values are stored as "Available" / "Sold" / "Reserved" (Title Case) or null
// (treated as available), consistently across every site table — confirmed by sampling
// each table directly. head:true count queries return only a count header, no row
// payload, so this is 3 lightweight requests per site instead of paginating through
// every row just to tally 3 numbers client-side (the previous approach transferred
// ~2,943 rows for Trabuom Sector 1 alone, repeated for all 9 sites on every mount).
async function fetchPlotCounts(development: Development): Promise<PlotCounts> {
  const [totalRes, soldRes, availableRes] = await Promise.all([
    supabase.from(development.table).select("*", { count: "exact", head: true }),
    supabase.from(development.table).select("*", { count: "exact", head: true }).eq("status", "Sold"),
    supabase
      .from(development.table)
      .select("*", { count: "exact", head: true })
      .or("status.eq.Available,status.is.null"),
  ]);

  return {
    total: totalRes.count ?? 0,
    sold: soldRes.count ?? 0,
    available: availableRes.count ?? 0,
  };
}

export default function SitesScreen() {
  const { colors, spacing, fontSize, fontWeight, borderRadius, isDark } = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [view, setView] = useState<SiteView>("list");
  const [query, setQuery] = useState("");
  const [region, setRegion] = useState("All");
  const [counts, setCounts] = useState<Record<string, PlotCounts>>({});
  const [countsLoading, setCountsLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      const results = await Promise.all(
        DEVELOPMENTS.map(async (d) => [d.slug, await fetchPlotCounts(d)] as const),
      );
      if (alive) {
        setCounts(Object.fromEntries(results));
        setCountsLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

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

  const sections = useMemo(
    () =>
      ["Kumasi", "Accra"]
        .map((title) => ({ title, data: filtered.filter((site) => site.subtitle === title) }))
        .filter((section) => section.data.length > 0),
    [filtered],
  );

  const Header = () => (
    <View
      style={{
        paddingTop: insets.top + spacing.md,
        paddingBottom: spacing.sm,
        paddingHorizontal: spacing.lg,
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

        <View style={[styles.viewToggle, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <ViewToggleButton
            icon="list"
            active={view === "list"}
            onPress={() => setView("list")}
            colors={colors}
          />
          <ViewToggleButton
            icon="map"
            active={view === "map"}
            onPress={() => setView("map")}
            colors={colors}
          />
        </View>
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
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Header />

      {view === "map" ? (
        <SitesMap sites={filtered} counts={counts} countsLoading={countsLoading} />
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={(item) => item.slug}
          contentContainerStyle={{
            paddingHorizontal: spacing.lg,
            paddingBottom: 120,
            backgroundColor: colors.background,
          }}
          style={{ backgroundColor: colors.background }}
          ItemSeparatorComponent={() => <View style={{ height: spacing.md }} />}
          renderSectionHeader={({ section }) => (
            <View style={[styles.sectionHeader, { backgroundColor: colors.background }]}>
              <View style={[styles.sectionTitleWrap, { backgroundColor: colors.primary }]}>
                <Ionicons name="location" size={13} color={colors.primaryAccent} />
                <Text
                  style={[
                    styles.sectionTitle,
                    {
                      color: colors.primaryAccent,
                      fontWeight: fontWeight.bold as TextStyle["fontWeight"],
                    },
                  ]}
                >
                  {section.title}
                </Text>
              </View>
              <Text style={[styles.sectionCount, { color: colors.textMuted }]}>
                {section.data.length} {section.data.length === 1 ? "site" : "sites"}
              </Text>
              <View style={[styles.sectionLine, { backgroundColor: colors.border }]} />
            </View>
          )}
          renderItem={({ item, index }) => {
            const bg = COLOR_PALETTE[index % COLOR_PALETTE.length];
            const siteCounts = counts[item.slug];
            const soldOut =
              !countsLoading &&
              Number(siteCounts?.total) > 0 &&
              Number(siteCounts?.sold) === Number(siteCounts?.total);
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
                  <View style={styles.titleRow}>
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
                    {soldOut ? (
                      <View style={[styles.soldOutPill, { backgroundColor: colors.error + "18" }]}>
                        <Text style={[styles.soldOutPillText, { color: colors.error }]}>SOLD OUT</Text>
                      </View>
                    ) : null}
                  </View>
                  <Text style={[styles.subtitle, { color: colors.textMuted, fontSize: fontSize.sm }]}>
                    {item.subtitle}
                  </Text>

                  <View style={[styles.statsRow, { borderColor: colors.border }]}>
                    <SiteStat
                      label="Plots"
                      value={countsLoading ? "..." : siteCounts?.total}
                      color={colors.text}
                    />
                    <SiteStat
                      label="Available"
                      value={countsLoading ? "..." : siteCounts?.available}
                      color={colors.success}
                    />
                    <SiteStat
                      label="Sold"
                      value={countsLoading ? "..." : siteCounts?.sold}
                      color={colors.error}
                    />
                  </View>
                </View>

                <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
              </Pressable>
            );
          }}
        />
      )}
    </View>
  );
}

function ViewToggleButton({
  icon,
  active,
  onPress,
  colors,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  active: boolean;
  onPress: () => void;
  colors: ReturnType<typeof useTheme>["colors"];
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.viewToggleBtn,
        active && { backgroundColor: colors.primary },
      ]}
    >
      <Ionicons name={icon} size={16} color={active ? colors.white : colors.textMuted} />
    </Pressable>
  );
}

function SiteStat({ label, value, color }: { label: string; value?: number | string; color: string }) {
  const { colors, fontSize, fontWeight } = useTheme();
  return (
    <View style={statStyles.item}>
      <Text
        style={[
          statStyles.value,
          { color, fontSize: fontSize.sm, fontWeight: fontWeight.bold as TextStyle["fontWeight"] },
        ]}
      >
        {value ?? 0}
      </Text>
      <Text style={[statStyles.label, { color: colors.textMuted, fontSize: 10 }]}>{label}</Text>
    </View>
  );
}

const statStyles = StyleSheet.create({
  item: { marginRight: 18 },
  value: {},
  label: { marginTop: 1 },
});

const styles = StyleSheet.create({
  headerWrap: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  pageHeading: {},
  viewToggle: {
    flexDirection: "row",
    borderRadius: 10,
    borderWidth: 1,
    padding: 3,
    gap: 2,
  },
  viewToggleBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
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
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingTop: 20,
    paddingBottom: 12,
  },
  sectionTitleWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  sectionTitle: { fontSize: 11, letterSpacing: 1.2, textTransform: "uppercase" },
  sectionCount: { fontSize: 11, fontWeight: "600" },
  sectionLine: { height: StyleSheet.hairlineWidth, flex: 1 },
  thumb: { width: 50, height: 50, alignItems: "center", justifyContent: "center" },
  thumbText: { color: "#fff", fontSize: 18 },
  cardBody: { flex: 1, marginLeft: 16 },
  titleRow: { flexDirection: "row", alignItems: "center", flexWrap: "wrap", gap: 7 },
  soldOutPill: { borderRadius: 999, paddingHorizontal: 7, paddingVertical: 3 },
  soldOutPillText: { fontSize: 9, fontWeight: "800", letterSpacing: 0.6 },
  title: {},
  subtitle: { marginTop: 2 },
  statsRow: {
    flexDirection: "row",
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
});
