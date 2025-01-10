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
import { ChevronDown, Menu, ShoppingCart } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { buttonVariants } from "@/components/ui/button";
import { useCart } from "@/store/useStore";

const Header = () => {
  const path = usePathname();
  const router = useRouter();
  const { user, isSignedIn } = useUser();

  const [cartOpen, setCartOpen] = useState(false);
  const { plots } = useCart();

  return (
    <header className="fixed top-0 w-full bg-white shadow-sm z-20">
      {/* Flex container to handle layout */}
      <div className="flex items-center px-10 py-2 justify-between md:px-14">
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
                <DropdownMenu>
                  <DropdownMenuTrigger>
                    <Link
                      href={"/"}
                      className={`${buttonVariants({
                        variant: "link",
                      })} hover:text-primary hover:bg-gray-50 py-1 px-2 rounded-md w-full`}
                    >
                      <span
                        className={`text-base ${
                          (path === "/nthc" && "text-primary font-extrabold") ||
                          (path === "/dar-es-salaam" &&
                            "text-primary font-extrabold") ||
                          (path === "/trabuom" &&
                            "text-primary font-extrabold") ||
                          (path === "/legon-hills" &&
                            "text-primary font-extrabold") ||
                          (path === "/yabi" && "text-primary font-extrabold")
                        }`}
                      >
                        Our Sites
                      </span>
                      <ChevronDown />
                    </Link>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem>
                      <ListItem href="/nthc" title="NTHC">
                        NTHC (Kwadaso)
                      </ListItem>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <ListItem href="/dar-es-salaam" title="Dar Es Salaam">
                        Dar Es Salaam (Ejisu)
                      </ListItem>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <ListItem href="/trabuom" title="Trabuom">
                        Trabuom
                      </ListItem>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <ListItem href="/legon-hills" title="Legon Hills">
                        East Legon Hills
                      </ListItem>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <ListItem href="/yabi" title="Yabi">
                        Yabi
                      </ListItem>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
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

              {plots.length > 0 && (
                <NavigationMenuItem>
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

                    {/* <CartContent open={cartOpen} setOpen={setCartOpen} /> */}
                  </div>
                </NavigationMenuItem>
              )}
            </NavigationMenuList>
          </NavigationMenu>
        </nav>

        {/* Mobile */}
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
                <p className="ml-2">Our Sites</p>

                <ul className="grid gap-3 p-5 py-3 md:w-[340px] lg:w-[330px] xl:w-[340px] grid-cols-1">
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
                    East Legon Hills
                  </ListItem>
                  <ListItem href="/yabi" title="Yabi">
                    Yabi
                  </ListItem>
                </ul>

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
