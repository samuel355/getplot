"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ChevronDown,
  Globe,
  HeartHandshake,
  LandPlot,
  LayoutDashboard,
  LogOut,
  MapPin,
  Users2,
} from "lucide-react";
import { usePathname, useSearchParams } from "next/navigation";
import { useClerk, useUser } from "@clerk/nextjs";
import { cn } from "@/lib/utils";

const SITES = [
  { href: "/dashboard/trabuom",         label: "Trabuom Sector 1" },
  { href: "/dashboard/new-trabuom",     label: "Trabuom Sector 2" },
  { href: "/dashboard/nthc",            label: "NTHC Kwadaso" },
  { href: "/dashboard/legon-hills",     label: "East Legon Hills" },
  { href: "/dashboard/dar-es-salaam",   label: "Dar Es Salaam" },
  { href: "/dashboard/yabi",            label: "Yabi" },
  { href: "/dashboard/berekuso",        label: "Berekuso" },
  { href: "/dashboard/asokore-mampong", label: "Asokore Mampong" },
  { href: "/dashboard/royal-court-estate", label: "Royal Court Estate" },
];

const INTERESTS = [
  { href: "/dashboard/trabuom-interested-clients",         label: "Trabuom S1" },
  { href: "/dashboard/new-trabuom-interested-clients",     label: "Trabuom S2" },
  { href: "/dashboard/kwadaso-interested-clients",         label: "NTHC Kwadaso" },
  { href: "/dashboard/legon-hills-interested-clients",     label: "East Legon Hills" },
  { href: "/dashboard/adense-interested-clients",          label: "Dar Es Salaam" },
  { href: "/dashboard/yabi-interested-clients",            label: "Yabi" },
  { href: "/dashboard/berekuso-interested-clients",        label: "Berekuso" },
  { href: "/dashboard/asokore-mampong-interested-clients", label: "Asokore Mampong" },
  { href: "/dashboard/royal-court-interested-clients",     label: "Royal Court Estate" },
];

function NavLink({ href, label, icon: Icon, pathname }) {
  const active = pathname === href;
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors",
        active
          ? "bg-brand-teal/15 text-brand-navy font-semibold"
          : "text-slate-500 hover:bg-slate-100 hover:text-slate-800"
      )}
    >
      {Icon && <Icon className="h-4 w-4 shrink-0" />}
      <span className="truncate">{label}</span>
      {active && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-brand-teal shrink-0" />}
    </Link>
  );
}

function CollapsibleSection({ title, icon: Icon, children, defaultOpen = false, isAnyChildActive }) {
  const [open, setOpen] = useState(defaultOpen || isAnyChildActive);
  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors",
          isAnyChildActive
            ? "text-brand-navy font-semibold"
            : "text-slate-500 hover:bg-slate-100 hover:text-slate-800"
        )}
      >
        {Icon && <Icon className="h-4 w-4 shrink-0" />}
        <span className="flex-1 text-left truncate">{title}</span>
        <ChevronDown className={cn("h-3.5 w-3.5 shrink-0 transition-transform", open && "rotate-180")} />
      </button>
      {open && (
        <div className="ml-3 mt-0.5 border-l border-slate-200 pl-3 space-y-0.5">
          {children}
        </div>
      )}
    </div>
  );
}

const Sidebar = () => {
  const { user } = useUser();
  const { signOut } = useClerk();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const search = searchParams.get("table");

  const isSiteActive = (href) => pathname === href || search?.includes(href.replace("/dashboard/", ""));
  const isInterestActive = (href) => pathname === href;
  const anySiteActive = SITES.some((s) => isSiteActive(s.href));
  const anyInterestActive = INTERESTS.some((s) => isInterestActive(s.href));

  return (
    <div className="flex flex-col h-screen w-full border-r bg-white">
      {/* Header */}
      <div className="flex h-[60px] items-center gap-3 border-b px-5 shrink-0 bg-brand-navy">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-teal">
          <LandPlot className="h-4 w-4 text-brand-navy" />
        </div>
        <div>
          <p className="text-sm font-bold text-white leading-none">GetOnePlot</p>
          <p className="text-[10px] text-white/50 mt-0.5">Land Dashboard</p>
        </div>
      </div>

      {/* Nav */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-5">

        {/* Overview */}
        <div className="space-y-0.5">
          <NavLink href="/dashboard" label="Overview" icon={LayoutDashboard} pathname={pathname} />
          <NavLink href="/" label="Public Website" icon={Globe} pathname={pathname} />
          <NavLink href="/properties/all-properties" label="Properties Dashboard" icon={MapPin} pathname={pathname} />
        </div>

        <div className="border-t border-slate-100" />

        {/* Land Sites */}
        <div className="space-y-0.5">
          <p className="px-3 pb-1 text-[10px] font-semibold uppercase tracking-widest text-slate-400">Land Sites</p>
          <CollapsibleSection
            title="All Sites"
            icon={LandPlot}
            defaultOpen={true}
            isAnyChildActive={anySiteActive}
          >
            {SITES.map((s) => (
              <Link
                key={s.href}
                href={s.href}
                className={cn(
                  "block py-1.5 px-2 rounded-md text-sm transition-colors truncate",
                  isSiteActive(s.href)
                    ? "text-brand-navy font-semibold bg-brand-teal/10"
                    : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"
                )}
              >
                {s.label}
              </Link>
            ))}
          </CollapsibleSection>
        </div>

        <div className="border-t border-slate-100" />

        {/* People */}
        <div className="space-y-0.5">
          <p className="px-3 pb-1 text-[10px] font-semibold uppercase tracking-widest text-slate-400">People</p>
          <NavLink href="/dashboard/users" label="Users" icon={Users2} pathname={pathname} />
          <CollapsibleSection
            title="Interested Clients"
            icon={HeartHandshake}
            isAnyChildActive={anyInterestActive}
          >
            {INTERESTS.map((s) => (
              <Link
                key={s.href}
                href={s.href}
                className={cn(
                  "block py-1.5 px-2 rounded-md text-sm transition-colors truncate",
                  isInterestActive(s.href)
                    ? "text-brand-navy font-semibold bg-brand-teal/10"
                    : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"
                )}
              >
                {s.label}
              </Link>
            ))}
          </CollapsibleSection>
        </div>
      </div>

      {/* User footer */}
      <div className="border-t px-4 py-3 shrink-0 bg-slate-50">
        <div className="flex items-center gap-3">
          <img
            src={user?.imageUrl}
            alt={user?.fullName || "User"}
            className="h-8 w-8 rounded-full object-cover border border-slate-200"
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-slate-800 truncate leading-none">{user?.fullName || user?.username}</p>
            <p className="text-xs text-slate-400 truncate mt-0.5">{user?.emailAddresses[0]?.emailAddress}</p>
          </div>
        </div>
        <button
          onClick={() => signOut()}
          className="mt-3 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-500 transition-colors hover:bg-red-50 hover:text-red-600"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
