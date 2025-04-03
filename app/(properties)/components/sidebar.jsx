"use client";

import { useUser } from '@clerk/nextjs';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Building,
  Home,
  Users,
  Settings,
  BarChart4,
  PlusCircle,
  LogOut
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useClerk } from '@clerk/nextjs';

export default function Sidebar() {
  const { user, isSignedIn } = useUser();
  const { signOut } = useClerk();
  const pathname = usePathname();
  
  if (!isSignedIn) return null;
  
  const isAdmin = user?.publicMetadata?.role === 'admin' || user?.publicMetadata?.role === 'sysadmin';
  
  const navigation = [
    { name: 'Dashboard', href: '/properties', icon: LayoutDashboard },
    { name: 'My Properties', href: '/properties/list', icon: Home },
    { name: 'Add Property', href: '/properties/create', icon: PlusCircle },
  ];
  
  const adminNavigation = [
    { name: 'All Properties', href: '/properties/admin/properties', icon: Building },
    { name: 'Users', href: '/properties/admin/users', icon: Users },
    { name: 'Analytics', href: '/properties/admin/analytics', icon: BarChart4 },
    { name: 'Settings', href: '/properties/admin/settings', icon: Settings },
  ];
  
  return (
    <div className="hidden border-r bg-muted/40 md:block md:w-64">
      <div className="flex h-full max-h-screen flex-col gap-2">
        <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
          <Link href="/properties" className="flex items-center gap-2 font-semibold">
            <Building className="h-6 w-6" />
            <span>PropManager</span>
          </Link>
        </div>
        <div className="flex-1 overflow-auto py-2">
          <nav className="grid items-start px-2 lg:px-4 gap-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all ${
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <item.icon className="h-4 w-4" />
                  {item.name}
                </Link>
              );
            })}
            
            {isAdmin && (
              <>
                <div className="my-2 px-3">
                  <h2 className="mb-2 px-1 text-xs font-semibold tracking-tight text-muted-foreground">
                    Admin
                  </h2>
                  {adminNavigation.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all ${
                          isActive
                            ? "bg-primary text-primary-foreground"
                            : "text-muted-foreground hover:bg-muted hover:text-foreground"
                        }`}
                      >
                        <item.icon className="h-4 w-4" />
                        {item.name}
                      </Link>
                    );
                  })}
                </div>
              </>
            )}
          </nav>
        </div>
        <div className="mt-auto p-4 border-t">
          <div className="flex items-center gap-3 py-2">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted">
              <img 
                src={user?.imageUrl} 
                alt={user?.fullName || "User"} 
                className="rounded-full h-8 w-8"
              />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium leading-none">
                {user?.fullName || user?.username}
              </span>
              <span className="text-xs text-muted-foreground">
                {isAdmin ? "Administrator" : "User"}
              </span>
            </div>
          </div>
          <Button 
            variant="outline" 
            className="mt-2 w-full justify-start flex gap-2" 
            onClick={() => signOut()}
          >
            <LogOut className="h-4 w-4" />
            Log out
          </Button>
        </div>
      </div>
    </div>
  );
}