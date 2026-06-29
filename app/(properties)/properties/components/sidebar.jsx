"use client";

import { useUser, useClerk } from "@clerk/nextjs";
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
  MapPin,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSidebar } from "../contexts/sidebar-context";
import { LogoLateral } from "@/app/_components/Logo";

const USER_NAV = [
  { name: "My Dashboard", href: "/properties/my-dashboard", icon: LayoutDashboard },
  { name: "My Properties", href: "/properties/list", icon: Home },
  { name: "Saved Properties", href: "/properties/saved", icon: Bookmark },
  { name: "Market Place", href: "/market-place", icon: Store },
  { name: "Add Property", href: "/properties/add-listing", icon: PlusCircle },
];

const ADMIN_NAV = [
  { name: "Overview", href: "/properties", icon: LayoutDashboard, exact: true },
  { name: "Lands Dashboard", href: "/dashboard", icon: MapPin, exact: true },
  { name: "All Properties", href: "/properties/all-properties", icon: Building },
  { name: "Advanced Search", href: "/properties/search", icon: Search },
  { name: "Users", href: "/properties/users", icon: Users },
  { name: "Analytics", href: "/properties/analytics", icon: BarChart4 },
  { name: "Activity Logs", href: "/properties/activity", icon: Clock },
  { name: "Settings", href: "/properties/settings", icon: Settings },
];

const SYSADMIN_NAV = [
  { name: "System Logs", href: "/properties/system-logs", icon: FileText },
];

function NavLink({ item, pathname, onClick }) {
  const active = item.exact
    ? pathname === item.href
    : pathname === item.href || pathname.startsWith(item.href + "/");
  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
        active
          ? "bg-white text-brand-navy"
          : "text-white/70 hover:text-white hover:bg-white/10"
      )}
    >
      <Icon className="w-4 h-4 shrink-0" />
      <span className="flex-1 truncate">{item.name}</span>
      {active && <ChevronRight className="w-3 h-3 shrink-0" />}
    </Link>
  );
}

function SectionLabel({ children }) {
  return (
    <p className="px-3 pt-4 pb-1.5 text-xs font-semibold uppercase tracking-wider text-white/30 select-none">
      {children}
    </p>
  );
}

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

  const close = () => setIsMobileOpen(false);

  const content = (
    <div className="flex flex-col h-full bg-brand-navy text-white overflow-hidden">
      {/* Logo header */}
      <div className="flex items-center justify-between px-5 py-5 border-b border-white/10 shrink-0">
        <Link href={isAdmin ? "/properties" : "/properties/my-dashboard"} onClick={close}>
          <LogoLateral variant="light" height={28} />
        </Link>
        <button
          className="md:hidden p-1.5 rounded-md hover:bg-white/10 transition-colors"
          onClick={close}
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Role badge */}
      <div className="px-5 py-2.5 border-b border-white/10 shrink-0">
        <span className="text-xs font-medium uppercase tracking-wider text-white/40">
          {isSysAdmin ? "System Admin" : isAdmin ? "Administrator" : "Properties"}
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-3 overflow-y-auto space-y-0.5">
        {/* Regular user section (only for non-admins, or at bottom for admins) */}
        {!isAdmin && (
          <>
            {USER_NAV.map((item) => (
              <NavLink key={item.href} item={item} pathname={pathname} onClick={close} />
            ))}
          </>
        )}

        {/* Admin section */}
        {isAdmin && (
          <>
            {ADMIN_NAV.map((item) => (
              <NavLink key={item.href} item={item} pathname={pathname} onClick={close} />
            ))}

            <SectionLabel>My Account</SectionLabel>
            {USER_NAV.map((item) => (
              <NavLink key={item.href} item={item} pathname={pathname} onClick={close} />
            ))}
          </>
        )}

        {/* Sysadmin-only section */}
        {isSysAdmin && (
          <>
            <SectionLabel>System</SectionLabel>
            {SYSADMIN_NAV.map((item) => (
              <NavLink key={item.href} item={item} pathname={pathname} onClick={close} />
            ))}
          </>
        )}
      </nav>

      {/* User footer */}
      <div className="shrink-0 border-t border-white/10 px-3 py-3">
        <div className="flex items-center gap-3 px-3 py-2 rounded-lg mb-1">
          <img
            src={user.imageUrl}
            alt={user.fullName ?? "User"}
            className="h-8 w-8 rounded-full object-cover border border-white/20 shrink-0"
          />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-white truncate">
              {user.fullName ?? user.username}
            </p>
            <p className="text-xs text-white/40 truncate">
              {user.primaryEmailAddress?.emailAddress}
            </p>
          </div>
        </div>
        <button
          onClick={() => signOut()}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-white/60 hover:text-white hover:bg-white/10 transition-colors"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          Sign out
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop fixed sidebar */}
      <div className="hidden md:block w-64 shrink-0 fixed inset-y-0 left-0 z-20">
        {content}
      </div>
      {/* Desktop spacer */}
      <div className="hidden md:block w-64 shrink-0" />

      {/* Mobile overlay */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="fixed inset-0 bg-black/50" onClick={close} />
          <div className="fixed inset-y-0 left-0 w-64 shadow-2xl">
            {content}
          </div>
        </div>
      )}
    </>
  );
}
