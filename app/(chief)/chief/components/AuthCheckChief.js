"use client";

import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AuthCheckChief({
  children,
  allowedRoles = ["admin", "sysadmin", "chief", "chief_asst"],
}) {
  const { userId, isLoaded, isSignedIn, user } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded) {
      if (!isSignedIn) {
        router.push("/sign-in");
        return;
      }

      if (!user) {
        router.push("/sign-in");
        return;
      }
      const userRole = user?.publicMetadata?.role;
      const area = user?.publicMetadata?.area;

      if (!userRole || !allowedRoles.includes(userRole)) {
        router.push("/unauthorized");
        return;
      }

      if((userRole === 'chief' || userRole === 'chief_asst') && !area){
        router.push("/unauthorized")
        return
      }
    }
  }, [isLoaded, isSignedIn, user, router, allowedRoles]);

  if (!isLoaded || !isSignedIn) {
    return null;
  }

  const userRole = user?.publicMetadata?.role;
  if (!userRole || !allowedRoles.includes(userRole)) {
    return null;
  }

  return children;
}
