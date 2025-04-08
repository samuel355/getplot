import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function RejectionDialog({ 
  isOpen, 
  setIsOpen, 
  selectedProperty, 
  rejectionReason, 
  setRejectionReason, 
  onReject 
}) {
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reject Property</DialogTitle>
          <DialogDescription>
            Please provide a reason for rejecting this property. This information will be shared with the property owner.
          </DialogDescription>
        </DialogHeader>
        
        {selectedProperty && (
          <div className="py-2">
            <h3 className="text-sm font-medium">{selectedProperty.title}</h3>
            <p className="text-sm text-muted-foreground">{selectedProperty.location}</p>
          </div>
        )}
        
        <div className="py-2">
          <Label htmlFor="rejection-reason">Rejection Reason</Label>
          <Textarea
            id="rejection-reason"
            placeholder="Enter the reason for rejection..."
            rows={4}
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            className="mt-2"
          />
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button 
            variant="destructive" 
            onClick={onReject}
            disabled={!rejectionReason.trim()}
          >
            Reject Property
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}