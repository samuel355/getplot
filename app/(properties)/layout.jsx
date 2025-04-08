'use client'
import GoogleMapsProvider from '@/providers/google-map-provider';
import { useUser } from '@clerk/nextjs';
import { useEffect } from 'react';
import Header from './properties/components/header';
import Sidebar from './properties/components/sidebar';
import { SidebarProvider } from './properties/contexts/sidebar-context';

export default function DashboardLayout({ children }) {
  const { user, isSignedIn, isLoaded } = useUser();
  useEffect(() => {
    if (isLoaded && !user) {
      window.location.href = '/market-place';
    }
  }, [isLoaded, isSignedIn, user]);

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }
  return (
    <GoogleMapsProvider>
      <SidebarProvider>
        <div className="flex min-h-screen flex-col w-full">
          <Header />
          <div className="flex flex-1">
            <Sidebar />
            <main className="flex-1 p-4 md:p-6 mt-16">{children}</main>
          </div>
        </div>
      </SidebarProvider>
    </GoogleMapsProvider>
  );
}