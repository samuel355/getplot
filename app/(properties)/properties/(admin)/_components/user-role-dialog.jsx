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
  SelectLabel,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { toast } from "react-toastify";

export default function UserRoleDialog({
  isOpen,
  setIsOpen,
  selectedUser,
  newRole,
  setNewRole,
  onUpdateRole,
  currentUserRole,
  area,
  setArea
}) {
  const [roleError, setRoleError] = useState(false);
  const [areaError, setAreaError] = useState(false);
  const [loading, setLoading] = useState(false);

  const roles = [
    { value: "member", label: "Regular User" },
    { value: "admin", label: "Administrator" },
    { value: "chief", label: "Chief" },
    { value: "chief_asst", label: "Chief/Owner Assistant" },
    { value: "property_agent", label: "Property Agent" },
    ...(currentUserRole === "sysadmin" || currentUserRole?.role === "sysadmin"
      ? [{ value: "sysadmin", label: "System Administrator" }]
      : []),
  ];

  const handleSubmit = async () => {
    // Reset errors
    setRoleError(false);
    setAreaError(false);
    setLoading(true);

    try {
      // Validation
      if (!newRole) {
        setRoleError(true);
        toast.error("Choose Role");
        return;
      }else{
        setRoleError(false);
      }

      if ((newRole === "chief" || newRole === "chief_asst") && !area) {
        setAreaError(true);
        toast.error("Select Area");
        return;
      }else{
        setRoleError(false);
      }

      // Call the update function
      await onUpdateRole();
      
    } catch (error) {
      console.error("Error updating role:", error);
      toast.error("Failed to update role");
    } finally {
      setLoading(false);
    }
  };

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

        <div className="mt-4">
          <Label htmlFor="role">Select Role</Label>
          <Select value={newRole} onValueChange={setNewRole}>
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
                      selectedUser?.id === currentUserRole?.id ||
                      (role.value === "sysadmin" && 
                       currentUserRole !== "sysadmin" && 
                       currentUserRole?.role !== "sysadmin")
                    }
                  >
                    {role.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
          {roleError && (
            <span className="text-red-600 text-xs mt-1 block">Choose a role</span>
          )}
        </div>

        {(newRole === "chief" || newRole === "chief_asst") && (
          <div className="mt-2">
            <Label htmlFor="area" className="text-right whitespace-nowrap">
              Area
            </Label>
            <div className="flex-1">
              <Select value={area} onValueChange={setArea}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select Area" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Areas</SelectLabel>
                    <SelectItem value="asokore_mampong">
                      Asokore Mampong
                    </SelectItem>
                    <SelectItem value="royal_court_estate">
                      Royal Court Estate
                    </SelectItem>
                    <SelectItem value="legon_hills">Legon Hills</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
              {areaError && (
                <span className="text-red-600 text-xs mt-1 block">Assign Area</span>
              )}
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading || !newRole || newRole === selectedUser?.role}
          >
            {loading ? "Updating..." : "Update Role"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}