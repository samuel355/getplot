import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Check, X, Download, Mail, MoreHorizontal } from "lucide-react";
import useBulkActionStore from "../../_store/useBulkActionStore";
import { BulkRejectDialog } from "./bulk-reject-dialog";
import { useToast } from "@/hooks/use-toast";

export function BulkActionBar() {
  const { selectedItems, bulkApproveProperties, exportData } = useBulkActionStore();
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const { toast } = useToast();

  const handleBulkApprove = async () => {
    const result = await bulkApproveProperties();
    
    if (result.success) {
      toast({
        title: "Success",
        description: `Approved ${result.count} properties`,
      });
    } else {
      toast({
        title: "Error",
        description: "Failed to approve properties",
        variant: "destructive",
      });
    }
  };

  const handleExport = async (format) => {
    const result = await exportData(format);
    
    if (result.success) {
      toast({
        title: "Success",
        description: "Export completed successfully",
      });
    } else {
      toast({
        title: "Error",
        description: "Failed to export data",
        variant: "destructive",
      });
    }
  };

  if (selectedItems.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 flex items-center gap-2 bg-white p-4 rounded-lg shadow-lg border">
      <span className="text-sm text-muted-foreground">
        {selectedItems.length} items selected
      </span>

      <Button
        variant="outline"
        className="text-green-600 hover:text-green-700"
        onClick={handleBulkApprove}
      >
        <Check className="mr-2 h-4 w-4" />
        Approve All
      </Button>

      <Button
        variant="outline"
        className="text-red-600 hover:text-red-700"
        onClick={() => setIsRejectDialogOpen(true)}
      >
        <X className="mr-2 h-4 w-4" />
        Reject All
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>More Actions</DropdownMenuLabel>
          <DropdownMenuItem onClick={() => handleExport('csv')}>
            <Download className="mr-2 h-4 w-4" />
            Export as CSV
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleExport('excel')}>
            <Download className="mr-2 h-4 w-4" />
            Export as Excel
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem>
            <Mail className="mr-2 h-4 w-4" />
            Send Notification
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <BulkRejectDialog
        isOpen={isRejectDialogOpen}
        setIsOpen={setIsRejectDialogOpen}
      />
    </div>
  );
}