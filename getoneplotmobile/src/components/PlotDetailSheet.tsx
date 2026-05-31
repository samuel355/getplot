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
  Linking,
  Alert,
  TextInput,
} from "react-native";
import { useUser } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { colors, fontSize, spacing } from "../constants/theme";
import {
  formatGhs,
  formatAreaSize,
  formatStreet,
  updatePlotDetailsAdmin,
  type AdminPlotUpdate,
} from "../lib/plotService";
import type { PlotFeature, PlotProperties } from "../types/plot";
import type { Development } from "../constants/developments";
import { Button } from "./ui/Button";
import { Badge } from "./ui/Badge";
import { Input } from "./ui/Input";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { getPlotActionVisibility, PLOT_SUPPORT_PHONE } from "../constants/plotStatus";

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
  onPlotUpdated?: (plot: PlotFeature) => void;
};

type DetailRow = { label: string; value: string };
type AdminForm = {
  status: string;
  plotTotalAmount: string;
  paidAmount: string;
  remainingAmount: string;
  remarks: string;
  firstname: string;
  lastname: string;
  email: string;
  country: string;
  phone: string;
  residentialAddress: string;
  agent: string;
};

const STATUS_OPTIONS = ["Sold", "Reserved", "Available", "On Hold"] as const;

