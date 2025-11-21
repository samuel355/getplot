"use client";

import { useUser } from "@clerk/nextjs";
import { useState, useEffect } from "react";
import { supabase } from "@/utils/supabase/client";
import { format } from "date-fns";
import Link from "next/link";
import toast from "react-hot-toast";
import {
  Eye,
  Pencil,
  Trash2,
  Plus,
  Filter,
  Grid3X3,
  List as ListIcon,
  MapPin,
  Home,
  Tag,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";


export default function PropertyListPage() {
  const { user, isSignedIn } = useUser();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState("table");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const itemsPerPage = 10;

  useEffect(() => {
    if (!isSignedIn) return;
  
    const fetchProperties = async () => {
      setLoading(true);
      try {
        // First, get the total count
        let countQuery = supabase
          .from("saadi")
          .select("*", { count: "exact", head: true })
  
        if (statusFilter !== "all") {
          if (statusFilter === "Available") {
            // For Available, include both "Available" and null values
            countQuery = countQuery.or('status.eq.Available,status.is.null');
          } else {
            countQuery = countQuery.eq("status", statusFilter);
          }
        }
  
        const { count } = await countQuery;
        setTotalCount(count || 0);
  
        // Then fetch the paginated data
        let query = supabase
          .from("saadi")
          .select("*")
          .range(
            (currentPage - 1) * itemsPerPage,
            currentPage * itemsPerPage - 1
          );
  
        if (statusFilter !== "all") {
          if (statusFilter === "Available") {
            // For Available, include both "Available" and null values
            query = query.or('status.eq.Available,status.is.null');
          } else {
            query = query.eq("status", statusFilter);
          }
        }
  
        const { data, error } = await query;
  
        if (error) throw error;
  
        setProperties(data || []);
      } catch (error) {
        console.error("Error fetching properties:", error);
        toast.error("Failed to load properties");
      } finally {
        setLoading(false);
      }
    };
  
    fetchProperties();
  }, [isSignedIn, user, statusFilter, currentPage]);
  if (!isSignedIn) {
    return <div>Please sign in to view this page</div>;
  }

  return (
    <div>
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6">
        <h1 className="text-2xl font-bold tracking-tight mb-2 md:mb-0">
          My Properties
        </h1>

        <div className="flex flex-wrap items-center gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="Available">Available</SelectItem>
              <SelectItem value="Reserved">Pending</SelectItem>
              <SelectItem value="Sold">Sold</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs defaultValue="all" className="mt-6" value={statusFilter} onValueChange={setStatusFilter}>
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="Available">Available</TabsTrigger>
          <TabsTrigger value="Reserved">Reserved</TabsTrigger>
          <TabsTrigger value="Sold">Sold</TabsTrigger>
        </TabsList>
        <TabsContent value="all">
          {renderProperties(viewMode, properties, loading)}
          {renderPagination(
            totalCount,
            currentPage,
            setCurrentPage,
            itemsPerPage
          )}
        </TabsContent>
        <TabsContent value="Sold">
          {renderProperties(
            viewMode,
            properties.filter((p) => p.status === "Sold" || p.status === 'sold'),
            loading,
          )}
          {renderPagination(
            totalCount,
            currentPage,
            setCurrentPage,
            itemsPerPage
          )}
        </TabsContent>
        <TabsContent value="Available">
          {renderProperties(
            viewMode,
            properties.filter((p) => p.status === "Available" || p.status === null),
            loading,
          )}
          {renderPagination(
            totalCount,
            currentPage,
            setCurrentPage,
            itemsPerPage
          )}
        </TabsContent>
        <TabsContent value="Reserved">
          {renderProperties(
            viewMode,
            properties.filter((p) => p.status === "Reserved"),
            loading
          )}
          {renderPagination(
            totalCount,
            currentPage,
            setCurrentPage,
            itemsPerPage
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function renderProperties(viewMode, properties, loading) {
  if (loading) {
    return (
      <div className="space-y-4 mt-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-16 bg-muted rounded-md animate-pulse"></div>
        ))}
      </div>
    );
  }

  if (properties.length === 0) {
    return (
      <div className="text-center py-10 bg-muted/30 rounded-lg mt-4">
        <h3 className="text-lg font-medium">No properties/plots found</h3>
      </div>
    );
  }

  if (viewMode === "table") {
    return (
      <div className="rounded-md border mt-4">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Plot Number</TableHead>
              <TableHead>Street Name</TableHead>
              <TableHead>Size (sqft)</TableHead>
              <TableHead>Land Use</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {properties.map((property) => (
              <TableRow key={property.id}>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-3">
                    <div>
                      <div className="font-medium">{property.properties.Plot_No}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <span>{property.properties.Street_Nam}</span>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span>
                      {property.properties.Area}
                    </span>
                  </div>
                </TableCell>
                <TableCell>{property.properties.LANDUSE}</TableCell>
                <TableCell>
                  {property.status ?? 'Available'}
                </TableCell>
                <TableCell>
                  {property.plotTotalAmount.toLocaleString()}
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <span className="sr-only">Open menu</span>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="lucide lucide-more-vertical"
                        >
                          <circle cx="12" cy="12" r="1" />
                          <circle cx="12" cy="5" r="1" />
                          <circle cx="12" cy="19" r="1" />
                        </svg>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem asChild>
                        <Link href={`/properties/property/${property.id}`}>
                          <Eye className="mr-2 h-4 w-4" />
                          View
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href={`/properties/edit-property/${property.id}`}>
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }
}

const renderPagination = (
  totalCount,
  currentPage,
  setCurrentPage,
  itemsPerPage
) => {
  const totalPages = Math.ceil(totalCount / itemsPerPage);
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-center space-x-2 py-4">
      <Button
        variant="outline"
        size="sm"
        onClick={() => setCurrentPage(1)}
        disabled={currentPage === 1}
      >
        First
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setCurrentPage(currentPage - 1)}
        disabled={currentPage === 1}
      >
        Previous
      </Button>
      <span className="text-sm">
        Page {currentPage} of {totalPages}
      </span>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setCurrentPage(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        Next
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setCurrentPage(totalPages)}
        disabled={currentPage === totalPages}
      >
        Last
      </Button>
    </div>
  );
};