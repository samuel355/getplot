import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { ArrowUpDown, Loader, MoreHorizontal } from "lucide-react";
import { useEffect, useState } from "react";

export function ViewUserDialog({
  open,
  onOpenChange,
  userId,
  setIsDialogOpen,
}) {
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);
  const [userLoading, setUserLoading] = useState(true);

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
          setUserLoading(false);
          const data = await response.json();
          if (data) {
            setIsDialogOpen(false);
            setUser(data);
          }
        } catch (error) {
          setUserLoading(false);
          setIsDialogOpen(false);
          console.log(error);
          setError(error.message);
        }
      };

      fetchUser();
    }
  }, [userId]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw]">
        <DialogHeader>
          <DialogTitle className="font-bold">Update User Details</DialogTitle>
        </DialogHeader>
        <div>
          {userLoading && (
            <div className="flex flex-col justify-center items-center">
              <Loader className="animate-spin text-primary z-50" />
            </div>
          )}

          {error && <div>{error}</div>}
          {user && (
            <div className="flex flex-col gap-4">
              <p className="text-gray-900 font-semibold text-sm w-1/4">
                Change Role
              </p>
            </div>
          )}7
        </div>
      </DialogContent>
    </Dialog>
  );
}

export const columns = [
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
    header: () => <div className="text-right">Role</div>,
  },
  {
    accessorKey: "username",
    header: () => <div className="text-right">Username</div>,
  },
  {
    accessorKey: "firstName",
    header: () => <div className="text-right">First Name</div>,
  },
  {
    accessorKey: "lastName",
    header: () => <div className="text-right">Last Name</div>,
  },
  {
    id: "actions",
    header: () => <div className="text-right">Action</div>,
    cell: ({ row }) => {
      const rowData = row.original;
      const userId = rowData.id;

      const [isDialogOpen, setIsDialogOpen] = useState(false);

      const handleOpenChange = (open) => {
        setIsDialogOpen(open);
      };

      return (
        <>
          <div className="flex justify-end">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">Open menu</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setIsDialogOpen(true)}>
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem>Delete</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {isDialogOpen && (
              <ViewUserDialog
                open={isDialogOpen}
                onOpenChange={setIsDialogOpen}
                userId={userId}
                setIsDialogOpen={setIsDialogOpen}
              />
            )}
          </div>
        </>
      );
    },
  },
];
