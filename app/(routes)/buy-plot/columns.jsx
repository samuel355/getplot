"use client"

import { ColumnDef } from "@tanstack/react-table"


export const columns = [
  {
    accessorKey: "properties.Plot_No",
    header: "No.",
  },
  {
    accessorKey: "properties.Street_Nam",
    header: "Street",
  },
  {
    accessorKey: "location",
    header: "Location",
  },
  {
    accessorKey: "properties.Area",
    header: "Size (Acres)"
  },
  {
    accessorKey: "plotTotalAmount",
    header: "Amount",
    cell: ({ row }) => {
      let value = row.getValue("plotTotalAmount") ?? 0;
      const amount = parseFloat(value);
      const formatted = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "GHS",
      }).format(amount);

      return <div className="text-right font-medium">{formatted}</div>;
    },
  }
]
