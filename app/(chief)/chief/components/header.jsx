"use client";

import { UserButton, useUser } from "@clerk/nextjs";
import {
  Search,
  Bell,
  Menu,
  CheckCircle,
  XCircle,
  Eye,
  Mail,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useSidebar } from "../contexts/sidebar-context";
import { useRouter } from "next/navigation";
import { supabase } from "@/utils/supabase/client";
import { formatDistanceToNow } from "date-fns";

export default function Header() {
  const { user } = useUser();
  const { isMobileOpen, setIsMobileOpen } = useSidebar();
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  const isAdmin =
    user?.publicMetadata?.role === "admin" ||
    user?.publicMetadata?.role === "sysadmin";
  const isChief = user?.publicMetadata.role === 'chief'

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      if (isAdmin) {
        // Admins go to advanced search
        router.push(`/properties/search?q=${encodeURIComponent(searchQuery)}`);
      } else {
        // Regular users search their properties
        router.push(
          `/properties/list?search=${encodeURIComponent(searchQuery)}`
        );
      }
    }
  };

  return (
    <header className="border-b bg-white fixed top-0 left-0 right-0 z-40">
      <div className="flex h-16 items-center px-4 md:px-6">
        <div className="md:hidden">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMobileOpen(!isMobileOpen)}
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>

        <div className="hidden md:flex md:flex-1">
          <h1 className="text-xl font-semibold text-foreground">
            {isChief ? "Properties Dashboard" : "Dashboard"}
          </h1>
        </div>

        <div className="flex items-center gap-4 md:ml-auto">
          <form
            onSubmit={handleSearch}
            className="relative hidden md:flex w-64"
          >
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              type="search"
              placeholder={
                isChief ? "Search all plots..." : "Search my properties..."
              }
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-background rounded-md border border-input pl-8 pr-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </form>

          <NotificationButton isAdmin={isAdmin} />

          <UserButton
            afterSignOutUrl="/"
            appearance={{
              elements: {
                avatarBox: "h-8 w-8",
              },
            }}
          />
        </div>
      </div>
    </header>
  );
}

function NotificationButton({ isAdmin }) {
  const { user } = useUser();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const router = useRouter();

  const getNotificationIcon = (type) => {
    switch (type) {
      case "property_approved":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "property_rejected":
        return <XCircle className="h-4 w-4 text-red-500" />;
      case "property_interest":
        return <Eye className="h-4 w-4 text-blue-500" />;
      case "user_banned":
        return <XCircle className="h-4 w-4 text-red-500" />;
      case "user_unbanned":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      default:
        return <Bell className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getNotificationTitle = (type) => {
    switch (type) {
      case "property_approved":
        return "Property Approved";
      case "property_rejected":
        return "Property Rejected";
      case "property_interest":
        return "New Property Interest";
      case "user_banned":
        return "Account Banned";
      case "user_unbanned":
        return "Account Unbanned";
      default:
        return type.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase());
    }
  };

  // Fetch notifications based on user role
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        let query = supabase
          .from("notifications")
          .select("*")
          .eq("status", "pending")
          .order("created_at", { ascending: false })
          .limit(10);

        if (!isAdmin) {
          query = query.eq("user_id", user.id);
        }

        const { data, error } = await query;

        if (error) throw error;
        setNotifications(data || []);
        setUnreadCount(data?.length || 0);
      } catch (error) {
        console.error("Error fetching notifications:", error);
      }
    };

    fetchNotifications();
  }, [isAdmin, user?.id]);

  const markAsRead = async (notificationId) => {
    try {
      const { error } = await supabase
        .from("notifications")
        .update({
          status: "sent",
          sent_at: new Date().toISOString(),
        })
        .eq("id", notificationId);

      if (error) throw error;

      // Remove the notification from the local state since it's no longer pending
      setNotifications(notifications.filter((n) => n.id !== notificationId));
      setUnreadCount((prev) => prev - 1);
    } catch (error) {
      console.error("Error marking notification as sent:", error);
    }
  };

  return (
    <div className="relative">
      <Button variant="ghost" size="icon" onClick={() => setIsOpen(!isOpen)}>
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-red-500"></span>
        )}
        <span className="sr-only">Notifications</span>
      </Button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 rounded-md shadow-lg bg-white z-50 border animate-in fade-in-0 zoom-in-95">
          <div className="p-3 border-b flex justify-between items-center">
            <h3 className="text-sm font-medium">Notifications</h3>
            <Button
              variant="link"
              size="sm"
              className="text-xs"
              onClick={() => {
                setIsOpen(false);
                router.push("/properties/notifications");
              }}
            >
              View all
            </Button>
          </div>
          <div className="max-h-[480px] overflow-y-auto">
            {notifications.length > 0 ? (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 border-b hover:bg-gray-50 ${
                    notification.status === "pending" ? "bg-blue-50" : ""
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-1">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold text-gray-900">
                          {getNotificationTitle(notification.type)}
                        </p>
                        <span className="text-xs text-gray-500">
                          {formatDistanceToNow(
                            new Date(notification.created_at),
                            { addSuffix: true }
                          )}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        {notification.details || notification.message}
                      </p>
                      {notification.data?.inquirer_name && (
                        <div className="mt-2 text-xs text-gray-500">
                          <p>From: {notification.data.inquirer_name}</p>
                          <p>Contact: {notification.data.inquirer_phone}</p>
                        </div>
                      )}
                      <div className="mt-2 flex items-center gap-2">
                        {notification.status === "pending" && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-xs h-7"
                            onClick={() => markAsRead(notification.id)}
                          >
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Mark as Read
                          </Button>
                        )}
                        {notification.property_id && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-xs h-7"
                            onClick={() => {
                              setIsOpen(false);
                              router.push(
                                `/properties/property/${notification.property_id}`
                              );
                            }}
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            View Property
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-4 text-center">
                <Bell className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-500">No notifications</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
