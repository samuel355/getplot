"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, MoreHorizontal, Eye, Trash2, Check } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import Link from "next/link";
import useNotificationsStore from "../../_store/useNotificationsStore";

export const columns = [
  {
    accessorKey: "type",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Type
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const type = row.getValue("type");
      const getTypeBadge = (type) => {
        switch (type) {
          case 'property_approved':
            return <Badge variant="success">Approved</Badge>;
          case 'property_rejected':
            return <Badge variant="destructive">Rejected</Badge>;
          case 'property_interest':
            return <Badge variant="outline">Interest</Badge>;
          case 'user_banned':
            return <Badge variant="destructive">User Banned</Badge>;
          case 'user_unbanned':
            return <Badge variant="success">User Unbanned</Badge>;
          default:
            return <Badge>{type}</Badge>;
        }
      };
      return getTypeBadge(type);
    },
  },
  {
    accessorKey: "message",
    header: "Message",
  },
  {
    accessorKey: "properties.title",
    header: "Property",
    cell: ({ row }) => {
      const property = row.original.properties;
      return property ? (
        <Link 
          href={`/properties/${property.id}`}
          className="text-primary hover:underline"
        >
          {property.title}
        </Link>
      ) : '-';
    },
  },
  {
    accessorKey: "created_at",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Date
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const date = row.getValue("created_at");
      return format(new Date(date), "PPpp");
    },
  },
  {
    accessorKey: "read",
    header: "Status",
    cell: ({ row }) => {
      const read = row.getValue("read");
      return read ? (
        <Badge variant="outline">Read</Badge>
      ) : (
        <Badge variant="secondary">Unread</Badge>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const notification = row.original;
      const { markAsRead, deleteNotification } = useNotificationsStore();

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            {notification.properties && (
              <DropdownMenuItem asChild>
                <Link href={`/properties/${notification.properties.id}`}>
                  <Eye className="mr-2 h-4 w-4" />
                  View Property
                </Link>
              </DropdownMenuItem>
            )}
            {!notification.read && (
              <DropdownMenuItem
                onClick={() => markAsRead(notification.id)}
              >
                <Check className="mr-2 h-4 w-4" />
                Mark as Read
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-red-600"
              onClick={() => deleteNotification(notification.id)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
]; 