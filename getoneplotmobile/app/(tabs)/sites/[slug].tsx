import { useAuth } from '@clerk/clerk-expo';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
import { useCallback, useEffect, useLayoutEffect, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, fontSize, spacing } from '../../../src/constants/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MapLegend } from '../../../src/components/MapLegend';
import { PlotDetailSheet } from '../../../src/components/PlotDetailSheet';
import { PlotMap } from '../../../src/components/PlotMap';
import { getDevelopment } from '../../../src/constants/developments';
import { fetchPlotsForTable } from '../../../src/lib/mapUtils';
import type { PlotFeature } from '../../../src/types/plot';
import { useCartStore } from '../../../src/stores/cartStore';

export default function SiteMapScreen() {
  const params = useLocalSearchParams<{ slug: string; returnTo?: string }>();
  const slug = Array.isArray(params.slug) ? params.slug[0] : params.slug;
  const returnTo = Array.isArray(params.returnTo) ? params.returnTo[0] : params.returnTo;
  const router = useRouter();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { isSignedIn } = useAuth();
  const development = getDevelopment(slug || '');
  const [plots, setPlots] = useState<PlotFeature[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [selected, setSelected] = useState<PlotFeature | null>(null);
  const { addPlot, isInCart } = useCartStore();

  const goBack = useCallback(() => {
    if (returnTo === 'admin-plots') {
      router.replace('/admin/plots');
      return;
    }
    if (router.canGoBack()) {
      router.back();
      return;
    }
    router.push('/admin/plots');
  }, [returnTo, router]);

  useLayoutEffect(() => {
    const tabNav = navigation.getParent();
    tabNav?.setOptions({ tabBarStyle: { display: 'none' } });
    return () => {
      tabNav?.setOptions({ tabBarStyle: undefined });
    };
  }, [navigation]);

  useLayoutEffect(() => {
    if (development) {
      navigation.setOptions({
        title: development.title,
        headerLeft: () => (
          <Pressable style={styles.headerBackButton} onPress={goBack}>
            <Ionicons name="chevron-back" size={24} color={colors.primary} />
            <Text style={styles.headerBackText}>Back</Text>
          </Pressable>
        ),
      });
    }
  }, [development, goBack, navigation]);

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
        setFetchError('No plots found for this development.');
      }
    } catch (e) {
      setFetchError(e instanceof Error ? e.message : 'Failed to load plots');
    } finally {
      setLoading(false);
    }
  }, [development]);

  useEffect(() => {
    loadPlots();
  }, [loadPlots]);

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
    <View style={[styles.container, { paddingBottom: insets.bottom }]}>
      <PlotMap
        development={development}
        plots={plots}
        loading={loading}
        onPlotPress={setSelected}
        onRefresh={loadPlots}
      />
      <MapLegend />
      {fetchError && !loading ? (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>{fetchError}</Text>
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
              pathname: '/plot/reserve',
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
  headerBackButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: spacing.sm,
  },
  headerBackText: {
    color: colors.primary,
    fontSize: fontSize.md,
    fontWeight: '700',
  },
  errorBanner: {
    position: 'absolute',
    bottom: 24,
    left: spacing.lg,
    right: spacing.lg,
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fecaca',
    borderRadius: 10,
    padding: spacing.md,
    zIndex: 10,
  },
  errorText: { color: colors.error, fontSize: fontSize.sm, textAlign: 'center' },
});
