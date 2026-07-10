"use client";

import { useMemo, useState } from "react";
import { format, parseISO } from "date-fns";
import { toast } from "react-toastify";
import { supabase } from "@/utils/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Eye, Mail, Phone, Search, Trash2 } from "lucide-react";

function formatDate(value) {
  if (!value) return "—";
  try {
    return format(parseISO(value), "dd MMM yyyy, h:mm a");
  } catch {
    return value;
  }
}

export default function InterestsTable({ interests, sites }) {
  const [query, setQuery] = useState("");
  const [siteFilter, setSiteFilter] = useState("all");
  const [rows, setRows] = useState(interests);
  const [viewing, setViewing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [deleteBusy, setDeleteBusy] = useState(false);

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    return rows.filter((row) => {
      if (siteFilter !== "all" && row._siteSlug !== siteFilter) return false;
      if (!term) return true;
      return [row.firstname, row.lastname, row.email, row.phone, row.plot_number, row._siteName]
        .some((value) => String(value ?? "").toLowerCase().includes(term));
    });
  }, [rows, query, siteFilter]);

  const confirmDelete = async () => {
    if (!deleting) return;
    setDeleteBusy(true);
    const { error } = await supabase.from(deleting._table).delete().eq("id", deleting.id);
    setDeleteBusy(false);
    if (error) {
      toast.error("Failed to delete. Please try again.");
      return;
    }
    setRows((current) => current.filter((row) => !(row._table === deleting._table && row.id === deleting.id)));
    toast.success("Interest deleted");
    setDeleting(null);
  };

  return (
    <div className="bg-white rounded-lg border shadow-sm">
      <div className="flex flex-col gap-3 border-b p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search name, email, phone, plot..."
            className="h-9 w-full rounded-md border border-gray-200 bg-white pl-9 pr-3 text-sm outline-none focus:border-brand-teal focus:ring-2 focus:ring-brand-teal/20"
          />
        </div>
        <select
          value={siteFilter}
          onChange={(e) => setSiteFilter(e.target.value)}
          className="h-9 rounded-md border border-gray-200 bg-white px-3 text-sm outline-none focus:border-brand-teal focus:ring-2 focus:ring-brand-teal/20"
        >
          <option value="all">All sites</option>
          {sites.map((site) => (
            <option key={site.slug} value={site.slug}>{site.name}</option>
          ))}
        </select>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b">
            <tr>
              {["Client", "Contact", "Site", "Plot", "Amount", "Date", "Actions"].map((h) => (
                <th key={h} className="text-left px-5 py-3 font-medium text-gray-500 whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y">
            {filtered.map((row) => (
              <tr key={`${row._table}-${row.id}`} className="hover:bg-slate-50 transition-colors">
                <td className="px-5 py-3.5 font-medium text-gray-900 whitespace-nowrap">
                  {row.firstname} {row.lastname}
                </td>
                <td className="px-5 py-3.5 text-gray-600 whitespace-nowrap">
                  <div className="flex items-center gap-1.5">
                    <Mail className="h-3.5 w-3.5 text-gray-400" />
                    <a href={`mailto:${row.email}`} className="hover:text-brand-navy hover:underline">{row.email}</a>
                  </div>
                  <div className="mt-0.5 flex items-center gap-1.5">
                    <Phone className="h-3.5 w-3.5 text-gray-400" />
                    <a href={`tel:${row.phone}`} className="hover:text-brand-navy hover:underline">{row.phone}</a>
                  </div>
                </td>
                <td className="px-5 py-3.5 text-gray-600 whitespace-nowrap">{row._siteName}</td>
                <td className="px-5 py-3.5 text-gray-600 whitespace-nowrap">{row.plot_number ?? "—"}</td>
                <td className="px-5 py-3.5 text-gray-600 whitespace-nowrap">
                  {row.plot_amount ? `GHS ${Number(row.plot_amount).toLocaleString()}` : "—"}
                </td>
                <td className="px-5 py-3.5 text-gray-500 whitespace-nowrap">{formatDate(row.created_at)}</td>
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setViewing(row)}
                      className="text-gray-400 hover:text-brand-navy transition-colors"
                      title="View details"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleting(row)}
                      className="text-gray-400 hover:text-red-600 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {!filtered.length && (
              <tr>
                <td colSpan={7} className="px-5 py-12 text-center text-gray-400">
                  No interests found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Dialog open={!!viewing} onOpenChange={(open) => !open && setViewing(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{viewing?.firstname} {viewing?.lastname}</DialogTitle>
          </DialogHeader>
          {viewing && (
            <div className="space-y-3 text-sm">
              <DetailRow label="Email" value={viewing.email} />
              <DetailRow label="Phone" value={viewing.phone} />
              <DetailRow label="Country" value={viewing.country || "—"} />
              <DetailRow label="Site" value={viewing._siteName} />
              <DetailRow label="Plot" value={viewing.plot_number ?? "—"} />
              <DetailRow
                label="Amount"
                value={viewing.plot_amount ? `GHS ${Number(viewing.plot_amount).toLocaleString()}` : "—"}
              />
              <DetailRow label="Submitted" value={formatDate(viewing.created_at)} />
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Message</p>
                <p className="mt-1 whitespace-pre-wrap text-gray-700">{viewing.message || "No message provided"}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleting} onOpenChange={(open) => !open && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this interest?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove {deleting?.firstname} {deleting?.lastname}&apos;s interest in plot{" "}
              {deleting?.plot_number} at {deleting?._siteName}. This can&apos;t be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteBusy}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => { e.preventDefault(); confirmDelete(); }}
              disabled={deleteBusy}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleteBusy ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function DetailRow({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">{label}</span>
      <span className="text-gray-900">{value}</span>
    </div>
  );
}
