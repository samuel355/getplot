import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Loader } from "lucide-react";

const ChangeStatusDialog = ({ isStatusModalOpen, setIsStatusModalOpen, newStatus, setNewStatus, handleSaveNewStatus, statusLoading }) => (
  <Dialog open={isStatusModalOpen} onOpenChange={setIsStatusModalOpen}>
    <DialogTrigger asChild></DialogTrigger>
    <DialogContent className="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle>Change Plot Status</DialogTitle>
        <DialogDescription className="flex items-center gap-4 text-gray-800 text-sm">
          <span className="font-semibold text-sm">Select new status for this plot.</span>
        </DialogDescription>
      </DialogHeader>
      <div className="grid gap-4 py-4">
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="newStatus" className="text-right">
            Status
          </Label>
          <select
            id="newStatus"
            className="col-span-3 border rounded px-2 py-1"
            value={newStatus}
            onChange={e => setNewStatus(e.target.value)}
          >
            <option value="">Select status</option>
            <option value="Available">Available</option>
            <option value="Reserved">Reserved</option>
            <option value="Sold">Sold</option>
          </select>
        </div>
      </div>
      <DialogFooter>
        <Button onClick={handleSaveNewStatus} type="button" disabled={!newStatus || statusLoading}>
          {statusLoading ? <Loader className="animate-spin" /> : "Save Status"}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);

export default ChangeStatusDialog; 