import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export default function UserRoleDialog({
  isOpen,
  setIsOpen,
  selectedUser,
  newRole,
  setNewRole,
  onUpdateRole,
  currentUserRole,
}) {
  const roles = [
    { value: "user", label: "Regular User" },
    { value: "admin", label: "Administrator" },
    ...(currentUserRole === "sysadmin" ? [
      { value: "sysadmin", label: "System Administrator" }
    ] : []),
  ];

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update User Role</DialogTitle>
          <DialogDescription>
            Change the role and permissions for this user.
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

        <div className="py-4">
          <Label htmlFor="role">Select Role</Label>
          <Select
            value={newRole}
            onValueChange={setNewRole}
          >
            <SelectTrigger className="w-full mt-2">
              <SelectValue placeholder="Select a role" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {roles.map((role) => (
                  <SelectItem
                    key={role.value}
                    value={role.value}
                    disabled={
                      // Prevent changing own role or assigning sysadmin if not sysadmin
                      (selectedUser?.id === currentUserRole?.id) ||
                      (role.value === "sysadmin" && currentUserRole !== "sysadmin")
                    }
                  >
                    {role.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setIsOpen(false)}
          >
            Cancel
          </Button>
          <Button
            onClick={onUpdateRole}
            disabled={!newRole || newRole === selectedUser?.role}
          >
            Update Role
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}