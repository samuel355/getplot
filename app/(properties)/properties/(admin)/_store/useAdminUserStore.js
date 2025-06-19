import { create } from "zustand";

const useAdminUserStore = create((set, get) => ({
  // Users state
  users: [],
  filteredUsers: [],
  selectedUser: null,
  loading: true,
  error: null,

  // UI state
  searchQuery: "",
  roleFilter: "all",
  sortOrder: "newest",

  // Stats
  stats: {
    total: 0,
    admins: 0,
    sysadmins: 0,
    regularUsers: 0,
    banned: 0,
  },

  // Fetch users
  fetchUsers: async () => {
    try {
      set({ loading: true, error: null });

      // Fetch all users from Clerk
      let users = [];
      const response = await fetch("/api/users");
      if (!response.ok) {
        throw new Error("Failed to fetch users");
      }

      const data = await response.json();
      if (data) {
        users = data.data;
      }

      // Format user data
      const formattedUsers = users.map((user) => ({
        id: user.id,
        email: user.emailAddresses[0]?.emailAddress,
        firstName: user.firstName,
        lastName: user.lastName,
        imageUrl: user.imageUrl,
        role: user.publicMetadata?.role || "user",
        status: user.publicMetadata?.banned ? "banned" : "active",
        createdAt: user.createdAt,
        lastSignIn: user.lastSignInAt,
        // Add any other relevant user data
      }));

      // Calculate stats
      const stats = {
        total: formattedUsers.length,
        admins: formattedUsers.filter((u) => u.role === "admin").length,
        sysadmins: formattedUsers.filter((u) => u.role === "sysadmin").length,
        regularUsers: formattedUsers.filter((u) => u.role === "user").length,
        banned: formattedUsers.filter((u) => u.status === "banned").length,
      };

      set({
        users: formattedUsers,
        stats,
        loading: false,
      });

      // Apply initial filtering
      get().filterUsers();
    } catch (error) {
      console.error("Error fetching users:", error);
      set({
        error: "Failed to fetch users",
        loading: false,
      });
    }
  },

  // Filter users based on search and filters
  filterUsers: () => {
    const { users, searchQuery, roleFilter, sortOrder } = get();

    let filtered = [...users];

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (user) =>
          user.email?.toLowerCase().includes(query) ||
          user.firstName?.toLowerCase().includes(query) ||
          user.lastName?.toLowerCase().includes(query) ||
          `${user.firstName} ${user.lastName}`.toLowerCase().includes(query)
      );
    }

    // Filter by role
    if (roleFilter !== "all") {
      filtered = filtered.filter((user) => user.role === roleFilter);
    }

    // Sort users
    switch (sortOrder) {
      case "newest":
        filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      case "oldest":
        filtered.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        break;
      case "name":
        filtered.sort((a, b) =>
          `${a.firstName} ${a.lastName}`.localeCompare(
            `${b.firstName} ${b.lastName}`
          )
        );
        break;
      case "email":
        filtered.sort((a, b) => a.email.localeCompare(b.email));
        break;
    }

    set({ filteredUsers: filtered });
  },

  // Set search query
  setSearchQuery: (query) => {
    set({ searchQuery: query });
    get().filterUsers();
  },

  // Set role filter
  setRoleFilter: (role) => {
    set({ roleFilter: role });
    get().filterUsers();
  },

  // Set sort order
  setSortOrder: (order) => {
    set({ sortOrder: order });
    get().filterUsers();
  },

  // Update user role
  updateUserRole: async (userId, newRole) => {
    try {
      const response = await fetch(`/api/admin/update-user`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId, newRole }),
      });

      if (!response.ok) {
        throw new Error("Failed to update user role");
      }

      // Update local state
      const updatedUsers = get().users.map((user) =>
        user.id === userId ? { ...user, role: newRole } : user
      );

      // Update stats
      const stats = {
        total: updatedUsers.length,
        admins: updatedUsers.filter((u) => u.role === "admin").length,
        sysadmins: updatedUsers.filter((u) => u.role === "sysadmin").length,
        regularUsers: updatedUsers.filter((u) => u.role === "user").length,
        banned: updatedUsers.filter((u) => u.status === "banned").length,
      };

      set({
        users: updatedUsers,
        stats,
      });

      // Re-apply filters
      get().filterUsers();

      return { success: true };
    } catch (error) {
      console.error("Error updating user role:", error);
      return { success: false, error: error.message };
    }
  },

  // Ban/unban user
  toggleUserBan: async (userId, ban) => {
    try {
      // Update user ban status in Clerk
      await clerkClient.users.updateUser(userId, {
        publicMetadata: { banned: ban },
      });

      // Update local state
      const updatedUsers = get().users.map((user) =>
        user.id === userId
          ? { ...user, status: ban ? "banned" : "active" }
          : user
      );

      // Update stats
      const stats = {
        ...get().stats,
        banned: ban
          ? get().stats.banned + 1
          : Math.max(0, get().stats.banned - 1),
      };

      set({
        users: updatedUsers,
        stats,
      });

      // Re-apply filters
      get().filterUsers();

      return { success: true };
    } catch (error) {
      console.error("Error updating user ban status:", error);
      return { success: false, error: error.message };
    }
  },

  // Reset store
  resetStore: () => {
    set({
      users: [],
      filteredUsers: [],
      selectedUser: null,
      loading: false,
      error: null,
      searchQuery: "",
      roleFilter: "all",
      sortOrder: "newest",
      stats: {
        total: 0,
        admins: 0,
        sysadmins: 0,
        regularUsers: 0,
        banned: 0,
      },
    });
  },
}));

export default useAdminUserStore;
