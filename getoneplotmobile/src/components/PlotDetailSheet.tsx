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
import { Ionicons } from "@expo/vector-icons";
import { colors, fontSize, spacing } from "../constants/theme";
import { formatGhs } from "../lib/plotService";
import type { PlotFeature, PlotProperties } from "../types/plot";
import type { Development } from "../constants/developments";
import { Button } from "./ui/Button";
import { Badge } from "./ui/Badge";
import { useSafeAreaInsets } from "react-native-safe-area-context";

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

type DetailRow = { label: string; value: string };

function formatSize(size: unknown): string {
  if (size === undefined || size === null || size === "") return "";
  const num = Number(size);
  return Number.isNaN(num) ? "" : num.toFixed(2);
}

function formatStreet(street: unknown): string {
  if (!street) return "";
  return String(street).replace(/\r/g, "").trim();
}

function buildDetailRows(props: PlotProperties): DetailRow[] {
  const rows: DetailRow[] = [];

  const size = formatSize(props.Area);
  if (size) rows.push({ label: "Size", value: `${size} acres` });

  const useType = props.For;
  if (useType && String(useType).trim()) {
    rows.push({ label: "Use", value: String(useType).trim() });
  }

  const agent = props.Agent;
  if (agent && String(agent).trim()) {
    rows.push({ label: "Agent", value: String(agent).trim() });
  }

  const description = props.allDetails;
  if (description && String(description).trim()) {
    rows.push({ label: "Description", value: String(description).trim() });
  }

  return rows;
}

