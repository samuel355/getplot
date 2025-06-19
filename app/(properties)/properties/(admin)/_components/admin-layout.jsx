"use client";

import { useToast } from "@/hooks/use-toast";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function AdminLayout({ children }) {
  const { user, isSignedIn, isLoaded } = useUser();
  const router = useRouter();
  const { toast } = useToast();
  const [authorized, setAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);

  // Check admin permission
  useEffect(() => {
    if (isLoaded) {
      if (!isSignedIn) {
        router.push("/sign-in");
        return;
      }

      const userRole = user?.publicMetadata?.role;
      if (userRole !== "admin" && userRole !== "sysadmin") {
        router.push("/properties");
        toast({
          title: "Access Denied",
          description: "You don't have permission to access the admin area",
          variant: "destructive",
        });
        return;
      }

      setAuthorized(true);
      setLoading(false);
    }
  }, [isLoaded, isSignedIn, user, router, toast]);

  if (loading) {
    return (
      <div className="flex h-full w-full items-center justify-center p-6">
        <div className="flex flex-col items-center gap-2">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!authorized) {
    return null; // Router will redirect, so no need to show anything
  }

  return <>{children}</>;
}
