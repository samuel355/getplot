"use client";

import { useState } from "react";
import { supabase } from "@/utils/supabase/client";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

const STATUSES = ["Available", "Reserved", "Sold", "Hold"];

export default function ManagerPlotActions({ plotId, table, currentStatus }) {
  const [status, setStatus] = useState(currentStatus ?? "Available");
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  const dirty = status !== currentStatus;

  const save = async () => {
    setSaving(true);
    const { error } = await supabase.from(table).update({ status }).eq("id", plotId);
    setSaving(false);
    if (error) { toast.error("Failed to update status"); return; }
    toast.success("Status updated");
    router.refresh();
  };

  return (
    <div className="flex items-center gap-2">
      <select
        value={status}
        onChange={(e) => setStatus(e.target.value)}
        className="h-7 px-2 text-xs border rounded-lg focus:outline-none focus:ring-1 focus:ring-[#05014c] bg-white"
      >
        {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
      </select>
      {dirty && (
        <button
          onClick={save}
          disabled={saving}
          className="h-7 px-2.5 text-xs bg-[#05014c] text-white rounded-lg hover:bg-[#05014c]/90 disabled:opacity-50 flex items-center gap-1"
        >
          {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : "Save"}
        </button>
      )}
    </div>
  );
}
