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
  Users,
} from "lucide-react";
import { usePathname, useSearchParams } from "next/navigation";

const Sidebar = () => {
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
                <li key={link.id} className="p-1 hover:bg-gray-100 rounded-sm">
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
            </ul>
          </nav>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-3 justify-between hover:bg-slate-200 p-1 rounded-sm">
            <div className="flex gap-1">
              <Image
                className="object-cover rounded-lg"
                src={"/avatars/avatar-1.png"}
                width={40}
                height={40}
                alt="avatar"
              />
              <div className="flex flex-col">
                <p className="text-left">Email</p>
                <span className="text-gray-400 text-sm">samuel@gmail.com</span>
              </div>
            </div>
            <ArrowRight />
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-[220px]">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Profile</DropdownMenuItem>
            <DropdownMenuItem>Billing</DropdownMenuItem>
            <DropdownMenuItem>Team</DropdownMenuItem>
            <DropdownMenuItem>Subscription</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};

export default Sidebar;
