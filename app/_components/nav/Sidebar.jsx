"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import {
  LayoutDashboard,
  MapPin,
  Users,
  List,
  PlusCircle,
  Menu,
  X,
  Home,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { SITES } from "@/lib/sites";
import { LogoLateral } from "@/app/_components/Logo";

// Nav config per role
const NAV = {
  sysadmin: [
    { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
    { label: "Sites", href: "/dashboard/sites", icon: MapPin },
    { label: "Users", href: "/dashboard/users", icon: Users },
    { label: "Properties", href: "/properties/all-properties", icon: List },
  ],
  admin: [
    { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
    { label: "Sites", href: "/dashboard/sites", icon: MapPin },
    { label: "Users", href: "/dashboard/users", icon: Users },
    { label: "Properties", href: "/properties/all-properties", icon: List },
  ],
  agent: [
    { label: "Overview", href: "/agent", icon: LayoutDashboard },
    { label: "My Listings", href: "/agent/listings", icon: List },
    { label: "Add Listing", href: "/properties/add-listing", icon: PlusCircle },
  ],
  property_agent: [
    { label: "Overview", href: "/agent", icon: LayoutDashboard },
    { label: "My Listings", href: "/agent/listings", icon: List },
    { label: "Add Listing", href: "/properties/add-listing", icon: PlusCircle },
  ],
  land_manager: [
    { label: "Overview", href: "/manager", icon: LayoutDashboard },
    { label: "My Sites", href: "/manager/sites", icon: MapPin },
  ],
  chief: [
    { label: "Overview", href: "/manager", icon: LayoutDashboard },
    { label: "My Sites", href: "/manager/sites", icon: MapPin },
  ],
  chief_asst: [
    { label: "Overview", href: "/manager", icon: LayoutDashboard },
    { label: "My Sites", href: "/manager/sites", icon: MapPin },
  ],
};

const ROLE_LABELS = {
  sysadmin: "System Admin",
  admin: "Admin",
  agent: "Property Agent",
  property_agent: "Property Agent",
  land_manager: "Land Manager",
  chief: "Chief",
  chief_asst: "Chief Assistant",
};

export default function Sidebar({ role, assignedSites = [] }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const navItems = NAV[role] ?? [];

  // For land managers, append their assigned sites under "My Sites"
  const managerSiteItems = ["land_manager", "chief", "chief_asst"].includes(role)
    ? SITES.filter((s) => assignedSites.includes(s.slug)).map((s) => ({
        label: s.name,
        href: `/manager/sites/${s.slug}`,
        icon: MapPin,
        sub: true,
      }))
    : [];

  return (
    <>
      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 h-14 bg-brand-navy text-white flex items-center justify-between px-4 shadow-md">
        <Link href="/" className="flex items-center">
          <LogoLateral variant="light" height={28} />
        </Link>
        <button onClick={() => setMobileOpen((o) => !o)} className="p-1.5 rounded-md hover:bg-white/10">
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-black/50"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar panel */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-50 h-full w-64 bg-brand-navy text-white flex flex-col transition-transform duration-200",
          "md:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        {/* Brand */}
        <div className="flex items-center px-5 py-5 border-b border-white/10">
          <LogoLateral variant="light" height={30} />
        </div>

        {/* Role badge */}
        <div className="px-5 py-3 border-b border-white/10">
          <span className="text-xs font-medium uppercase tracking-wider text-white/40">
            {ROLE_LABELS[role] ?? "Dashboard"}
          </span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {navItems.map((item) => (
            <SidebarLink key={item.href} item={item} pathname={pathname} onClick={() => setMobileOpen(false)} />
          ))}
          {managerSiteItems.map((item) => (
            <SidebarLink key={item.href} item={item} pathname={pathname} onClick={() => setMobileOpen(false)} sub />
          ))}
        </nav>

        {/* Bottom */}
        <div className="px-3 py-4 border-t border-white/10 space-y-2">
          <Link
            href="/"
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-white/60 hover:text-white hover:bg-white/10 transition-colors"
          >
            <Home className="w-4 h-4" />
            Visit Site
          </Link>
          <div className="flex items-center gap-3 px-3 py-2">
            <UserButton afterSignOutUrl="/" />
            <span className="text-sm text-white/60">Account</span>
          </div>
        </div>
      </aside>
    </>
  );
}

function SidebarLink({ item, pathname, onClick, sub }) {
  const active = pathname === item.href || (item.href !== "/dashboard" && item.href !== "/agent" && item.href !== "/manager" && pathname.startsWith(item.href));
  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
        sub && "pl-6 text-xs",
        active
          ? "bg-white text-brand-navy"
          : "text-white/70 hover:text-white hover:bg-white/10"
      )}
    >
      <Icon className={cn("shrink-0", sub ? "w-3.5 h-3.5" : "w-4 h-4")} />
      {item.label}
      {active && <ChevronRight className="w-3 h-3 ml-auto" />}
    </Link>
  );
}
