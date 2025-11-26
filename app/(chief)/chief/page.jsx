"use client";
import { useUser } from "@clerk/nextjs";
import { useState, useEffect } from "react";
import { supabase } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Building,
  CheckCircle,
  Clock,
  Plus,
} from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";
import AuthCheck from "@/app/_components/AuthCheck";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function PropertiesDashboard() {
  const { user, isSignedIn } = useUser();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    available: 0,
    reserved: 0,
    rejected: 0,
    sold: 0,
  });
  const [soldParcels, setSoldParcels] = useState([]);

  useEffect(() => {
    if (!isSignedIn) return;

    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const userId = user.id;
        const isChief = user?.publicMetadata?.role === "chief";
        //save chief area in public metdatadata in clerk and use it to fetch from supabase when user signs in 

        let query = supabase.from("saadi");

        // If not admin, only show user's properties
        if (!isChief) {
          query = query.eq("user_id", userId);
        }

        const { data: properties, error } = await query.select("*");

        if (error) throw error;

        // Calculate stats
        const available = properties.filter(
          (p) => p.status === "available" || p.status === null
        ).length;
        const reserved = properties.filter(
          (p) => p.status === "reserved"
        ).length;
        const rejected = properties.filter(
          (p) => p.status === "rejected"
        ).length;
        const sold = properties.filter((p) => p.status === "Sold").length;

        setStats({
          total: properties.length,
          available,
          reserved,
          rejected,
          sold,
        });

        // Get sold plots
        let soldPlots = supabase
          .from("saadi")
          .select("*")
          .eq("status", "Sold")
          .limit(10);

        const { data: soldparcels, error: soldError } = await soldPlots;

        if (soldError) throw soldError;

        setSoldParcels(soldparcels);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        toast.error("Failed to load dashboard data");
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
    <AuthCheck>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <Link href="/properties/add-listing">
            <Button className="flex gap-2">
              <Plus className="h-4 w-4" />
              Add Property
            </Button>
          </Link>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">
                Total Properties
              </CardTitle>
              <Building className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? (
                  <div className="h-8 w-16 bg-muted animate-pulse rounded-md"></div>
                ) : (
                  stats.total
                )}
              </div>
              <p className="text-xs text-muted-foreground">All Plots at site</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">Available</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? (
                  <div className="h-8 w-16 bg-muted animate-pulse rounded-md"></div>
                ) : (
                  stats.available
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Available plots for purchase
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">Sold Plots</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? (
                  <div className="h-8 w-16 bg-muted animate-pulse rounded-md"></div>
                ) : (
                  stats.sold
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Completed transactions
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">
                Reserved Plots
              </CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? (
                  <div className="h-8 w-16 bg-muted animate-pulse rounded-md"></div>
                ) : (
                  stats.reserved
                )}
              </div>
              <p className="text-xs text-muted-foreground">Reserved plots</p>
            </CardContent>
          </Card>
        </div>

        <div className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Plots</CardTitle>
                <Link href="/chief/plots-lists">
                  <Button variant="outline" size="sm">
                    View All Plots
                  </Button>
                </Link>
              </div>
              <CardDescription>Few Sold Plots</CardDescription>
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
              ) : soldParcels.length > 0 ? (
                <div className="space-y-4">

                  <div className="rounded-md border mt-4">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Plot Number</TableHead>
                          <TableHead>Street Name</TableHead>
                          <TableHead>Size(sqft)</TableHead>
                          <TableHead>Land Use</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Amount (GHS)</TableHead>
                        </TableRow>
                      </TableHeader>

                      <TableBody>
                        {soldParcels.map((parcel) => (
                          <TableRow key={parcel.id}>
                            <TableCell>
                              <div>{parcel.properties.Plot_No}</div>
                            </TableCell>
                            <TableCell>
                              <div>{parcel.properties.Street_Nam}</div>
                            </TableCell>
                            <TableCell>
                              <div>{parcel.properties.Area}</div>
                            </TableCell>
                            <TableCell>
                              <div>{parcel.properties.LANDUSE}</div>
                            </TableCell>
                            <TableCell>
                              <div>{parcel.status}</div>
                            </TableCell>
                            <TableCell>
                              <div>{parcel.plotTotalAmount.toLocaleString()}</div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Building className="h-12 w-12 mx-auto text-muted-foreground" />
                  <h3 className="mt-2 text-sm font-medium">No Plots found</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Contact the administrator
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AuthCheck>
  );
}

function StatusBadge({ status }) {
  const statusStyles = {
    available: "bg-green-100 text-green-800 border-green-200",
    reserved: "bg-yellow-100 text-yellow-800 border-yellow-200",
    rejected: "bg-red-100 text-red-800 border-red-200",
    sold: "bg-blue-100 text-blue-800 border-blue-200",
  };

  const style = statusStyles[status] || statusStyles.reserved;

  return (
    <span className={`text-xs px-2 py-1 rounded-full border ${style}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}
