"use client";
import React from "react";
import Link from "next/link";
import Image from "next/image";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ArrowRight,
  DraftingCompass,
  Home,
  LandPlot,
  LayoutDashboard,
  User,
  Users,
  Users2,
} from "lucide-react";
import { usePathname, useSearchParams } from "next/navigation";
import { UserButton, useUser } from "@clerk/nextjs";

const Sidebar = () => {
  const { user } = useUser();
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
      title: "Legon Hills",
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
  ];

  return (
    <div className="fixed top-0 border-r bg-white">
      <div className="h-screen flex flex-col justify-between p-4 w-full ">
        <div>
          <div className="border-b pb-3">
            <h2 className="text-primary text-xl font-semibold">Get One Plot</h2>
          </div>

          <nav className="pt-2">
            <ul className="flex flex-col gap-1">
              {menuLinks.map((link) => (
                <li
                  key={link.id}
                  className={`p-1 hover:bg-gray-100 rounded-sm text-sm ${
                    path === link.href && "bg-gray-100"
                  }`}
                >
                  <Link
                    href={link.href}
                    className={`relative flex items-center ${
                      path === link.href ||
                      (search?.includes(link?.query) && "font-semibold")
                    }`}
                  >
                    {link.icon}
                    {path === link.href && (
                      <span className="absolute w-[3px] h-4 bg-primary left-0 top-[4px]"></span>
                    )}
                    <span className="ml-2">{link.title}</span>
                  </Link>
                </li>
              ))}

              <li
                className={`p-1 hover:bg-gray-100 rounded-sm text-sm mt-5 ${
                  path === "/dashboard/users" && "bg-gray-100"
                }`}
              >
                <Link
                  href={"/dashboard/users"}
                  className="flex gap-2 items-center"
                >
                  <Users2 className="w-4 h-4" /> <span>Users</span>
                </Link>
              </li>
              <hr className="my-2" />
              <li
                className={`p-1 hover:bg-gray-100 rounded-sm text-sm mt-5 ${
                  path === "/dashboard/trabuom-interested-clients" && "bg-gray-100"
                }`}
              >
                <Link
                  href={"/dashboard/trabuom-interested-clients"}
                  className="flex gap-2 items-center"
                >
                  Trabuom Interested clients
                </Link>
              </li>
              <li
                className={`p-1 hover:bg-gray-100 rounded-sm text-sm mt-1 ${
                  path === "/dashboard/kwadaso-interested-clients" && "bg-gray-100"
                }`}
              >
                <Link
                  href={"/dashboard/kwadaso-interested-clients"}
                  className="flex gap-2 items-center"
                >
                  Kwadaso Interested clients
                </Link>
              </li>
              <li
                className={`p-1 hover:bg-gray-100 rounded-sm text-sm mt-1 ${
                  path === "/dashboard/legon-hills-interested-clients" && "bg-gray-100"
                }`}
              >
                <Link
                  href={"/dashboard/legon-hills-interested-clients"}
                  className="flex gap-2 items-center"
                >
                  Legon Hills Interested clients
                </Link>
              </li>
            </ul>
          </nav>
        </div>

        <div className="flex flex-col gap-2 hover:bg-gray-100 p-2 rounded-md w-full">
          <div className="flex items-center gap-2">
            <UserButton />
            <p className="text-left">{user?.fullName}</p>
          </div>
          <p className=" text-xs">{user?.emailAddresses[0]?.emailAddress}</p>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
