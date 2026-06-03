import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  type TextStyle,
  type ViewStyle,
} from "react-native";
import { useAuth } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { fetchAdminUsers, updateAdminUser } from "../../../src/lib/adminUsers";
import { Badge } from "../../../src/components/ui/Badge";
import { fontSize, fontWeight, useTheme } from "../../../src/constants/theme";

type ClerkUser = {
  id: string;
  firstName: string | null;
  lastName: string | null;
  username: string | null;
  imageUrl: string;
  emailAddresses?: Array<{ emailAddress: string }>;
  publicMetadata?: { role?: string; area?: string; banned?: boolean };
};

const ROLES = [
  "member",
  "property_agent",
  "chief",
  "chief_asst",
  "admin",
  "sysadmin",
] as const;

const ROLE_FILTERS: { id: string; label: string }[] = [
  { id: "all", label: "All" },
  { id: "admin", label: "Admin" },
  { id: "sysadmin", label: "Sysadmin" },
  { id: "chief", label: "Chief" },
  { id: "property_agent", label: "Agent" },
  { id: "member", label: "Member" },
  { id: "banned", label: "Banned" },
];

const weights = fontWeight as Record<keyof typeof fontWeight, TextStyle["fontWeight"]>;

function roleBadgeVariant(role: string): "primary" | "secondary" | "success" | "warning" | "error" | "outline" {
  if (role === "sysadmin" || role === "admin") return "primary";
  if (role === "chief" || role === "chief_asst") return "secondary";
  if (role === "property_agent") return "warning";
  return "outline";
}

function formatRole(role: string) {
  return role.replace(/_/g, " ");
}

function userEmail(u: ClerkUser) {
  return u.emailAddresses?.[0]?.emailAddress ?? "";
}

