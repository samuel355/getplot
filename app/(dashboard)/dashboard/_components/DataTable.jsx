import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function DataTable({ columns, data }) {
  const [sorting, setSorting] = useState([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [pageSize, setPageSize] = useState(20);
  const [pageIndex, setPageIndex] = useState(0);

  // Global filter function to check all columns for a match with filterValue
  const globalFilterFn = (row, columnId, filterValue) => {
    console.log("Filtering row:", row.original);
    return row.original // `row.original` gives access to the raw row data
      ? Object.values(row.original).some(value =>
          String(value).toLowerCase().includes(filterValue.toLowerCase())
        )
      : false;
  };

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      globalFilter,
      pagination: {
        pageIndex,
        pageSize,
      },
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    globalFilterFn, // Apply the global filter function
  });

  return (
    <div>
      {/* Search Input */}
      <div className="flex items-center justify-between py-4">
        <Input
          placeholder="Search all columns..."
          value={globalFilter ?? ""}
          onChange={(event) => setGlobalFilter(event.target.value)}
        />
        <select
          value={pageSize}
          onChange={(e) => {
            const newSize = Number(e.target.value);
            setPageSize(newSize);
            setPageIndex(0);
            table.setPageSize(newSize);
          }}
          className="ml-4 p-2 border border-gray-300 rounded-md"
        >
          <option value={10}>10</option>
          <option value={20}>20</option>
          <option value={50}>50</option>
          <option value={100}>100</option>
          <option value={1000}>1000</option>
        </select>
      </div>

      <div className="overflow-x-auto">
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id} className={header.column.columnDef.className}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className={cell.column.columnDef.className}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-24 text-center">
                    No results found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <div className="flex items-center justify-end space-x-2 py-4">
        <Button
          variant="outline"
          onClick={() => {
            setPageIndex((old) => Math.max(old - 1, 0));
          }}
          disabled={!table.getCanPreviousPage()}
        >
          Previous
        </Button>

        <span>
          Page {pageIndex + 1} of {table.getPageCount()}
        </span>

        <Button
          variant="outline"
          onClick={() => {
            setPageIndex((old) => Math.min(old + 1, table.getPageCount() - 1));
          }}
          disabled={!table.getCanNextPage()}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
