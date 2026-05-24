import React, { useMemo, useRef, useState, useEffect } from "react";
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Animated,
  PanResponder,
  TouchableWithoutFeedback,
  Pressable,
  Share,
} from "react-native";
import { useUser } from "@clerk/clerk-expo";
import { colors, fontSize, spacing } from "../constants/theme";
import { formatGhs } from "../lib/plotService";
import type { PlotFeature } from "../types/plot";
import type { Development } from "../constants/developments";
import { Button } from "./ui/Button";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

type Props = {
  visible: boolean;
  plot: PlotFeature | null;
  development: Development;
  inCart: boolean;
  onClose: () => void;
  onAddToCart: () => void;
  onBuy: () => void;
  onReserve: () => void;
  onExpressInterest: () => void;
};

export function PlotDetailSheet({
  visible,
  plot,
  development,
  inCart,
  onClose,
  onAddToCart,
  onBuy,
  onReserve,
  onExpressInterest,
}: Props) {
  const { user } = useUser();
  const role = (user?.publicMetadata?.role as string) || "";
  const isAdmin = ["admin", "sysadmin", "chief", "chief_asst"].includes(role);
  const insets = useSafeAreaInsets();

  // Keep hooks and derived values consistent even when `plot` is null
  const props = plot?.properties || {};
  const details = useMemo(() => {
    const rows: { key: string; label: string; value: string }[] = [];
    if (props.Plot_No) rows.push({ key: "plot_no", label: "Plot", value: String(props.Plot_No) });
    if (props.Street_Nam)
      rows.push({ key: "street", label: "Street", value: String(props.Street_Nam) });
    if (props.Area) rows.push({ key: "area", label: "Size", value: String(props.Area) + " acres" });
    const extras = Object.keys(props).filter((k) => !["Plot_No", "Street_Nam", "Area"].includes(k));
    extras.slice(0, 6).forEach((k) => {
      const v = props[k];
      if (v !== undefined && v !== null && typeof v !== "object")
        rows.push({ key: k, label: k.replace(/_/g, " "), value: String(v) });
    });
    return rows;
  }, [props]);

  // local UI state
  const [favorite, setFavorite] = useState(false);

  // animated drag-to-close
  const translateY = useRef(new Animated.Value(0)).current;
  const panRef = useRef<any>(null);

  useEffect(() => {
    // reset translate when modal opens
    if (visible) translateY.setValue(0);
  }, [visible, translateY]);

  if (!plot) return null;

  const plotNo = props.Plot_No ?? "—";
  const street = props.Street_Nam ?? "—";
  const area = props.Area ?? "—";
  const amount = plot.plotTotalAmount || 0;
  const status = plot.status || "Available";
  const canPurchase = (!status || status === "Available") && amount > 0;

  // configure pan responder for the handle (dragging from the handle will drag the sheet)
  if (!panRef.current) {
    panRef.current = PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (evt, gs) =>
        Math.abs(gs.dy) > Math.abs(gs.dx) && Math.abs(gs.dy) > 4,
      onPanResponderMove: (evt, gs) => {
        if (gs.dy > 0) translateY.setValue(gs.dy);
      },
      onPanResponderRelease: (evt, gs) => {
        const shouldClose = gs.dy > 120 || gs.vy > 1.0;
        if (shouldClose) {
          Animated.timing(translateY, {
            toValue: 1000,
            duration: 180,
            useNativeDriver: true,
          }).start(() => {
            translateY.setValue(0);
            onClose();
          });
        } else {
          Animated.spring(translateY, { toValue: 0, useNativeDriver: true }).start();
        }
      },
      onPanResponderTerminate: () => {
        Animated.spring(translateY, { toValue: 0, useNativeDriver: true }).start();
      },
    });
  }

  const handleShare = async () => {
    try {
      const text = `${development.title} — Plot ${plotNo}\nPrice: ${formatGhs(amount)}\nLocation: ${street}`;
      await Share.share({ message: text });
    } catch (e) {
      // ignore
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback onPress={() => {}}>
            <Animated.View
              style={[
                styles.sheet,
                { paddingBottom: 20 + (insets.bottom ?? 0), transform: [{ translateY }] },
              ]}
            >
              {/* handle (users can drag this to close) */}
              <View style={styles.handle} {...(panRef.current ? panRef.current.panHandlers : {})} />

              <ScrollView showsVerticalScrollIndicator={false}>
                <Text style={styles.site}>{development.title}</Text>
                <Text style={styles.plotNo}>Plot {plotNo}</Text>
                <Text style={styles.meta}>{street}</Text>
                <Text style={styles.meta}>Size: {area} acres</Text>
                <Text style={styles.price}>{formatGhs(amount)}</Text>
                <View style={[styles.badge, statusStyle(status)]}>
                  <Text style={styles.badgeText}>{status}</Text>
                </View>

                <View style={styles.actions}>
                  {canPurchase && (
                    <>
                      <Button title="Buy Plot" onPress={onBuy} />
                      <Button title="Reserve Plot" variant="outline" onPress={onReserve} />
                      <Button
                        title={inCart ? "In Cart" : "Add to Cart"}
                        variant="secondary"
                        onPress={onAddToCart}
                        disabled={inCart}
                      />
                    </>
                  )}

                  <Button title="Express Interest" variant="ghost" onPress={onExpressInterest} />
                  {isAdmin && (
                    <Text style={styles.adminHint}>
                      Admin: use web dashboard for price/status edits, or contact support.
                    </Text>
                  )}
                  <Button title="Close" variant="outline" onPress={onClose} />
                </View>
              </ScrollView>
            </Animated.View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

function statusStyle(status: string) {
  if (status === "Sold") return { backgroundColor: "#fee2e2" };
  if (status === "Reserved") return { backgroundColor: "#f3f4f6" };
  if (status === "On Hold") return { backgroundColor: "#e5e7eb" };
  return { backgroundColor: "#dcfce7" };
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  sheet: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "75%",
    padding: spacing.lg,
  },
  handle: {
    width: 40,
    height: 6,
    backgroundColor: colors.border,
    borderRadius: 3,
    alignSelf: "center",
    marginBottom: spacing.md,
  },
  site: { fontSize: fontSize.sm, color: colors.textMuted },
  plotNo: { fontSize: fontSize.xxl, fontWeight: "800", color: colors.primary },
  meta: { fontSize: fontSize.md, color: colors.textMuted, marginTop: 4 },
  price: {
    fontSize: fontSize.xl,
    fontWeight: "700",
    color: colors.primary,
    marginVertical: spacing.md,
  },
  badge: {
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    marginBottom: spacing.lg,
  },
  badgeText: { fontWeight: "600", fontSize: fontSize.sm },
  actions: { gap: spacing.sm, paddingBottom: spacing.xl },
  adminHint: { fontSize: fontSize.xs, color: colors.textMuted, textAlign: "center" },
});
