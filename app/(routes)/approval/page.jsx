"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useEffect, useState, useCallback } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { RefreshCw, Loader2, Clock, CheckCircle } from "lucide-react";
import Link from "next/link";

// interface UserStatus {
//   isApproved: boolean;
//   departmentName?: string;
//   role?: string;
//   position?: string;
//   lastChecked: Date;
// }

export default function WaitForApprovalPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [userStatus, setUserStatus] = useState();
  const [checking, setChecking] = useState(false);
  const [lastChecked, setLastChecked] = useState();
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Ensure component is mounted before showing time to avoid hydration issues
  useEffect(() => {
    setMounted(true);
  }, []);

  const checkApprovalStatus = useCallback(async () => {
    if (!user) return;
    
    setChecking(true);
    try {
      const response = await fetch('/api/approval-status');
      
      if (!response.ok) {
        throw new Error('Failed to check approval status');
      }

      const statusData = await response.json();
      console.log('status Data', statusData)
      const status = {
        isApproved: statusData.isApproved,
        userArea: statusData.area,
        role: statusData.role,
        lastChecked: new Date(statusData.lastChecked)
      };

      setUserStatus(status);
      setLastChecked(new Date());

      if (statusData.isApproved && !isRedirecting) {
        console.log('User approved! Redirecting to dashboard...', statusData);
        setIsRedirecting(true);
        toast.success("You've been approved! Redirecting to dashboard...");
        // Use window.location.href for more reliable redirect
        setTimeout(() => {
          window.location.href = "/dashboard";
        }, 1500);
      } else if (!statusData.isApproved) {
        console.log('User not approved yet:', statusData);
      }
    } catch (error) {
      console.error('Error checking approval status:', error);
      toast.error("Failed to check approval status");
    } finally {
      setChecking(false);
    }
  }, [user, isRedirecting]);

  useEffect(() => {
    if (isLoaded && !user) {
      router.push("/sign-in");
      return;
    }

    if (isLoaded && user && !isRedirecting) {
      // Check approval status immediately - don't check Clerk metadata here
      // as it might not be updated yet, but the database might have the approval
      checkApprovalStatus();

      // Set up periodic checking every 30 seconds
      const interval = setInterval(() => {
        if (!isRedirecting) {
          checkApprovalStatus();
        }
      }, 30000);
      return () => clearInterval(interval);
    }
  }, [user, isLoaded, router, checkApprovalStatus, isRedirecting]);

  const handleManualCheck = () => {
    if (!isRedirecting) {
      checkApprovalStatus();
    }
  };

  const getStatusIcon = () => {
    if (checking) {
      return <Loader2 className="w-8 h-8 text-primary animate-spin" />;
    }
    if (userStatus?.isApproved) {
      return <CheckCircle className="w-8 h-8 text-green-500" />;
    }
    return <Clock className="w-8 h-8 text-primary animate-pulse" />;
  };

  const getStatusMessage = () => {
    if (checking) {
      return "Checking your approval status...";
    }
    if (userStatus?.isApproved) {
      return "Congratulations! You've been approved.";
    }
    return "Your account is awaiting approval by a system administrator";
  };

  const getStatusDescription = () => {
    if (userStatus?.role === 'chief' && userStatus.area === null) {
      return `You've been assigned to ${userStatus.departmentName} as ${userStatus.position || userStatus.role}. You'll be redirected to the dashboard shortly.`;
    }
    return "Please wait while a system administrator assign you to your Area. Once you've been assigned, you will gain access to the dashboard.";
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-background via-background to-background/95 p-4">
      <div className="w-full max-w-md animate-scale-in">
        <Card className="glass-card shadow-2xl border-0">
          <CardHeader className="text-center pb-6">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-primary/10 mb-6 mx-auto">
              {getStatusIcon()}
            </div>
            <CardTitle className="text-3xl font-bold mb-2">
              {userStatus?.isApproved ? "Approved!" : "Pending Approval"}
            </CardTitle>
            <CardDescription className="text-base">
              {getStatusMessage()}
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <div className="p-4 rounded-xl bg-muted/50 border border-border/50">
              <p className="text-muted-foreground leading-relaxed">
                {getStatusDescription()}
              </p>
            </div>

            {userStatus?.isApproved && (
              <div className="p-4 rounded-xl bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800">
                <div className="flex items-center gap-2 text-green-700 dark:text-green-300">
                  <CheckCircle className="w-5 h-5" />
                  <span className="font-medium">Approval Details</span>
                </div>
                <div className="mt-2 text-sm text-green-600 dark:text-green-400 space-y-1">
                  <p><strong>Area:</strong> {userStatus.area}</p>
                  <p><strong>Role:</strong> {userStatus.role}</p>
                </div>
              </div>
            )}

            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
              <span>
                {userStatus?.isApproved ? "Redirecting..." : "Waiting for approval..."}
              </span>
            </div>

            <div className="pt-4 border-t border-border/50">
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleManualCheck}
                  disabled={checking || isRedirecting}
                  className="h-8"
                >
                  {checking ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <RefreshCw className="w-3 h-3" />
                  )}
                  <span className="ml-1">Check Now</span>
                </Button>
              </div>
              
              <div className="text-xs text-muted-foreground">
                <p>Status updates automatically every 30 seconds</p>
                <p className="mt-1">
                  Need help? Contact your system administrator at{" "}
                  <span className="text-primary">landandhomesconsult@gmail.com</span>
                </p>
              </div>
              <Link href={'/'} className="mt-3 text-xl">Go Home</Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
