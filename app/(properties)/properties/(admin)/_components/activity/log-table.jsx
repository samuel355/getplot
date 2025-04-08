import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Settings,
  User,
  Home,
  AlertCircle,
  Check,
  X,
  Shield,
  RefreshCw,
} from "lucide-react";
import { format } from "date-fns";

export function LogTable({ logs }) {
  const getActionIcon = (type) => {
    switch (type) {
      case 'property':
        return <Home className="h-4 w-4" />;
      case 'user':
        return <User className="h-4 w-4" />;
      case 'settings':
        return <Settings className="h-4 w-4" />;
      case 'system':
        return <Shield className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'success':
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700">
            <Check className="h-3 w-3 mr-1" />
            Success
          </Badge>
        );
      case 'error':
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700">
            <X className="h-3 w-3 mr-1" />
            Error
          </Badge>
        );
      case 'pending':
        return (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700">
            <RefreshCw className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        );
      default:
        return (
          <Badge variant="outline">
            {status}
          </Badge>
        );
    }
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Timestamp</TableHead>
          <TableHead>User</TableHead>
          <TableHead>Action</TableHead>
          <TableHead>Details</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {logs.map((log) => (
          <TableRow key={log.id}>
            <TableCell>
              {format(new Date(log.created_at), 'PPpp')}
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-2">
                <img
                  src={log.user?.imageUrl}
                  alt={log.user?.firstName}
                  className="h-6 w-6 rounded-full"
                />
                <span>{log.user?.firstName} {log.user?.lastName}</span>
              </div>
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-2">
                {getActionIcon(log.type)}
                <span className="capitalize">{log.action}</span>
              </div>
            </TableCell>
            <TableCell>
              <p className="max-w-md truncate">{log.details}</p>
            </TableCell>
            <TableCell>
              {getStatusBadge(log.status)}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}