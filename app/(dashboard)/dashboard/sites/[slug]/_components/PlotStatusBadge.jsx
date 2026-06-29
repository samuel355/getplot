import { cn } from "@/lib/utils";

const STATUS_MAP = {
  Available: { label: "Available", cls: "bg-green-100 text-green-700" },
  AVAILABLE: { label: "Available", cls: "bg-green-100 text-green-700" },
  Reserved: { label: "Reserved", cls: "bg-orange-100 text-orange-700" },
  RESERVED: { label: "Reserved", cls: "bg-orange-100 text-orange-700" },
  Sold: { label: "Sold", cls: "bg-red-100 text-red-600" },
  SOLD: { label: "Sold", cls: "bg-red-100 text-red-600" },
  Hold: { label: "On Hold", cls: "bg-blue-100 text-blue-600" },
  HOLD: { label: "On Hold", cls: "bg-blue-100 text-blue-600" },
};

export default function PlotStatusBadge({ status }) {
  const config = STATUS_MAP[status] ?? { label: status ?? "Unknown", cls: "bg-gray-100 text-gray-600" };
  return (
    <span className={cn("inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium", config.cls)}>
      {config.label}
    </span>
  );
}
