"use client";

import { useState } from "react";
import { supabase } from "@/utils/supabase/client";
import { toast } from "react-toastify";
import { Check, X, Pencil } from "lucide-react";

export default function EditPriceCell({ plotId, table, price }) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(price ?? "");
  const [saving, setSaving] = useState(false);

  const save = async () => {
    const num = parseFloat(value);
    if (!num || num <= 0) { toast.error("Enter a valid price"); return; }
    setSaving(true);
    const { error } = await supabase.from(table).update({ plotTotalAmount: num }).eq("id", plotId);
    setSaving(false);
    if (error) { toast.error("Failed to update price"); return; }
    toast.success("Price updated");
    setEditing(false);
  };

  if (!editing) {
    return (
      <button
        onClick={() => setEditing(true)}
        className="flex items-center gap-1.5 text-gray-700 hover:text-brand-navy group transition-colors"
      >
        {price ? `${Number(price).toLocaleString()}` : <span className="text-gray-400 italic">Set price</span>}
        <Pencil className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
      </button>
    );
  }

  return (
    <div className="flex items-center gap-1">
      <input
        type="number"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        autoFocus
        className="w-28 h-7 px-2 text-sm border rounded-md focus:outline-none focus:ring-1 focus:ring-brand-teal"
      />
      <button onClick={save} disabled={saving} className="p-1 text-green-600 hover:text-green-700">
        <Check className="w-4 h-4" />
      </button>
      <button onClick={() => setEditing(false)} className="p-1 text-red-500 hover:text-red-600">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
