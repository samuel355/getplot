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
import { SITES } from "@/lib/sites";

const LAND_MANAGEMENT_ROLES = ["chief", "chief_asst", "land_manager"];

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
    { value: "land_manager", label: "Land Manager" },
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

      if (LAND_MANAGEMENT_ROLES.includes(newRole) && !area) {
        setAreaError(true);
        toast.error("Select Site");
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

        {LAND_MANAGEMENT_ROLES.includes(newRole) && (
          <div className="mt-2">
            <Label htmlFor="area" className="text-right whitespace-nowrap">
              Site
            </Label>
            <div className="flex-1">
              <Select value={area} onValueChange={setArea}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select Site" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Sites</SelectLabel>
                    {SITES.map((site) => (
                      <SelectItem key={site.slug} value={site.slug}>
                        {site.name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
              {areaError && (
                <span className="text-red-600 text-xs mt-1 block">Assign site</span>
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
