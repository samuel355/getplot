import { useRouter } from "expo-router";
import { memo, useCallback, useRef, useState } from "react";
import { Linking, Platform, Pressable, StyleSheet, Text, View, type TextStyle } from "react-native";
import MapView, { Marker, PROVIDER_DEFAULT, PROVIDER_GOOGLE, type Region } from "react-native-maps";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { canUseGoogleProvider } from "./PlotMap";
import { type Development } from "../constants/developments";
import { useTheme } from "../constants/theme";

type PlotCounts = { total: number; available: number; sold: number };

type Props = {
  sites: Development[];
  counts: Record<string, PlotCounts>;
  countsLoading: boolean;
};

// Ghana-wide view, wide enough to show every site before fitAll narrows it down
// once the map and marker layout are actually ready.
const GHANA_REGION: Region = {
  latitude: 7.9465,
  longitude: -1.0232,
  latitudeDelta: 6.5,
  longitudeDelta: 5.5,
};

function zoomRegion(region: Region, factor: number): Region {
  return {
    ...region,
    latitudeDelta: Math.max(region.latitudeDelta * factor, 0.01),
    longitudeDelta: Math.max(region.longitudeDelta * factor, 0.01),
  };
}

function getShortLabel(title: string) {
  const words = title.replace(/\([^)]*\)/g, "").match(/[A-Za-z0-9]+/g) ?? [];
  return words
    .map((w) => w[0])
    .slice(0, 3)
    .join("")
    .toUpperCase();
}

function SitesMapComponent({ sites, counts, countsLoading }: Props) {
  const { colors, spacing, fontSize, fontWeight, borderRadius } = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const mapRef = useRef<MapView>(null);
  const regionRef = useRef<Region>(GHANA_REGION);
  const useGoogle = canUseGoogleProvider();
  const [selected, setSelected] = useState<Development | null>(null);

  const fitAll = useCallback(() => {
    if (!mapRef.current || sites.length === 0) return;
    mapRef.current.fitToCoordinates(
      sites.map((s) => s.center),
      { edgePadding: { top: 90, right: 60, bottom: 200, left: 60 }, animated: true },
    );
  }, [sites]);

  const focusSite = useCallback((site: Development) => {
    setSelected(site);
    const next: Region = {
      latitude: site.center.latitude,
      longitude: site.center.longitude,
      latitudeDelta: 0.3,
      longitudeDelta: 0.3,
    };
    regionRef.current = next;
    mapRef.current?.animateToRegion(next, 400);
  }, []);

  const zoomIn = useCallback(() => {
    const next = zoomRegion(regionRef.current, 0.5);
    regionRef.current = next;
    mapRef.current?.animateToRegion(next, 250);
  }, []);

  const zoomOut = useCallback(() => {
    const next = zoomRegion(regionRef.current, 2);
    regionRef.current = next;
    mapRef.current?.animateToRegion(next, 250);
  }, []);

  const openDirections = useCallback((site: Development) => {
    const { latitude, longitude } = site.center;
    const label = encodeURIComponent(site.title);
    const url = Platform.select({
      ios: `maps:0,0?q=${label}@${latitude},${longitude}`,
      android: `geo:0,0?q=${latitude},${longitude}(${label})`,
      default: `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`,
    });
    if (url) Linking.openURL(url).catch(() => {});
  }, []);

  const siteCounts = selected ? counts[selected.slug] : undefined;

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={useGoogle ? PROVIDER_GOOGLE : PROVIDER_DEFAULT}
        initialRegion={GHANA_REGION}
        onRegionChangeComplete={(r) => {
          regionRef.current = r;
        }}
        onMapReady={() => setTimeout(fitAll, 200)}
        showsUserLocation={false}
        showsCompass={false}
        onPress={() => setSelected(null)}
      >
        {sites.map((site) => (
          <Marker
            key={site.slug}
            coordinate={site.center}
            onPress={(e) => {
              e.stopPropagation();
              focusSite(site);
            }}
            tracksViewChanges={selected?.slug === site.slug}
          >
            <SitePin
              label={getShortLabel(site.title)}
              active={selected?.slug === site.slug}
              colors={colors}
            />
          </Marker>
        ))}
      </MapView>

      <View
        style={[styles.controls, { top: (insets.top ?? spacing.md) + 12, right: spacing.md }]}
        pointerEvents="box-none"
      >
        <MapButton icon="add" onPress={zoomIn} colors={colors} label="Zoom in" />
        <MapButton icon="remove" onPress={zoomOut} colors={colors} label="Zoom out" />
        <MapButton icon="locate-outline" onPress={fitAll} colors={colors} label="Show all sites" />
      </View>

      {selected ? (
        <View
          style={[
            styles.card,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
              borderRadius: borderRadius.lg,
              bottom: insets.bottom + spacing.lg,
            },
          ]}
        >
          <Pressable
            style={styles.cardClose}
            onPress={() => setSelected(null)}
            accessibilityLabel="Close"
          >
            <Ionicons name="close" size={16} color={colors.textMuted} />
          </Pressable>

          <Text
            style={[
              styles.cardTitle,
              {
                color: colors.text,
                fontSize: fontSize.md,
                fontWeight: fontWeight.bold as TextStyle["fontWeight"],
              },
            ]}
          >
            {selected.title}
          </Text>
          <Text style={[styles.cardSubtitle, { color: colors.textMuted, fontSize: fontSize.sm }]}>
            {selected.subtitle}
          </Text>

          <View style={[styles.statsRow, { borderColor: colors.border }]}>
            <CardStat
              label="Plots"
              value={countsLoading ? "..." : siteCounts?.total}
              color={colors.text}
              colors={colors}
            />
            <CardStat
              label="Available"
              value={countsLoading ? "..." : siteCounts?.available}
              color={colors.success}
              colors={colors}
            />
            <CardStat
              label="Sold"
              value={countsLoading ? "..." : siteCounts?.sold}
              color={colors.error}
              colors={colors}
            />
          </View>

          <View style={styles.cardActions}>
            <Pressable
              style={[
                styles.cardBtn,
                styles.cardBtnOutline,
                { borderColor: colors.border, borderRadius: borderRadius.md },
              ]}
              onPress={() => openDirections(selected)}
            >
              <Ionicons name="navigate-outline" size={16} color={colors.text} />
              <Text style={[styles.cardBtnText, { color: colors.text, fontSize: fontSize.sm }]}>
                Directions
              </Text>
            </Pressable>
            <Pressable
              style={[
                styles.cardBtn,
                { backgroundColor: colors.primary, borderRadius: borderRadius.md },
              ]}
              onPress={() => router.push(`/(tabs)/sites/${selected.slug}`)}
            >
              <Text style={[styles.cardBtnText, { color: colors.white, fontSize: fontSize.sm }]}>
                View plots
              </Text>
              <Ionicons name="arrow-forward" size={16} color={colors.white} />
            </Pressable>
          </View>
        </View>
      ) : null}
    </View>
  );
}

