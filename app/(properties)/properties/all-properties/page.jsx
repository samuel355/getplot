"use client";
import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import PropertyTable from "../(admin)/_components/property-table";
import StatCards from "../(admin)/_components/stat-cards";
import RejectionDialog from "../(admin)/_components/rejection-dialog";
import useAdminPropertyStore from "../(admin)/_store/useAdminPropertyStore";
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
} from "lucide-react";
import { BulkActionBar } from "../(admin)/_components/bulk-actions/bulk-action-bar";
import { useToast } from "@/hooks/use-toast";

export default function AdminPropertiesPage() {
  const {
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
  const { user } = useUser();
  const userRole = user?.publicMetadata?.role;
  const userId = user?.id;

  useEffect(() => {
    fetchProperties();
  }, [fetchProperties]);

  const handleApproveProperty = async (propertyId) => {
    const result = await approveProperty(propertyId);
    if (result.success) {
      toast({ title: "Property approved" });
      sendNotificationEmail(result.property, "approved");
    } else {
      toast({ title: "Error", description: result.error, variant: "destructive" });
    }
  };

  const handleOpenRejectDialog = (property) => {
    setSelectedProperty(property);
    setRejectionReason("");
    setIsRejectionDialogOpen(true);
  };

  const handleRejectProperty = async () => {
    if (!selectedProperty) return;
    const result = await rejectProperty(selectedProperty.id, rejectionReason);
    if (result.success) {
      setIsRejectionDialogOpen(false);
      toast({ title: "Property rejected" });
      sendNotificationEmail(result.property, "rejected", rejectionReason);
    } else {
      toast({ title: "Error", description: result.error, variant: "destructive" });
    }
  };

  const sendNotificationEmail = async (property, status, reason = null) => {
    try {
      await fetch("/api/admin/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          property,
          propertyId: property.id,
          propertyOwnerId: property.user_id,
          userId,
          userRole,
          emailType: status === "approved" ? "property-approved" : "property-rejected",
          rejectionReason: reason,
        }),
      });
    } catch (error) {
      console.error("Error sending notification:", error);
    }
  };

  const statsData = [
    {
      title: "Total",
      value: stats.total,
      icon: <Building className="h-4 w-4 text-slate-400" />,
    },
    {
      title: "Pending",
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
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">All Properties</h1>
          <p className="text-sm text-slate-400 mt-0.5">
            Review, approve, and manage property listings
          </p>
        </div>
      </div>

      {/* Stats */}
      <StatCards stats={statsData} />

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
          <Input
            type="search"
            placeholder="Search properties…"
            className="pl-9"
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Select defaultValue="all" onValueChange={setFilterType}>
            <SelectTrigger className="w-40">
              <Filter className="mr-2 h-4 w-4 text-slate-400" />
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="house">Houses</SelectItem>
              <SelectItem value="land">Land</SelectItem>
            </SelectContent>
          </Select>
          <Select defaultValue="newest" onValueChange={setSortOrder}>
            <SelectTrigger className="w-44">
              <ArrowUpDown className="mr-2 h-4 w-4 text-slate-400" />
              <SelectValue placeholder="Sort" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="oldest">Oldest First</SelectItem>
              <SelectItem value="price-high">Price: High → Low</SelectItem>
              <SelectItem value="price-low">Price: Low → High</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Tabs + Table */}
      <Tabs defaultValue="pending" value={currentTab} onValueChange={setTab}>
        <TabsList className="bg-slate-100">
          {[
            { value: "all", label: "All", count: stats.total },
            { value: "pending", label: "Pending", count: stats.pending },
            { value: "approved", label: "Approved", count: stats.approved },
            { value: "rejected", label: "Rejected", count: stats.rejected },
          ].map(({ value, label, count }) => (
            <TabsTrigger key={value} value={value} className="gap-1.5">
              {label}
              <span className="rounded-full bg-white px-1.5 py-0.5 text-xs font-medium text-slate-600 shadow-sm">
                {count}
              </span>
            </TabsTrigger>
          ))}
        </TabsList>

        {["pending", "approved", "rejected", "all"].map((tab) => (
          <TabsContent key={tab} value={tab} className="mt-4">
            <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
              <PropertyTable
                properties={filteredProperties}
                approveProperty={handleApproveProperty}
                openRejectDialog={handleOpenRejectDialog}
                hideActions={tab === "approved" || tab === "rejected"}
                emptyMessage={`No ${tab === "all" ? "" : tab} properties found`}
              />
            </div>
          </TabsContent>
        ))}
      </Tabs>

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
  );
}