function userMatchesSearch(u: ClerkUser, query: string) {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  const haystack = [
    u.firstName,
    u.lastName,
    u.username,
    userEmail(u),
    u.publicMetadata?.role,
    u.publicMetadata?.area,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  return haystack.includes(q);
}

export default function AdminUsersScreen() {
  const { colors, spacing, borderRadius, isDark } = useTheme();
  const styles = useMemo(() => createStyles(colors, spacing, borderRadius, isDark), [colors, spacing, borderRadius, isDark]);

  const [users, setUsers] = useState<ClerkUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<ClerkUser | null>(null);
  const [newRole, setNewRole] = useState("");
  const [area, setArea] = useState("");

  const { getToken, isLoaded, isSignedIn } = useAuth();
  const listRef = useRef<FlatList<ClerkUser>>(null);
  const refreshInFlight = useRef(false);

  const applyUsersFromApi = useCallback(async (token: string) => {
    const payload = await fetchAdminUsers(token);
    const usersData = Array.isArray(payload) ? payload : payload?.data;
    if (Array.isArray(usersData)) {
      setUsers(usersData);
      await AsyncStorage.setItem("admin_users_cache", JSON.stringify(usersData));
    }
  }, []);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const cached = await AsyncStorage.getItem("admin_users_cache");
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed)) setUsers(parsed);
        } catch {
          /* ignore */
        }
      }

      const token = await getToken({ skipCache: true });
      if (!token) throw new Error("Not authenticated. Sign in again.");
      await applyUsersFromApi(token);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes("401")) setError("Unauthorized. Admin access required.");
      else if (msg.includes("403") || msg.toLowerCase().includes("forbidden")) {
        setError("Forbidden. Admin access required.");
      } else {
        setError(msg || "Failed to load users");
      }
    } finally {
      setLoading(false);
    }
  }, [getToken, applyUsersFromApi]);

  /** Full reload from API — used by refresh button and pull-to-refresh */
  const handleRefresh = useCallback(async () => {
    if (refreshInFlight.current) return;
    refreshInFlight.current = true;
    setRefreshing(true);
    setError(null);
    listRef.current?.scrollToOffset({ offset: 0, animated: true });

    try {
      const token = await getToken({ skipCache: true });
      if (!token) throw new Error("Not authenticated. Sign in again.");
      await applyUsersFromApi(token);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes("401")) setError("Unauthorized. Admin access required.");
      else if (msg.includes("403") || msg.toLowerCase().includes("forbidden")) {
        setError("Forbidden. Admin access required.");
      } else {
        setError(msg || "Failed to load users");
      }
    } finally {
      refreshInFlight.current = false;
      setRefreshing(false);
    }
  }, [getToken, applyUsersFromApi]);

  useEffect(() => {
    if (!isLoaded) return;
    if (!isSignedIn) {
      setError("Please sign in to manage users.");
      setLoading(false);
      return;
    }
    loadUsers();
  }, [isLoaded, isSignedIn]);

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      if (!userMatchesSearch(u, search)) return false;
      const role = u.publicMetadata?.role || "member";
      const banned = !!u.publicMetadata?.banned;
      if (roleFilter === "all") return true;
      if (roleFilter === "banned") return banned;
      return role === roleFilter;
    });
  }, [users, search, roleFilter]);

  const stats = useMemo(() => {
    const admins = users.filter((u) => {
      const r = u.publicMetadata?.role;
      return r === "admin" || r === "sysadmin";
    }).length;
    const banned = users.filter((u) => u.publicMetadata?.banned).length;
    return { total: users.length, admins, banned };
  }, [users]);

  const openEditModal = (user: ClerkUser) => {
    setSelectedUser(user);
    setNewRole(user.publicMetadata?.role || "member");
    setArea((user.publicMetadata?.area as string) || "");
    setModalOpen(true);
  };

  const updateUserRole = async () => {
    if (!selectedUser || !newRole) return;
    setSaving(true);
    try {
      const token = await getToken();
      const body: { userId: string; newRole: string; area?: string } = {
        userId: selectedUser.id,
        newRole,
      };
      if ((newRole === "chief" || newRole === "chief_asst") && area) body.area = area;
      await updateAdminUser(token, body);
      Alert.alert("Success", "User role updated");
      setModalOpen(false);
      handleRefresh();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to update role";
      Alert.alert("Error", msg);
    } finally {
      setSaving(false);
    }
  };

  const confirmToggleBan = (u: ClerkUser) => {
    const banned = !!u.publicMetadata?.banned;
    Alert.alert(
      banned ? "Unban user" : "Ban user",
      banned
        ? `Restore access for ${u.firstName ?? "this user"}?`
        : `Ban ${u.firstName ?? "this user"}? They will lose access.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: banned ? "Unban" : "Ban",
          style: banned ? "default" : "destructive",
          onPress: () => toggleBan(u),
        },
      ],
    );
  };

  const toggleBan = async (u: ClerkUser) => {
    try {
      const token = await getToken();
      const banned = !!u.publicMetadata?.banned;
      await updateAdminUser(token, { userId: u.id, banned: !banned });
      handleRefresh();
    } catch {
      Alert.alert("Error", "Failed to update user status");
    }
  };

  const renderUserCard = ({ item }: { item: ClerkUser }) => {
    const role = item.publicMetadata?.role || "member";
    const banned = !!item.publicMetadata?.banned;
    const initials = `${item.firstName?.[0] || ""}${item.lastName?.[0] || ""}`.toUpperCase() || "?";
    const email = userEmail(item);

    return (
      <View style={styles.card}>
        <View style={styles.cardMain}>
          {item.imageUrl ? (
            <Image source={{ uri: item.imageUrl }} style={styles.avatarImage} />
          ) : (
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{initials}</Text>
            </View>
          )}

          <View style={styles.cardBody}>
            <View style={styles.nameRow}>
              <Text style={styles.name} numberOfLines={1}>
                {item.firstName} {item.lastName}
              </Text>
              {banned && <Badge content="Banned" variant="error" />}
            </View>
            <Text style={styles.email} numberOfLines={1}>
              {email || "No email"}
            </Text>
            {item.username ? (
              <Text style={styles.username}>@{item.username}</Text>
            ) : null}
            <View style={styles.badgeRow}>
              <Badge content={formatRole(role)} variant={roleBadgeVariant(role)} />
              {item.publicMetadata?.area ? (
                <Badge content={String(item.publicMetadata.area)} variant="outline" />
              ) : null}
            </View>
          </View>
        </View>

        <View style={styles.cardActions}>
          <Pressable
            style={({ pressed }) => [styles.actionBtn, styles.actionEdit, pressed && styles.pressed]}
            onPress={() => openEditModal(item)}
          >
            <Ionicons name="create-outline" size={18} color={colors.white} />
            <Text style={styles.actionLabel}>Edit</Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => [
              styles.actionBtn,
              banned ? styles.actionUnban : styles.actionBan,
              pressed && styles.pressed,
            ]}
            onPress={() => confirmToggleBan(item)}
          >
            <Ionicons
              name={banned ? "checkmark-circle-outline" : "ban-outline"}
              size={18}
              color={colors.white}
            />
            <Text style={styles.actionLabel}>{banned ? "Unban" : "Ban"}</Text>
          </Pressable>
        </View>
      </View>
    );
  };

  if (loading && users.length === 0) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading users…</Text>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      {error ? (
        <Pressable style={styles.errorBanner} onPress={handleRefresh}>
          <Ionicons name="warning-outline" size={18} color={colors.white} />
          <Text style={styles.errorText}>{error}</Text>
          <Text style={styles.errorRetry}>Tap to retry</Text>
        </Pressable>
      ) : null}

      <FlatList
        ref={listRef}
        data={filteredUsers}
        keyExtractor={(u) => u.id}
        renderItem={renderUserCard}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
        ListHeaderComponent={
          <View style={styles.toolbar}>
            <View style={styles.statsRow}>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{stats.total}</Text>
                <Text style={styles.statLabel}>Total</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{stats.admins}</Text>
                <Text style={styles.statLabel}>Admins</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={[styles.statValue, stats.banned > 0 && { color: colors.error }]}>
                  {stats.banned}
                </Text>
                <Text style={styles.statLabel}>Banned</Text>
              </View>
              <Pressable
                style={({ pressed }) => [styles.refreshBtn, pressed && styles.pressed]}
                onPress={handleRefresh}
                disabled={refreshing}
                accessibilityLabel="Refresh users"
              >
                <Ionicons name="refresh" size={22} color={colors.primary} />
              </Pressable>
            </View>

            <View style={styles.searchWrap}>
              <Ionicons name="search" size={20} color={colors.textMuted} style={styles.searchIcon} />
              <TextInput
                value={search}
                onChangeText={setSearch}
                placeholder="Search name, email, role…"
                placeholderTextColor={colors.textMuted}
                style={styles.searchInput}
                autoCapitalize="none"
                autoCorrect={false}
                clearButtonMode="while-editing"
              />
              {search.length > 0 ? (
                <Pressable onPress={() => setSearch("")} hitSlop={8} style={styles.clearBtn}>
                  <Ionicons name="close-circle" size={20} color={colors.textMuted} />
                </Pressable>
              ) : null}
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.chipsRow}
            >
              {ROLE_FILTERS.map((f) => {
                const active = roleFilter === f.id;
                return (
                  <Pressable
                    key={f.id}
                    onPress={() => setRoleFilter(f.id)}
                    style={[styles.chip, active && styles.chipActive]}
                  >
                    <Text style={[styles.chipText, active && styles.chipTextActive]}>{f.label}</Text>
                  </Pressable>
                );
              })}
            </ScrollView>

            <Text style={styles.resultCount}>
              {filteredUsers.length} of {users.length} users
            </Text>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="people-outline" size={48} color={colors.textMuted} />
            <Text style={styles.emptyTitle}>
              {search || roleFilter !== "all" ? "No matches" : "No users yet"}
            </Text>
            <Text style={styles.emptyHint}>
              {search || roleFilter !== "all"
                ? "Try a different search or filter"
                : "Pull down or tap refresh to reload"}
            </Text>
          </View>
        }
      />

      {refreshing ? (
        <View style={styles.refreshOverlay} pointerEvents="box-none">
          <View style={styles.refreshOverlayCard}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.refreshOverlayText}>Refreshing users…</Text>
          </View>
        </View>
      ) : null}

      <Modal visible={modalOpen} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={styles.modalSafe} edges={["top", "bottom"]}>
          <KeyboardAvoidingView
            style={styles.modalFlex}
            behavior={Platform.OS === "ios" ? "padding" : undefined}
          >
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Edit user</Text>
                <Text style={styles.modalSubtitle}>
                  {selectedUser?.firstName} {selectedUser?.lastName}
                </Text>
              </View>
              <Pressable onPress={() => setModalOpen(false)} hitSlop={12}>
                <Ionicons name="close" size={28} color={colors.text} />
              </Pressable>
            </View>

            <ScrollView
              style={styles.modalScroll}
              contentContainerStyle={styles.modalScrollContent}
              keyboardShouldPersistTaps="handled"
            >
              <Text style={styles.fieldLabel}>Role</Text>
              <View style={styles.roleGrid}>
                {ROLES.map((r) => {
                  const selected = newRole === r;
                  return (
                    <Pressable
                      key={r}
                      onPress={() => setNewRole(r)}
                      style={[styles.roleOption, selected && styles.roleOptionSelected]}
                    >
                      <Text style={[styles.roleOptionText, selected && styles.roleOptionTextSelected]}>
                        {formatRole(r)}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              {(newRole === "chief" || newRole === "chief_asst") && (
                <>
                  <Text style={styles.fieldLabel}>Area</Text>
                  <TextInput
                    value={area}
                    onChangeText={setArea}
                    placeholder="e.g. asokore_mampong"
                    placeholderTextColor={colors.textMuted}
                    style={styles.areaInput}
                  />
                </>
              )}
            </ScrollView>

            <View style={styles.modalFooter}>
              <Pressable
                style={[styles.modalBtn, styles.modalBtnSecondary]}
                onPress={() => setModalOpen(false)}
                disabled={saving}
              >
                <Text style={styles.modalBtnSecondaryText}>Cancel</Text>
              </Pressable>
              <Pressable
                style={[styles.modalBtn, styles.modalBtnPrimary, saving && styles.btnDisabled]}
                onPress={updateUserRole}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator color={colors.white} />
                ) : (
                  <Text style={styles.modalBtnPrimaryText}>Save changes</Text>
                )}
              </Pressable>
            </View>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </Modal>
    </View>
  );
}

function createStyles(
  colors: ReturnType<typeof useTheme>["colors"],
  spacing: ReturnType<typeof useTheme>["spacing"],
  borderRadius: ReturnType<typeof useTheme>["borderRadius"],
  isDark: boolean,
) {
  const cardShadow: ViewStyle =
    Platform.OS === "ios"
      ? {
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: isDark ? 0.25 : 0.08,
          shadowRadius: 8,
        }
      : { elevation: 3 };

  return StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: colors.surfaceAlt,
    },
    centered: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: colors.background,
      gap: spacing.md,
    },
    loadingText: {
      color: colors.textMuted,
      fontSize: fontSize.md,
    },
    errorBanner: {
      flexDirection: "row",
      flexWrap: "wrap",
      alignItems: "center",
      gap: spacing.sm,
      backgroundColor: colors.error,
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md,
    },
    errorText: {
      flex: 1,
      color: colors.white,
      fontSize: fontSize.sm,
      fontWeight: weights.medium,
    },
    errorRetry: {
      color: "rgba(255,255,255,0.85)",
      fontSize: fontSize.xs,
      fontWeight: weights.semibold,
    },
    refreshOverlay: {
      ...StyleSheet.absoluteFill,
      backgroundColor: isDark ? "rgba(15, 23, 42, 0.55)" : "rgba(255, 255, 255, 0.65)",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 10,
    },
    refreshOverlayCard: {
      backgroundColor: colors.background,
      paddingHorizontal: spacing.xl,
      paddingVertical: spacing.lg,
      borderRadius: borderRadius.xl,
      alignItems: "center",
      gap: spacing.md,
      borderWidth: 1,
      borderColor: colors.border,
      ...cardShadow,
    },
    refreshOverlayText: {
      fontSize: fontSize.sm,
      fontWeight: weights.medium,
      color: colors.textSecondary,
    },
    toolbar: {
      backgroundColor: colors.background,
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.md,
      paddingBottom: spacing.sm,
      marginBottom: spacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    statsRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.sm,
      marginBottom: spacing.md,
    },
    statCard: {
      flex: 1,
      backgroundColor: colors.surface,
      borderRadius: borderRadius.lg,
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.sm,
      alignItems: "center",
      borderWidth: 1,
      borderColor: colors.border,
    },
    statValue: {
      fontSize: fontSize.xl,
      fontWeight: weights.bold,
      color: colors.primary,
    },
    statLabel: {
      fontSize: fontSize.xs,
      color: colors.textMuted,
      marginTop: 2,
      fontWeight: weights.medium,
    },
    refreshBtn: {
      width: 48,
      height: 48,
      borderRadius: borderRadius.lg,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: "center",
      justifyContent: "center",
    },
    searchWrap: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.surface,
      borderRadius: borderRadius.lg,
      borderWidth: 1,
      borderColor: colors.border,
      paddingHorizontal: spacing.md,
      marginBottom: spacing.md,
    },
    searchIcon: {
      marginRight: spacing.sm,
    },
    searchInput: {
      flex: 1,
      paddingVertical: Platform.OS === "ios" ? spacing.md : spacing.sm,
      fontSize: fontSize.base,
      color: colors.text,
    },
    clearBtn: {
      padding: spacing.xs,
    },
    chipsRow: {
      gap: spacing.sm,
      paddingBottom: spacing.sm,
    },
    chip: {
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      borderRadius: borderRadius.full,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
    },
    chipActive: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    chipText: {
      fontSize: fontSize.sm,
      fontWeight: weights.semibold,
      color: colors.textSecondary,
    },
    chipTextActive: {
      color: colors.white,
    },
    resultCount: {
      fontSize: fontSize.xs,
      color: colors.textMuted,
      marginTop: spacing.xs,
    },
    listContent: {
      flexGrow: 1,
      paddingHorizontal: spacing.lg,
      paddingBottom: spacing.xxxl,
      gap: spacing.md,
    },
    card: {
      backgroundColor: colors.background,
      borderRadius: borderRadius.xl,
      borderWidth: 1,
      borderColor: colors.border,
      overflow: "hidden",
      ...cardShadow,
    },
    cardMain: {
      flexDirection: "row",
      padding: spacing.lg,
      gap: spacing.md,
    },
    avatar: {
      width: 52,
      height: 52,
      borderRadius: borderRadius.full,
      backgroundColor: colors.primaryAccent,
      alignItems: "center",
      justifyContent: "center",
    },
    avatarImage: {
      width: 52,
      height: 52,
      borderRadius: borderRadius.full,
    },
    avatarText: {
      color: colors.white,
      fontWeight: weights.bold,
      fontSize: fontSize.md,
    },
    cardBody: {
      flex: 1,
      minWidth: 0,
    },
    nameRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.sm,
      flexWrap: "wrap",
    },
    name: {
      fontSize: fontSize.md,
      fontWeight: weights.bold,
      color: colors.text,
      flexShrink: 1,
    },
    email: {
      fontSize: fontSize.sm,
      color: colors.textMuted,
      marginTop: 2,
    },
    username: {
      fontSize: fontSize.xs,
      color: colors.textSecondary,
      marginTop: 2,
    },
    badgeRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: spacing.xs,
      marginTop: spacing.sm,
    },
    cardActions: {
      flexDirection: "row",
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    actionBtn: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: spacing.xs,
      paddingVertical: spacing.md,
    },
    actionEdit: {
      backgroundColor: colors.primary,
    },
    actionBan: {
      backgroundColor: colors.error,
    },
    actionUnban: {
      backgroundColor: colors.success,
    },
    actionLabel: {
      color: colors.white,
      fontSize: fontSize.sm,
      fontWeight: weights.semibold,
    },
    pressed: {
      opacity: 0.85,
    },
    empty: {
      alignItems: "center",
      paddingVertical: spacing.xxxl,
      gap: spacing.sm,
    },
    emptyTitle: {
      fontSize: fontSize.lg,
      fontWeight: weights.bold,
      color: colors.text,
    },
    emptyHint: {
      fontSize: fontSize.sm,
      color: colors.textMuted,
      textAlign: "center",
    },
    modalSafe: {
      flex: 1,
      backgroundColor: colors.background,
    },
    modalFlex: {
      flex: 1,
    },
    modalHeader: {
      flexDirection: "row",
      alignItems: "flex-start",
      justifyContent: "space-between",
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.lg,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    modalTitle: {
      fontSize: fontSize.xl,
      fontWeight: weights.bold,
      color: colors.text,
    },
    modalSubtitle: {
      fontSize: fontSize.sm,
      color: colors.textMuted,
      marginTop: 4,
    },
    modalScroll: {
      flex: 1,
    },
    modalScrollContent: {
      padding: spacing.lg,
      paddingBottom: spacing.xxl,
    },
    fieldLabel: {
      fontSize: fontSize.sm,
      fontWeight: weights.semibold,
      color: colors.textSecondary,
      marginBottom: spacing.sm,
      marginTop: spacing.md,
    },
    roleGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: spacing.sm,
    },
    roleOption: {
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      borderRadius: borderRadius.md,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
    },
    roleOptionSelected: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    roleOptionText: {
      fontSize: fontSize.sm,
      fontWeight: weights.semibold,
      color: colors.text,
    },
    roleOptionTextSelected: {
      color: colors.white,
    },
    areaInput: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: borderRadius.md,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.md,
      fontSize: fontSize.base,
      color: colors.text,
      backgroundColor: colors.surface,
    },
    modalFooter: {
      flexDirection: "row",
      gap: spacing.md,
      padding: spacing.lg,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    modalBtn: {
      flex: 1,
      paddingVertical: spacing.md,
      borderRadius: borderRadius.lg,
      alignItems: "center",
      justifyContent: "center",
      minHeight: 48,
    },
    modalBtnPrimary: {
      backgroundColor: colors.primary,
    },
    modalBtnSecondary: {
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
    },
    modalBtnPrimaryText: {
      color: colors.white,
      fontWeight: weights.bold,
      fontSize: fontSize.md,
    },
    modalBtnSecondaryText: {
      color: colors.text,
      fontWeight: weights.bold,
      fontSize: fontSize.md,
    },
    btnDisabled: {
      opacity: 0.6,
    },
  });
}
