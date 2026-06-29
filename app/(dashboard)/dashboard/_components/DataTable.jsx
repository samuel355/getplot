"use client";

import React, { useState } from "react";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Columns3,
  FileText,
  Loader2,
  Search,
  Sheet,
} from "lucide-react";
import { cn } from "@/lib/utils";

const STATUS_OPTIONS = ["All", "Available", "Reserved", "Sold", "Hold"];

export function DataTable({ columns, data, loading, databaseName }) {
  const [globalFilter, setGlobalFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [sorting, setSorting] = useState([]);
  const [columnFilters, setColumnFilters] = useState([]);
  const [columnVisibility, setColumnVisibility] = useState({});
  const [rowSelection, setRowSelection] = useState({});
  const [pageSize, setPageSize] = useState(20);
  const [pageIndex, setPageIndex] = useState(0);

  const filteredData = React.useMemo(() => {
    if (statusFilter === "All") return data;
    return data.filter((row) => (row.status ?? "Available") === statusFilter);
  }, [data, statusFilter]);

  const globalFilterFn = (row, _columnId, filterValue) =>
    Object.values(row.original).some((value) =>
      String(value ?? "").toLowerCase().includes(filterValue.toLowerCase())
    );

  const table = useReactTable({
    data: filteredData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    globalFilterFn,
    state: {
      globalFilter,
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      pagination: { pageIndex, pageSize },
    },
  });

  const totalRows = table.getFilteredRowModel().rows.length;
  const selectedRows = table.getFilteredSelectedRowModel().rows.length;
  const pageCount = table.getPageCount();
  const canPrev = table.getCanPreviousPage();
  const canNext = table.getCanNextPage();

  const goToPage = (idx) => {
    setPageIndex(Math.max(0, Math.min(idx, pageCount - 1)));
    table.setPageIndex(Math.max(0, Math.min(idx, pageCount - 1)));
  };

  const handleExportPdf = async () => {
    const { exportToPdf } = await import("../_actions/save-pdf");
    exportToPdf(filteredData);
  };

  const handleExportExcel = async () => {
    const { exportToExcel } = await import("../_actions/export-excel");
    exportToExcel(filteredData);
  };

  const pageNumbers = React.useMemo(() => {
    if (pageCount <= 7) return Array.from({ length: pageCount }, (_, i) => i);
    const pages = new Set([0, pageCount - 1, pageIndex]);
    for (let d = -2; d <= 2; d++) {
      const p = pageIndex + d;
      if (p >= 0 && p < pageCount) pages.add(p);
    }
    return Array.from(pages).sort((a, b) => a - b);
  }, [pageCount, pageIndex]);

  return (
    <div className="space-y-3">
      {/* Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Left: search + status filter */}
        <div className="flex flex-1 items-center gap-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
            <Input
              placeholder="Search plots…"
              value={globalFilter}
              onChange={(e) => { setGlobalFilter(e.target.value); setPageIndex(0); }}
              className="pl-8 h-9 text-sm"
            />
          </div>
          <div className="flex gap-1">
            {STATUS_OPTIONS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => { setStatusFilter(s); setPageIndex(0); }}
                className={cn(
                  "rounded-full px-3 py-1 text-xs font-medium transition-colors border",
                  statusFilter === s
                    ? s === "Available" ? "bg-green-600 text-white border-green-600"
                      : s === "Reserved" ? "bg-slate-800 text-white border-slate-800"
                      : s === "Sold" ? "bg-red-600 text-white border-red-600"
                      : s === "Hold" ? "bg-slate-400 text-white border-slate-400"
                      : "bg-brand-navy text-white border-brand-navy"
                    : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                )}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Right: page size + columns + export */}
        <div className="flex items-center gap-2 shrink-0">
          <select
            value={pageSize}
            onChange={(e) => {
              const s = Number(e.target.value);
              setPageSize(s);
              setPageIndex(0);
              table.setPageSize(s);
            }}
            className="h-9 rounded-md border border-slate-200 bg-white px-2 text-sm text-slate-700 focus:outline-none"
          >
            {[10, 20, 50, 100, 500].map((n) => (
              <option key={n} value={n}>{n} / page</option>
            ))}
          </select>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-9 gap-1.5 text-xs">
                <Columns3 className="h-3.5 w-3.5" /> Columns
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              {table.getAllColumns().filter((c) => c.getCanHide()).map((column) => (
                <DropdownMenuCheckboxItem
                  key={column.id}
                  className="capitalize text-sm"
                  checked={column.getIsVisible()}
                  onCheckedChange={(v) => column.toggleVisibility(!!v)}
                >
                  {column.id.replace(/_/g, " ")}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="sm" className="h-9 px-2.5" onClick={handleExportPdf}>
                  <FileText className="h-3.5 w-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Export PDF</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="sm" className="h-9 px-2.5" onClick={handleExportExcel}>
                  <Sheet className="h-3.5 w-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Export Excel</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((hg) => (
              <TableRow key={hg.id} className="bg-slate-50 hover:bg-slate-50 border-b border-slate-200">
                {hg.headers.map((header) => (
                  <TableHead key={header.id} className="text-xs font-semibold uppercase tracking-wide text-slate-500 py-3">
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 8 }).map((_, i) => (
                <TableRow key={i} className="border-b border-slate-100">
                  {columns.map((_, j) => (
                    <TableCell key={j}>
                      <div className="h-4 rounded bg-slate-100 animate-pulse" style={{ width: `${50 + Math.random() * 40}%` }} />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row, i) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className={cn(
                    "border-b border-slate-100 transition-colors hover:bg-slate-50",
                    row.getIsSelected() && "bg-brand-teal/5"
                  )}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="py-2.5 text-sm">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-32 text-center text-sm text-slate-400">
                  No plots found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Footer */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between text-sm text-slate-500">
        <p>
          {selectedRows > 0 ? <><span className="font-medium text-slate-800">{selectedRows}</span> selected · </> : null}
          <span className="font-medium text-slate-800">{totalRows.toLocaleString()}</span> plot{totalRows !== 1 ? "s" : ""}
          {statusFilter !== "All" ? ` · filtered by ${statusFilter}` : ""}
        </p>

        <div className="flex items-center gap-1">
          <PagBtn onClick={() => goToPage(0)} disabled={!canPrev} label="First page">
            <ChevronsLeft className="h-3.5 w-3.5" />
          </PagBtn>
          <PagBtn onClick={() => { setPageIndex((p) => p - 1); table.previousPage(); }} disabled={!canPrev} label="Previous page">
            <ChevronLeft className="h-3.5 w-3.5" />
          </PagBtn>

          {pageNumbers.map((p, idx) => {
            const prev = pageNumbers[idx - 1];
            const gap = prev !== undefined && p - prev > 1;
            return (
              <React.Fragment key={p}>
                {gap && <span className="px-1 text-slate-300 select-none">…</span>}
                <button
                  type="button"
                  onClick={() => goToPage(p)}
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-md text-xs font-medium transition-colors",
                    pageIndex === p
                      ? "bg-brand-navy text-white"
                      : "text-slate-600 hover:bg-slate-100"
                  )}
                >
                  {p + 1}
                </button>
              </React.Fragment>
            );
          })}

          <PagBtn onClick={() => { setPageIndex((p) => p + 1); table.nextPage(); }} disabled={!canNext} label="Next page">
            <ChevronRight className="h-3.5 w-3.5" />
          </PagBtn>
          <PagBtn onClick={() => goToPage(pageCount - 1)} disabled={!canNext} label="Last page">
            <ChevronsRight className="h-3.5 w-3.5" />
          </PagBtn>
        </div>
      </div>
    </div>
  );
}

function PagBtn({ children, onClick, disabled, label }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className="flex h-8 w-8 items-center justify-center rounded-md text-slate-600 transition-colors hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed"
    >
      {children}
    </button>
  );
}
