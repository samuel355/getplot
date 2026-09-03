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
  Menu,
  Users2,
  X,
} from "lucide-react";
import { usePathname } from "next/navigation";
import { useClerk, useUser, UserButton } from "@clerk/nextjs";
import { cn } from "@/lib/utils";

const SITES = [
  { href: "/dashboard/new-trabuom",        label: "Trabuom Sector 2" },
  { href: "/dashboard/asokore-mampong",    label: "Asokore Mampong" },
  { href: "/dashboard/yabi",               label: "Yabi" },
  { href: "/dashboard/royal-court-estate", label: "Royal Court Estate" },
  { href: "/dashboard/trabuom",            label: "Trabuom Sector 1" },
  { href: "/dashboard/nthc",               label: "NTHC Kwadaso" },
  { href: "/dashboard/dar-es-salaam",      label: "Ejisu - Adense" },
  { href: "/dashboard/legon-hills",        label: "East Legon Hills" },
  { href: "/dashboard/berekuso",           label: "Berekuso" },
];

const INTERESTS = [
  { href: "/dashboard/new-trabuom-interested-clients",     label: "Trabuom S2" },
  { href: "/dashboard/asokore-mampong-interested-clients", label: "Asokore Mampong" },
  { href: "/dashboard/yabi-interested-clients",            label: "Yabi" },
  { href: "/dashboard/royal-court-interested-clients",     label: "Royal Court Estate" },
  { href: "/dashboard/trabuom-interested-clients",         label: "Trabuom S1" },
  { href: "/dashboard/kwadaso-interested-clients",         label: "NTHC Kwadaso" },
  { href: "/dashboard/adense-interested-clients",          label: "Ejisu - Adense" },
  { href: "/dashboard/legon-hills-interested-clients",     label: "East Legon Hills" },
  { href: "/dashboard/berekuso-interested-clients",        label: "Berekuso" },
];

function DrawerLink({ href, label, icon: Icon, pathname, onClick }) {
  const active = pathname === href;
  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors",
        active
          ? "bg-brand-teal/15 text-brand-navy font-semibold"
          : "text-slate-600 hover:bg-slate-100"
      )}
    >
      {Icon && <Icon className="h-4 w-4 shrink-0" />}
      <span>{label}</span>
    </Link>
  );
}

function DrawerSection({ title, icon: Icon, items, pathname, onLinkClick }) {
  const isAnyActive = items.some((s) => pathname === s.href);
  const [open, setOpen] = useState(isAnyActive);
  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors",
          isAnyActive ? "text-brand-navy font-semibold" : "text-slate-600 hover:bg-slate-100"
        )}
      >
        {Icon && <Icon className="h-4 w-4 shrink-0" />}
        <span className="flex-1 text-left">{title}</span>
        <ChevronDown className={cn("h-4 w-4 transition-transform", open && "rotate-180")} />
      </button>
      {open && (
        <div className="ml-4 mt-0.5 border-l border-slate-200 pl-3 space-y-0.5">
          {items.map((s) => (
            <Link
              key={s.href}
              href={s.href}
              onClick={onLinkClick}
              className={cn(
                "block rounded-md px-2 py-2 text-sm transition-colors",
                pathname === s.href
                  ? "text-brand-navy font-semibold bg-brand-teal/10"
                  : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"
              )}
            >
              {s.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

const MobileMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const { user, signOut } = useClerk();
  const { user: clerkUser } = useUser();
  const close = () => setIsOpen(false);

  return (
    <div className="flex items-center justify-between border-b bg-white px-4 py-3 md:hidden">
      {/* Brand */}
      <div className="flex items-center gap-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-brand-navy">
          <LandPlot className="h-3.5 w-3.5 text-white" />
        </div>
        <span className="text-sm font-bold text-brand-navy">GetOnePlot</span>
      </div>

      <div className="flex items-center gap-3">
        <UserButton />
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="rounded-md p-1.5 text-slate-600 hover:bg-slate-100 transition-colors"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
          onClick={close}
        />
      )}

      {/* Drawer */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-[75vw] max-w-[300px] flex flex-col bg-white shadow-2xl transition-transform duration-300",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Drawer header */}
        <div className="flex h-14 items-center justify-between bg-brand-navy px-4 shrink-0">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-brand-teal">
              <LandPlot className="h-3.5 w-3.5 text-brand-navy" />
            </div>
            <div>
              <p className="text-xs font-bold text-white leading-none">GetOnePlot</p>
              <p className="text-[9px] text-white/50">Land Dashboard</p>
            </div>
          </div>
          <button
            type="button"
            onClick={close}
            className="rounded-md p-1 text-white/60 hover:text-white transition-colors"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Nav */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-4">
          {/* Overview */}
          <div className="space-y-0.5">
            <DrawerLink href="/dashboard" label="Overview" icon={LayoutDashboard} pathname={pathname} onClick={close} />
            <DrawerLink href="/" label="Public Website" icon={Globe} pathname={pathname} onClick={close} />
            <DrawerLink href="/properties/all-properties" label="Properties Dashboard" icon={MapPin} pathname={pathname} onClick={close} />
          </div>

          <div className="border-t border-slate-100" />

          {/* Land Sites */}
          <div>
            <p className="px-3 pb-1 text-[10px] font-semibold uppercase tracking-widest text-slate-400">Land Sites</p>
            <DrawerSection title="All Sites" icon={LandPlot} items={SITES} pathname={pathname} onLinkClick={close} />
          </div>

          <div className="border-t border-slate-100" />

          {/* People */}
          <div className="space-y-0.5">
            <p className="px-3 pb-1 text-[10px] font-semibold uppercase tracking-widest text-slate-400">People</p>
            <DrawerLink href="/dashboard/users" label="Users" icon={Users2} pathname={pathname} onClick={close} />
            <DrawerSection title="Interested Clients" icon={HeartHandshake} items={INTERESTS} pathname={pathname} onLinkClick={close} />
          </div>
        </div>

        {/* User footer */}
        <div className="border-t px-4 py-3 shrink-0 bg-slate-50">
          <div className="flex items-center gap-3">
            <img
              src={clerkUser?.imageUrl}
              alt={clerkUser?.fullName || "User"}
              className="h-8 w-8 rounded-full object-cover border border-slate-200"
            />
            <div className="min-w-0">
              <p className="text-sm font-semibold text-slate-800 truncate leading-none">{clerkUser?.fullName || clerkUser?.username}</p>
              <p className="text-xs text-slate-400 truncate mt-0.5">{clerkUser?.emailAddresses?.[0]?.emailAddress}</p>
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
    </div>
  );
};

export default MobileMenu;
