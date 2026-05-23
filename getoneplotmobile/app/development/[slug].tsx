import { useAuth } from '@clerk/clerk-expo';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { MapLegend } from '../../src/components/MapLegend';
import { PlotDetailSheet } from '../../src/components/PlotDetailSheet';
import { PlotMap } from '../../src/components/PlotMap';
import { getDevelopment } from '../../src/constants/developments';
import { fetchPlotsForTable } from '../../src/lib/mapUtils';
import type { PlotFeature } from '../../src/types/plot';
import { useCartStore } from '../../src/stores/cartStore';

export default function DevelopmentMapScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const router = useRouter();
  const { isSignedIn } = useAuth();
  const development = getDevelopment(slug || '');
  const [plots, setPlots] = useState<PlotFeature[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<PlotFeature | null>(null);
  const { addPlot, isInCart } = useCartStore();

  useEffect(() => {
    if (!development) return;
    (async () => {
      setLoading(true);
      const data = await fetchPlotsForTable(development.table);
      setPlots(data);
      setLoading(false);
    })();
  }, [development?.table]);

  if (!development) {
    return null;
  }

  const requireAuth = (action: () => void) => {
    if (!isSignedIn) {
      Alert.alert('Sign in required', 'Please sign in to continue.', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign In', onPress: () => router.push('/(auth)/sign-in') },
      ]);
      return;
    }
    action();
  };

  return (
    <View style={styles.container}>
      <PlotMap
        development={development}
        plots={plots}
        loading={loading}
        onPlotPress={setSelected}
      />
      <MapLegend />
      <PlotDetailSheet
        visible={!!selected}
        plot={selected}
        development={development}
        inCart={selected ? isInCart(selected.id) : false}
        onClose={() => setSelected(null)}
        onAddToCart={() => {
          if (!selected) return;
          requireAuth(() => {
            addPlot(selected);
            Alert.alert('Added', 'Plot added to cart');
          });
        }}
        onBuy={() => {
          if (!selected) return;
          requireAuth(() => {
            setSelected(null);
            router.push({
              pathname: '/plot/buy',
              params: { id: selected.id, slug: development.slug, table: development.table },
            });
          });
        }}
        onReserve={() => {
          if (!selected) return;
          requireAuth(() => {
            setSelected(null);
            router.push({
              pathname: '/plot/reserve',
              params: { id: selected.id, slug: development.slug, table: development.table },
            });
          });
        }}
        onExpressInterest={() => {
          if (!selected) return;
          setSelected(null);
          router.push({
            pathname: '/plot/interest',
            params: {
              id: selected.id,
              slug: development.slug,
              table: development.table,
              interestTable: development.interestTable,
            },
          });
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});