export const SitesMap = memo(SitesMapComponent);

const SitePin = memo(function SitePin({
  label,
  active,
  colors,
}: {
  label: string;
  active: boolean;
  colors: ReturnType<typeof useTheme>["colors"];
}) {
  return (
    <View
      style={[
        pinStyles.pill,
        { borderColor: active ? colors.primaryAccent : colors.white },
        active && { borderWidth: 2 },
      ]}
    >
      <View style={[pinStyles.dot, { backgroundColor: colors.primaryAccent }]} />
      <Text style={[pinStyles.label, { color: colors.primary }]}>{label}</Text>
    </View>
  );
});

function MapButton({
  icon,
  onPress,
  colors,
  label,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  colors: ReturnType<typeof useTheme>["colors"];
  label: string;
}) {
  return (
    <Pressable
      style={[btnStyles.btn, { backgroundColor: colors.white, borderColor: colors.border }]}
      onPress={onPress}
      accessibilityLabel={label}
      accessibilityRole="button"
    >
      <Ionicons name={icon} size={20} color={colors.primary} />
    </Pressable>
  );
}

function CardStat({
  label,
  value,
  color,
  colors,
}: {
  label: string;
  value?: number | string;
  color: string;
  colors: ReturnType<typeof useTheme>["colors"];
}) {
  return (
    <View style={statStyles.item}>
      <Text style={[statStyles.value, { color }]}>{value ?? 0}</Text>
      <Text style={[statStyles.label, { color: colors.textMuted }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#e5e7eb" },
  map: { flex: 1, width: "100%", height: "100%" },
  controls: { position: "absolute", zIndex: 12, gap: 8 },
  card: {
    position: "absolute",
    left: 16,
    right: 16,
    padding: 16,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  cardClose: { position: "absolute", top: 12, right: 12, padding: 4 },
  cardTitle: { paddingRight: 24 },
  cardSubtitle: { marginTop: 2 },
  statsRow: {
    flexDirection: "row",
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  cardActions: { flexDirection: "row", gap: 10, marginTop: 14 },
  cardBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 11,
  },
  cardBtnOutline: { borderWidth: 1 },
  cardBtnText: { fontWeight: "700" },
});

const pinStyles = StyleSheet.create({
  pill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#fff",
    borderRadius: 999,
    borderWidth: 1.5,
    paddingHorizontal: 10,
    paddingVertical: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  dot: { width: 8, height: 8, borderRadius: 4 },
  label: { fontSize: 11, fontWeight: "800" },
});

const btnStyles = StyleSheet.create({
  btn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 4,
  },
});

const statStyles = StyleSheet.create({
  item: { marginRight: 18 },
  value: { fontSize: 13, fontWeight: "700" },
  label: { fontSize: 10, marginTop: 1 },
});
