import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Alert, Pressable, StyleSheet, Text, View, type ViewStyle } from "react-native";
import { colors, fontSize, spacing } from "../constants/theme";

export type MapTypeOption = "standard" | "satellite" | "hybrid" | "terrain";

const MAP_TYPE_OPTIONS: { id: MapTypeOption; label: string }[] = [
  { id: "standard", label: "Road Map" },
  { id: "satellite", label: "Satellite" },
  { id: "hybrid", label: "Hybrid" },
  { id: "terrain", label: "Terrain" },
];

type Props = {
  mapType: MapTypeOption;
  onMapTypeChange: (type: MapTypeOption) => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onFitAll: () => void;
  onRefresh?: () => void;
  style?: ViewStyle;
};

export function MapControls({
  mapType,
  onMapTypeChange,
  onZoomIn,
  onZoomOut,
  onFitAll,
  onRefresh,
  style,
}: Props) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <View style={[styles.column, style]} pointerEvents="box-none">
      <ControlButton icon="add" onPress={onZoomIn} accessibilityLabel="Zoom in" />
      <ControlButton icon="remove" onPress={onZoomOut} accessibilityLabel="Zoom out" />
      <View style={styles.divider} />

      <View style={styles.menuWrap}>
        <ControlButton
          icon="layers-outline"
          onPress={() => setMenuOpen((v) => !v)}
          accessibilityLabel="Change map type"
          active={menuOpen}
        />
        {menuOpen ? (
          <View style={styles.menu}>
            {MAP_TYPE_OPTIONS.map((opt) => (
              <Pressable
                key={opt.id}
                style={[styles.menuItem, mapType === opt.id && styles.menuItemActive]}
                onPress={() => {
                  onMapTypeChange(opt.id);
                  setMenuOpen(false);
                }}
              >
                <Text style={[styles.menuText, mapType === opt.id && styles.menuTextActive]}>
                  {opt.label}
                </Text>
              </Pressable>
            ))}
          </View>
        ) : null}
      </View>

      <ControlButton icon="locate-outline" onPress={onFitAll} accessibilityLabel="Show all plots" />
      {onRefresh ? (
        <ControlButton
          icon="refresh-outline"
          onPress={onRefresh}
          accessibilityLabel="Refresh map"
        />
      ) : null}
      <ControlButton
        icon="information-circle-outline"
        onPress={() =>
          Alert.alert("Map help", "Tap any plot to view details, add to cart, buy, or reserve.", [
            { text: "OK" },
          ])
        }
        accessibilityLabel="Help"
      />
    </View>
  );
}

function ControlButton({
  icon,
  onPress,
  accessibilityLabel,
  active,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  accessibilityLabel: string;
  active?: boolean;
}) {
  return (
    <Pressable
      style={[styles.btn, active && styles.btnActive]}
      onPress={onPress}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
    >
      <Ionicons name={icon} size={20} color={colors.primary} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  column: {
    position: "absolute",
    top: spacing.md,
    right: spacing.md,
    zIndex: 12,
    gap: 8,
    alignItems: "flex-end",
  },
  btn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 4,
    borderWidth: 1,
    borderColor: colors.border,
  },
  btnActive: {
    backgroundColor: "rgba(5, 1, 76, 0.08)",
    borderColor: colors.primary,
  },
  divider: {
    height: 1,
    width: 28,
    backgroundColor: colors.border,
    alignSelf: "center",
  },
  menuWrap: {
    alignItems: "flex-end",
  },
  menu: {
    position: "absolute",
    right: 52,
    top: 0,
    backgroundColor: colors.white,
    borderRadius: 10,
    overflow: "hidden",
    minWidth: 130,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    elevation: 6,
  },
  menuItem: {
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  menuItemActive: {
    backgroundColor: "rgba(5, 1, 76, 0.08)",
  },
  menuText: {
    fontSize: fontSize.sm,
    color: colors.text,
  },
  menuTextActive: {
    color: colors.primary,
    fontWeight: "700",
  },
});
