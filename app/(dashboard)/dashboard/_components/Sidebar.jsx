"use client";
import React from "react";
import Link from "next/link";
import { Globe, LandPlot, LayoutDashboard, Users2, LogOut, X } from "lucide-react";
import { usePathname, useSearchParams } from "next/navigation";
import { UserButton, useUser, useClerk } from "@clerk/nextjs";

const Sidebar = () => {
  const { user } = useUser();
  const { signOut } = useClerk();
  const path = usePathname();
  const searchParams = useSearchParams();
  const search = searchParams.get("table");

  const menuLinks = [
    {
      id: 1,
      href: "/dashboard",
      title: "Dashboard",
      query: "dashboard",
      icon: <LayoutDashboard className="w-4 h-4 ml-2" />,
    },
    {
      id: 2,
      href: "/dashboard/trabuom",
      title: "Trabuom",
      query: "trabuom",
      icon: <LandPlot className="w-4 h-4 ml-2" />,
    },
    {
      id: 3,
      href: "/dashboard/nthc",
      title: "NTHC Kwadaso",
      query: "nthc",
      icon: <LandPlot className="w-4 h-4 ml-2" />,
    },
    {
      id: 4,
      href: "/dashboard/legon-hills",
      title: "East Legon Hills",
      query: "legon-hills",
      icon: <LandPlot className="w-4 h-4 ml-2" />,
    },
    {
      id: 5,
      href: "/dashboard/dar-es-salaam",
      title: "Dar Es Salaam",
      query: "dar-es-salaam",
      icon: <LandPlot className="w-4 h-4 ml-2" />,
    },
    {
      id: 6,
      href: "/dashboard/yabi",
      title: "Yabi",
      query: "yabi",
      icon: <LandPlot className="w-4 h-4 ml-2" />,
    },
    {
      id: 7,
      href: "/dashboard/berekuso",
      title: "Berekuso",
      query: "berekuso",
      icon: <LandPlot className="w-4 h-4 ml-2" />,
    },
  ];

  const Button = ({ children, onClick, className }) => (
    <button onClick={onClick} className={className}>
      {children}
    </button>
  );

  const sidebarContent = (
    <div className="flex flex-col h-screen">
      <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6 shrink-0">
        <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
          <LayoutDashboard className="h-6 w-6" />
          <span>SITES DASHBOARD</span>
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto">
        <nav className="grid items-start px-2 lg:px-4 gap-1 py-2">
          <div className="my-4">
            <Link
              href={"/"}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all ${
                path === "/"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <Globe className="h-4 w-4" /> <span>Website</span>
            </Link>
            <Link
              href={"/properties/all-properties"}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all ${
                path === "/properties/all-properties"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <LayoutDashboard className="h-4 w-4" />{" "}
              <span>Properties Dashboard</span>
            </Link>
          </div>

          <hr className="my-2" />

          <div className="my-4">
            {menuLinks.map((link) => {
              const isActive = path === link.href || search?.includes(link?.query);
              return (
                <Link
                  key={link.id}
                  href={link.href}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all ${
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  {link.icon}
                  {link.title}
                </Link>
              );
            })}
          </div>

          <hr className="my-2" />

          <div className="my-4">
            <Link
              href={"/dashboard/users"}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all ${
                path === "/dashboard/users"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <Users2 className="h-4 w-4" /> <span>Users</span>
            </Link>
            <h2 className="mb-2 mt-4 px-1 text-xs font-semibold tracking-tight text-muted-foreground">
              Interested Clients
            </h2>
            <Link
              href={"/dashboard/trabuom-interested-clients"}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all ${
                path === "/dashboard/trabuom-interested-clients"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              Trabuom Interested clients
            </Link>
            <Link
              href={"/dashboard/kwadaso-interested-clients"}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all ${
                path === "/dashboard/kwadaso-interested-clients"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              Kwadaso Interested clients
            </Link>
            <Link
              href={"/dashboard/legon-hills-interested-clients"}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all ${
                path === "/dashboard/legon-hills-interested-clients"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              Legon Hills Interested clients
            </Link>
            <Link
              href={"/dashboard/adense-interested-clients"}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all ${
                path === "/dashboard/adense-interested-clients"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              Adense Interested clients
            </Link>
            <Link
              href={"/dashboard/yabi-interested-clients"}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all ${
                path === "/dashboard/yabi-interested-clients"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              Yabi Interested clients
            </Link>
            <Link
              href={"/dashboard/berekuso-interested-clients"}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all ${
                path === "/dashboard/berekuso-interested-clients"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              Berekuso Interested clients
            </Link>
          </div>
        </nav>
      </div>

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
              {user?.emailAddresses[0]?.emailAddress}
            </span>
          </div>
        </div>
        <Button
          className="mt-2 w-full justify-start flex gap-2 p-2 rounded-md hover:bg-gray-100"
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

      {/* Mobile sidebar overlay - will be implemented when useSidebar context is available */}
      {/* {isMobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="fixed inset-0 bg-black/50"
            onClick={() => setIsMobileOpen(false)}
          ></div>

          <div className="fixed inset-y-0 left-0 w-64 border-r bg-background">
            {sidebarContent}
          </div>
        </div>
      )} */}
    </>
  );
};

export default Sidebar;
