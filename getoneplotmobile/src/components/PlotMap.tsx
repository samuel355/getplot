import Constants from "expo-constants";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Platform, StyleSheet, Text, View } from "react-native";
import MapView, {
  Polygon,
  PROVIDER_DEFAULT,
  PROVIDER_GOOGLE,
  type Region,
} from "react-native-maps";
import { MapControls, type MapTypeOption } from "./MapControls";
import { Loading } from "./ui/Loading";
import { getPlotFillColor, getPlotStrokeColor, getPolygonRing } from "../lib/mapUtils";
import type { PlotFeature } from "../types/plot";
import type { Development } from "../constants/developments";
import { colors, fontSize, spacing } from "../constants/theme";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type Props = {
  development: Development;
  plots: PlotFeature[];
  loading?: boolean;
  onPlotPress: (plot: PlotFeature) => void;
  onRefresh?: () => void;
};

const googleMapsKey = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;

export function canUseGoogleProvider() {
  if (Platform.OS === "web" || !googleMapsKey) return false;
  if (Constants.appOwnership === "expo") return false;
  return true;
}

function regionFromPlots(plots: PlotFeature[], fallback: Development): Region {
  const coords = plots.flatMap((p) => getPolygonRing(p));
  if (!coords.length) {
    return {
      latitude: fallback.center.latitude,
      longitude: fallback.center.longitude,
      latitudeDelta: 0.025,
      longitudeDelta: 0.025,
    };
  }
  let minLat = Infinity;
  let maxLat = -Infinity;
  let minLng = Infinity;
  let maxLng = -Infinity;
  coords.forEach(({ latitude, longitude }) => {
    minLat = Math.min(minLat, latitude);
    maxLat = Math.max(maxLat, latitude);
    minLng = Math.min(minLng, longitude);
    maxLng = Math.max(maxLng, longitude);
  });
  const pad = 0.004;
  return {
    latitude: (minLat + maxLat) / 2,
    longitude: (minLng + maxLng) / 2,
    latitudeDelta: Math.max(maxLat - minLat + pad, 0.008),
    longitudeDelta: Math.max(maxLng - minLng + pad, 0.008),
  };
}

function zoomRegion(region: Region, factor: number): Region {
  return {
    ...region,
    latitudeDelta: Math.max(region.latitudeDelta * factor, 0.0008),
    longitudeDelta: Math.max(region.longitudeDelta * factor, 0.0008),
  };
}

