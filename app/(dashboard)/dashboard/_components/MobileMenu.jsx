"use client";
import React from "react";
import Link from "next/link";
import {
  DraftingCompass,
  LandPlot,
  LayoutDashboard,
  Menu,
  Users2,
  X,
} from "lucide-react";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";

const MobileMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
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
      href: "/dashboard/trabuom",
      title: "Trabuom",
      icon: <LandPlot className="w-4 h-4 ml-2" />,
    },
    {
      id: 3,
      href: "/dashboard/nthc",
      title: "NTHC Kwadaso",
      icon: <LandPlot className="w-4 h-4 ml-2" />,
    },
    {
      id: 4,
      href: "/dashboard/legon-hills",
      title: "East Legon Hills",
      icon: <LandPlot className="w-4 h-4 ml-2" />,
    },
    {
      id: 5,
      href: "/dashboard/dar-es-salaam",
      title: "Dar Es Salaam",
      icon: <LandPlot className="w-4 h-4 ml-2" />,
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
    <div className="lg:hidden md:hidden flex items-center justify-between py-3 px-5 mobile-menu">
      <Menu
        className="w-5 h-5 text-gray-400 hover:text-gray-700"
        onClick={() => setIsOpen(true)}
      />

      <div className="pt-2">
        <UserButton />
      </div>

      {isOpen && (
        <div
          className={`absolute z-10 w-full h-screen overflow-hidden left-0 top-0 bg-black/20 transition-opacity duration-500 ease-in-out ${
            isOpen
              ? "opacity-100 translate-x-0 duration-200"
              : "opacity-0 -translate-x-4 duration-200"
          }`}
          onClick={() => setIsOpen(false)}
        >
          <div
            className={`md:w-[55%] w-[65%] p-4 h-[95vh] rounded-md bg-white m-2 z-20 transition-all duration-500 ease-in-out ${
              isOpen
                ? "opacity-100 translate-x-0 duration-200"
                : "opacity-0 -translate-x-4 duration-200"
            }`}
          >
            <X
              className="w-5 h-5 text-gray-400 cursor-pointer hover:text-gray-700"
              onClick={() => setIsOpen(false)}
            />

            {/* Add your content here */}
            <div className="flex flex-col h-full justify-between">
              <div>
                <div className="border-b pb-3 pt-3">
                  <h2 className="text-primary text-xl font-semibold text-center">
                    Get One Plot
                  </h2>
                </div>

                <div className="py-6">
                  <h1 className="text-primary text-muted text-sm">
                    Land Sites
                  </h1>
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

                    <li
                      className={`p-1 hover:bg-gray-100 rounded-sm text-sm mt-5 ${
                        path === "/dashboard/users" && "bg-gray-100"
                      }`}
                    >
                      <Link
                        href={"/dashboard/users"}
                        className="flex gap-2 items-center"
                      >
                        {" "}
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
                        East Legon Hills Interested clients
                      </Link>
                    </li>
                    <li
                      className={`p-1 hover:bg-gray-100 rounded-sm text-sm mt-1 ${
                        path === "/dashboard/adense-interested-clients" && "bg-gray-100"
                      }`}
                    >
                      <Link
                        href={"/dashboard/adense-interested-clients"}
                        className="flex gap-2 items-center"
                      >
                        Adense Interested clients
                      </Link>
                    </li>
                  </ul>
                </nav>
              </div>
              <footer className="">
                <p className="text-gray-500 text-center text-sm mb-3 font-light">
                  All Rights Reserved @2024
                </p>
              </footer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MobileMenu;
