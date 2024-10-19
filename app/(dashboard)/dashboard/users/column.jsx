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
import { ArrowUpDown, MoreHorizontal } from "lucide-react";
import { useEffect, useState } from "react";

export function ViewUserDialog({
  open,
  onOpenChange,
  userId,
  table,
  setIsDialogOpen,
}) {
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
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
          throw new Error('User not found');
        }
        const data = await response.json();
        setUser(data);
      } catch (error) {
        console.log(error);
        setError(error.message);
      }
    };

    fetchUser();
  }, [userId]);

  console.log(user)
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw]">
        <DialogHeader>
          <DialogTitle className="font-bold">Update User Details</DialogTitle>
        </DialogHeader>
        <div>
          <p>Update user details</p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export const columns = [
  {
    accessorKey: "email",
    cell: (info) => info.getValue(),
    className: "text-left",

    header: ({ column }) => {
      return (
        <Button
          className="flex justify-start p-1"
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Email
          <ArrowUpDown className="ml-1 h-4" />
        </Button>
      );
    },
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

      return (
        <>
          <div className="flex justify-end">
            <DropdownMenu className="">
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
          </div>

          {isDialogOpen && (
            <ViewUserDialog
              open={isDialogOpen}
              onOpenChange={setIsDialogOpen}
              userId={userId}
              setIsDialogOpen={setIsDialogOpen}
            />
          )}
        </>
      );
    },
  },
];
