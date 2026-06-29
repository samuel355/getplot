const MAP = {
  approved: "bg-green-100 text-green-700",
  pending: "bg-yellow-100 text-yellow-700",
  rejected: "bg-red-100 text-red-600",
};

export default function StatusPill({ status }) {
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${MAP[status] ?? "bg-gray-100 text-gray-600"}`}>
      {status ?? "draft"}
    </span>
  );
}
