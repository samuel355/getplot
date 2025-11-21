"use client";

import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AuthCheck({
  children,
  allowedRoles = ["admin", "sysadmin", "chief"],
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
      if (!userRole || !allowedRoles.includes(userRole)) {
        router.push("/unauthorized");
        return;
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
