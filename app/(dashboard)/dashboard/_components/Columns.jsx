"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Define the columns
export const columns = [
  {
    accessorKey: "Plot_No",
    cell: (info) => info.getValue(),
    className: "text-center w-2",
    
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          No.
          <ArrowUpDown className="ml-1 h-4 w-4" />
        </Button>
      );
    },
  },
  {
    accessorKey: "Street_Nam",
    header: "Street",
    cell: (info) => info.getValue(),
    className: "text-left lowercase",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: (info) => info.getValue(),
    className: "w-2",
  },
  {
    accessorKey: "firstname",
    header: "First Name",
  },
  {
    accessorKey: "lastname",
    header: "Last Name",
  },
  {
    accessorKey: "phone",
    header: "Contact",
  },
  {
    accessorKey: "plotTotalAmount",
    header: "Plot Amount",
    cell: (info) => info.getValue(),
    className: "w-2",
  },
  {
    accessorKey: "paidAmount",
    header: "Paid (GHS)",
    cell: (info) => info.getValue(),
    className: "w-2",
  },
  {
    accessorKey: "remainingAmount",
    header: "Remaining (GHS)",
    cell: (info) => info.getValue(),
    className: "w-2 text-right",
  },
  {
    accessorKey: "actions",
    header: "Actions",
    cell: (info) => info.getValue(),
    className: "text-right",
    cell: ({ row }) => {
      return (
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
            <DropdownMenuItem>View</DropdownMenuItem>
            <DropdownMenuItem>Delete</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
