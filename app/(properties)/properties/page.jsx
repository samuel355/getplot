"use client";

import { useUser } from '@clerk/nextjs';
import { useState, useEffect } from 'react';
import { supabase } from '@/utils/supabase/client';
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Building,
  CheckCircle,
  Clock,
  AlertTriangle,
  Plus,
  Activity,
  Home,
  MapPin
} from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function PropertiesDashboard() {
  const { user, isSignedIn } = useUser();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    approved: 0,
    pending: 0,
    rejected: 0,
    sold: 0
  });
  const [recentProperties, setRecentProperties] = useState([]);
  
  useEffect(() => {
    if (!isSignedIn) return;
    
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const userId = user.id;
        const isAdmin = user?.publicMetadata?.role === 'admin' || user?.publicMetadata?.role === 'sysadmin';
        
        let query = supabase.from('properties');
        
        // If not admin, only show user's properties
        if (!isAdmin) {
          query = query.eq('user_id', userId);
        }
        
        const { data: properties, error } = await query.select('*');
        
        if (error) throw error;
        
        // Calculate stats
        const approved = properties.filter(p => p.status === 'approved').length;
        const pending = properties.filter(p => p.status === 'pending').length;
        const rejected = properties.filter(p => p.status === 'rejected').length;
        const sold = properties.filter(p => p.status === 'sold').length;
        
        setStats({
          total: properties.length,
          approved,
          pending,
          rejected,
          sold
        });
        
        // Get recent properties
        let recentQuery = supabase
          .from('properties')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(5);
          
        if (!isAdmin) {
          recentQuery = recentQuery.eq('user_id', userId);
        }
        
        const { data: recent, error: recentError } = await recentQuery;
        
        if (recentError) throw recentError;
        
        setRecentProperties(recent || []);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        toast.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, [isSignedIn, user]);
  
  if (!isSignedIn) {
    return <div>Please sign in to view this page</div>;
  }
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <Link href="/properties/create">
          <Button className="flex gap-2">
            <Plus className="h-4 w-4" />
            Add Property
          </Button>
        </Link>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Total Properties</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? <div className="h-8 w-16 bg-muted animate-pulse rounded-md"></div> : stats.total}
            </div>
            <p className="text-xs text-muted-foreground">
              All your property listings
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? <div className="h-8 w-16 bg-muted animate-pulse rounded-md"></div> : stats.approved}
            </div>
            <p className="text-xs text-muted-foreground">
              Actively listed properties
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Pending Approval</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? <div className="h-8 w-16 bg-muted animate-pulse rounded-md"></div> : stats.pending}
            </div>
            <p className="text-xs text-muted-foreground">
              Waiting for review
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Rejected</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? <div className="h-8 w-16 bg-muted animate-pulse rounded-md"></div> : stats.rejected}
            </div>
            <p className="text-xs text-muted-foreground">
              Need revision
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Sold</CardTitle>
            <Home className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? <div className="h-8 w-16 bg-muted animate-pulse rounded-md"></div> : stats.sold}
            </div>
            <p className="text-xs text-muted-foreground">
              Completed transactions
            </p>
          </CardContent>
        </Card>
      </div>
      
      <div className="mt-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Recent Properties</CardTitle>
              <Link href="/properties/list">
                <Button variant="outline" size="sm">View All</Button>
              </Link>
            </div>
            <CardDescription>Your latest property listings</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex gap-4 items-center">
                    <div className="h-12 w-12 rounded-md bg-muted animate-pulse"></div>
                    <div className="space-y-2">
                      <div className="h-4 w-32 bg-muted animate-pulse rounded-md"></div>
                      <div className="h-3 w-24 bg-muted animate-pulse rounded-md"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : recentProperties.length > 0 ? (
              <div className="space-y-4">
                {recentProperties.map((property) => (
                  <Link key={property.id} href={`/properties/${property.id}`} className="flex items-center gap-4 rounded-lg p-2 hover:bg-muted">
                    <div className="h-12 w-12 rounded-md overflow-hidden bg-muted">
                      <img 
                        src={property.images?.[0]?.url || '/placeholder-property.jpg'} 
                        alt={property.title} 
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{property.title}</p>
                      <p className="text-sm text-muted-foreground truncate flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {property.location}
                      </p>
                    </div>
                    <StatusBadge status={property.status} />
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Building className="h-12 w-12 mx-auto text-muted-foreground" />
                <h3 className="mt-2 text-sm font-medium">No properties found</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Get started by creating a new property.
                </p>
                <Button className="mt-4" asChild>
                  <Link href="/properties/create">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Property
                  </Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Activity</CardTitle>
            <CardDescription>Recent activity on your properties</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center">
                <Activity className="h-4 w-4 mr-2 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">No recent activity to display</span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks to manage your properties</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" asChild>
                <Link href="/properties/create">
                  <Plus className="h-4 w-4 mr-2" />
                  New Property
                </Link>
              </Button>
              <Button variant="outline">
                <Clock className="h-4 w-4 mr-2" />
                View Pending
              </Button>
              <Button variant="outline">
                <Building className="h-4 w-4 mr-2" />
                Property Reports
              </Button>
              <Button variant="outline">
                <CheckCircle className="h-4 w-4 mr-2" />
                Update Status
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const statusStyles = {
    approved: "bg-green-100 text-green-800 border-green-200",
    pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
    rejected: "bg-red-100 text-red-800 border-red-200",
    sold: "bg-blue-100 text-blue-800 border-blue-200",
  };
  
  const style = statusStyles[status] || statusStyles.pending;
  
  return (
    <span className={`text-xs px-2 py-1 rounded-full border ${style}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}