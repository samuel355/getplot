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
import { usePathname } from "next/navigation";

const Sidebar = () => {
  const path = usePathname();

  const menuLinks = [
    {
      id: 1,
      href: "/dashboard",
      title: "Dashboard",
      icon: <LayoutDashboard className="w-4 h-4 ml-2" />,
    },
    {
      id: 2,
      href: "/dashboard/lands",
      title: "Lands",
      icon: <LandPlot className="w-4 h-4 ml-2" />,
    },
    {
      id: 3,
      href: "/dashboard/houses",
      title: "Houses",
      icon: <Home className="w-4 h-4 ml-2" />,
    },
    {
      id: 4,
      href: "/dashboard/users",
      title: "Users",
      icon: <Users className="w-4 h-4 ml-2" />,
    },
  ];
  const sites = [
    {
      id: 1,
      href: "/dashboard/nthc",
      title: "NTHC",
      icon: <DraftingCompass className="w-4 h-4 ml-2" />,
    },
    {
      id: 2,
      href: "/dashboard/dar-es-salaam",
      title: "Dar Es Salaam",
      icon: <DraftingCompass className="w-4 h-4 ml-2" />,
    },
    {
      id: 3,
      href: "/dashboard/trabuom",
      title: "Trabuom",
      icon: <DraftingCompass className="w-4 h-4 ml-2" />,
    },
  ];

  return (
    <div className="fixed top-0">
      <div className="h-screen flex flex-col justify-between p-4 w-full bg-primary/10">
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
                      path === link.href && "font-semibold"
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
              <div className="py-6">
                <h1 className="text-primary text-muted text-sm">Land Sites</h1>
              </div>
              {sites.map((site) => (
                <li key={site.id} className="p-1 hover:bg-gray-100 rounded-sm">
                  <Link
                    href={site.href}
                    className={`relative flex items-center ${
                      path === site.href && "font-semibold"
                    }`}
                  >
                    {site.icon}
                    {path === site.href && (
                      <span className="absolute w-[3px] h-4 bg-primary left-0 top-[4px]"></span>
                    )}
                    <span className="ml-2">{site.title}</span>
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
