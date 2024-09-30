"use client";

import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";
import ListItem from "./ListItem";

const Header = () => {
  const path = usePathname();
  return (
    <header className="fixed top-0 w-full bg-white shadow-sm z-20">
      {/* Flex container to handle layout */}
      <div className="flex items-center px-8 py-2">
        {/* Logo section */}
        <div className="w-full">
          <Link href={"/"}>
            <Image
              src={"/logo.png"}
              width={125}
              height={125}
              alt="logo"
              className="w-auto h-auto object-cover"
            />
          </Link>
        </div>

        {/* Navigation Menu section */}
        <nav className="hidden lg:flex space-x-6 w-full">
          <NavigationMenu>
            <NavigationMenuList className="flex items-center space-x-4">
              <NavigationMenuItem>
                <ListItem href={"/"} title={"Home"}>
                  Home
                </ListItem>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <NavigationMenuTrigger
                  className={`flex border-0 items-center hover:text-primary text-base ${
                    (path === "/nthc" && "text-primary font-extrabold") ||
                    (path === "/dar-es-salaam" &&
                      "text-primary font-extrabold") ||
                    (path === "/trabuom" && "text-primary font-extrabold")
                  }`}
                >
                  Our Sites
                </NavigationMenuTrigger>
                <NavigationMenuContent className="">
                  <ul className="grid gap-3 p-3 py-5 md:w-[200px] lg:w-[230px] xl:w-[240px] grid-cols-1">
                    <ListItem href="/nthc" title="NTHC">
                      NTHC (Kwadaso)
                    </ListItem>
                    <ListItem href="/dar-es-salaam" title="Dar Es Salaam">
                      Dar Es Salaam (Ejisu)
                    </ListItem>
                    <ListItem href="/trabuom" title="Trabuom">
                      Trabuom
                    </ListItem>
                    <ListItem href="/legon-hills" title="Legon Hills">
                      Legon Hills
                    </ListItem>
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <ListItem href={"/contact-us"} title={"Contact Us"}>
                  Contact Us
                </ListItem>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </nav>
      </div>
    </header>
  );
};

export default Header;
