'use client'
import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import AdminLayout from "../_components/admin-layout";
import PropertyTable from "../_components/property-table";
import StatCards from "../_components/stat-cards";
import RejectionDialog from "../_components/rejection-dialog";
import useAdminPropertyStore from "../_store/useAdminPropertyStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  Filter,
  ArrowUpDown,
  Building,
  CheckCircle,
  XCircle,
  Clock,
  Badge,
  PlusCircle,
} from "lucide-react";
import { BulkActionBar } from "../_components/bulk-actions/bulk-action-bar";
import { useToast } from "@/hooks/use-toast";

export default function AdminPropertiesPage() {
  const {
    properties,
    filteredProperties,
    stats,
    loading,
    currentTab,
    fetchProperties,
    setTab,
    setSearchQuery,
    setFilterType,
    setSortOrder,
    approveProperty,
    rejectProperty,
  } = useAdminPropertyStore();

  const { toast } = useToast();
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [isRejectionDialogOpen, setIsRejectionDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");

  // Fetch properties on mount
  useEffect(() => {
    fetchProperties();
  }, [fetchProperties]);

  // Handler for property approval
  const handleApproveProperty = async (propertyId) => {
    const result = await approveProperty(propertyId);

    if (result.success) {
      toast({
        title: "Success",
        description: "Property has been approved",
      });

      // Send notification email (we'll implement this next)
      sendNotificationEmail(result.property, "approved");
    } else {
      toast({
        title: "Error",
        description: result.error || "Failed to approve property",
        variant: "destructive",
      });
    }
  };

  // Open rejection dialog
  const handleOpenRejectDialog = (property) => {
    setSelectedProperty(property);
    setRejectionReason("");
    setIsRejectionDialogOpen(true);
  };

  // Handler for property rejection
  const handleRejectProperty = async () => {
    if (!selectedProperty) return;

    const result = await rejectProperty(selectedProperty.id, rejectionReason);

    if (result.success) {
      setIsRejectionDialogOpen(false);

      toast({
        title: "Success",
        description: "Property has been rejected",
      });

      // Send notification email (we'll implement this next)
      sendNotificationEmail(result.property, "rejected", rejectionReason);
    } else {
      toast({
        title: "Error",
        description: result.error || "Failed to reject property",
        variant: "destructive",
      });
    }
  };

  // Placeholder for notification email sending (we'll implement this next)
  const sendNotificationEmail = async (property, status, reason = null) => {
    try {
      const response = await fetch("/api/admin/send-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          propertyId: property.id,
          propertyOwnerId: property.user_id,
          emailType:
            status === "approved" ? "property-approved" : "property-rejected",
          rejectionReason: reason,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to send notification");
      }

      toast({
        title: "Notification Sent",
        description: `Email notification sent to property owner`,
      });
    } catch (error) {
      console.error("Error sending notification:", error);
      toast({
        title: "Error",
        description: "Failed to send notification email",
        variant: "destructive",
      });
    }
  };

  // Generate stats for display
  const statsData = [
    {
      title: "Total Properties",
      value: stats.total,
      icon: <Building className="h-4 w-4 text-muted-foreground" />,
    },
    {
      title: "Pending Approval",
      value: stats.pending,
      icon: <Clock className="h-4 w-4 text-amber-500" />,
    },
    {
      title: "Approved",
      value: stats.approved,
      icon: <CheckCircle className="h-4 w-4 text-green-500" />,
    },
    {
      title: "Rejected",
      value: stats.rejected,
      icon: <XCircle className="h-4 w-4 text-red-500" />,
    },
  ];

  return (
    <AdminLayout>
      <div className="flex-1 p-6 space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Property Management
            </h1>
            <p className="text-muted-foreground">
              Review, approve, and manage property listings
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button asChild>
              <Link href="/properties/list">
                <Building className="mr-2 h-4 w-4" />
                View My Listings
              </Link>
            </Button>
          </div>
        </div>

        {/* Stats cards */}
        <StatCards stats={statsData} />

        {/* Filters */}
        <div className="flex flex-col gap-4 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search properties..."
              className="w-full pl-8"
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <Select defaultValue="all" onValueChange={setFilterType}>
              <SelectTrigger className="w-[160px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Property Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="house">Houses</SelectItem>
                <SelectItem value="land">Land</SelectItem>
              </SelectContent>
            </Select>
            <Select defaultValue="newest" onValueChange={setSortOrder}>
              <SelectTrigger className="w-[160px]">
                <ArrowUpDown className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Sort By" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="oldest">Oldest First</SelectItem>
                <SelectItem value="price-high">Price (High to Low)</SelectItem>
                <SelectItem value="price-low">Price (Low to High)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Tabs and Table */}
        <Tabs defaultValue="pending" value={currentTab} onValueChange={setTab}>
          <TabsList>
            <TabsTrigger value="pending" className="flex gap-2 items-center">
              <Clock className="h-4 w-4" />
              Pending{" "}
              <span className="ml-1 rounded-full bg-muted px-2 py-0.5 text-xs font-medium">
                {stats.pending}
              </span>
            </TabsTrigger>
            <TabsTrigger value="approved" className="flex gap-2 items-center">
              <CheckCircle className="h-4 w-4" />
              Approved{" "}
              <span className="ml-1 rounded-full bg-muted px-2 py-0.5 text-xs font-medium">
                {stats.approved}
              </span>
            </TabsTrigger>
            <TabsTrigger value="rejected" className="flex gap-2 items-center">
              <XCircle className="h-4 w-4" />
              Rejected{" "}
              <span className="ml-1 rounded-full bg-muted px-2 py-0.5 text-xs font-medium">
                {stats.rejected}
              </span>
            </TabsTrigger>
            <TabsTrigger value="all" className="flex gap-2 items-center">
              All{" "}
              <span className="ml-1 rounded-full bg-muted px-2 py-0.5 text-xs font-medium">
                {stats.total}
              </span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="mt-6">
            <PropertyTable
              properties={filteredProperties}
              approveProperty={handleApproveProperty}
              openRejectDialog={handleOpenRejectDialog}
              emptyMessage="No pending properties found"
            />
          </TabsContent>

          <TabsContent value="approved" className="mt-6">
            <PropertyTable
              properties={filteredProperties}
              approveProperty={handleApproveProperty}
              openRejectDialog={handleOpenRejectDialog}
              hideActions
              emptyMessage="No approved properties found"
            />
          </TabsContent>

          <TabsContent value="rejected" className="mt-6">
            <PropertyTable
              properties={filteredProperties}
              approveProperty={handleApproveProperty}
              openRejectDialog={handleOpenRejectDialog}
              hideActions
              emptyMessage="No rejected properties found"
            />
          </TabsContent>

          <TabsContent value="all" className="mt-6">
            <PropertyTable
              properties={filteredProperties}
              approveProperty={handleApproveProperty}
              openRejectDialog={handleOpenRejectDialog}
              emptyMessage="No properties found"
            />
          </TabsContent>
        </Tabs>

        {/* Rejection Dialog */}
        <RejectionDialog
          isOpen={isRejectionDialogOpen}
          setIsOpen={setIsRejectionDialogOpen}
          selectedProperty={selectedProperty}
          rejectionReason={rejectionReason}
          setRejectionReason={setRejectionReason}
          onReject={handleRejectProperty}
        />
        <BulkActionBar />
      </div>
    </AdminLayout>
  );
}
