"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import AdminLayout from "../_components/admin-layout";
import UserStats from "../_components/user-stats";
import UserTable from "../_components/user-table";
import UserRoleDialog from "../_components/user-role-dialog";
import UserBanDialog from "../_components/user-ban-dialog";
import useAdminUserStore from "../_store/useAdminUserStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, ArrowUpDown, UserPlus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function AdminUsersPage() {
  const { user } = useUser();
  const {
    users,
    filteredUsers,
    stats,
    loading,
    fetchUsers,
    setSearchQuery,
    setRoleFilter,
    setSortOrder,
    updateUserRole,
    toggleUserBan,
  } = useAdminUserStore();

  const [selectedUser, setSelectedUser] = useState(null);
  const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false);
  const [isBanDialogOpen, setIsBanDialogOpen] = useState(false);
  const [newRole, setNewRole] = useState("");
  const { toast } = useToast();

  // Fetch users on mount
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Handle role change
  const handleOpenRoleDialog = (user) => {
    setSelectedUser(user);
    setNewRole(user.role);
    setIsRoleDialogOpen(true);
  };

  const handleRoleUpdate = async () => {
    if (!selectedUser || !newRole) return;

    const result = await updateUserRole(selectedUser.id, newRole);

    if (result.success) {
      toast({
        title: "Role Updated",
        description: `User role has been updated to ${newRole}`,
      });
      setIsRoleDialogOpen(false);
    } else {
      toast({
        title: "Error",
        description: result.error || "Failed to update user role",
        variant: "destructive",
      });
    }
  };

  // Handle ban/unban
  const handleOpenBanDialog = (user) => {
    setSelectedUser(user);
    setIsBanDialogOpen(true);
  };

  const handleUserBan = async (reason) => {
    if (!selectedUser) return;

    const result = await toggleUserBan(selectedUser.id, true);

    if (result.success) {
      toast({
        title: "User Banned",
        description: "User has been banned from the platform",
        variant: "default",
      });
      setIsBanDialogOpen(false);

      // Send notification email
      await sendBanNotification(selectedUser, reason);
    } else {
      toast({
        title: "Error",
        description: result.error || "Failed to ban user",
        variant: "destructive",
      });
    }
  };

  const handleUserUnban = async () => {
    if (!selectedUser) return;

    const result = await toggleUserBan(selectedUser.id, false);

    if (result.success) {
      toast({
        title: "User Unbanned",
        description: "User has been unbanned and can now access the platform",
        variant: "default",
      });
      setIsBanDialogOpen(false);

      // Send notification email
      await sendUnbanNotification(selectedUser);
    } else {
      toast({
        title: "Error",
        description: result.error || "Failed to unban user",
        variant: "destructive",
      });
    }
  };

  // Send notification emails
  const sendBanNotification = async (user, reason) => {
    try {
      const response = await fetch('/api/admin/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          emailType: 'user-banned',
          reason,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send ban notification');
      }
    } catch (error) {
      console.error('Error sending ban notification:', error);
      toast({
        title: "Warning",
        description: "Failed to send ban notification email",
        variant: "destructive",
      });
    }
  };

  const sendUnbanNotification = async (user) => {
    try {
      const response = await fetch('/api/admin/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          emailType: 'user-unbanned',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send unban notification');
      }
    } catch (error) {
      console.error('Error sending unban notification:', error);
      toast({
        title: "Warning",
        description: "Failed to send unban notification email",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex h-full w-full items-center justify-center p-6">
          <div className="flex flex-col items-center gap-2">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
            <p className="text-sm text-muted-foreground">Loading users...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="flex-1 p-6 space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">User Management</h1>
            <p className="text-muted-foreground">
              Manage users and their permissions
            </p>
          </div>
          <Button>
            <UserPlus className="mr-2 h-4 w-4" />
            Invite User
          </Button>
        </div>

        {/* Stats */}
        <UserStats stats={stats} />

        {/* Filters */}
        <div className="flex flex-col gap-4 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search users..."
              className="w-full pl-8"
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <Select defaultValue="all" onValueChange={setRoleFilter}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Filter by Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="user">Regular Users</SelectItem>
                <SelectItem value="admin">Administrators</SelectItem>
                <SelectItem value="sysadmin">System Admins</SelectItem>
              </SelectContent>
            </Select>
            <Select defaultValue="newest" onValueChange={setSortOrder}>
              <SelectTrigger className="w-[160px]">
                <ArrowUpDown className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Sort By" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="oldest">Oldest First</SelectItem>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="email">Email</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* User Table */}
        <div className="rounded-md border">
          <UserTable
            users={filteredUsers}
            onChangeRole={handleOpenRoleDialog}
            onBanUser={handleOpenBanDialog}
            onUnbanUser={handleOpenBanDialog}
            currentUserRole={user?.publicMetadata?.role}
          />
        </div>

        {/* Role Dialog */}
        <UserRoleDialog
          isOpen={isRoleDialogOpen}
          setIsOpen={setIsRoleDialogOpen}
          selectedUser={selectedUser}
          newRole={newRole}
          setNewRole={setNewRole}
          onUpdateRole={handleRoleUpdate}
          currentUserRole={user?.publicMetadata?.role}
        />

        {/* Ban Dialog */}
        <UserBanDialog
          isOpen={isBanDialogOpen}
          setIsOpen={setIsBanDialogOpen}
          selectedUser={selectedUser}
          onBanUser={handleUserBan}
          isBan={selectedUser?.status === "active"}
        />
      </div>
    </AdminLayout>
  );
}