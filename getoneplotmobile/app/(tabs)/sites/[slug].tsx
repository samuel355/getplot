import { useAuth } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import { useCallback, useEffect, useLayoutEffect, useMemo, useState } from "react";
import {
  Alert,
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type TextStyle,
} from "react-native";
import { useTheme } from "../../../src/constants/theme";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MapLegend } from "../../../src/components/MapLegend";
import { PlotDetailSheet } from "../../../src/components/PlotDetailSheet";
import { PlotMap } from "../../../src/components/PlotMap";
import { getDevelopment } from "../../../src/constants/developments";
import { fetchPlotsForTable } from "../../../src/lib/mapUtils";
import { formatAreaSize, formatGhs, formatStreet } from "../../../src/lib/plotService";
import type { PlotFeature } from "../../../src/types/plot";
import { useCartStore } from "../../../src/stores/cartStore";

type SiteView = "map" | "list";
type StatusFilter = "all" | "available" | "reserved" | "sold" | "hold";

const STATUS_FILTERS: Array<{ key: StatusFilter; label: string }> = [
  { key: "all", label: "All" },
  { key: "available", label: "Available" },
  { key: "reserved", label: "Reserved" },
  { key: "sold", label: "Sold" },
  { key: "hold", label: "On Hold" },
];

function statusKey(status?: string | null): Exclude<StatusFilter, "all"> | "other" {
  const normalized = String(status ?? "").trim().toLowerCase();
  if (!normalized || normalized === "available") return "available";
  if (normalized === "reserved") return "reserved";
  if (normalized === "sold") return "sold";
  if (normalized === "hold" || normalized === "on hold") return "hold";
  return "other";
}

