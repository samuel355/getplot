"use client";

import { useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  Filter,
  ArrowUpDown,
  Bell,
  CheckCircle,
  XCircle,
  Clock,
  Mail,
  Eye,
  Trash2,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import useNotificationsStore from "../(admin)/_store/useNotificationsStore";
import StatCards from "../(admin)/_components/stat-cards";

export default function NotificationsPage() {
  const { user } = useUser();
  const {
    notifications,
    loading,
    error,
    filters,
    fetchNotifications,
    setFilters,
    markAllAsRead,
    clearFilters,
    setSort,
    markAsRead,
    deleteNotification,
  } = useNotificationsStore();

  const { toast } = useToast();
  const isAdmin = user?.publicMetadata?.role === 'admin' || user?.publicMetadata?.role === 'sysadmin';

  useEffect(() => {
    if (user) {
      fetchNotifications(user.id, isAdmin);
    }
  }, [user, isAdmin, fetchNotifications]);

  const handleFilterChange = (key, value) => {
    setFilters({ [key]: value });
  };

  // Calculate stats
  const stats = {
    total: notifications.length,
    unread: notifications.filter(n => !n.read).length,
    property: notifications.filter(n => n.type.startsWith('property_')).length,
    user: notifications.filter(n => n.type.startsWith('user_')).length,
  };

  // Generate stats for display
  const statsData = [
    {
      title: "Total Notifications",
      value: stats.total,
      icon: <Bell className="h-4 w-4 text-muted-foreground" />,
    },
    {
      title: "Unread",
      value: stats.unread,
      icon: <Clock className="h-4 w-4 text-amber-500" />,
    },
    {
      title: "Property Related",
      value: stats.property,
      icon: <CheckCircle className="h-4 w-4 text-green-500" />,
    },
    {
      title: "User Related",
      value: stats.user,
      icon: <Mail className="h-4 w-4 text-blue-500" />,
    },
  ];

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'property_approved':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'property_rejected':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'property_interest':
        return <Eye className="h-4 w-4 text-blue-500" />;
      case 'user_banned':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'user_unbanned':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      default:
        return <Bell className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getNotificationMessage = (notification) => {
    switch (notification.type) {
      case 'property_approved':
        return `Your property "${notification.property?.title}" has been approved`;
      case 'property_rejected':
        return `Your property "${notification.property?.title}" has been rejected`;
      case 'property_interest':
        return `Someone is interested in your property "${notification.property?.title}"`;
      case 'user_banned':
        return 'Your account has been banned';
      case 'user_unbanned':
        return 'Your account has been unbanned';
      default:
        return notification.message;
    }
  };

  const renderTable = (filteredNotifications) => (
    <Table>
      <TableCaption>A list of your notifications</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Type</TableHead>
          <TableHead>Message</TableHead>
          <TableHead>Date</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {loading ? (
          <TableRow>
            <TableCell colSpan={5} className="text-center">
              Loading...
            </TableCell>
          </TableRow>
        ) : error ? (
          <TableRow>
            <TableCell colSpan={5} className="text-center text-red-500">
              {error}
            </TableCell>
          </TableRow>
        ) : filteredNotifications.length === 0 ? (
          <TableRow>
            <TableCell colSpan={5} className="text-center">
              No notifications found
            </TableCell>
          </TableRow>
        ) : (
          filteredNotifications.map((notification) => (
            <TableRow key={notification.id} className={!notification.read ? 'bg-blue-50' : ''}>
              <TableCell>
                <div className="flex items-center gap-2">
                  {getNotificationIcon(notification.type)}
                  <span className="capitalize">
                    {notification.type.replace('_', ' ')}
                  </span>
                </div>
              </TableCell>
              <TableCell>
                {notification.property ? (
                  <Link 
                    href={`/properties/${notification.property.id}`}
                    className="hover:underline"
                  >
                    {getNotificationMessage(notification)}
                  </Link>
                ) : (
                  getNotificationMessage(notification)
                )}
              </TableCell>
              <TableCell>
                {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
              </TableCell>
              <TableCell>
                {notification.read ? 'Read' : 'Unread'}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  {!notification.read && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => markAsRead(notification.id)}
                    >
                      <CheckCircle className="h-4 w-4" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteNotification(notification.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );

  return (
    <div className="container mx-auto py-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Notifications</h1>
          <p className="text-muted-foreground">
            Manage and view your notifications
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => markAllAsRead(user.id)}
            className="flex items-center gap-2"
          >
            <CheckCircle className="h-4 w-4" />
            Mark all as read
          </Button>
        </div>
      </div>

      {/* Stats cards */}
      <StatCards stats={statsData} />

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search notifications..."
            className="w-full pl-8"
            onChange={(e) => handleFilterChange("search", e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Select
            value={filters.type || "all"}
            onValueChange={(value) => handleFilterChange("type", value === "all" ? null : value)}
          >
            <SelectTrigger className="w-[160px]">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Notification Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="property_approved">Property Approved</SelectItem>
              <SelectItem value="property_rejected">Property Rejected</SelectItem>
              <SelectItem value="property_interest">Property Interest</SelectItem>
              <SelectItem value="user_banned">User Banned</SelectItem>
              <SelectItem value="user_unbanned">User Unbanned</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={filters.read === null ? "all" : filters.read.toString()}
            onValueChange={(value) => 
              handleFilterChange("read", value === "all" ? null : value === "true")
            }
          >
            <SelectTrigger className="w-[160px]">
              <ArrowUpDown className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="false">Unread</SelectItem>
              <SelectItem value="true">Read</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Tabs and Table */}
      <Tabs defaultValue="unread">
        <TabsList>
          <TabsTrigger value="all" className="flex gap-2 items-center">
            All{" "}
            <span className="ml-1 rounded-full bg-muted px-2 py-0.5 text-xs font-medium">
              {stats.total}
            </span>
          </TabsTrigger>
          <TabsTrigger value="unread" className="flex gap-2 items-center">
            <Clock className="h-4 w-4" />
            Unread{" "}
            <span className="ml-1 rounded-full bg-muted px-2 py-0.5 text-xs font-medium">
              {stats.unread}
            </span>
          </TabsTrigger>
          <TabsTrigger value="property" className="flex gap-2 items-center">
            <CheckCircle className="h-4 w-4" />
            Property{" "}
            <span className="ml-1 rounded-full bg-muted px-2 py-0.5 text-xs font-medium">
              {stats.property}
            </span>
          </TabsTrigger>
          <TabsTrigger value="user" className="flex gap-2 items-center">
            <Mail className="h-4 w-4" />
            User{" "}
            <span className="ml-1 rounded-full bg-muted px-2 py-0.5 text-xs font-medium">
              {stats.user}
            </span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
          {renderTable(notifications)}
        </TabsContent>

        <TabsContent value="unread" className="mt-6">
          {renderTable(notifications.filter(n => !n.read))}
        </TabsContent>

        <TabsContent value="property" className="mt-6">
          {renderTable(notifications.filter(n => n.type.startsWith('property_')))}
        </TabsContent>

        <TabsContent value="user" className="mt-6">
          {renderTable(notifications.filter(n => n.type.startsWith('user_')))}
        </TabsContent>
      </Tabs>
    </div>
  );
} 