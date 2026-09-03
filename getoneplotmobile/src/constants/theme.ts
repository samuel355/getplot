import { useColorScheme } from "react-native";
import { useAppStore } from "../stores/appStore";

// Brand colors extracted from logo
const BRAND_NAVY = "#191347";
const BRAND_TEAL = "#68c9cd";

// Modern, mobile-optimized color palette
const lightColors = {
  // Primary brand colors
  primary: BRAND_NAVY,
  primaryLight: "#2d2475",
  primaryDark: "#0d0a2b",
  primaryAccent: BRAND_TEAL,

  // Semantic colors
  success: "#10b981", // Emerald
  error: "#ef4444", // Red
  warning: "#f59e0b", // Amber
  info: "#3b82f6", // Blue

  // Plot status
  plotAvailable: "#166534",
  plotReserved: "#171717",
  plotSold: "#dc2626",
  plotOnHold: "#6b7280",
  plotUnpriced: "#1e3a8a",
  accentBlue: "#04a7ff",

  // Neutral palette
  white: "#ffffff",
  black: "#000000",
  background: "#f6f7fb",
  surface: "#ffffff",
  surfaceAlt: "#eef1f7",
  border: "#dde2ec",
  borderLight: "#edf0f5",

  // Text hierarchy
  text: "#0f172a",
  textSecondary: "#475569",
  textMuted: "#78828f",
  textLight: "#cbd5e1",
  textInverse: "#ffffff",

  // Shadow
  shadow: "rgba(25, 19, 71, 0.12)",
};

const darkColors = {
  // Primary brand colors
  primary: "#a5b4fc", // Lighter lavender-blue for dark mode
  primaryLight: "#c7d2fe",
  primaryDark: BRAND_NAVY,
  primaryAccent: BRAND_TEAL,

  // Semantic colors
  success: "#34d399",
  error: "#f87171",
  warning: "#fbbf24",
  info: "#60a5fa",

  // Plot status
  plotAvailable: "#22c55e",
  plotReserved: "#e5e7eb",
  plotSold: "#ef4444",
  plotOnHold: "#9ca3af",
  plotUnpriced: "#3b82f6",
  accentBlue: "#60a5fa",

  // Neutral palette
  white: "#ffffff",
  black: "#000000",
  background: "#0f172a",
  surface: "#1e293b",
  surfaceAlt: "#334155",
  border: "#334155",
  borderLight: "#1e293b",

  // Text hierarchy
  text: "#f8fafc",
  textSecondary: "#cbd5e1",
  textMuted: "#94a3b8",
  textLight: "#475569",
  textInverse: "#0f172a",

  // Shadow
  shadow: "rgba(0, 0, 0, 0.3)",
};

export const colors = lightColors; // Default for static usage, but prefer useTheme hook

export function useTheme() {
  const systemColorScheme = useColorScheme();
  const themePreference = useAppStore((state) => state.theme);

  const isDark =
    themePreference === "system" ? systemColorScheme === "dark" : themePreference === "dark";

  const themeColors = isDark ? darkColors : lightColors;

  return {
    colors: themeColors,
    isDark,
    themePreference,
    spacing,
    fontSize,
    fontWeight,
    borderRadius,
    shadows,
  };
}

// Static values that don't change between themes
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 40,
};

export const fontSize = {
  xs: 11,
  sm: 12,
  base: 14,
  md: 16,
  lg: 18,
  xl: 20,
  xxl: 24,
  xxxl: 28,
  display: 32,
};

export const fontWeight = {
  regular: "400",
  medium: "500",
  semibold: "600",
  bold: "700",
  extrabold: "800",
};

export const borderRadius = {
  none: 0,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};

export const shadows = {
  none: "none",
  sm: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
  md: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
  lg: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
  xl: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
  elevated: "0 8px 16px rgba(0, 0, 0, 0.12)",
};
