"use client";

import { UserButton, useUser } from "@clerk/nextjs";
import { Search, Bell, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useSidebar } from "../contexts/sidebar-context";
import { useRouter } from "next/navigation";
import { supabase } from "@/utils/supabase/client";

export default function Header() {
  const { user } = useUser();
  const { isMobileOpen, setIsMobileOpen } = useSidebar();
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();
  
  const isAdmin = user?.publicMetadata?.role === 'admin' || user?.publicMetadata?.role === 'sysadmin';

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      if (isAdmin) {
        // Admins go to advanced search
        router.push(`/properties/search?q=${encodeURIComponent(searchQuery)}`);
      } else {
        // Regular users search their properties
        router.push(`/properties/list?search=${encodeURIComponent(searchQuery)}`);
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
            {isAdmin ? "Admin Dashboard" : "Properties Dashboard"}
          </h1>
        </div>
        
        <div className="flex items-center gap-4 md:ml-auto">
          <form onSubmit={handleSearch} className="relative hidden md:flex w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              type="search"
              placeholder={isAdmin ? "Search all properties..." : "Search my properties..."}
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
                avatarBox: "h-8 w-8"
              }
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

  // Fetch notifications based on user role
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        let query = supabase
          .from('notifications')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(10);

        if (!isAdmin) {
          query = query.eq('user_id', user.id);
        }

        const { data, error } = await query;

        if (error) throw error;
        setNotifications(data || []);
        setUnreadCount(data?.filter(n => !n.read).length || 0);
      } catch (error) {
        console.error('Error fetching notifications:', error);
      }
    };

    fetchNotifications();
  }, [isAdmin]);

  const markAsRead = async (notificationId) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId);

      if (error) throw error;
      
      setNotifications(notifications.map(n => 
        n.id === notificationId ? { ...n, read: true } : n
      ));
      setUnreadCount(prev => prev - 1);
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  return (
    <div className="relative">
      <Button 
        variant="ghost" 
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-red-500"></span>
        )}
        <span className="sr-only">Notifications</span>
      </Button>
      
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 rounded-md shadow-lg bg-white z-50 border animate-in fade-in-0 zoom-in-95">
          <div className="p-3 border-b flex justify-between items-center">
            <h3 className="text-sm font-medium">Notifications</h3>
            <Button 
              variant="link" 
              size="sm" 
              className="text-xs"
              onClick={() => {
                setIsOpen(false);
                router.push('/properties/notifications');
              }}
            >
              View all
            </Button>
          </div>
          <div className="max-h-64 overflow-y-auto">
            {notifications.length > 0 ? (
              notifications.map(notification => (
                <div 
                  key={notification.id} 
                  className={`p-3 border-b hover:bg-gray-50 ${!notification.read ? 'bg-blue-50' : ''}`}
                >
                  <p className="text-sm font-medium">{notification.message}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(notification.created_at).toRelativeTimeString()}
                  </p>
                  {!notification.read && (
                    <Button
                      variant="link"
                      size="sm"
                      className="text-xs mt-2"
                      onClick={() => markAsRead(notification.id)}
                    >
                      Mark as read
                    </Button>
                  )}
                </div>
              ))
            ) : (
              <div className="p-3 text-sm text-gray-500">No notifications</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}