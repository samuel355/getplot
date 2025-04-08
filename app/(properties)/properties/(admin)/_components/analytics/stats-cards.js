import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { TrendingUp, Check, X, Clock } from "lucide-react";

export function StatsCards({ approvalStats }) {
  const stats = [
    {
      title: "Total Properties",
      value: approvalStats.total,
      icon: <TrendingUp className="h-4 w-4 text-muted-foreground" />,
    },
    {
      title: "Approved",
      value: approvalStats.approved,
      percentage: approvalStats.rate + '%',
      icon: <Check className="h-4 w-4 text-green-500" />,
    },
    {
      title: "Rejected",
      value: approvalStats.rejected,
      percentage: ((approvalStats.rejected / approvalStats.total) * 100).toFixed(1) + '%',
      icon: <X className="h-4 w-4 text-red-500" />,
    },
    {
      title: "Pending",
      value: approvalStats.pending,
      percentage: ((approvalStats.pending / approvalStats.total) * 100).toFixed(1) + '%',
      icon: <Clock className="h-4 w-4 text-yellow-500" />,
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              {stat.title}
            </CardTitle>
            {stat.icon}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            {stat.percentage && (
              <p className="text-xs text-muted-foreground">
                {stat.percentage} of total
              </p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}