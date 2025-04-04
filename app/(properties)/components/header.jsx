"use client";

import { UserButton, useUser } from "@clerk/nextjs";
import { Search, Bell, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useState } from "react"; // For notifications
import { useSidebar } from "../contexts/sidebar-context";

export default function Header() {
  const { user } = useUser()
  const { isMobileOpen, setIsMobileOpen } = useSidebar();
  
  return (
    <header className="border-b bg-white">
      <div className="flex h-16 items-center px-4 md:px-6">
        <div className="md:hidden">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => setIsMobileOpen(!isMobileOpen)} // Toggle sidebar
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>
        <div className="hidden md:flex md:flex-1">
          <h1 className="text-xl font-semibold text-foreground">
            Properties Dashboard
          </h1>
        </div>
        
        <div className="flex items-center gap-4 md:ml-auto">
          <div className="relative hidden md:flex w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              type="search"
              placeholder="Search properties..."
              className="w-full bg-background rounded-md border border-input pl-8 pr-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>
          
          <NotificationButton />
          
          <UserButton afterSignOutUrl="/" />
        </div>
      </div>
    </header>
  );
}

// New component for notifications
function NotificationButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, message: "New property listing", time: "2 minutes ago" },
    { id: 2, message: "Message from tenant", time: "1 hour ago" }
  ]);

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
                  <p className="text-xs text-muted-foreground mt-1">{notification.time}</p>
                </div>
              ))
            ) : (
              <div className="p-3 text-sm text-gray-500">No notifications</div>
            )}
          </div>
          <div className="p-2 border-t">
            <Button 
              variant="link" 
              size="sm" 
              className="w-full text-xs"
              onClick={() => setNotifications([])}
            >
              Mark all as read
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}