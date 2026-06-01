import React, { useEffect, useState } from "react";
import {
  FlatList,
  View,
  Text,
  Pressable,
  Modal,
  TextInput,
  ActivityIndicator,
  Alert,
  Image,
} from "react-native";
import { api } from "../../../src/lib/api";
import { useAuth, useUser } from "@clerk/clerk-expo";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useTheme } from "../../../src/constants/theme";
import { Ionicons } from "@expo/vector-icons";

export default function AdminUsersScreen() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [newRole, setNewRole] = useState("");
  const [area, setArea] = useState("");

  const { getToken } = useAuth();
  const { colors, spacing, borderRadius, fontSize, fontWeight } = useTheme();

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    setError(null);

    try {
      // First, test if server is reachable
      console.log("[AdminUsers] Testing API health...");
      try {
        await api.get("/api/health", { timeout: 3000 });
        console.log("[AdminUsers] API health check passed");
      } catch (healthErr: any) {
        console.warn("[AdminUsers] Health check failed:", healthErr.message);
        setError("API server not responding. Make sure Expo dev server is running.");
        setLoading(false);
        return;
      }

      // Try cached first to show immediate data
      const cached = await AsyncStorage.getItem("admin_users_cache");
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed)) {
            setUsers(parsed);
            console.log("[AdminUsers] Loaded from cache:", parsed.length, "users");
          }
        } catch (e) {}
      }

      // Create abort controller with 15s timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);

      console.log("[AdminUsers] Fetching fresh users from API...");
      const token = await getToken();
      console.log("[AdminUsers] Token obtained, making request...");
      
      const res = await api.get("/api/users", {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        signal: controller.signal as any,
      });
      clearTimeout(timeoutId);

      console.log("[AdminUsers] API response received");
      const usersData = Array.isArray(res.data) ? res.data : res.data?.data;
      console.log("[AdminUsers] Parsed users:", usersData?.length || 0, "users");
      
      if (Array.isArray(usersData)) {
        setUsers(usersData);
        await AsyncStorage.setItem("admin_users_cache", JSON.stringify(usersData));
      }
    } catch (err: any) {
      console.error("[AdminUsers] Error loading users:", err.message || err);
      if (err.code === "ECONNABORTED" || err.message?.includes("timeout")) {
        setError("Request timed out. Check Expo logs for details.");
      } else if (err.response?.status === 401) {
        setError("Unauthorized. Not an admin.");
      } else if (err.response?.status === 403) {
        setError("Forbidden. Admin access required.");
      } else {
        setError(err.response?.data?.error || err.message || "Failed to load users");
      }
    } finally {
      setLoading(false);
    }
  };

  const updateUserRole = async () => {
    if (!selectedUser || !newRole) return;

    try {
      const token = await getToken();
      const payload: any = { userId: selectedUser.id };
      if (newRole) payload.newRole = newRole;
      if ((newRole === "chief" || newRole === "chief_asst") && area) {
        payload.area = area;
      }

      await api.post("/api/admin/update-user", payload, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      Alert.alert("Success", "User role updated");
      setModalOpen(false);
      loadUsers();
    } catch (err: any) {
      Alert.alert("Error", err.response?.data?.error || "Failed to update role");
    }
  };

  const toggleBan = async (u: any) => {
    try {
      const token = await getToken();
      const banned = !!u.publicMetadata?.banned;
      await api.post(
        "/api/admin/update-user",
        { userId: u.id, banned: !banned },
        { headers: token ? { Authorization: `Bearer ${token}` } : {} }
      );
      Alert.alert("Success", `User ${!banned ? "banned" : "unbanned"}`);
      loadUsers();
    } catch (err: any) {
      Alert.alert("Error", "Failed to update user status");
    }
  };

  const renderUserItem = ({ item }: { item: any }) => {
    const role = item.publicMetadata?.role || "member";
    const banned = item.publicMetadata?.banned;
    const initials = `${item.firstName?.[0] || ""}${item.lastName?.[0] || ""}`.toUpperCase();

    return (
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingVertical: spacing.md,
          paddingHorizontal: spacing.md,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
        }}
      >
        {/* Avatar */}
        <View
          style={{
            width: 48,
            height: 48,
            borderRadius: borderRadius.full,
            backgroundColor: colors.primaryAccent,
            alignItems: "center",
            justifyContent: "center",
            marginRight: spacing.md,
          }}
        >
          <Text style={{ color: colors.white, fontWeight: fontWeight.bold, fontSize: fontSize.md }}>
            {initials}
          </Text>
        </View>

        {/* Info */}
        <View style={{ flex: 1 }}>
          <Text
            style={{
              color: colors.text,
              fontWeight: fontWeight.semibold,
              fontSize: fontSize.md,
            }}
          >
            {item.firstName} {item.lastName}
          </Text>
          <Text style={{ color: colors.textMuted, fontSize: fontSize.sm, marginTop: 2 }}>
            {item.emailAddresses?.[0]?.emailAddress || item.email}
          </Text>
          <Text
            style={{
              color: colors.textSecondary,
              fontSize: fontSize.xs,
              marginTop: 4,
            }}
          >
            Role: {role} {item.publicMetadata?.area ? `• ${item.publicMetadata.area}` : ""}
          </Text>
          {banned && (
            <Text style={{ color: colors.error, fontWeight: fontWeight.semibold, marginTop: 2 }}>
              BANNED
            </Text>
          )}
        </View>

        {/* Actions */}
        <View style={{ flexDirection: "row", gap: spacing.sm }}>
          <Pressable
            onPress={() => {
              setSelectedUser(item);
              setNewRole(item.publicMetadata?.role || "member");
              setArea(item.publicMetadata?.area || "");
              setModalOpen(true);
            }}
            style={{
              backgroundColor: colors.primary,
              paddingHorizontal: spacing.sm,
              paddingVertical: spacing.xs,
              borderRadius: borderRadius.md,
            }}
          >
            <Ionicons name="pencil" size={16} color={colors.white} />
          </Pressable>

          <Pressable
            onPress={() => toggleBan(item)}
            style={{
              backgroundColor: banned ? colors.success : colors.error,
              paddingHorizontal: spacing.sm,
              paddingVertical: spacing.xs,
              borderRadius: borderRadius.md,
            }}
          >
            <Ionicons name={banned ? "checkmark" : "ban"} size={16} color={colors.white} />
          </Pressable>
        </View>
      </View>
    );
  };

  if (loading && users.length === 0) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: colors.background,
        }}
      >
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {error && (
        <View
          style={{
            backgroundColor: colors.error,
            paddingHorizontal: spacing.md,
            paddingVertical: spacing.sm,
          }}
        >
          <Text style={{ color: colors.white, fontSize: fontSize.sm }}>
            {error}
          </Text>
        </View>
      )}

      {/* Users List */}
      <FlatList
        data={users}
        keyExtractor={(u) => u.id}
        renderItem={renderUserItem}
        ListEmptyComponent={
          <View
            style={{
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
              paddingVertical: 60,
            }}
          >
            <Text style={{ color: colors.textMuted, fontSize: fontSize.md }}>
              No users found
            </Text>
          </View>
        }
      />

      {/* Role Update Modal */}
      <Modal
        visible={modalOpen}
        animationType="slide"
        onRequestClose={() => setModalOpen(false)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: colors.background,
            paddingHorizontal: spacing.md,
            paddingVertical: spacing.lg,
          }}
        >
          <Text
            style={{
              fontSize: fontSize.lg,
              fontWeight: fontWeight.bold,
              color: colors.text,
              marginBottom: spacing.lg,
            }}
          >
            Update {selectedUser?.firstName || "User"}
          </Text>

          <Text
            style={{
              fontSize: fontSize.sm,
              fontWeight: fontWeight.semibold,
              color: colors.textSecondary,
              marginBottom: spacing.sm,
            }}
          >
            Select Role
          </Text>

          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing.sm, marginBottom: spacing.lg }}>
            {["member", "property_agent", "chief", "chief_asst", "admin", "sysadmin"].map((r) => (
              <Pressable
                key={r}
                onPress={() => setNewRole(r)}
                style={{
                  paddingHorizontal: spacing.md,
                  paddingVertical: spacing.sm,
                  borderRadius: borderRadius.md,
                  backgroundColor:
                    newRole === r ? colors.primary : colors.surface,
                  borderWidth: 1,
                  borderColor: newRole === r ? colors.primary : colors.border,
                }}
              >
                <Text
                  style={{
                    color:
                      newRole === r ? colors.white : colors.text,
                    fontSize: fontSize.sm,
                    fontWeight: fontWeight.semibold,
                  }}
                >
                  {r.replace(/_/g, " ")}
                </Text>
              </Pressable>
            ))}
          </View>

          {(newRole === "chief" || newRole === "chief_asst") && (
            <>
              <Text
                style={{
                  fontSize: fontSize.sm,
                  fontWeight: fontWeight.semibold,
                  color: colors.textSecondary,
                  marginBottom: spacing.sm,
                }}
              >
                Area
              </Text>
              <TextInput
                value={area}
                onChangeText={setArea}
                placeholder="Enter area"
                placeholderTextColor={colors.textMuted}
                style={{
                  borderWidth: 1,
                  borderColor: colors.border,
                  borderRadius: borderRadius.md,
                  paddingHorizontal: spacing.md,
                  paddingVertical: spacing.sm,
                  color: colors.text,
                  marginBottom: spacing.lg,
                }}
              />
            </>
          )}

          {/* Buttons */}
          <View style={{ flexDirection: "row", gap: spacing.md }}>
            <Pressable
              onPress={updateUserRole}
              style={{
                flex: 1,
                backgroundColor: colors.primary,
                paddingVertical: spacing.md,
                borderRadius: borderRadius.md,
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  color: colors.white,
                  fontWeight: fontWeight.bold,
                  fontSize: fontSize.md,
                }}
              >
                Save
              </Text>
            </Pressable>

            <Pressable
              onPress={() => setModalOpen(false)}
              style={{
                flex: 1,
                backgroundColor: colors.surface,
                borderWidth: 1,
                borderColor: colors.border,
                paddingVertical: spacing.md,
                borderRadius: borderRadius.md,
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  color: colors.text,
                  fontWeight: fontWeight.bold,
                  fontSize: fontSize.md,
                }}
              >
                Cancel
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}