export default function SiteMapScreen() {
  const { colors, fontSize, spacing, fontWeight } = useTheme();
  const params = useLocalSearchParams<{ slug: string; returnTo?: string }>();
  const slug = Array.isArray(params.slug) ? params.slug[0] : params.slug;
  const returnTo = Array.isArray(params.returnTo) ? params.returnTo[0] : params.returnTo;
  const router = useRouter();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { isSignedIn } = useAuth();
  const development = getDevelopment(slug || "");
  const [plots, setPlots] = useState<PlotFeature[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [selected, setSelected] = useState<PlotFeature | null>(null);
  const [view, setView] = useState<SiteView>("map");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const addPlot = useCartStore((s) => s.addPlot);
  const isInCart = useCartStore((s) => s.isInCart);

  const goBack = useCallback(() => {
    if (returnTo === "admin-plots") {
      router.replace("/admin/plots");
      return;
    }
    if (router.canGoBack()) {
      router.back();
      return;
    }
    router.push("/admin/plots");
  }, [returnTo, router]);

  useLayoutEffect(() => {
    const tabNav = navigation.getParent();
    tabNav?.setOptions({ tabBarStyle: { display: "none" } });
    return () => {
      tabNav?.setOptions({ tabBarStyle: undefined });
    };
  }, [navigation]);

  useLayoutEffect(() => {
    if (development) {
      navigation.setOptions({
        title: development.title,
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.text,
        headerLeft: () => (
          <Pressable style={styles.headerBackButton} onPress={goBack}>
            <Ionicons name="chevron-back" size={24} color={colors.primary} />
            <Text
              style={[
                styles.headerBackText,
                {
                  color: colors.primary,
                  fontSize: fontSize.md,
                  fontWeight: fontWeight.bold as TextStyle["fontWeight"],
                },
              ]}
            >
              Back
            </Text>
          </Pressable>
        ),
      });
    }
  }, [development, goBack, navigation, colors, fontSize, fontWeight]);

  const loadPlots = useCallback(async () => {
    if (!development) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setFetchError(null);
    try {
      const data = await fetchPlotsForTable(development.table);
      setPlots(data);
      if (data.length === 0) {
        setFetchError("No plots found for this development.");
      }
    } catch (e) {
      setFetchError(e instanceof Error ? e.message : "Failed to load plots");
    } finally {
      setLoading(false);
    }
  }, [development]);

  useEffect(() => {
    loadPlots();
  }, [loadPlots]);

  const stats = useMemo(() => {
    const next = { total: plots.length, available: 0, reserved: 0, sold: 0, hold: 0 };
    plots.forEach((plot) => {
      const key = statusKey(plot.status);
      if (key !== "other") next[key] += 1;
    });
    return next;
  }, [plots]);
  const soldOut = !loading && stats.total > 0 && stats.sold === stats.total;

  const filteredPlots = useMemo(
    () =>
      statusFilter === "all"
        ? plots
        : plots.filter((plot) => statusKey(plot.status) === statusFilter),
    [plots, statusFilter],
  );

  if (!development) {
    return null;
  }

  const requireAuth = (action: () => void) => {
    if (!isSignedIn) {
      Alert.alert("Sign in required", "Please sign in to continue.", [
        { text: "Cancel", style: "cancel" },
        { text: "Sign In", onPress: () => router.push("/(auth)/sign-in") },
      ]);
      return;
    }
    action();
  };

  const handlePlotUpdated = (updatedPlot: PlotFeature) => {
    setPlots((current) =>
      current.map((plot) => (plot.id === updatedPlot.id ? updatedPlot : plot)),
    );
    setSelected(updatedPlot);
  };

  return (
    <View
      style={[
        styles.container,
        { paddingBottom: insets.bottom, backgroundColor: colors.background },
      ]}
    >
      <View style={[styles.siteBar, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={styles.statsRow}>
          <SiteStat label="Total" value={stats.total} color={colors.text} />
          <SiteStat label="Available" value={stats.available} color={colors.success} />
          <SiteStat label="Reserved" value={stats.reserved} color={colors.text} />
          <SiteStat label="Sold" value={stats.sold} color={colors.error} />
        </View>
        <View style={[styles.viewToggle, { backgroundColor: colors.background }]}>
          <ViewButton
            label="Map"
            icon="map-outline"
            active={view === "map"}
            onPress={() => setView("map")}
          />
          <ViewButton
            label="List"
            icon="grid-outline"
            active={view === "list"}
            onPress={() => setView("list")}
          />
        </View>
      </View>

      {soldOut ? (
        <View
          style={[
            styles.soldOutBanner,
            { backgroundColor: colors.error + "12", borderColor: colors.error + "30" },
          ]}
        >
          <View style={[styles.soldOutIcon, { backgroundColor: colors.error }]}>
            <Ionicons name="checkmark" size={14} color={colors.white} />
          </View>
          <View style={styles.soldOutCopy}>
            <Text style={[styles.soldOutTitle, { color: colors.error }]}>Site sold out</Text>
            <Text style={[styles.soldOutText, { color: colors.textMuted }]}>
              All {stats.total.toLocaleString()} plots at this location have been sold.
            </Text>
          </View>
        </View>
      ) : null}

      {view === "map" ? (
        <>
          <PlotMap
            development={development}
            plots={plots}
            loading={loading}
            onPlotPress={setSelected}
            onRefresh={loadPlots}
          />
          <MapLegend />
        </>
      ) : (
        <View style={styles.listPane}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filters}
          >
            {STATUS_FILTERS.map((filter) => {
              const active = statusFilter === filter.key;
              const count = filter.key === "all" ? stats.total : stats[filter.key];
              return (
                <Pressable
                  key={filter.key}
                  onPress={() => setStatusFilter(filter.key)}
                  style={[
                    styles.filterChip,
                    { borderColor: active ? colors.primary : colors.border },
                    active && { backgroundColor: colors.primary },
                  ]}
                >
                  <Text style={{ color: active ? colors.white : colors.text, fontSize: fontSize.xs }}>
                    {filter.label}  {count}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
          <FlatList
            data={filteredPlots}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.plotList}
            ItemSeparatorComponent={() => <View style={{ height: spacing.sm }} />}
            renderItem={({ item }) => (
              <PlotListCard
                plot={item}
                onPress={() => {
                  setSelected(item);
                  setView("map");
                }}
              />
            )}
            ListEmptyComponent={
              !loading ? (
                <Text style={[styles.emptyText, { color: colors.textMuted }]}>No matching plots found.</Text>
              ) : null
            }
          />
        </View>
      )}
      {fetchError && !loading ? (
        <View
          style={[
            styles.errorBanner,
            { backgroundColor: colors.error + "10", borderColor: colors.error + "30" },
          ]}
        >
          <Text style={[styles.errorText, { color: colors.error, fontSize: fontSize.sm }]}>
            {fetchError}
          </Text>
        </View>
      ) : null}
      <PlotDetailSheet
        visible={!!selected}
        plot={selected}
        development={development}
        inCart={selected ? isInCart(selected.id) : false}
        onClose={() => setSelected(null)}
        onAddToCart={() => {
          if (!selected) return;
          requireAuth(() => {
            addPlot({ ...selected, table: development.table, siteName: development.title });
            Alert.alert("Added", "Plot added to cart");
          });
        }}
        onBuy={() => {
          if (!selected) return;
          requireAuth(() => {
            setSelected(null);
            router.push({
              pathname: "/plot/buy",
              params: {
                id: selected.id,
                slug: development.slug,
                table: development.table,
              },
            });
          });
        }}
        onReserve={() => {
          if (!selected) return;
          requireAuth(() => {
            setSelected(null);
            router.push({
              pathname: "/plot/reserve",
              params: {
                id: selected.id,
                slug: development.slug,
                table: development.table,
              },
            });
          });
        }}
        onExpressInterest={() => {
          if (!selected) return;
          setSelected(null);
          router.push({
            pathname: "/plot/interest",
            params: {
              id: selected.id,
              slug: development.slug,
              table: development.table,
              interestTable: development.interestTable,
            },
          });
        }}
        onPlotUpdated={handlePlotUpdated}
      />
    </View>
  );
}

function SiteStat({ label, value, color }: { label: string; value: number; color: string }) {
  const { colors, fontSize } = useTheme();
  return (
    <View style={styles.statItem}>
      <Text style={[styles.statValue, { color, fontSize: fontSize.sm }]}>{value.toLocaleString()}</Text>
      <Text style={[styles.statLabel, { color: colors.textMuted }]}>{label}</Text>
    </View>
  );
}

function ViewButton({
  label,
  icon,
  active,
  onPress,
}: {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  active: boolean;
  onPress: () => void;
}) {
  const { colors, fontSize } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={[styles.viewButton, active && { backgroundColor: colors.surface }]}
    >
      <Ionicons name={icon} size={15} color={active ? colors.primary : colors.textMuted} />
      <Text style={{ color: active ? colors.primary : colors.textMuted, fontSize: fontSize.xs }}>
        {label}
      </Text>
    </Pressable>
  );
}

function PlotListCard({ plot, onPress }: { plot: PlotFeature; onPress: () => void }) {
  const { colors, fontSize } = useTheme();
  const props = plot.properties ?? {};
  const plotNo = props.Plot_No ?? plot.id;
  const street = formatStreet(props.Street_Nam);
  const status = plot.status || "Available";
  const key = statusKey(status);
  const statusColor =
    key === "available" ? colors.success : key === "sold" ? colors.error : colors.text;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.plotCard,
        { backgroundColor: colors.surface, borderColor: colors.border },
        pressed && { opacity: 0.82 },
      ]}
    >
      <View style={styles.plotCardTop}>
        <Text style={[styles.plotTitle, { color: colors.text, fontSize: fontSize.md }]}>
          Plot {String(plotNo)}
        </Text>
        <Text style={[styles.plotStatus, { color: statusColor }]}>{status}</Text>
      </View>
      {street ? <Text style={[styles.plotMeta, { color: colors.textMuted }]}>{street}</Text> : null}
      <View style={styles.plotCardBottom}>
        <Text style={[styles.plotPrice, { color: colors.text }]}>
          {plot.plotTotalAmount ? formatGhs(plot.plotTotalAmount) : "Contact for price"}
        </Text>
        <Text style={[styles.plotMeta, { color: colors.textMuted }]}>
          {formatAreaSize(props.Area)}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  siteBar: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 10,
  },
  statsRow: { flexDirection: "row", justifyContent: "space-between" },
  statItem: { minWidth: 58 },
  statValue: { fontWeight: "700" },
  statLabel: { marginTop: 1, fontSize: 10 },
  viewToggle: { flexDirection: "row", alignSelf: "flex-start", borderRadius: 9, padding: 3 },
  viewButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 7,
  },
  soldOutBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginHorizontal: 16,
    marginTop: 10,
    paddingHorizontal: 13,
    paddingVertical: 11,
    borderWidth: 1,
    borderRadius: 12,
  },
  soldOutIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  soldOutCopy: { flex: 1 },
  soldOutTitle: { fontSize: 13, fontWeight: "800", textTransform: "uppercase", letterSpacing: 0.5 },
  soldOutText: { marginTop: 2, fontSize: 11, lineHeight: 15 },
  listPane: { flex: 1 },
  filters: { paddingHorizontal: 16, paddingVertical: 12, gap: 8 },
  filterChip: { borderWidth: 1, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 7 },
  plotList: { paddingHorizontal: 16, paddingBottom: 28 },
  plotCard: { borderWidth: 1, borderRadius: 12, padding: 14 },
  plotCardTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  plotCardBottom: { flexDirection: "row", justifyContent: "space-between", marginTop: 12 },
  plotTitle: { fontWeight: "700", flex: 1 },
  plotStatus: { fontSize: 11, fontWeight: "700" },
  plotPrice: { fontSize: 13, fontWeight: "700" },
  plotMeta: { fontSize: 11, marginTop: 3 },
  emptyText: { textAlign: "center", paddingVertical: 48, fontSize: 13 },
  headerBackButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingRight: 12,
  },
  headerBackText: {},
  errorBanner: {
    position: "absolute",
    bottom: 24,
    left: 20,
    right: 20,
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    zIndex: 10,
  },
  errorText: { textAlign: "center" },
});
