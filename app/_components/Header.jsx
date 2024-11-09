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
import { usePathname, useRouter } from "next/navigation";
import React from "react";
import ListItem from "./ListItem";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Menu } from "lucide-react";
import { useUser } from "@clerk/nextjs";

const Header = () => {
  const path = usePathname();
  const router = useRouter();
  const { user, isSignedIn } = useUser();
  return (
    <header className="fixed top-0 w-full bg-white shadow-sm z-20 lg:mx-3">
      {/* Flex container to handle layout */}
      <div className="flex items-center px-10 py-2 justify-between">
        {/* Logo section */}
        <div className="">
          <Link href={"/"}>
            <Image src={'/logo-lateral.svg'} className="object-cover" width={140} height={140} alt="logo" />
          </Link>
        </div>

        {/* Navigation Menu section */}
        <nav className="hidden lg:flex space-x-5">
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
                  <ul className="grid gap- p-3 py-5 md:w-[200px] lg:w-[230px] xl:w-[240px] grid-cols-1">
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

              {isSignedIn && user?.publicMetadata?.role === "sysadmin" && (
                <NavigationMenuItem>
                  <ListItem href={"/dashboard"} title={"Dashboard"}>
                    Dashboard
                  </ListItem>
                </NavigationMenuItem>
              )}
              {isSignedIn && user?.publicMetadata?.role === "admin" && (
                <NavigationMenuItem>
                  <ListItem href={"/dashboard"} title={"Dashboard"}>
                    Dashboard
                  </ListItem>
                </NavigationMenuItem>
              )}
            </NavigationMenuList>
          </NavigationMenu>
        </nav>

        <div className="block lg:hidden xl:hidden">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Menu />
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuGroup>
                <DropdownMenuItem>
                  <button
                    className={`hover:text-primary text-base ${
                      path == "/" && "text-primary font-semibold"
                    }`}
                    onClick={() => router.replace("/")}
                  >
                    Home
                  </button>
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <DropdownMenuGroup className="w-[240px]">
                  <DropdownMenuSub>
                    <DropdownMenuSubTrigger>
                      <button className={`hover:text-primary text-base `}>
                        Our Sites
                      </button>
                    </DropdownMenuSubTrigger>
                    <DropdownMenuSubContent>
                      <ul className="grid gap-3 p-3 py-5 md:w-[240px] lg:w-[230px] xl:w-[240px] grid-cols-1">
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
                    </DropdownMenuSubContent>
                  </DropdownMenuSub>
                </DropdownMenuGroup>

                <DropdownMenuSeparator />

                <DropdownMenuItem>
                  <button
                    className={`hover:text-primary text-base ${
                      path == "/contact-us" && "text-primary font-semibold"
                    }`}
                    onClick={() => router.push("/contact-us")}
                  >
                    Contact Us
                  </button>
                </DropdownMenuItem>

                {isSignedIn && user?.publicMetadata?.role === "sysadmin" && (
                  <DropdownMenuItem>
                    <button
                      className={`hover:text-primary text-base ${
                        path == "/dashboard" && "text-primary font-semibold"
                      }`}
                      onClick={() => router.push("/dashboard")}
                    >
                      Dashboard
                    </button>
                  </DropdownMenuItem>
                )}
                {isSignedIn && user?.publicMetadata?.role === "admin" && (
                  <DropdownMenuItem>
                    <button
                      className={`hover:text-primary text-base ${
                        path == "/dashboard" && "text-primary font-semibold"
                      }`}
                      onClick={() => router.push("/dashboard")}
                    >
                      Dashboard
                    </button>
                  </DropdownMenuItem>
                )}
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default Header;
