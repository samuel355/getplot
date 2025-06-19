"use client";
import React, { useEffect, useState } from "react";
import Sidebar from "./dashboard/_components/Sidebar";
import MobileMenu from "./dashboard/_components/MobileMenu";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

const layout = ({ children }) => {
  const { user, isSignedIn, isLoaded } = useUser();
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isLoaded) {
      if (!isSignedIn) {
        router.push("/");
      } else if (
        user?.publicMetadata?.role !== "sysadmin" &&
        user?.publicMetadata?.role !== "admin"
      ) {
        router.push("/");
      } else {
        setLoading(false);
      }
    }
  }, [user, router, isLoaded, isSignedIn]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="w-full h-screen max-h-screen">
      <div className="flex flex-row gap-4 items-center">
        <div className="fixed sidebar top-0 w-[25%] overflow-hidden max-w-[25%] box-border hidden md:flex lg:flex xl:flex  z-20">
          <Sidebar />
        </div>

        <div className="md:w-[75%] md:mt-0 md:ml-[22%] md:mr-[1.5rem] md:mb-[1.5rem] main-content lg:w-full xl:w-full 2xl:ml-[14.5%] xl:ml-[20%] h-full bg-white  overflow-x-hidden">
          <div className="w-full">
            <MobileMenu />
            <div className="px-4 pt-2 md:pt-7 md:m-2 relative z-0">
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default layout;
