import React, { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { PLOT_LEGEND_ITEMS } from "../constants/plotStatus";
import { colors, fontSize, spacing } from "../constants/theme";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export function MapLegend() {
  const [open, setOpen] = useState(false);
  const insets = useSafeAreaInsets();

  const collapsedBottom = (insets.bottom ?? spacing.md) + 12;

  // Collapsed pill at the bottom center of the map — always visible
  if (!open) {
    return (
      <Pressable
        onPress={() => setOpen(true)}
        style={[styles.collapsedPill, { bottom: collapsedBottom }]}
        accessibilityLabel="Show legend"
        accessibilityRole="button"
      >
        <View style={styles.swatchRow}>
          {PLOT_LEGEND_ITEMS.slice(0, 3).map((item) => (
            <View
              key={item.label}
              style={[styles.swatchSmall, { backgroundColor: item.fill, borderColor: item.stroke }]}
            />
          ))}
        </View>
        <Text style={styles.pillText}>Land status</Text>
        <Ionicons name="chevron-up" size={16} color={colors.primary} />
      </Pressable>
    );
  }

  // Expanded full legend above the collapsed pill
  return (
    <View style={[styles.box, { bottom: collapsedBottom + 10, alignSelf: "center" }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Land Status</Text>
        <Pressable onPress={() => setOpen(false)} accessibilityLabel="Close legend">
          <Ionicons name="close" size={18} color={colors.textMuted} />
        </Pressable>
      </View>
      <View style={styles.body}>
        {PLOT_LEGEND_ITEMS.map((item) => (
          <View key={item.label} style={styles.row}>
            <View style={styles.swatchOuter}>
              <View
                style={[
                  styles.swatchFill,
                  { backgroundColor: item.fill, borderColor: item.stroke },
                ]}
              />
            </View>
            <Text style={styles.label}>{item.label}</Text>
          </View>
        ))}
      </View>
      <Text style={styles.hint}>Tap an available plot to view details and purchase</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    position: "absolute",
    maxWidth: 320,
    backgroundColor: "rgba(255,255,255,0.98)",
    borderRadius: 12,
    zIndex: 20,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 6,
  },
  collapsedPill: {
    position: "absolute",
    zIndex: 20,
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.white,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
    elevation: 4,
  },
  swatchRow: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 8,
  },
  swatchSmall: {
    width: 12,
    height: 12,
    borderRadius: 3,
    borderWidth: 1,
    marginLeft: 6,
  },
  pillText: {
    fontSize: fontSize.sm,
    color: colors.text,
    fontWeight: "600",
    marginRight: 8,
  },
  header: {
    backgroundColor: colors.surfaceAlt,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    fontWeight: "700",
    fontSize: fontSize.sm,
    color: colors.primary,
  },
  body: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xs,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  swatchOuter: {
    marginRight: 10,
  },
  swatchFill: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 2,
  },
  label: {
    fontSize: fontSize.sm,
    color: colors.text,
    fontWeight: "500",
  },
  hint: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    textAlign: "center",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    lineHeight: 16,
  },
});
