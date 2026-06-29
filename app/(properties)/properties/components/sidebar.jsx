"use client";

import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Building,
  Home,
  Users,
  Settings,
  BarChart4,
  PlusCircle,
  LogOut,
  X,
  Search,
  FileText,
  Clock,
  Store,
  Bookmark,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useClerk } from "@clerk/nextjs";
import { useSidebar } from "../contexts/sidebar-context";

export default function Sidebar() {
  const { user, isSignedIn } = useUser();
  const { signOut } = useClerk();
  const pathname = usePathname();
  const { isMobileOpen, setIsMobileOpen } = useSidebar();

  if (!isSignedIn) return null;

  const isAdmin =
    user?.publicMetadata?.role === "admin" ||
    user?.publicMetadata?.role === "sysadmin";
  const isSysAdmin = user?.publicMetadata?.role === "sysadmin";
  const isChief = user?.publicMetadata?.role === "chief";

  // Regular user navigation
  const navigation = [
    {
      name: "My Dashboard",
      href: "/properties/my-dashboard",
      icon: LayoutDashboard,
    },
    { name: "My Properties", href: "/properties/list", icon: Home },
    { name: "Saved Properties", href: "/properties/saved", icon: Bookmark },
    { name: "Market Place", href: "/market-place", icon: Store },
    { name: "Add Property", href: "/properties/add-listing", icon: PlusCircle },
  ];

  // Admin navigation with new routes
  const adminNavigation = [
    {
      name: "Properties Dashboard",
      href: "/properties",
      icon: LayoutDashboard,
    },
    { name: "Lands Dashboard", href: "/dashboard", icon: LayoutDashboard },
    {
      name: "All Properties",
      href: "/properties/all-properties",
      icon: Building,
    },
    { name: "Advanced Search", href: "/properties/search", icon: Search },
    { name: "Users", href: "/properties/users", icon: Users },
    { name: "Analytics", href: "/properties/analytics", icon: BarChart4 },
    { name: "Activity Logs", href: "/properties/activity", icon: Clock },
    { name: "Settings", href: "/properties/settings", icon: Settings },
  ];

  // System admin only navigation
  const sysAdminNavigation = [
    { name: "System Logs", href: "/properties/system-logs", icon: FileText },
  ];

  // The main sidebar content
  const sidebarContent = (
    <div className="flex flex-col h-screen">
      <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6 shrink-0">
        <Link
          href="/properties"
          className="flex items-center gap-2 font-semibold"
        >
          <Building className="h-6 w-6" />
          <span>PropManager</span>
        </Link>
        <Button
          variant="ghost"
          size="icon"
          className="ml-auto md:hidden"
          onClick={() => setIsMobileOpen(false)}
        >
          <X className="h-5 w-5" />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto">
        <nav className="grid items-start px-2 lg:px-4 gap-1 py-2">
          {/* Regular navigation */}
          <div className="my-4">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all ${
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                  onClick={() => setIsMobileOpen(false)}
                >
                  <item.icon className="h-4 w-4" />
                  {item.name}
                </Link>
              );
            })}
          </div>

          {/* Admin navigation */}
          {isAdmin && (
            <div className="space-y-4">
              <div className="px-3">
                <h2 className="mb-2 px-1 text-xs font-semibold tracking-tight text-muted-foreground">
                  Admin
                </h2>
                {adminNavigation.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all ${
                        isActive
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      }`}
                      onClick={() => setIsMobileOpen(false)}
                    >
                      <item.icon className="h-4 w-4" />
                      {item.name}
                    </Link>
                  );
                })}
              </div>

              {/* System Admin Only Section */}
              {isSysAdmin && (
                <div className="px-3">
                  <h2 className="mb-2 px-1 text-xs font-semibold tracking-tight text-muted-foreground">
                    System
                  </h2>
                  {sysAdminNavigation.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all ${
                          isActive
                            ? "bg-primary text-primary-foreground"
                            : "text-muted-foreground hover:bg-muted hover:text-foreground"
                        }`}
                        onClick={() => setIsMobileOpen(false)}
                      >
                        <item.icon className="h-4 w-4" />
                        {item.name}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </nav>
      </div>

      {/* User profile and logout */}
      <div className="p-4 border-t shrink-0">
        <div className="flex items-center gap-3 py-2">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted">
            <img
              src={user?.imageUrl}
              alt={user?.fullName || "User"}
              className="rounded-full h-8 w-8"
            />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium leading-none">
              {user?.fullName || user?.username}
            </span>
            <span className="text-xs text-muted-foreground">
              {isSysAdmin ? "System Admin" : isAdmin ? "Administrator" : "User"}
            </span>
          </div>
        </div>
        <Button
          variant="outline"
          className="mt-2 w-full justify-start flex gap-2"
          onClick={() => signOut()}
        >
          <LogOut className="h-4 w-4" />
          Log out
        </Button>
      </div>
    </div>
  );

  return (
    <>
      <div className="hidden md:block md:w-64 border-r bg-muted/40 fixed h-screen z-10">
        {sidebarContent}
      </div>

      <div className="hidden md:block md:w-64 flex-shrink-0"></div>

      {isMobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="fixed inset-0 bg-black/50"
            onClick={() => setIsMobileOpen(false)}
          ></div>

          <div className="fixed inset-y-0 left-0 w-64 border-r bg-background">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