function buildDetailRows(props: PlotProperties): DetailRow[] {
  const rows: DetailRow[] = [];

  const size = formatAreaSize(props.Area);
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

function statusBadgeVariant(status: string): "success" | "error" | "warning" | "primary" | "secondary" {
  if (status === "Sold") return "error";
  if (status === "On Hold") return "warning";
  if (status === "Available") return "success";
  if (status === "Reserved") return "secondary";
  return "primary";
}

function numberToField(value: unknown): string {
  const amount = Number(value ?? 0);
  return Number.isFinite(amount) && amount > 0 ? String(amount) : "";
}

function parseCurrencyInput(value: string): number {
  const parsed = Number(String(value || "0").replace(/,/g, ""));
  return Number.isFinite(parsed) ? parsed : 0;
}

function buildAdminForm(plot: PlotFeature | null): AdminForm {
  const total = Number(plot?.plotTotalAmount ?? 0);
  const paid = Number(plot?.paidAmount ?? 0);
  const remaining = Number(plot?.remainingAmount ?? Math.max(total - paid, 0));

  return {
    status: plot?.status || "Available",
    plotTotalAmount: numberToField(total),
    paidAmount: numberToField(paid),
    remainingAmount: numberToField(remaining),
    remarks: plot?.remarks || "",
    firstname: plot?.firstname || "",
    lastname: plot?.lastname || "",
    email: plot?.email || "",
    country: plot?.country || "",
    phone: plot?.phone || "",
    residentialAddress: plot?.residentialAddress || "",
    agent: plot?.agent || "",
  };
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
  onPlotUpdated,
}: Props) {
  const { user } = useUser();
  const role = (user?.publicMetadata?.role as string) || "";
  const isAdmin = ["admin", "sysadmin", "chief", "chief_asst"].includes(role);
  const isSysadmin = role === "sysadmin";
  const insets = useSafeAreaInsets();

  const props = plot?.properties || {};
  const detailRows = useMemo(() => buildDetailRows(props), [props]);

  const [favorite, setFavorite] = useState(false);
  const [adminOpen, setAdminOpen] = useState(false);
  const [adminSaving, setAdminSaving] = useState(false);
  const [adminForm, setAdminForm] = useState<AdminForm>(() => buildAdminForm(plot));
  const translateY = useRef(new Animated.Value(0)).current;
  const panRef = useRef<ReturnType<typeof PanResponder.create> | null>(null);

  useEffect(() => {
    if (visible) {
      translateY.setValue(0);
      setAdminOpen(false);
      setAdminForm(buildAdminForm(plot));
    }
  }, [visible, plot, translateY]);

  if (!plot) return null;

  const plotNo = props.Plot_No ?? "—";
  const street = formatStreet(props.Street_Nam);
  const amount = plot.plotTotalAmount || 0;
  const status = plot.status ?? "Available";
  const actions = getPlotActionVisibility(plot.status);
  const setAdminField = (field: keyof AdminForm, value: string) => {
    setAdminForm((current) => {
      const next = { ...current, [field]: value };
      if (field === "plotTotalAmount" || field === "paidAmount") {
        const total = parseCurrencyInput(field === "plotTotalAmount" ? value : next.plotTotalAmount);
        const paid = parseCurrencyInput(field === "paidAmount" ? value : next.paidAmount);
        next.remainingAmount = String(Math.max(total - paid, 0));
      }
      if (field === "status" && value === "Available") {
        next.firstname = "";
        next.lastname = "";
        next.email = "";
        next.country = "";
        next.phone = "";
        next.residentialAddress = "";
        next.agent = "";
      }
      return next;
    });
  };

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

  const handleCallForInfo = async () => {
    const url = `tel:${PLOT_SUPPORT_PHONE}`;
    try {
      const supported = await Linking.canOpenURL(url);
      if (!supported) {
        Alert.alert("Call", PLOT_SUPPORT_PHONE);
        return;
      }
      await Linking.openURL(url);
    } catch {
      Alert.alert("Call", PLOT_SUPPORT_PHONE);
    }
  };

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

  const handleSaveAdminChanges = async () => {
    if (!isSysadmin) return;

    const total = parseCurrencyInput(adminForm.plotTotalAmount);
    const paid = parseCurrencyInput(adminForm.paidAmount);
    const remaining = Math.max(total - paid, 0);
    const needsClient = adminForm.status === "Sold" || adminForm.status === "Reserved";

    if (!adminForm.status) {
      Alert.alert("Missing status", "Choose a plot status.");
      return;
    }
    if (needsClient && total <= 0) {
      Alert.alert("Missing amount", "Enter the plot total amount.");
      return;
    }
    if (needsClient && paid <= 0) {
      Alert.alert("Missing payment", "Enter the amount paid.");
      return;
    }
    if (paid > total) {
      Alert.alert("Check amount", "Paid amount must not be greater than the plot total amount.");
      return;
    }
    if (needsClient) {
      const required: Array<[keyof AdminForm, string]> = [
        ["firstname", "first name"],
        ["lastname", "last name"],
        ["email", "email"],
        ["country", "country"],
        ["phone", "phone"],
        ["residentialAddress", "residential address"],
      ];
      const missing = required.find(([field]) => !adminForm[field].trim());
      if (missing) {
        Alert.alert("Missing client info", `Enter the client's ${missing[1]}.`);
        return;
      }
      if (adminForm.phone.trim().length !== 10) {
        Alert.alert("Check phone", "Phone number must be 10 digits.");
        return;
      }
    }

    const clearClient = adminForm.status === "Available";
    const payload: AdminPlotUpdate = {
      status: adminForm.status,
      firstname: clearClient ? "" : adminForm.firstname.trim(),
      lastname: clearClient ? "" : adminForm.lastname.trim(),
      email: clearClient ? "" : adminForm.email.trim(),
      country: clearClient ? "" : adminForm.country.trim(),
      phone: clearClient ? "" : adminForm.phone.trim(),
      residentialAddress: clearClient ? "" : adminForm.residentialAddress.trim(),
      agent: clearClient ? "" : adminForm.agent.trim(),
      plotTotalAmount: total,
      paidAmount: paid,
      remainingAmount: remaining,
      remarks: adminForm.remarks.trim(),
    };

    setAdminSaving(true);
    const { data, error } = await updatePlotDetailsAdmin(development.table, plot.id, payload);
    setAdminSaving(false);

    if (error || !data) {
      Alert.alert("Update failed", error?.message || "Could not update plot details.");
      return;
    }

    const updated = data as PlotFeature;
    setAdminForm(buildAdminForm(updated));
    onPlotUpdated?.(updated);
    Alert.alert("Saved", "Plot details updated successfully.");
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
                    <Badge content={status} variant={statusBadgeVariant(status)} />
                    <Text style={styles.price}>{formatGhs(amount)}</Text>
                  </View>
                </View>

                {actions.showOnHoldMessage ? (
                  <View style={styles.statusBanner}>
                    <Text style={styles.statusBannerText}>
                      This plot is on hold for a client for 48 hours.
                      {isSysadmin
                        ? " You can edit this plot and change the status below."
                        : ""}
                    </Text>
                  </View>
                ) : null}

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
                            style={[styles.detailLabel, isDescription && styles.detailLabelStacked]}
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

                  {actions.showAddToCart ? (
                    <Pressable
                      onPress={onAddToCart}
                      style={[styles.cartBtn, inCart && styles.cartBtnDisabled]}
                      disabled={inCart}
                      accessibilityRole="button"
                    >
                      <Ionicons name="cart-outline" size={18} color={colors.white} />
                      <Text style={styles.cartBtnText}>{inCart ? "In cart" : "Add to cart"}</Text>
                    </Pressable>
                  ) : null}
                </View>

                {isSysadmin ? (
                  <View style={styles.adminPanel}>
                    <Pressable
                      style={styles.adminHeader}
                      onPress={() => setAdminOpen((open) => !open)}
                      accessibilityRole="button"
                    >
                      <View>
                        <Text style={styles.adminTitle}>Sysadmin plot controls</Text>
                        <Text style={styles.adminSubtitle}>Edit price, status, and client details</Text>
                      </View>
                      <Ionicons
                        name={adminOpen ? "chevron-up" : "chevron-down"}
                        size={20}
                        color={colors.primary}
                      />
                    </Pressable>

                    {adminOpen ? (
                      <View style={styles.adminForm}>
                        <Text style={styles.fieldLabel}>Status</Text>
                        <View style={styles.statusOptions}>
                          {STATUS_OPTIONS.map((option) => {
                            const active = adminForm.status === option;
                            return (
                              <Pressable
                                key={option}
                                onPress={() => setAdminField("status", option)}
                                style={[styles.statusOption, active && styles.statusOptionActive]}
                              >
                                <Text
                                  style={[
                                    styles.statusOptionText,
                                    active && styles.statusOptionTextActive,
                                  ]}
                                >
                                  {option}
                                </Text>
                              </Pressable>
                            );
                          })}
                        </View>

                        <View style={styles.twoColumn}>
                          <Input
                            label="Total amount"
                            value={adminForm.plotTotalAmount}
                            onChangeText={(value) => setAdminField("plotTotalAmount", value)}
                            keyboardType="number-pad"
                            containerStyle={styles.formHalf}
                          />
                          <Input
                            label="Paid amount"
                            value={adminForm.paidAmount}
                            onChangeText={(value) => setAdminField("paidAmount", value)}
                            keyboardType="number-pad"
                            containerStyle={styles.formHalf}
                          />
                        </View>

                        <Input
                          label="Remaining amount"
                          value={String(
                            Math.max(
                              parseCurrencyInput(adminForm.plotTotalAmount) -
                                parseCurrencyInput(adminForm.paidAmount),
                              0,
                            ),
                          )}
                          editable={false}
                        />

                        <Text style={styles.sectionLabel}>Client information</Text>
                        <View style={styles.twoColumn}>
                          <Input
                            label="First name"
                            value={adminForm.firstname}
                            onChangeText={(value) => setAdminField("firstname", value)}
                            containerStyle={styles.formHalf}
                          />
                          <Input
                            label="Last name"
                            value={adminForm.lastname}
                            onChangeText={(value) => setAdminField("lastname", value)}
                            containerStyle={styles.formHalf}
                          />
                        </View>
                        <Input
                          label="Email"
                          value={adminForm.email}
                          onChangeText={(value) => setAdminField("email", value)}
                          autoCapitalize="none"
                          keyboardType="email-address"
                        />
                        <View style={styles.twoColumn}>
                          <Input
                            label="Country"
                            value={adminForm.country}
                            onChangeText={(value) => setAdminField("country", value)}
                            containerStyle={styles.formHalf}
                          />
                          <Input
                            label="Phone"
                            value={adminForm.phone}
                            onChangeText={(value) => setAdminField("phone", value)}
                            keyboardType="phone-pad"
                            containerStyle={styles.formHalf}
                          />
                        </View>
                        <Input
                          label="Residential address"
                          value={adminForm.residentialAddress}
                          onChangeText={(value) => setAdminField("residentialAddress", value)}
                        />
                        <Input
                          label="Agent"
                          value={adminForm.agent}
                          onChangeText={(value) => setAdminField("agent", value)}
                        />

                        <Text style={styles.fieldLabel}>Remarks</Text>
                        <TextInput
                          value={adminForm.remarks}
                          onChangeText={(value) => setAdminField("remarks", value)}
                          multiline
                          textAlignVertical="top"
                          style={styles.remarksInput}
                          placeholder="Add notes"
                          placeholderTextColor={colors.textMuted}
                        />

                        <Button
                          title="Save plot details"
                          onPress={handleSaveAdminChanges}
                          loading={adminSaving}
                          fullWidth
                        />
                      </View>
                    ) : null}
                  </View>
                ) : isAdmin ? (
                  <Text style={styles.adminHint}>Only sysadmin can edit plot price and status.</Text>
                ) : null}
              </ScrollView>

              <View style={[styles.footer, { paddingBottom: 12 + (insets.bottom ?? 0) }]}>
                {actions.isAvailable ? (
                  <>
                    <View style={styles.footerSecondary}>
                      {actions.showReserve ? (
                        <Button
                          title="Reserve plot"
                          variant="outline"
                          onPress={onReserve}
                          style={styles.footerHalf}
                        />
                      ) : null}
                      {actions.showExpressInterest ? (
                        <Button
                          title="Express interest"
                          variant="ghost"
                          onPress={onExpressInterest}
                          style={styles.footerHalf}
                        />
                      ) : null}
                    </View>
                    {actions.showBuy ? <Button title="Buy plot" fullWidth onPress={onBuy} /> : null}
                  </>
                ) : actions.showCallForInfo ? (
                  <Button title="Call for info" fullWidth onPress={handleCallForInfo} />
                ) : null}
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

  statusBanner: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: 10,
    borderLeftWidth: 3,
    borderLeftColor: colors.warning,
  },
  statusBannerText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    lineHeight: 20,
  },

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
  adminPanel: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: "hidden",
  },
  adminHeader: {
    minHeight: 58,
    padding: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
  },
  adminTitle: {
    fontSize: fontSize.md,
    fontWeight: "800",
    color: colors.primary,
  },
  adminSubtitle: {
    marginTop: 2,
    fontSize: fontSize.xs,
    color: colors.textMuted,
  },
  adminForm: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
    padding: spacing.md,
    gap: spacing.md,
  },
  fieldLabel: {
    fontSize: fontSize.sm,
    fontWeight: "700",
    color: colors.textSecondary,
  },
  sectionLabel: {
    marginTop: spacing.sm,
    fontSize: fontSize.md,
    fontWeight: "800",
    color: colors.text,
  },
  statusOptions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  statusOption: {
    minHeight: 38,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
  },
  statusOptionActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
  statusOptionText: {
    fontSize: fontSize.sm,
    fontWeight: "700",
    color: colors.textSecondary,
  },
  statusOptionTextActive: {
    color: colors.white,
  },
  twoColumn: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  formHalf: {
    flex: 1,
  },
  remarksInput: {
    minHeight: 90,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: spacing.md,
    backgroundColor: colors.white,
    color: colors.text,
    fontSize: fontSize.base,
  },
});
