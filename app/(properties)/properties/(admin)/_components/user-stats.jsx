import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Users, ShieldCheck, UserCheck, UserX, User } from "lucide-react";

export default function UserStats({ stats }) {
  const statCards = [
    {
      title: "Total Users",
      value: stats.total,
      icon: <Users className="h-4 w-4 text-muted-foreground" />,
    },
    {
      title: "Regular Users",
      value: stats.regularUsers,
      icon: <User className="h-4 w-4 text-blue-500" />,
    },
    {
      title: "Administrators",
      value: stats.admins,
      icon: <UserCheck className="h-4 w-4 text-emerald-500" />,
    },
    {
      title: "System Admins",
      value: stats.sysadmins,
      icon: <ShieldCheck className="h-4 w-4 text-purple-500" />,
    },
    {
      title: "Banned Users",
      value: stats.banned,
      icon: <UserX className="h-4 w-4 text-red-500" />,
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-5">
      {statCards.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              {stat.title}
            </CardTitle>
            {stat.icon}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}