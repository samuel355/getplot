"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUser, UserButton, SignedIn, SignedOut } from "@clerk/nextjs";
import { Menu, X, ChevronDown, MapPin, LayoutDashboard, Building2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { SITES } from "@/lib/sites";
import { LogoLateral } from "@/app/_components/Logo";

export default function PublicHeader() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [sitesOpen, setSitesOpen] = useState(false);
  const [dashOpen, setDashOpen] = useState(false);
  const pathname = usePathname();
  const { user } = useUser();
  const role = user?.publicMetadata?.role;

  const isAdmin = role === "sysadmin" || role === "admin";
  const isActive = (href) => pathname === href;
  const isSiteActive = SITES.some((s) => pathname === `/sites/${s.slug}`);
  const isDashActive = pathname.startsWith("/dashboard") || pathname.startsWith("/properties") || pathname.startsWith("/agent") || pathname.startsWith("/manager");

  const singleDashHref =
    isAdmin ? null
    : role === "agent" ? "/agent"
    : role === "land_manager" ? "/manager"
    : null;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-brand-navy text-white shadow-lg shadow-brand-navy/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <LogoLateral variant="light" height={56} />
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            <NavLink href="/" active={isActive("/")}>Home</NavLink>

            {/* Sites dropdown */}
            <div className="relative" onMouseLeave={() => setSitesOpen(false)}>
              <button
                onMouseEnter={() => setSitesOpen(true)}
                className={cn(
                  "flex items-center gap-1 px-4 py-2 rounded-md text-sm font-medium transition-colors hover:bg-white/10",
                  isSiteActive && "bg-white/15 text-brand-teal"
                )}
              >
                Our Sites <ChevronDown className="w-4 h-4" />
              </button>
              {sitesOpen && (
                <div className="absolute top-full left-0 mt-1 w-64 bg-white rounded-lg shadow-xl overflow-hidden border border-slate-200">
                  {SITES.map((site) => (
                    <Link
                      key={site.slug}
                      href={`/sites/${site.slug}`}
                      onClick={() => setSitesOpen(false)}
                      className={cn(
                        "flex items-start gap-3 px-4 py-3 hover:bg-slate-50 transition-colors border-b border-slate-100 last:border-0",
                        pathname === `/sites/${site.slug}` && "bg-brand-teal/10"
                      )}
                    >
                      <MapPin className="w-4 h-4 text-brand-navy mt-0.5 shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{site.name}</p>
                        <p className="text-xs text-gray-500">{site.location}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <NavLink href="/marketplace" active={isActive("/marketplace")}>Marketplace</NavLink>
            <NavLink href="/contact" active={isActive("/contact")}>Contact</NavLink>

            {/* Dashboard — visible when signed in */}
            <SignedIn>
              {isAdmin ? (
                <div className="relative" onMouseLeave={() => setDashOpen(false)}>
                  <button
                    onMouseEnter={() => setDashOpen(true)}
                    className={cn(
                      "flex items-center gap-1 px-4 py-2 rounded-md text-sm font-medium transition-colors hover:bg-white/10",
                      isDashActive && "bg-white/15 text-brand-teal"
                    )}
                  >
                    Dashboard <ChevronDown className="w-4 h-4" />
                  </button>
                  {dashOpen && (
                    <div className="absolute top-full left-0 mt-1 w-56 bg-white rounded-lg shadow-xl overflow-hidden border border-slate-200">
                      <Link
                        href="/dashboard"
                        onClick={() => setDashOpen(false)}
                        className={cn(
                          "flex items-start gap-3 px-4 py-3 hover:bg-slate-50 transition-colors border-b border-slate-100",
                          pathname.startsWith("/dashboard") && "bg-brand-teal/10"
                        )}
                      >
                        <LayoutDashboard className="w-4 h-4 text-brand-navy mt-0.5 shrink-0" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">Land Dashboard</p>
                          <p className="text-xs text-gray-500">Sites, plots & users</p>
                        </div>
                      </Link>
                      <Link
                        href="/properties"
                        onClick={() => setDashOpen(false)}
                        className={cn(
                          "flex items-start gap-3 px-4 py-3 hover:bg-slate-50 transition-colors",
                          pathname.startsWith("/properties") && "bg-brand-teal/10"
                        )}
                      >
                        <Building2 className="w-4 h-4 text-brand-navy mt-0.5 shrink-0" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">Properties Dashboard</p>
                          <p className="text-xs text-gray-500">Marketplace listings</p>
                        </div>
                      </Link>
                    </div>
                  )}
                </div>
              ) : singleDashHref ? (
                <NavLink href={singleDashHref} active={isDashActive}>Dashboard</NavLink>
              ) : null}
            </SignedIn>
          </nav>

          {/* Right: auth */}
          <div className="hidden md:flex items-center gap-3">
            <SignedIn>
              <UserButton afterSignOutUrl="/" />
            </SignedIn>
            <SignedOut>
              <Link
                href="/sign-in"
                className="text-sm font-medium px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/sign-up"
                className="text-sm font-medium px-4 py-2 rounded-lg bg-brand-teal hover:bg-brand-teal/90 text-brand-navy transition-colors"
              >
                Get Started
              </Link>
            </SignedOut>
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 rounded-md hover:bg-white/10"
            onClick={() => setMobileOpen((o) => !o)}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-brand-navy border-t border-white/10 px-4 pb-4 space-y-1">
          <MobileNavLink href="/" onClick={() => setMobileOpen(false)}>Home</MobileNavLink>
          <div className="pt-1 pb-1">
            <p className="text-xs uppercase tracking-wider text-white/40 px-3 py-1">Our Sites</p>
            {SITES.map((site) => (
              <MobileNavLink key={site.slug} href={`/sites/${site.slug}`} onClick={() => setMobileOpen(false)}>
                {site.name}
              </MobileNavLink>
            ))}
          </div>
          <MobileNavLink href="/marketplace" onClick={() => setMobileOpen(false)}>Marketplace</MobileNavLink>
          <MobileNavLink href="/contact" onClick={() => setMobileOpen(false)}>Contact</MobileNavLink>

          {/* Dashboard in mobile */}
          <SignedIn>
            {isAdmin ? (
              <div className="pt-1 pb-1">
                <p className="text-xs uppercase tracking-wider text-white/40 px-3 py-1">Dashboard</p>
                <MobileNavLink href="/dashboard" onClick={() => setMobileOpen(false)}>
                  Land Dashboard
                </MobileNavLink>
                <MobileNavLink href="/properties" onClick={() => setMobileOpen(false)}>
                  Properties Dashboard
                </MobileNavLink>
              </div>
            ) : singleDashHref ? (
              <MobileNavLink href={singleDashHref} onClick={() => setMobileOpen(false)}>
                Dashboard
              </MobileNavLink>
            ) : null}
          </SignedIn>

          <div className="pt-2 flex gap-2">
            <SignedIn>
              <UserButton afterSignOutUrl="/" />
            </SignedIn>
            <SignedOut>
              <Link
                href="/sign-in"
                onClick={() => setMobileOpen(false)}
                className="flex-1 text-center text-sm font-medium px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/sign-up"
                onClick={() => setMobileOpen(false)}
                className="flex-1 text-center text-sm font-medium px-4 py-2 rounded-lg bg-brand-teal hover:bg-brand-teal/90 text-brand-navy transition-colors"
              >
                Get Started
              </Link>
            </SignedOut>
          </div>
        </div>
      )}
    </header>
  );
}

function NavLink({ href, active, children }) {
  return (
    <Link
      href={href}
      className={cn(
        "px-4 py-2 rounded-md text-sm font-medium transition-colors hover:bg-white/10",
        active && "bg-white/15 text-brand-teal"
      )}
    >
      {children}
    </Link>
  );
}

function MobileNavLink({ href, onClick, children }) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="block px-3 py-2 rounded-md text-sm font-medium text-white/80 hover:text-white hover:bg-white/10 transition-colors"
    >
      {children}
    </Link>
  );
}
