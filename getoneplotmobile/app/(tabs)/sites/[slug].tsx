<<<<<<< HEAD
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
=======
import { useAuth } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import { useCallback, useEffect, useLayoutEffect, useState } from "react";
import { Alert, Pressable, StyleSheet, Text, View, type TextStyle } from "react-native";
import { useTheme } from "../../../src/constants/theme";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MapLegend } from "../../../src/components/MapLegend";
import { PlotDetailSheet } from "../../../src/components/PlotDetailSheet";
import { PlotMap } from "../../../src/components/PlotMap";
import { getDevelopment } from "../../../src/constants/developments";
import { fetchPlotsForTable } from "../../../src/lib/mapUtils";
import type { PlotFeature } from "../../../src/types/plot";
import { useCartStore } from "../../../src/stores/cartStore";

export default function SiteMapScreen() {
  const { colors, fontSize, spacing, fontWeight } = useTheme();
>>>>>>> mobile
  const params = useLocalSearchParams<{ slug: string; returnTo?: string }>();
  const slug = Array.isArray(params.slug) ? params.slug[0] : params.slug;
  const returnTo = Array.isArray(params.returnTo) ? params.returnTo[0] : params.returnTo;
  const router = useRouter();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { isSignedIn } = useAuth();
<<<<<<< HEAD
  const development = getDevelopment(slug || '');
=======
  const development = getDevelopment(slug || "");
>>>>>>> mobile
  const [plots, setPlots] = useState<PlotFeature[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [selected, setSelected] = useState<PlotFeature | null>(null);
  const { addPlot, isInCart } = useCartStore();

  const goBack = useCallback(() => {
<<<<<<< HEAD
    if (returnTo === 'admin-plots') {
      router.replace('/admin/plots');
=======
    if (returnTo === "admin-plots") {
      router.replace("/admin/plots");
>>>>>>> mobile
      return;
    }
    if (router.canGoBack()) {
      router.back();
      return;
    }
<<<<<<< HEAD
    router.push('/admin/plots');
=======
    router.push("/admin/plots");
>>>>>>> mobile
  }, [returnTo, router]);

  useLayoutEffect(() => {
    const tabNav = navigation.getParent();
<<<<<<< HEAD
    tabNav?.setOptions({ tabBarStyle: { display: 'none' } });
=======
    tabNav?.setOptions({ tabBarStyle: { display: "none" } });
>>>>>>> mobile
    return () => {
      tabNav?.setOptions({ tabBarStyle: undefined });
    };
  }, [navigation]);

  useLayoutEffect(() => {
    if (development) {
      navigation.setOptions({
        title: development.title,
<<<<<<< HEAD
        headerLeft: () => (
          <Pressable style={styles.headerBackButton} onPress={goBack}>
            <Ionicons name="chevron-back" size={24} color={colors.primary} />
            <Text style={styles.headerBackText}>Back</Text>
=======
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
>>>>>>> mobile
          </Pressable>
        ),
      });
    }
<<<<<<< HEAD
  }, [development, goBack, navigation]);
=======
  }, [development, goBack, navigation, colors, fontSize, fontWeight]);
>>>>>>> mobile

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
<<<<<<< HEAD
        setFetchError('No plots found for this development.');
      }
    } catch (e) {
      setFetchError(e instanceof Error ? e.message : 'Failed to load plots');
=======
        setFetchError("No plots found for this development.");
      }
    } catch (e) {
      setFetchError(e instanceof Error ? e.message : "Failed to load plots");
>>>>>>> mobile
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
<<<<<<< HEAD
      Alert.alert('Sign in required', 'Please sign in to continue.', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign In', onPress: () => router.push('/(auth)/sign-in') },
=======
      Alert.alert("Sign in required", "Please sign in to continue.", [
        { text: "Cancel", style: "cancel" },
        { text: "Sign In", onPress: () => router.push("/(auth)/sign-in") },
>>>>>>> mobile
      ]);
      return;
    }
    action();
  };

  return (
<<<<<<< HEAD
    <View style={[styles.container, { paddingBottom: insets.bottom }]}>
=======
    <View
      style={[
        styles.container,
        { paddingBottom: insets.bottom, backgroundColor: colors.background },
      ]}
    >
>>>>>>> mobile
      <PlotMap
        development={development}
        plots={plots}
        loading={loading}
        onPlotPress={setSelected}
        onRefresh={loadPlots}
      />
      <MapLegend />
      {fetchError && !loading ? (
<<<<<<< HEAD
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>{fetchError}</Text>
=======
        <View
          style={[
            styles.errorBanner,
            { backgroundColor: colors.error + "10", borderColor: colors.error + "30" },
          ]}
        >
          <Text style={[styles.errorText, { color: colors.error, fontSize: fontSize.sm }]}>
            {fetchError}
          </Text>
>>>>>>> mobile
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
<<<<<<< HEAD
            Alert.alert('Added', 'Plot added to cart');
=======
            Alert.alert("Added", "Plot added to cart");
>>>>>>> mobile
          });
        }}
        onBuy={() => {
          if (!selected) return;
          requireAuth(() => {
            setSelected(null);
            router.push({
<<<<<<< HEAD
              pathname: '/plot/buy',
=======
              pathname: "/plot/buy",
>>>>>>> mobile
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
<<<<<<< HEAD
              pathname: '/plot/reserve',
=======
              pathname: "/plot/reserve",
>>>>>>> mobile
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
<<<<<<< HEAD
            pathname: '/plot/interest',
=======
            pathname: "/plot/interest",
>>>>>>> mobile
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
<<<<<<< HEAD
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
=======
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
>>>>>>> mobile
});
