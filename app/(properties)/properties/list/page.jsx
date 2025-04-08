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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function PropertyListPage() {
  const { user, isSignedIn } = useUser();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState("table");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [propertyToDelete, setPropertyToDelete] = useState(null);

  useEffect(() => {
    if (!isSignedIn) return;

    const fetchProperties = async () => {
      setLoading(true);
      try {
        let query = supabase
          .from("properties")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        if (statusFilter !== "all") {
          query = query.eq("status", statusFilter);
        }

        if (typeFilter !== "all") {
          query = query.eq("type", typeFilter);
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
  }, [isSignedIn, user, statusFilter, typeFilter]);

  const handleDeleteConfirm = (property) => {
    setPropertyToDelete(property);
    setDeleteConfirmOpen(true);
  };

  const handleDelete = async () => {
    if (!propertyToDelete) return;

    try {
      const { error } = await supabase
        .from("properties")
        .delete()
        .eq("id", propertyToDelete.id)
        .eq("user_id", user.id); // Security check to ensure user owns this property

      if (error) throw error;

      setProperties(properties.filter((p) => p.id !== propertyToDelete.id));
      toast.success("Property deleted successfully");
      setDeleteConfirmOpen(false);
    } catch (error) {
      console.error("Error deleting property:", error);
      toast.error("Failed to delete property");
    }
  };

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
          <div className="flex items-center">
            <Button
              variant={viewMode === "table" ? "default" : "outline"}
              size="icon"
              onClick={() => setViewMode("table")}
              className="rounded-r-none"
            >
              <ListIcon className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "grid" ? "default" : "outline"}
              size="icon"
              onClick={() => setViewMode("grid")}
              className="rounded-l-none"
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
          </div>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
              <SelectItem value="sold">Sold</SelectItem>
            </SelectContent>
          </Select>

          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="house">House</SelectItem>
              <SelectItem value="land">Land</SelectItem>
            </SelectContent>
          </Select>

          <Button asChild>
            <Link href="/properties/add-listing">
              <Plus className="mr-2 h-4 w-4" />
              Add Property
            </Link>
          </Button>
        </div>
      </div>

      <Tabs defaultValue="all" className="mt-6">
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="house">Houses</TabsTrigger>
          <TabsTrigger value="land">Land</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
        </TabsList>
        <TabsContent value="all">
          {renderProperties(viewMode, properties, loading, handleDeleteConfirm)}
        </TabsContent>
        <TabsContent value="house">
          {renderProperties(
            viewMode,
            properties.filter((p) => p.type === "house"),
            loading,
            handleDeleteConfirm,
          )}
        </TabsContent>
        <TabsContent value="land">
          {renderProperties(
            viewMode,
            properties.filter((p) => p.type === "land"),
            loading,
            handleDeleteConfirm,
          )}
        </TabsContent>
        <TabsContent value="pending">
          {renderProperties(
            viewMode,
            properties.filter((p) => p.status === "pending"),
            loading,
            handleDeleteConfirm,
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{propertyToDelete?.title}"? This
              action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteConfirmOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function renderProperties(viewMode, properties, loading, onDelete) {
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
        <h3 className="text-lg font-medium">No properties found</h3>
        <p className="text-muted-foreground mt-1">
          Get started by creating your first property listing.
        </p>
        <Button className="mt-4" asChild>
          <Link href="/properties/add-listing">
            <Plus className="mr-2 h-4 w-4" />
            Add Property
          </Link>
        </Button>
      </div>
    );
  }

  if (viewMode === "table") {
    return (
      <div className="rounded-md border mt-4">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Property</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {properties.map((property) => (
              <TableRow key={property.id}>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-md overflow-hidden bg-muted">
                      <img
                        src={
                          property.images?.[0]?.url ||
                          "/placeholder-property.jpg"
                        }
                        alt={property.title}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div>
                      <div className="font-medium">{property.title}</div>
                      <div className="text-xs text-muted-foreground">
                        {property.size} •{" "}
                        {property.type === "house"
                          ? `${property.bedrooms} bed • ${property.bathrooms} bath`
                          : "Land"}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="capitalize">{property.type}</span>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span>${Number(property.price).toLocaleString()}</span>
                    {property.negotiable && (
                      <span className="text-xs text-muted-foreground">
                        Negotiable
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell>{property.location}</TableCell>
                <TableCell>
                  <StatusBadge status={property.status} />
                </TableCell>
                <TableCell>
                  {property.created_at
                    ? format(new Date(property.created_at), "MMM d, yyyy")
                    : "-"}
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
                      <DropdownMenuItem
                        onClick={() => onDelete(property)}
                        className="text-red-600"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  } else {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
        {properties.map((property) => (
          <div
            key={property.id}
            className="border rounded-lg overflow-hidden bg-card"
          >
            <div className="h-48 overflow-hidden relative">
              <img
                src={property.images?.[0]?.url || "/placeholder-property.jpg"}
                alt={property.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-2 right-2">
                <StatusBadge status={property.status} />
              </div>
              <div className="absolute top-2 left-2">
                <span className="bg-black/70 text-white text-xs px-2 py-1 rounded-md capitalize">
                  {property.type}
                </span>
              </div>
            </div>
            <div className="p-4">
              <h3 className="font-semibold text-lg truncate">
                {property.title}
              </h3>
              <p className="text-sm text-muted-foreground truncate flex items-center mt-1">
                <MapPin className="h-3 w-3 mr-1" />
                {property.location}
              </p>
              <div className="flex justify-between items-center mt-2">
                <div className="font-medium">
                  ${Number(property.price).toLocaleString()}
                </div>
                {property.negotiable && (
                  <div className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                    Negotiable
                  </div>
                )}
              </div>
              <div className="flex mt-2 gap-2 text-sm text-muted-foreground">
                <div className="flex items-center">
                  <Home className="h-3 w-3 mr-1" />
                  {property.size}
                </div>
                {property.type === "house" && (
                  <>
                    <span>•</span>
                    <div>{property.bedrooms} bed</div>
                    <span>•</span>
                    <div>{property.bathrooms} bath</div>
                  </>
                )}
              </div>
              <div className="flex mt-4 gap-2">
                <Button variant="outline" size="sm" asChild className="flex-1">
                  <Link href={`/properties/property/${property.id}`}>
                    <Eye className="mr-2 h-4 w-4" />
                    View
                  </Link>
                </Button>
                <Button variant="outline" size="sm" asChild className="flex-1">
                  <Link href={`/properties/edit-property/${property.id}`}>
                    <Pencil className="mr-2 h-4 w-4" />
                    Edit
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onDelete(property)}
                  className="text-red-600"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }
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
