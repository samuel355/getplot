import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import useBulkActionStore from "../../_store/useBulkActionStore";
import { useToast } from "@/hooks/use-toast";

export function BulkRejectDialog({ isOpen, setIsOpen }) {
  const { selectedItems, bulkRejectProperties } = useBulkActionStore();
  const [reason, setReason] = useState("");
  const { toast } = useToast();

  const handleReject = async () => {
    const result = await bulkRejectProperties(reason);

    if (result.success) {
      toast({
        title: "Success",
        description: `Rejected ${result.count} properties`,
      });
      setIsOpen(false);
    } else {
      toast({
        title: "Error",
        description: "Failed to reject properties",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Bulk Reject Properties</DialogTitle>
          <DialogDescription>
            You are about to reject {selectedItems.length} properties. Please
            provide a reason for rejection.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <Textarea
            placeholder="Enter rejection reason..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={4}
          />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleReject}
            disabled={!reason.trim()}
          >
            Reject Properties
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
