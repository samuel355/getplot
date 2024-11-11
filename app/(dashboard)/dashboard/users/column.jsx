import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { toast as tToast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { ArrowUpDown, Loader } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "react-toastify";
import { useUser } from "@clerk/nextjs";

export function ViewUserDialog({ open, onOpenChange, userId, setDialogOpen }) {
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);
  const [userLoading, setUserLoading] = useState(true);
  const [role, setRole] = useState();
  const [roleError, setRoleError] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (userId) {
      const fetchUser = async () => {
        try {
          const response = await fetch(`/api/get-user`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ userId }),
          });
          if (!response.ok) {
            setUserLoading(false);
            throw new Error("User not found");
          }
          const data = await response.json();
          setUserLoading(false);
          setUser(data);
        } catch (error) {
          setUserLoading(false);
          console.log(error);
          setError(error.message);
        }
      };
      fetchUser();
    }
  }, [userId]);

  const handleForm = async (event) => {
    event.preventDefault();
    setLoading(true);
    if (role === undefined || role === null) {
      setRoleError(true);
      toast.error("Choose Role");
      setLoading(false);
    } else {
      setRoleError(false);
      const response = await fetch(`/api/edit-user-role`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId, role }),
      });
      if (!response.ok) {
        setLoading(false);
        throw new Error("Failed to edit user role");
      }
      setLoading(false);
      setDialogOpen(false);
      tToast("Role edited successfully");
      setTimeout(() => {
        window.location.reload();
      }, 1050);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit User Role</DialogTitle>
          <DialogDescription>Change Role and Click Save.</DialogDescription>
        </DialogHeader>
        {userLoading && (
          <div className="flex flex-col justify-center items-center">
            <Loader className="animate-spin text-primary z-50" />
          </div>
        )}
        {user && (
          <div className="grid gap-2 py-2">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Full Name
              </Label>
              <Input
                disabled
                id="name"
                defaultValue={user.firstName ?? "" + " " + user.lastName ?? ""}
                className="col-span-3"
                disabbled
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="username" className="text-right">
                Username
              </Label>
              <Input
                disabled
                id="username"
                defaultValue={`@${user.username}`}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="username" className="text-right">
                Current Role
              </Label>
              <Input
                disabled
                id="username"
                defaultValue={`${user.publicMetadata.role ?? "None"}`}
                className="col-span-3"
              />
            </div>
            <form onSubmit={handleForm}>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="username" className="text-right">
                  Change Role
                </Label>
                <Select onValueChange={(event) => setRole(event)}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Change Role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Roles</SelectLabel>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="sysadmin">System Admin</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
              {roleError && (
                <span className="text-red-600 text-xs"> Choose Role</span>
              )}
              <DialogFooter className={"mt-3"}>
                <Button type="submit">
                  {loading ? (
                    <Loader className="w-4 h-4 animate-spin text-white z-50" />
                  ) : (
                    "Save changes"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

export const columns = [
  {
    accessorKey: "imageUrl",
    header: () => <div className="text-left">Image</div>,
    cell: ({ row }) => {
      let value = row.getValue("imageUrl");

      return (
        <Avatar>
          <AvatarImage src={value} alt="user-img" />
          <AvatarFallback>CN</AvatarFallback>
        </Avatar>
      );
    },
  },
  {
    accessorKey: "email",
    cell: (info) => info.getValue(),
    header: ({ column }) => (
      <Button
        className="flex justify-start p-1"
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Email
        <ArrowUpDown className="ml-1 h-4" />
      </Button>
    ),
  },
  {
    accessorKey: "role",
    header: () => <div className="">Role</div>,
  },
  {
    accessorKey: "username",
    header: () => <div className="">Username</div>,
  },
  {
    accessorKey: "firstName",
    header: () => <div className="">First Name</div>,
  },
  {
    accessorKey: "lastName",
    header: () => <div className="">Last Name</div>,
  },
  {
    id: "actions",
    header: () => {
      const { user } = useUser();
      if (user.publicMetadata.role === "sysadmin") {
        return <div className="text-right">Action</div>;
      }
    },
    cell: ({ row }) => {
      const rowData = row.original;
      const userId = rowData.id;
      const [dialogOpen, setDialogOpen] = useState(false);
      const { user } = useUser();

      return (
        <>
          <div className="flex justify-end">
            {user.publicMetadata.role === "sysadmin" && (
              <Button
                onClick={() => setDialogOpen((prevState) => !prevState)}
                variant="ghost"
                size="small"
                className="border p-1"
              >
                Edit User
              </Button>
            )}

            {dialogOpen && (
              <ViewUserDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                userId={userId}
                setDialogOpen={setDialogOpen}
              />
            )}
          </div>
        </>
      );
    },
  },
];
