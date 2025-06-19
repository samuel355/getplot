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
import { Label } from "@/components/ui/label";
import { useState } from "react";

export default function UserBanDialog({
  isOpen,
  setIsOpen,
  selectedUser,
  onBanUser,
  isBan = true,
}) {
  const [reason, setReason] = useState("");

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isBan ? "Ban User" : "Unban User"}</DialogTitle>
          <DialogDescription>
            {isBan
              ? "This will prevent the user from accessing the platform."
              : "This will restore the user's access to the platform."}
          </DialogDescription>
        </DialogHeader>

        {selectedUser && (
          <div className="py-2">
            <div className="flex items-center space-x-3">
              <img
                src={selectedUser.imageUrl}
                alt={selectedUser.firstName}
                className="h-10 w-10 rounded-full"
              />
              <div>
                <h3 className="text-sm font-medium">
                  {selectedUser.firstName} {selectedUser.lastName}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {selectedUser.email}
                </p>
              </div>
            </div>
          </div>
        )}

        {isBan && (
          <div className="py-4">
            <Label htmlFor="reason">Reason for Ban</Label>
            <Textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Provide a reason for banning this user..."
              className="mt-2"
            />
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button
            variant={isBan ? "destructive" : "default"}
            onClick={() => {
              onBanUser(reason);
              setReason("");
            }}
            disabled={isBan && !reason.trim()}
          >
            {isBan ? "Ban User" : "Unban User"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
