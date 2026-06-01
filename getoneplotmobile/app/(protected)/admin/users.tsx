import React, { useEffect, useState } from "react";
import {
  FlatList,
  View,
  Text,
  StyleSheet,
  Pressable,
  Modal,
  TextInput,
  ActivityIndicator,
  Alert,
} from "react-native";
import { api } from "../../../src/lib/api";
import { useAuth, useUser } from "@clerk/clerk-expo";

export default function AdminUsersScreen() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [newRole, setNewRole] = useState("");
  const [area, setArea] = useState("");

  const { getToken } = useAuth();
  const { user } = useUser();

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    setLoading(true);
    setError(null);
    try {
      const token = await getToken();
      const res = await api.get("/api/users", {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      // Handle both { data: [...] } and [...] response structures
      const usersData = Array.isArray(res.data) ? res.data : res.data.data;

      if (usersData) {
        setUsers(usersData);
      } else {
        console.warn("Unexpected users response structure:", res.data);
        setUsers([]);
      }
      return;
    } catch (e: any) {
      console.error("Primary /api/users failed", e);

      // If unauthorized/forbidden, show specific error
      if (e.response?.status === 401) {
        setError("Unauthorized: Please sign in again.");
        setLoading(false);
        return;
      }
      if (e.response?.status === 403) {
        setError("Forbidden: You do not have admin permissions.");
        setLoading(false);
        return;
      }

      // If network error, try fallback hosts
      const isNetworkError = !e.response;
      if (!isNetworkError) {
        setError(e.response?.data?.error || e?.message || "Failed to load users");
        setLoading(false);
        return;
      }

      // Build fallback hosts to try
      const fallbacks: string[] = [];
      // expo config / env
      try {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const Constants = require("expo-constants");
        const expoApi = Constants.expoConfig?.extra?.apiUrl || Constants.manifest?.extra?.apiUrl;
        if (expoApi) fallbacks.push(expoApi);
        const debuggerHost =
          Constants.manifest?.debuggerHost || Constants.expoConfig?.extra?.debuggerHost;
        if (debuggerHost) {
          const host = debuggerHost.split(":")[0];
          fallbacks.push(`http://${host}:3000`);
        }
      } catch (err) {
        // ignore
      }

      // Platform fallbacks
      try {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const { Platform } = require("react-native");
        if (Platform.OS === "android") {
          fallbacks.push("http://10.0.2.2:3000");
        }
      } catch (err) {}

      // Generic fallbacks
      fallbacks.push("http://localhost:3000");

      // Try each fallback sequentially
      const axios = require("axios").default;
      const token = await getToken();
      for (const host of fallbacks) {
        try {
          const url = host.replace(/\/$/, "") + "/api/users";
          console.log("[AdminUsers] trying fallback", url);
          const r = await axios.get(url, {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
            timeout: 5000,
          });
          if (r && r.data) {
            // set global api baseURL so subsequent calls use working host
            try {
              api.defaults.baseURL = host;
            } catch (err) {}
            setUsers(r.data.data || r.data || []);
            setLoading(false);
            return;
          }
        } catch (err) {
          console.warn("Fallback failed for", host, err?.message || err);
          continue;
        }
      }

      // All fallbacks failed
      setError(
        "Network Error: failed to reach /api/users. Check EXPO_PUBLIC_API_URL or that Next.js is reachable from device.",
      );
      Alert.alert(
        "Network Error",
        "Failed to reach server. Check EXPO_PUBLIC_API_URL, and that your dev server is reachable from the device/emulator.",
      );
    } finally {
      setLoading(false);
    }
  }

  function openRoleModal(u: any) {
    setSelectedUser(u);
    setNewRole(u.publicMetadata?.role || "member");
    setArea(u.publicMetadata?.area || "");
    setModalOpen(true);
  }

  async function submitRoleChange() {
    if (!selectedUser) return;
    try {
      const token = await getToken();
      const payload: any = { userId: selectedUser.id };
      if (newRole) payload.newRole = newRole;
      if (newRole === "chief" || newRole === "chief_asst") payload.area = area || "";

      await api.post("/api/admin/update-user", payload, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      Alert.alert("Success", "User role updated");
      setModalOpen(false);
      fetchUsers();
    } catch (e) {
      console.error("Failed to update role", e);
      Alert.alert("Error", "Failed to update role");
    }
  }

  async function toggleBan(u: any) {
    try {
      const token = await getToken();
      const banned = !!u.publicMetadata?.banned;
      const payload = { userId: u.id, banned: !banned };
      await api.post("/api/admin/update-user", payload, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      Alert.alert("Success", `User ${!banned ? "banned" : "unbanned"}`);
      fetchUsers();
    } catch (e) {
      console.error("Failed to toggle ban", e);
      Alert.alert("Error", "Failed to toggle ban");
    }
  }

  function renderItem({ item }: { item: any }) {
    const role = item.publicMetadata?.role || "member";
    const banned = item.publicMetadata?.banned;
    return (
      <View style={styles.row}>
        <View style={styles.info}>
          <Text style={styles.name}>{item.firstName || item.first_name || item.email}</Text>
          <Text style={styles.meta}>{item.emailAddresses?.[0]?.emailAddress || item.email}</Text>
          <Text style={styles.meta}>
            Role: {role} {item.publicMetadata?.area ? `• ${item.publicMetadata.area}` : ""}
          </Text>
          {banned ? <Text style={styles.banned}>BANNED</Text> : null}
        </View>
        <View style={styles.actions}>
          <Pressable style={styles.button} onPress={() => openRoleModal(item)}>
            <Text style={styles.buttonText}>Change Role</Text>
          </Pressable>
          <Pressable
            style={[styles.button, { backgroundColor: banned ? "#16a34a" : "#dc2626" }]}
            onPress={() => toggleBan(item)}
          >
            <Text style={styles.buttonText}>{banned ? "Unban" : "Ban"}</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  if (loading) return <ActivityIndicator style={{ flex: 1 }} />;

  return (
    <View style={styles.container}>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <FlatList data={users} keyExtractor={(u) => u.id} renderItem={renderItem} />

      <Modal visible={modalOpen} animationType="slide" onRequestClose={() => setModalOpen(false)}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>
            Update Role for {selectedUser?.firstName || selectedUser?.email}
          </Text>

          <View style={{ marginTop: 12 }}>
            <Text style={styles.label}>Role</Text>
            <View style={styles.roleRow}>
              {["member", "property_agent", "chief", "chief_asst", "admin", "sysadmin"].map((r) => (
                <Pressable
                  key={r}
                  style={[styles.roleOption, newRole === r && styles.roleSelected]}
                  onPress={() => setNewRole(r)}
                >
                  <Text style={newRole === r ? styles.roleTextSelected : styles.roleText}>
                    {r.replace(/_/g, " ")}
                  </Text>
                </Pressable>
              ))}
            </View>

            {(newRole === "chief" || newRole === "chief_asst") && (
              <>
                <Text style={[styles.label, { marginTop: 12 }]}>Area (required for chief)</Text>
                <TextInput
                  value={area}
                  onChangeText={setArea}
                  style={styles.input}
                  placeholder="Area"
                />
              </>
            )}

            <View style={{ flexDirection: "row", gap: 12, marginTop: 20 }}>
              <Pressable style={[styles.button, { flex: 1 }]} onPress={submitRoleChange}>
                <Text style={styles.buttonText}>Save</Text>
              </Pressable>
              <Pressable
                style={[styles.button, { backgroundColor: "#999", flex: 1 }]}
                onPress={() => setModalOpen(false)}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#fff" },
  row: { flexDirection: "row", padding: 12, borderBottomWidth: 1, borderColor: "#eee" },
  info: { flex: 1 },
  actions: { justifyContent: "center", alignItems: "flex-end", gap: 8 },
  name: { fontWeight: "700" },
  meta: { color: "#666" },
  banned: { color: "#dc2626", fontWeight: "700", marginTop: 6 },
  button: { backgroundColor: "#2563eb", padding: 8, borderRadius: 6, marginTop: 6 },
  buttonText: { color: "#fff", fontWeight: "600" },
  modalContent: { flex: 1, padding: 20, backgroundColor: "#fff" },
  modalTitle: { fontSize: 18, fontWeight: "700" },
  label: { fontSize: 14, fontWeight: "600" },
  roleRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 8 },
  roleOption: {
    padding: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 6,
    marginRight: 8,
    marginBottom: 8,
  },
  roleSelected: { backgroundColor: "#2563eb", borderColor: "#2563eb" },
  roleText: { color: "#111" },
  roleTextSelected: { color: "#fff" },
  input: { borderWidth: 1, borderColor: "#ddd", padding: 8, borderRadius: 6, marginTop: 8 },
  error: { color: "#dc2626" },
});
