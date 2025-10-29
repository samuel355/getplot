"use client";

import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import {
  Building,
  Menu,
  ShoppingCart,
  ChevronDown,
  Map,
  Layout,
  UserCircle,
  Bell,
  Search,
  LogOut,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import React, { useState } from "react";
import ListItem from "./ListItem";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useUser, UserButton } from "@clerk/nextjs";
import { Button, buttonVariants } from "@/components/ui/button";
import { useCart } from "@/store/useStore";
import CartContent from "./CartContent";
import { cn } from "@/lib/utils";

const Header = () => {
  const path = usePathname();
  const router = useRouter();
  const { user, isSignedIn } = useUser();
  const [cartOpen, setCartOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const { plots } = useCart();

  // Check if current path is in a dashboard section
  const isInDashboard =
    path.includes("/dashboard") || path.includes("/properties");
  const isPropertiesDashboard = path.includes("/properties");
  const isLandDashboard =
    path.includes("/dashboard") && !path.includes("/properties");

  // If we're in a dashboard, show the dashboard header instead
  if (isInDashboard) {
    return (
      <header className="fixed top-0 w-full bg-white shadow-sm z-40">
        <div className="flex items-center justify-between h-16 px-4 md:px-6">
          {/* Left section: Logo and dashboard name */}
          <div className="flex items-center space-x-4">
            <Link href="/" className="flex items-center">
              <Image
                src="/logo-lateral.svg"
                className="object-cover hidden md:block"
                width={120}
                height={40}
                alt="logo"
              />
              <Image
                src="/logo-lateral.svg"
                className="object-cover md:hidden"
                width={90}
                height={30}
                alt="logo"
              />
            </Link>

            <div className="hidden md:flex items-center border-l border-gray-200 pl-4 ml-4 h-8">
              <span className="text-gray-500 text-sm">Dashboard</span>
            </div>
          </div>

          {/* Center section: Dashboard tabs */}
          <div className="hidden md:flex items-center">
            <nav className="flex space-x-1">
              <Link
                href="/dashboard"
                className={cn(
                  "relative px-3 py-2 rounded-md text-sm font-medium transition-colors",
                  isLandDashboard
                    ? "text-primary font-bold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-primary"
                    : "text-gray-700 hover:text-primary hover:bg-gray-50",
                )}
              >
                <div className="flex items-center space-x-1">
                  <Map className="h-4 w-4" />
                  <span>Land Sites</span>
                </div>
              </Link>

              <Link
                href="/properties"
                className={cn(
                  "relative px-3 py-2 rounded-md text-sm font-medium transition-colors",
                  isPropertiesDashboard
                    ? "text-primary font-bold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-primary"
                    : "text-gray-700 hover:text-primary hover:bg-gray-50",
                )}
              >
                <div className="flex items-center space-x-1">
                  <Building className="h-4 w-4" />
                  <span>Properties</span>
                </div>
              </Link>
            </nav>
          </div>

          {/* Right section: Search, notifications, and user */}
          <div className="flex items-center space-x-2 md:space-x-4">
            <div className="hidden md:flex relative rounded-md">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <input
                type="search"
                placeholder="Search..."
                className="w-full bg-gray-50 border border-gray-200 pl-8 pr-3 py-2 text-sm rounded-md focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
              />
            </div>

            <Button variant="ghost" size="icon" className="hidden md:flex">
              <Bell className="h-5 w-5" />
              <span className="sr-only">Notifications</span>
            </Button>

            {/* Mobile dashboard switcher */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild className="md:hidden">
                <Button variant="outline" size="sm" className="h-8 gap-1">
                  {isPropertiesDashboard ? (
                    <>
                      <Building className="h-4 w-4" />
                      <span className="sr-only md:not-sr-only">Properties</span>
                    </>
                  ) : (
                    <>
                      <Map className="h-4 w-4" />
                      <span className="sr-only md:not-sr-only">Land Sites</span>
                    </>
                  )}
                  <ChevronDown className="h-4 w-4 ml-1" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link href="/dashboard" className="flex items-center gap-2">
                    <Map className="h-4 w-4" />
                    <span>Land Sites Dashboard</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/properties" className="flex items-center gap-2">
                    <Building className="h-4 w-4" />
                    <span>Properties Dashboard</span>
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <Menu className="h-6 w-6" />
              <span className="sr-only">Open menu</span>
            </Button>

            {/* User dropdown */}
            <div className="hidden md:block">
              <UserButton />
            </div>
          </div>
        </div>

        {/* Mobile menu panel */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t">
            <div className="px-4 py-3 space-y-1">
              <div className="relative rounded-md mb-3">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <input
                  type="search"
                  placeholder="Search..."
                  className="w-full bg-gray-50 border border-gray-200 pl-8 pr-3 py-2 text-sm rounded-md focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                />
              </div>

              <div className="flex items-center justify-between py-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                    <UserCircle className="h-6 w-6 text-gray-600" />
                  </div>
                  <div className="text-sm font-medium">
                    {user?.fullName || user?.username || "User"}
                  </div>
                </div>
                <Button variant="ghost" size="sm" className="h-8">
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign out
                </Button>
              </div>

              <Link
                href="/dashboard"
                className={cn(
                  "flex items-center gap-2 px-3 py-2.5 rounded-md text-sm font-medium transition-colors",
                  isLandDashboard
                    ? "bg-primary/10 text-primary font-bold"
                    : "text-gray-700 hover:bg-gray-50",
                )}
                onClick={() => setMobileMenuOpen(false)}
              >
                <Map className="h-4 w-4" />
                <span>Land Sites Dashboard</span>
              </Link>

              <Link
                href="/properties"
                className={cn(
                  "flex items-center gap-2 px-3 py-2.5 rounded-md text-sm font-medium transition-colors",
                  isPropertiesDashboard
                    ? "bg-primary/10 text-primary font-bold"
                    : "text-gray-700 hover:bg-gray-50",
                )}
                onClick={() => setMobileMenuOpen(false)}
              >
                <Building className="h-4 w-4" />
                <span>Properties Dashboard</span>
              </Link>

              <Link
                href="/properties/list"
                className={cn(
                  "flex items-center gap-2 px-3 py-2.5 pl-8 rounded-md text-sm transition-colors",
                  path === "/properties/list"
                    ? "text-primary font-medium"
                    : "text-gray-600 hover:bg-gray-50",
                )}
                onClick={() => setMobileMenuOpen(false)}
              >
                <span>My Properties</span>
              </Link>

              <Link
                href="/dashboard/plots"
                className={cn(
                  "flex items-center gap-2 px-3 py-2.5 pl-8 rounded-md text-sm transition-colors",
                  path === "/dashboard/plots"
                    ? "text-primary font-medium"
                    : "text-gray-600 hover:bg-gray-50",
                )}
                onClick={() => setMobileMenuOpen(false)}
              >
                <span>My Plots</span>
              </Link>

              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start h-10 px-3 text-gray-700"
              >
                <Bell className="h-4 w-4 mr-2" />
                Notifications
              </Button>

              <Link
                href="/"
                className="flex items-center gap-2 px-3 py-2.5 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                onClick={() => setMobileMenuOpen(false)}
              >
                <span>Back to Main Site</span>
              </Link>
            </div>
          </div>
        )}
      </header>
    );
  }

  // Regular website header (non-dashboard)
  return (
    <header className="fixed top-0 w-full bg-white shadow-sm z-20">
      {/* Flex container to handle layout */}
      <div className="flex items-center px-4 py-2 md:px-10 lg:px-14 justify-between">
        {/* Logo section */}
        <div className="">
          <Link href={"/"}>
            <Image
              src={"/logo-lateral.svg"}
              className="object-cover"
              width={140}
              height={140}
              alt="logo"
            />
          </Link>
        </div>

        <div className="flex items-center">
          {/* Navigation Menu section */}
          <nav className="hidden lg:flex space-x-5">
            <NavigationMenu>
              <NavigationMenuList className="flex items-center space-x-3">
                <NavigationMenuItem>
                  <Link
                    href="/"
                    className={cn(
                      "group inline-flex h-9 w-max items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors hover:text-primary",
                      path === "/" ? "text-primary font-bold" : "text-gray-700",
                    )}
                  >
                    Home
                  </Link>
                </NavigationMenuItem>

                <NavigationMenuItem>
                  <NavigationMenuTrigger
                    className={cn(
                      "group inline-flex h-9 w-max items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors hover:text-primary",
                      path === "/nthc" ||
                        path === "/dar-es-salaam" ||
                        path === "/trabuom" ||
                        path === "/legon-hills" ||
                        path === "/yabi" ||
                        path === "/berekuso" ||
                        path === "/royal-court-estate" ||
                        path === "/asokore-mampong"
                        ? "text-primary font-bold"
                        : "text-gray-700",
                    )}
                  >
                    Our Sites
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid w-[400px] gap-2 p-4  md:grid-cols-2">
                      <ListItem
                        href="/royal-court-estate"
                        title="Saadi Gated Community"
                        isActive={path === "/royal-court-estate"}
                      >
                        Royal Court Estate
                      </ListItem>
                      <ListItem
                        href="/nthc"
                        title="NTHC"
                        isActive={path === "/nthc"}
                      >
                        NTHC (Kwadaso)
                      </ListItem>
                      <ListItem
                        href="/dar-es-salaam"
                        title="Dar Es Salaam"
                        isActive={path === "/dar-es-salaam"}
                      >
                        Dar Es Salaam (Ejisu)
                      </ListItem>
                      <ListItem
                        href="/trabuom"
                        title="Trabuom"
                        isActive={path === "/trabuom"}
                      >
                        Trabuom
                      </ListItem>
                      <ListItem
                        href="/legon-hills"
                        title="Lego n Hills"
                        isActive={path === "/legon-hills"}
                      >
                        East Legon Hills
                      </ListItem>
                      <ListItem
                        href="/yabi"
                        title="Yabi"
                        isActive={path === "/yabi"}
                      >
                        Yabi
                      </ListItem>
                      <ListItem
                        href="/berekuso"
                        title="Berekuso"
                        isActive={path === "/berekuso"}
                      >
                        Berekuso
                      </ListItem>
                      <ListItem
                        href="/asokore-mampong"
                        title="Asokore Mampong"
                        isActive={path === "/asokore-mampong"}
                      >
                        Asokore Mampong
                      </ListItem>
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>

                <NavigationMenuItem>
                  <Link
                    href="/market-place"
                    className={cn(
                      "group inline-flex h-9 w-max items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors hover:text-primary",
                      path === "/market-place"
                        ? "text-primary font-bold"
                        : "text-gray-700",
                    )}
                  >
                    Market Place
                  </Link>
                </NavigationMenuItem>

                <NavigationMenuItem>
                  <Link
                    href="/contact-us"
                    className={cn(
                      "group inline-flex h-9 w-max items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors hover:text-primary",
                      path === "/contact-us"
                        ? "text-primary font-bold"
                        : "text-gray-700",
                    )}
                  >
                    Contact Us
                  </Link>
                </NavigationMenuItem>

                {isSignedIn &&
                  (user?.publicMetadata?.role === "sysadmin" ||
                    user?.publicMetadata?.role === "admin") && (
                    <NavigationMenuItem>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button
                            className={cn(
                              "group inline-flex h-9 w-max items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors hover:text-primary gap-1",
                              path.includes("/dashboard") ||
                                path.includes("/properties")
                                ? "text-primary font-bold"
                                : "text-gray-700",
                            )}
                          >
                            Dashboard
                            <ChevronDown className="h-4 w-4" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem asChild>
                            <Link
                              href="/dashboard"
                              className="flex items-center gap-2"
                            >
                              <Map className="h-4 w-4" />
                              <span>Land Sites Dashboard</span>
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link
                              href="/properties"
                              className="flex items-center gap-2"
                            >
                              <Building className="h-4 w-4" />
                              <span>Properties Dashboard</span>
                            </Link>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </NavigationMenuItem>
                  )}
              </NavigationMenuList>
            </NavigationMenu>
          </nav>

          {/* Mobile */}
          <div className="block lg:hidden xl:hidden">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[250px]">
                <DropdownMenuGroup>
                  <DropdownMenuItem asChild>
                    <Link
                      href="/"
                      className={cn(
                        "w-full flex items-center",
                        path === "/" && "text-primary font-semibold",
                      )}
                    >
                      Home
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />
                  <p className="ml-2 text-xs text-gray-500 py-1">Our Sites</p>
                  <DropdownMenuItem asChild>
                    <Link
                      href="/royal-court-estate"
                      className={cn(
                        "w-full pl-4 py-1.5",
                        path === "/royal-court-estate" && "text-primary font-semibold",
                      )}
                    >
                      Royal Court Estate
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link
                      href="/nthc"
                      className={cn(
                        "w-full pl-4 py-1.5",
                        path === "/nthc" && "text-primary font-semibold",
                      )}
                    >
                      NTHC (Kwadaso)
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link
                      href="/dar-es-salaam"
                      className={cn(
                        "w-full pl-4 py-1.5",
                        path === "/dar-es-salaam" &&
                          "text-primary font-semibold",
                      )}
                    >
                      Dar Es Salaam (Ejisu)
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link
                      href="/trabuom"
                      className={cn(
                        "w-full pl-4 py-1.5",
                        path === "/trabuom" && "text-primary font-semibold",
                      )}
                    >
                      Trabuom
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link
                      href="/legon-hills"
                      className={cn(
                        "w-full pl-4 py-1.5",
                        path === "/legon-hills" && "text-primary font-semibold",
                      )}
                    >
                      East Legon Hills
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link
                      href="/yabi"
                      className={cn(
                        "w-full pl-4 py-1.5",
                        path === "/yabi" && "text-primary font-semibold",
                      )}
                    >
                      Yabi
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link
                      href="/berekuso"
                      className={cn(
                        "w-full pl-4 py-1.5",
                        path === "/berekuso" && "text-primary font-semibold",
                      )}
                    >
                      Berekuso
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link
                      href="/asokore-mampong"
                      className={cn(
                        "w-full pl-4 py-1.5",
                        path === "/asokore-mampong" && "text-primary font-semibold",
                      )}
                    >
                      Asokore Mampong
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />

                  <DropdownMenuItem asChild>
                    <Link
                      href="/market-place"
                      className={cn(
                        "w-full flex items-center",
                        path === "/market-place" &&
                          "text-primary font-semibold",
                      )}
                    >
                      Market Place
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuItem asChild>
                    <Link
                      href="/contact-us"
                      className={cn(
                        "w-full flex items-center",
                        path === "/contact-us" && "text-primary font-semibold",
                      )}
                    >
                      Contact Us
                    </Link>
                  </DropdownMenuItem>

                  {isSignedIn &&
                    (user?.publicMetadata?.role === "sysadmin" ||
                      user?.publicMetadata?.role === "admin") && (
                      <>
                        <DropdownMenuSeparator />
                        <p className="ml-2 text-xs text-gray-500 py-1">
                          Dashboards
                        </p>
                        <DropdownMenuItem asChild>
                          <Link
                            href="/dashboard"
                            className={cn(
                              "w-full pl-4 py-1.5 flex items-center gap-2",
                              path.includes("/dashboard") &&
                                !path.includes("/properties") &&
                                "text-primary font-semibold",
                            )}
                          >
                            <Map className="h-4 w-4" />
                            Land Sites Dashboard
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link
                            href="/properties"
                            className={cn(
                              "w-full pl-4 py-1.5 flex items-center gap-2",
                              path.includes("/properties") &&
                                "text-primary font-semibold",
                            )}
                          >
                            <Building className="h-4 w-4" />
                            Properties Dashboard
                          </Link>
                        </DropdownMenuItem>
                      </>
                    )}
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Shopping cart icon */}
          {plots.length > 0 && (
            <div className="ml-4">
              <div className="relative">
                <button
                  onClick={() => setCartOpen(!cartOpen)}
                  className="p-2 text-gray-800 bg-gray-200 rounded-full"
                >
                  <ShoppingCart size={16} />
                </button>
                <span className="absolute top-0 right-0 inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full transform translate-x-1/2 -translate-y-1/2">
                  {plots.length > 0 ? plots.length : ""}
                </span>

                <CartContent open={cartOpen} setOpen={setCartOpen} />
              </div>
            </div>
          )}

          {/* User button - show if signed in */}

          {isSignedIn && (
            <div className="ml-4">
              <UserButton />
            </div>
          )}

          {/* Sign in button - show if not signed in */}
          {/* {!isSignedIn && (
            <div className="ml-4">
              <Button asChild size="sm">
                <Link href="/sign-in">Sign In</Link>
              </Button>
            </div>
          )} */}
        </div>
      </div>
    </header>
  );
};

export default Header;