function statusBadgeVariant(status: string): "success" | "error" | "warning" | "info" | "default" {
  if (status === "Sold") return "error";
  if (status === "On Hold") return "warning";
  if (status === "Available") return "success";
  if (status === "Reserved") return "default";
  return "info";
}

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

  const props = plot?.properties || {};
  const detailRows = useMemo(() => buildDetailRows(props), [props]);

  const [favorite, setFavorite] = useState(false);
  const translateY = useRef(new Animated.Value(0)).current;
  const panRef = useRef<ReturnType<typeof PanResponder.create> | null>(null);

  useEffect(() => {
    if (visible) translateY.setValue(0);
  }, [visible, translateY]);

  if (!plot) return null;

  const plotNo = props.Plot_No ?? "—";
  const street = formatStreet(props.Street_Nam);
  const amount = plot.plotTotalAmount || 0;
  const status = plot.status || "Available";
  const canPurchase = (!status || status === "Available") && amount > 0;

  if (!panRef.current) {
    panRef.current = PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_evt, gs) =>
        Math.abs(gs.dy) > Math.abs(gs.dx) && Math.abs(gs.dy) > 4,
      onPanResponderMove: (_evt, gs) => {
        if (gs.dy > 0) translateY.setValue(gs.dy);
      },
      onPanResponderRelease: (_evt, gs) => {
        const shouldClose = gs.dy > 120 || gs.vy > 1.2;
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
      const lines = [
        `${development.title} — Plot ${plotNo}`,
        `Price: ${formatGhs(amount)}`,
        street ? `Street: ${street}` : null,
      ].filter(Boolean);
      await Share.share({ message: lines.join("\n") });
    } catch {
      // ignore
    }
  };

  const initials = (development.title || "")
    .split(" ")
    .map((s) => s[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

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
              <View style={styles.handleRow}>
                <View
                  style={styles.handle}
                  {...(panRef.current ? panRef.current.panHandlers : {})}
                />
                <Pressable
                  onPress={onClose}
                  style={styles.closeBtn}
                  hitSlop={8}
                  accessibilityRole="button"
                  accessibilityLabel="Close"
                >
                  <Ionicons name="close" size={22} color={colors.error} />
                </Pressable>
              </View>

              <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 140 }}
              >
                <View style={styles.header}>
                  <View style={[styles.thumb, { backgroundColor: colors.primaryAccent }]}>
                    <Text style={styles.thumbText}>{initials}</Text>
                  </View>

                  <View style={styles.headerBody}>
                    <Text style={styles.site}>{development.title}</Text>
                    <Text style={styles.plotNo}>Plot {plotNo}</Text>
                    {street ? (
                      <Text style={styles.street} numberOfLines={2}>
                        {street}
                      </Text>
                    ) : null}
                  </View>

                  <View style={styles.headerMeta}>
                    <Badge label={status} variant={statusBadgeVariant(status)} size="md" />
                    <Text style={styles.price}>{formatGhs(amount)}</Text>
                  </View>
                </View>

                {detailRows.length > 0 ? (
                  <View style={styles.detailsSection}>
                    {detailRows.map((row, index) => {
                      const isDescription = row.label === "Description";
                      return (
                        <View
                          key={row.label}
                          style={[
                            isDescription ? styles.detailRowStacked : styles.detailRow,
                            index < detailRows.length - 1 && styles.detailRowBorder,
                          ]}
                        >
                          <Text
                            style={[
                              styles.detailLabel,
                              isDescription && styles.detailLabelStacked,
                            ]}
                          >
                            {row.label}
                          </Text>
                          <Text
                            style={[
                              styles.detailValue,
                              isDescription && styles.detailValueMultiline,
                            ]}
                          >
                            {row.value}
                          </Text>
                        </View>
                      );
                    })}
                  </View>
                ) : null}

                <View style={styles.toolbar}>
                  <Pressable
                    onPress={() => setFavorite((v) => !v)}
                    style={styles.iconBtn}
                    accessibilityRole="button"
                    accessibilityLabel={favorite ? "Remove from favorites" : "Add to favorites"}
                  >
                    <Ionicons
                      name={favorite ? "heart" : "heart-outline"}
                      size={20}
                      color={favorite ? colors.error : colors.primary}
                    />
                  </Pressable>

                  <Pressable
                    onPress={handleShare}
                    style={styles.iconBtn}
                    accessibilityRole="button"
                    accessibilityLabel="Share plot"
                  >
                    <Ionicons name="share-social-outline" size={20} color={colors.primary} />
                  </Pressable>

                  <Pressable
                    onPress={onAddToCart}
                    style={[styles.cartBtn, inCart && styles.cartBtnDisabled]}
                    disabled={inCart}
                    accessibilityRole="button"
                  >
                    <Ionicons name="cart-outline" size={18} color={colors.white} />
                    <Text style={styles.cartBtnText}>{inCart ? "In cart" : "Add to cart"}</Text>
                  </Pressable>
                </View>

                {isAdmin ? (
                  <Text style={styles.adminHint}>
                    Admin: use web dashboard for price/status edits, or contact support.
                  </Text>
                ) : null}
              </ScrollView>

              <View style={[styles.footer, { paddingBottom: 12 + (insets.bottom ?? 0) }]}>
                <View style={styles.footerSecondary}>
                  <Button title="Reserve" variant="outline" onPress={onReserve} style={styles.footerHalf} />
                  <Button
                    title="Express interest"
                    variant="ghost"
                    onPress={onExpressInterest}
                    style={styles.footerHalf}
                  />
                </View>
                <Button
                  title={canPurchase ? "Buy now" : "Contact to buy"}
                  fullWidth
                  onPress={canPurchase ? onBuy : onExpressInterest}
                />
              </View>
            </Animated.View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.45)",
  },
  sheet: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "82%",
    overflow: "hidden",
  },
  handleRow: {
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    paddingHorizontal: spacing.lg,
    alignItems: "center",
    minHeight: 52,
  },
  handle: {
    width: 44,
    height: 5,
    backgroundColor: colors.border,
    borderRadius: 3,
  },
  closeBtn: {
    position: "absolute",
    right: spacing.lg,
    top: spacing.md,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: `${colors.error}18`,
    alignItems: "center",
    justifyContent: "center",
  },

  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
    gap: spacing.md,
  },
  thumb: {
    width: 52,
    height: 52,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  thumbText: { color: colors.white, fontSize: fontSize.lg, fontWeight: "800" },
  headerBody: { flex: 1, minWidth: 0 },
  headerMeta: { alignItems: "flex-end", gap: spacing.sm },
  site: { fontSize: fontSize.sm, color: colors.textMuted, fontWeight: "600" },
  plotNo: {
    fontSize: fontSize.xxl,
    fontWeight: "800",
    color: colors.primary,
    marginTop: 2,
  },
  street: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginTop: 4,
    textTransform: "capitalize",
  },
  price: { fontSize: fontSize.lg, fontWeight: "800", color: colors.primary },

  detailsSection: {
    marginHorizontal: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: 12,
    overflow: "hidden",
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    gap: spacing.md,
  },
  detailRowStacked: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    gap: spacing.xs,
  },
  detailRowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  detailLabel: {
    color: colors.textMuted,
    fontSize: fontSize.sm,
    fontWeight: "600",
    width: 96,
  },
  detailLabelStacked: { width: undefined },
  detailValue: {
    flex: 1,
    color: colors.text,
    fontSize: fontSize.sm,
    fontWeight: "600",
    textAlign: "right",
  },
  detailValueMultiline: {
    width: "100%",
    textAlign: "left",
    lineHeight: 20,
  },

  toolbar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    gap: spacing.sm,
  },
  iconBtn: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  cartBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: 10,
    minHeight: 44,
  },
  cartBtnDisabled: { opacity: 0.55 },
  cartBtnText: { color: colors.white, fontWeight: "700", fontSize: fontSize.sm },

  footer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    backgroundColor: colors.white,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
    gap: spacing.sm,
  },
  footerSecondary: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  footerHalf: { flex: 1 },

  adminHint: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    textAlign: "center",
    marginTop: spacing.lg,
    paddingHorizontal: spacing.lg,
  },
});
