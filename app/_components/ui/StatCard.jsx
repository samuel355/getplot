import { cn } from "@/lib/utils";

export default function StatCard({ label, value, icon: Icon, color = "text-brand-navy", bg = "bg-brand-navy/5" }) {
  return (
    <div className="bg-white rounded-lg border border-slate-200 p-5 flex items-center gap-4">
      <div className={cn("w-12 h-12 rounded-lg flex items-center justify-center", bg)}>
        <Icon className={cn("w-6 h-6", color)} />
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-900">{value ?? "—"}</p>
        <p className="text-sm text-gray-500">{label}</p>
      </div>
    </div>
  );
}
