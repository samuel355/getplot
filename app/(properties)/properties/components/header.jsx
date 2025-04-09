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
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);

  // Fetch notifications based on user role
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const { data, error } = await supabase
          .from('notifications')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(10);

        if (error) throw error;
        setNotifications(data);
      } catch (error) {
        console.error('Error fetching notifications:', error);
      }
    };

    fetchNotifications();
  }, [isAdmin]);

  return (
    <div className="relative">
      <Button 
        variant="ghost" 
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Bell className="h-5 w-5" />
        {notifications.length > 0 && (
          <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-red-500"></span>
        )}
        <span className="sr-only">Notifications</span>
      </Button>
      
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 rounded-md shadow-lg bg-white z-50 border animate-in fade-in-0 zoom-in-95">
          <div className="p-3 border-b">
            <h3 className="text-sm font-medium">Notifications</h3>
          </div>
          <div className="max-h-64 overflow-y-auto">
            {notifications.length > 0 ? (
              notifications.map(notification => (
                <div key={notification.id} className="p-3 border-b hover:bg-gray-50">
                  <p className="text-sm font-medium">{notification.message}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(notification.created_at).toRelativeTimeString()}
                  </p>
                </div>
              ))
            ) : (
              <div className="p-3 text-sm text-gray-500">No notifications</div>
            )}
          </div>
          {notifications.length > 0 && (
            <div className="p-2 border-t">
              <Button 
                variant="link" 
                size="sm" 
                className="w-full text-xs"
                onClick={() => {
                  // Mark notifications as read in database
                  // Then clear local state
                  setNotifications([]);
                }}
              >
                Mark all as read
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}