import { useCallback, useMemo, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import MapView, { Polygon, type Region } from 'react-native-maps';
import { Loading } from './ui/Loading';
import {
  calculateBoundingBox,
  getPlotFillColor,
  getPlotStrokeColor,
  isPolygonInBounds,
} from '../lib/mapUtils';
import type { PlotFeature } from '../types/plot';
import type { Development } from '../constants/developments';

type Props = {
  development: Development;
  plots: PlotFeature[];
  loading?: boolean;
  onPlotPress: (plot: PlotFeature) => void;
};

export function PlotMap({ development, plots, loading, onPlotPress }: Props) {
  const mapRef = useRef<MapView>(null);
  const [region, setRegion] = useState<Region>({
    latitude: development.center.latitude,
    longitude: development.center.longitude,
    latitudeDelta: 0.02,
    longitudeDelta: 0.02,
  });

  const visiblePlots = useMemo(() => {
    const bounds = {
      south: region.latitude - region.latitudeDelta / 2,
      north: region.latitude + region.latitudeDelta / 2,
      west: region.longitude - region.longitudeDelta / 2,
      east: region.longitude + region.longitudeDelta / 2,
    };
    return plots.filter((p) => {
      if (!p.geometry?.coordinates?.[0]) return false;
      const box = calculateBoundingBox(p);
      return isPolygonInBounds(box, bounds);
    });
  }, [plots, region]);

  const fitAll = useCallback(() => {
    if (!plots.length || !mapRef.current) return;
    const coords = plots.flatMap((p) =>
      (p.geometry.coordinates[0] || []).map(([lng, lat]) => ({
        latitude: lat,
        longitude: lng,
      }))
    );
    if (coords.length)
      mapRef.current.fitToCoordinates(coords, {
        edgePadding: { top: 48, right: 48, bottom: 48, left: 48 },
        animated: true,
      });
  }, [plots]);

  return (
    <View style={styles.container}>
      {loading && plots.length === 0 ? <Loading fullScreen={false} /> : null}
      <MapView
        ref={mapRef}
        style={styles.map}
        mapType="hybrid"
        initialRegion={{
          latitude: development.center.latitude,
          longitude: development.center.longitude,
          latitudeDelta: 0.02,
          longitudeDelta: 0.02,
        }}
        onRegionChangeComplete={setRegion}
        onMapReady={fitAll}
      >
        {visiblePlots.map((plot) => {
          const coords = plot.geometry.coordinates[0].map(([lng, lat]) => ({
            latitude: lat,
            longitude: lng,
          }));
          const amount = plot.plotTotalAmount || 0;
          const status = plot.status ?? null;
          return (
            <Polygon
              key={plot.id}
              coordinates={coords}
              fillColor={getPlotFillColor(status, amount)}
              strokeColor={getPlotStrokeColor(status, amount)}
              strokeWidth={1.5}
              tappable
              onPress={() => onPlotPress(plot)}
            />
          );
        })}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, minHeight: 400 },
  map: { ...StyleSheet.absoluteFill },
});
