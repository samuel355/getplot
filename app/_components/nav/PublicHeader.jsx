"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SignedIn, SignedOut, UserButton, useUser } from "@clerk/nextjs";
import {
  Building2,
  ChevronDown,
  Home,
  LandPlot,
  LayoutDashboard,
  MapPin,
  Menu,
  Phone,
  Store,
  UserRound,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { SITES } from "@/lib/sites";
import { LogoLateral } from "@/app/_components/Logo";

const DASHBOARD_ROLES = {
  agent: "/agent",
  property_agent: "/agent",
  land_manager: "/manager",
  chief: "/manager",
  chief_asst: "/manager",
};

export default function PublicHeader() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openMenu, setOpenMenu] = useState(null);
  const pathname = usePathname();
  const { user } = useUser();
  const role = user?.publicMetadata?.role;
  const headerRef = useRef(null);

  const groupedSites = useMemo(() => groupSitesByLocation(SITES), []);
  const isAdmin = role === "sysadmin" || role === "admin";
  const dashboardHref = isAdmin ? null : DASHBOARD_ROLES[role] ?? null;
  const isSiteActive = pathname === "/sites" || SITES.some((site) => pathname === `/sites/${site.slug}`);
  const isDashActive =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/properties") ||
    pathname.startsWith("/agent") ||
    pathname.startsWith("/manager");

  useEffect(() => {
    setOpenMenu(null);
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    const closeOnOutsideClick = (event) => {
      if (!headerRef.current?.contains(event.target)) setOpenMenu(null);
    };
    const closeOnEscape = (event) => {
      if (event.key === "Escape") setOpenMenu(null);
    };

    document.addEventListener("mousedown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("mousedown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, []);

  return (
    <header ref={headerRef} className="fixed left-0 right-0 top-0 z-50 border-b border-white/10 bg-brand-navy text-white shadow-lg shadow-brand-navy/15">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between gap-4">
          <Link href="/" className="flex shrink-0 items-center" aria-label="GetOnePlot home">
            <LogoLateral variant="light" height={52} />
          </Link>

          <nav className="hidden items-center gap-1 lg:flex" aria-label="Main navigation">
            <NavLink href="/" active={pathname === "/"} icon={Home}>
              Home
            </NavLink>

            <MenuButton
              active={isSiteActive}
              open={openMenu === "sites"}
              onClick={() => setOpenMenu((current) => current === "sites" ? null : "sites")}
              icon={LandPlot}
            >
              Sites
            </MenuButton>

            <NavLink href="/marketplace" active={pathname === "/marketplace"} icon={Store}>
              Marketplace
            </NavLink>
            <NavLink href="/contact" active={pathname === "/contact"} icon={Phone}>
              Contact
            </NavLink>

            <SignedIn>
              {isAdmin ? (
                <MenuButton
                  active={isDashActive}
                  open={openMenu === "dashboard"}
                  onClick={() => setOpenMenu((current) => current === "dashboard" ? null : "dashboard")}
                  icon={LayoutDashboard}
                >
                  Dashboard
                </MenuButton>
              ) : dashboardHref ? (
                <NavLink href={dashboardHref} active={isDashActive} icon={LayoutDashboard}>
                  Dashboard
                </NavLink>
              ) : null}
            </SignedIn>
          </nav>

          <div className="hidden shrink-0 items-center gap-3 lg:flex">
            <SignedIn>
              <UserButton afterSignOutUrl="/" />
            </SignedIn>
            <SignedOut>
              <Link href="/sign-up" className="inline-flex h-10 items-center rounded-lg bg-brand-teal px-4 text-sm font-bold text-brand-navy transition-colors hover:bg-brand-teal/90">
                Get started
              </Link>
            </SignedOut>
          </div>

          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-white/80 transition-colors hover:bg-white/10 hover:text-white lg:hidden"
            onClick={() => setMobileOpen((open) => !open)}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {openMenu === "sites" && (
        <DesktopPanel className="left-1/2 w-[min(52rem,calc(100vw-2rem))] -translate-x-1/2">
          <div className="grid gap-5 md:grid-cols-[1fr_17rem]">
            <div className="grid gap-5 sm:grid-cols-2">
              {groupedSites.map(({ location, sites }) => (
                <div key={location}>
                  <p className="mb-2 px-2 text-xs font-semibold uppercase tracking-wider text-slate-400">{location}</p>
                  <div className="space-y-1">
                    {sites.map((site) => (
                      <PanelLink
                        key={site.slug}
                        href={`/sites/${site.slug}`}
                        active={pathname === `/sites/${site.slug}`}
                        icon={MapPin}
                        title={site.name}
                        text={site.description}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="rounded-lg bg-slate-50 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-navy text-white">
                <LandPlot className="h-5 w-5" />
              </div>
              <h2 className="mt-4 font-semibold text-slate-950">Mapped land inventory</h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Open a site to inspect plot boundaries, live status, prices, and buyer actions.
              </p>
              <Link href="/sites" className="mt-4 inline-flex items-center text-sm font-semibold text-brand-navy hover:underline">
                View all locations
              </Link>
            </div>
          </div>
        </DesktopPanel>
      )}

      {openMenu === "dashboard" && (
        <DesktopPanel className="right-[max(1rem,calc((100vw-80rem)/2+1rem))] w-80">
          <div className="space-y-1">
            <PanelLink
              href="/dashboard"
              active={pathname.startsWith("/dashboard")}
              icon={LayoutDashboard}
              title="Land dashboard"
              text="Manage sites, plots, interests, and user roles."
            />
            <PanelLink
              href="/properties"
              active={pathname.startsWith("/properties")}
              icon={Building2}
              title="Properties dashboard"
              text="Manage marketplace property listings and approvals."
            />
          </div>
        </DesktopPanel>
      )}

      {mobileOpen && (
        <MobileMenu
          groupedSites={groupedSites}
          isAdmin={isAdmin}
          dashboardHref={dashboardHref}
          onClose={() => setMobileOpen(false)}
        />
      )}
    </header>
  );
}

function groupSitesByLocation(sites) {
  const groups = sites.reduce((acc, site) => {
    const key = site.location || "Other";
    acc[key] = acc[key] ? [...acc[key], site] : [site];
    return acc;
  }, {});

  return Object.entries(groups).map(([location, sites]) => ({ location, sites }));
}

function NavLink({ href, active, icon: Icon, children }) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex h-10 items-center gap-2 rounded-lg px-3 text-sm font-semibold text-white/75 transition-colors hover:bg-white/10 hover:text-white",
        active && "bg-white/10 text-brand-teal",
      )}
    >
      {Icon ? <Icon className="h-4 w-4" /> : null}
      {children}
    </Link>
  );
}

function MenuButton({ active, open, onClick, icon: Icon, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex h-10 items-center gap-2 rounded-lg px-3 text-sm font-semibold text-white/75 transition-colors hover:bg-white/10 hover:text-white",
        (active || open) && "bg-white/10 text-brand-teal",
      )}
      aria-expanded={open}
    >
      {Icon ? <Icon className="h-4 w-4" /> : null}
      {children}
      <ChevronDown className={cn("h-4 w-4 transition-transform", open && "rotate-180")} />
    </button>
  );
}

function DesktopPanel({ children, className }) {
  return (
    <div className={cn("absolute top-[calc(100%+0.5rem)] rounded-lg border border-slate-200 bg-white p-3 text-slate-900 shadow-2xl shadow-brand-navy/20", className)}>
      {children}
    </div>
  );
}

function PanelLink({ href, active, icon: Icon, title, text }) {
  return (
    <Link
      href={href}
      className={cn(
        "flex gap-3 rounded-lg p-3 transition-colors hover:bg-slate-50",
        active && "bg-brand-teal/10",
      )}
    >
      <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-navy/5 text-brand-navy">
        <Icon className="h-4 w-4" />
      </span>
      <span className="min-w-0">
        <span className="block text-sm font-semibold text-slate-950">{title}</span>
        {text ? <span className="mt-0.5 line-clamp-2 block text-xs leading-5 text-slate-500">{text}</span> : null}
      </span>
    </Link>
  );
}

function MobileMenu({ groupedSites, isAdmin, dashboardHref, onClose }) {
  const [sitesOpen, setSitesOpen] = useState(false);
  const [dashOpen, setDashOpen] = useState(false);

  return (
    <div className="border-t border-white/10 bg-brand-navy px-4 pb-5 lg:hidden">
      <div className="space-y-1 py-3">
        <MobileLink href="/" onClick={onClose} icon={Home}>Home</MobileLink>
        <MobileDisclosure label="Sites" icon={LandPlot} open={sitesOpen} onClick={() => setSitesOpen((open) => !open)} />
        {sitesOpen && (
          <div className="space-y-3 border-l border-white/10 py-2 pl-3">
            {groupedSites.map(({ location, sites }) => (
              <div key={location}>
                <p className="px-3 pb-1 text-[10px] font-semibold uppercase tracking-wider text-white/35">{location}</p>
                {sites.map((site) => (
                  <MobileLink key={site.slug} href={`/sites/${site.slug}`} onClick={onClose}>
                    {site.name}
                  </MobileLink>
                ))}
              </div>
            ))}
          </div>
        )}
        <MobileLink href="/marketplace" onClick={onClose} icon={Store}>Marketplace</MobileLink>
        <MobileLink href="/contact" onClick={onClose} icon={Phone}>Contact</MobileLink>

        <SignedIn>
          {isAdmin ? (
            <>
              <MobileDisclosure label="Dashboard" icon={LayoutDashboard} open={dashOpen} onClick={() => setDashOpen((open) => !open)} />
              {dashOpen && (
                <div className="border-l border-white/10 py-2 pl-3">
                  <MobileLink href="/dashboard" onClick={onClose}>Land dashboard</MobileLink>
                  <MobileLink href="/properties" onClick={onClose}>Properties dashboard</MobileLink>
                </div>
              )}
            </>
          ) : dashboardHref ? (
            <MobileLink href={dashboardHref} onClick={onClose} icon={LayoutDashboard}>Dashboard</MobileLink>
          ) : null}
        </SignedIn>
      </div>

      <div className="border-t border-white/10 pt-4">
        <SignedIn>
          <div className="flex items-center gap-3 rounded-lg bg-white/5 px-3 py-2">
            <UserButton afterSignOutUrl="/" />
            <span className="text-sm font-medium text-white/75">Account</span>
          </div>
        </SignedIn>
        <SignedOut>
          <div>
            <Link href="/sign-up" onClick={onClose} className="inline-flex h-10 w-full items-center justify-center rounded-lg bg-brand-teal text-sm font-bold text-brand-navy transition-colors hover:bg-brand-teal/90">
              Get started
            </Link>
          </div>
        </SignedOut>
      </div>
    </div>
  );
}

function MobileDisclosure({ label, icon: Icon, open, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold text-white/80 transition-colors hover:bg-white/10 hover:text-white"
      aria-expanded={open}
    >
      <Icon className="h-4 w-4" />
      <span className="flex-1 text-left">{label}</span>
      <ChevronDown className={cn("h-4 w-4 transition-transform", open && "rotate-180")} />
    </button>
  );
}

function MobileLink({ href, onClick, icon: Icon, children }) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold text-white/75 transition-colors hover:bg-white/10 hover:text-white"
    >
      {Icon ? <Icon className="h-4 w-4" /> : <span className="h-4 w-4" />}
      <span className="min-w-0 truncate">{children}</span>
    </Link>
  );
}
