import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ArrowUpDown, MoreHorizontal } from "lucide-react";

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
      const plotId = rowData.id;

      return (
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
              <DropdownMenuItem>
                Edit 
              </DropdownMenuItem>
              <DropdownMenuItem>
                View
              </DropdownMenuItem>
              <DropdownMenuItem>
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    },
  },
]