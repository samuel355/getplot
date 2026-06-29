import { useEffect, useState } from "react";
import useAdvancedSearchStore from "../../_store/useAdvancedSearchStore";
import PropertyTable from "../property-table";
import RejectionDialog from "../rejection-dialog";

export function SearchResults() {
  const { results, totalResults, loading, error, executeSearch } =
    useAdvancedSearchStore();
  const [isRejectionDialogOpen, setIsRejectionDialogOpen] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");

  useEffect(() => {
    executeSearch();
  }, [executeSearch]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (error) {
    return <div className="bg-red-50 text-red-700 p-4 rounded-md">{error}</div>;
  }

  if (results.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-lg text-gray-500">
          No properties found matching your criteria
        </p>
      </div>
    );
  }

  const handleOpenRejectDialog = (results) => {
    setSelectedProperty(results);
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

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">
          Found {totalResults} properties
        </p>
      </div>

      <PropertyTable
        properties={results}
        openRejectDialog={handleOpenRejectDialog}
      />

      <RejectionDialog
        isOpen={isRejectionDialogOpen}
        setIsOpen={setIsRejectionDialogOpen}
        selectedProperty={selectedProperty}
        rejectionReason={rejectionReason}
        setRejectionReason={setRejectionReason}
        onReject={handleRejectProperty}
      />
    </div>
  );
}
