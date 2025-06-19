import { Badge } from "@/components/ui/badge";
import { CheckCircle, Clock, XCircle } from "lucide-react";

export default function StatusBadge({ status }) {
  switch (status) {
    case "approved":
      return (
        <Badge
          variant="outline"
          className="bg-green-50 text-green-700 hover:bg-green-100 border-green-200 flex items-center gap-1"
        >
          <CheckCircle className="h-3 w-3" />
          Approved
        </Badge>
      );
    case "pending":
      return (
        <Badge
          variant="outline"
          className="bg-amber-50 text-amber-700 hover:bg-amber-100 border-amber-200 flex items-center gap-1"
        >
          <Clock className="h-3 w-3" />
          Pending
        </Badge>
      );
    case "rejected":
      return (
        <Badge
          variant="outline"
          className="bg-red-50 text-red-700 hover:bg-red-100 border-red-200 flex items-center gap-1"
        >
          <XCircle className="h-3 w-3" />
          Rejected
        </Badge>
      );
    case "sold":
      return (
        <Badge
          variant="outline"
          className="bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200 flex items-center gap-1"
        >
          Sold
        </Badge>
      );
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}