function PlotMapComponent({ development, plots, loading, onPlotPress, onRefresh }: Props) {
  const mapRef = useRef<MapView>(null);
  const useGoogle = canUseGoogleProvider();
  const [mapReady, setMapReady] = useState(false);
  const [mapType, setMapType] = useState<MapTypeOption>(useGoogle ? "hybrid" : "satellite");
  const regionRef = useRef<Region>(regionFromPlots(plots, development));
  const insets = useSafeAreaInsets();

  const initialRegion = useMemo(() => regionFromPlots(plots, development), [plots, development]);

  useEffect(() => {
    if (plots.length > 0) {
      regionRef.current = regionFromPlots(plots, development);
    }
  }, [plots, development]);

  const fitAll = useCallback(() => {
    if (!plots.length || !mapRef.current) return;
    const coords = plots.flatMap((p) => getPolygonRing(p));
    if (coords.length < 1) return;
    try {
      mapRef.current.fitToCoordinates(coords, {
        edgePadding: { top: 120, right: 56, bottom: 180, left: 56 },
        animated: true,
      });
    } catch {
      const next = regionFromPlots(plots, development);
      regionRef.current = next;
      mapRef.current.animateToRegion(next, 500);
    }
  }, [plots, development]);

  useEffect(() => {
    if (mapReady && plots.length > 0) {
      const t = setTimeout(fitAll, 300);
      return () => clearTimeout(t);
    }
  }, [mapReady, plots, fitAll]);

  const mapProvider = useGoogle ? PROVIDER_GOOGLE : PROVIDER_DEFAULT;
  const effectiveMapType =
    !useGoogle && (mapType === "hybrid" || mapType === "terrain") ? "satellite" : mapType;

  const zoomIn = () => {
    const next = zoomRegion(regionRef.current, 0.5);
    regionRef.current = next;
    mapRef.current?.animateToRegion(next, 250);
  };

  const zoomOut = () => {
    const next = zoomRegion(regionRef.current, 2);
    regionRef.current = next;
    mapRef.current?.animateToRegion(next, 250);
  };

  return (
    <View style={styles.container}>
      {loading && plots.length === 0 ? (
        <View style={styles.loadingOverlay}>
          <Loading fullScreen={false} />
          <Text style={styles.loadingText}>Loading plots…</Text>
        </View>
      ) : null}

      {!loading && plots.length === 0 ? (
        <View style={styles.emptyOverlay}>
          <Text style={styles.emptyTitle}>No plots to display</Text>
          <Text style={styles.emptySub}>
            Plots for this site could not be loaded. Check your connection and try again.
          </Text>
        </View>
      ) : null}

      {!loading && plots.length > 0 ? (
        <View
          style={[styles.countBadge, { top: (insets.top ?? spacing.md) + 8 }]}
          pointerEvents="none"
        >
          <Text style={styles.countText}>{plots.length} plots</Text>
        </View>
      ) : null}

      <MapView
        ref={mapRef}
        style={styles.map}
        provider={mapProvider}
        mapType={effectiveMapType}
        initialRegion={initialRegion}
        onRegionChangeComplete={(r) => {
          regionRef.current = r;
        }}
        showsUserLocation={false}
        showsCompass
        showsScale
        onMapReady={() => {
          setMapReady(true);
          fitAll();
        }}
      >
        {plots.map((plot) => (
          <PlotPolygon key={plot.id} plot={plot} onPress={onPlotPress} />
        ))}
      </MapView>

      {!loading && plots.length > 0 ? (
        <MapControls
          mapType={mapType}
          onMapTypeChange={setMapType}
          onZoomIn={zoomIn}
          onZoomOut={zoomOut}
          onFitAll={fitAll}
          onRefresh={onRefresh}
          style={[styles.controls, { top: (insets.top ?? spacing.md) + 12 }]}
        />
      ) : null}
    </View>
  );
}

export const PlotMap = memo(PlotMapComponent);

// Memoized per polygon so that updating one plot (e.g. after a status change) only
// re-renders that single polygon instead of re-creating all ~3,000 of them, and a
// stable per-plot onPress instead of a new inline closure on every PlotMap render.
const PlotPolygon = memo(function PlotPolygon({
  plot,
  onPress,
}: {
  plot: PlotFeature;
  onPress: (plot: PlotFeature) => void;
}) {
  const handlePress = useCallback(() => onPress(plot), [onPress, plot]);
  const coords = getPolygonRing(plot);
  if (coords.length < 3) return null;

  const amount = plot.plotTotalAmount || 0;
  const status = plot.status ?? null;

  return (
    <Polygon
      coordinates={coords}
      fillColor={getPlotFillColor(status, amount)}
      strokeColor={getPlotStrokeColor(status, amount)}
      strokeWidth={2.5}
      tappable
      onPress={handlePress}
    />
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
    backgroundColor: "#e5e7eb",
  },
  map: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  controls: {
    right: spacing.md,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 2,
    backgroundColor: "rgba(255,255,255,0.92)",
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: { marginTop: spacing.md, color: colors.textMuted, fontSize: fontSize.sm },
  emptyOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 2,
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.lg,
    backgroundColor: colors.surface,
  },
  emptyTitle: { fontWeight: "700", fontSize: fontSize.lg, color: colors.primary },
  emptySub: { marginTop: 8, color: colors.textMuted, fontSize: fontSize.sm, textAlign: "center" },
  countBadge: {
    position: "absolute",
    alignSelf: "center",
    zIndex: 10,
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
  },
  countText: { color: colors.white, fontSize: fontSize.xs, fontWeight: "600" },
});
