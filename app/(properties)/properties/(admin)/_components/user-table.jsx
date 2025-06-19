import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import {
  MoreHorizontal,
  Shield,
  UserCheck,
  User,
  Ban,
  Mail,
  UserCog,
  Building,
} from "lucide-react";
import Link from "next/link";

export default function UserTable({
  users,
  onChangeRole,
  onBanUser,
  onUnbanUser,
  currentUserRole,
}) {
  const RoleBadge = ({ role }) => {
    switch (role) {
      case "sysadmin":
        return (
          <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-200">
            <Shield className="h-3 w-3 mr-1" />
            System Admin
          </Badge>
        );
      case "admin":
        return (
          <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-200">
            <UserCheck className="h-3 w-3 mr-1" />
            Admin
          </Badge>
        );
      default:
        return (
          <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">
            <User className="h-3 w-3 mr-1" />
            User
          </Badge>
        );
    }
  };

  const StatusBadge = ({ status }) => (
    <Badge
      variant={status === "active" ? "outline" : "destructive"}
      className="flex items-center gap-1"
    >
      {status === "active" ? (
        <>
          <span className="h-2 w-2 rounded-full bg-green-500" />
          Active
        </>
      ) : (
        <>
          <Ban className="h-3 w-3" />
          Banned
        </>
      )}
    </Badge>
  );

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>User</TableHead>
          <TableHead>Role</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Joined</TableHead>
          <TableHead>Last Active</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.map((user) => (
          <TableRow key={user.id}>
            <TableCell>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 overflow-hidden rounded-full">
                  {user.imageUrl ? (
                    <img
                      src={user.imageUrl}
                      alt={`${user.firstName} ${user.lastName}`}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gray-200">
                      <User className="h-6 w-6 text-gray-500" />
                    </div>
                  )}
                </div>
                <div>
                  <div className="font-medium">
                    {user.firstName} {user.lastName}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {user.email}
                  </div>
                </div>
              </div>
            </TableCell>
            <TableCell>
              <RoleBadge role={user.role} />
            </TableCell>
            <TableCell>
              <StatusBadge status={user.status} />
            </TableCell>
            <TableCell>
              {new Date(user.createdAt).toLocaleDateString()}
            </TableCell>
            <TableCell>
              {user.lastSignIn
                ? new Date(user.lastSignIn).toLocaleDateString()
                : "Never"}
            </TableCell>
            <TableCell className="text-right">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                  <DropdownMenuItem
                    onClick={() =>
                      (window.location.href = `mailto:${user.email}`)
                    }
                  >
                    <Mail className="h-4 w-4 mr-2" />
                    Email User
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href={`/properties/users/${user.id}/properties`}>
                      <Building className="h-4 w-4 mr-2" />
                      View Properties
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />

                  {/* Only show role change option if current user has sufficient permissions */}
                  {(currentUserRole === "sysadmin" ||
                    (currentUserRole === "admin" &&
                      user.role !== "sysadmin")) && (
                    <DropdownMenuItem onClick={() => onChangeRole(user)}>
                      <UserCog className="h-4 w-4 mr-2" />
                      Change Role
                    </DropdownMenuItem>
                  )}

                  {/* Only show ban/unban if target is not a sysadmin */}
                  {user.role !== "sysadmin" && (
                    <DropdownMenuItem
                      onClick={() =>
                        user.status === "active"
                          ? onBanUser(user)
                          : onUnbanUser(user)
                      }
                      className={
                        user.status === "active"
                          ? "text-red-600"
                          : "text-green-600"
                      }
                    >
                      <Ban className="h-4 w-4 mr-2" />
                      {user.status === "active" ? "Ban User" : "Unban User"}
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
